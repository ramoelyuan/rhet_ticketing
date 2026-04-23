const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const { z } = require("zod");
const { pool } = require("../config/db");
const { env } = require("../config/env");
const { signAccessToken } = require("../services/jwt");
const { getUserRowForLogin, toSessionShape } = require("../services/sessionUser");
const { isValidDepartment } = require("../constants/departments");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await getUserRowForLogin(email.toLowerCase());
    if (!user || !user.is_active) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signAccessToken({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    });
    return res.json({
      token,
      user: toSessionShape(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    }
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user.id;

    const { rows } = await pool.query(
      "SELECT password_hash FROM users WHERE id=$1",
      [userId]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Current password is incorrect" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash=$1 WHERE id=$2", [passwordHash, userId]);

    return res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    }
    next(err);
  }
}

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  department: z
    .union([z.string(), z.literal(""), z.null()])
    .optional()
    .transform((v) => {
      if (v == null || v === "") return null;
      return String(v).trim();
    }),
});

async function updateProfile(req, res, next) {
  try {
    const parsed = profileSchema.parse(req.body);
    if (parsed.department != null && !isValidDepartment(parsed.department)) {
      return res.status(400).json({ error: "Invalid department." });
    }

    try {
      await pool.query(
        `
        UPDATE users
        SET full_name=$1,
            department=$2,
            updated_at=now()
        WHERE id=$3
        `,
        [parsed.fullName, parsed.department, req.user.id]
      );
    } catch (dbErr) {
      if (dbErr.code === "42703") {
        await pool.query("UPDATE users SET full_name=$1, updated_at=now() WHERE id=$2", [
          parsed.fullName,
          req.user.id,
        ]);
      } else {
        throw dbErr;
      }
    }

    const { rows } = await pool.query(
      `
      SELECT id, full_name, email, role, department, avatar_filename
      FROM users
      WHERE id=$1
      `,
      [req.user.id]
    );
    const u = rows[0];
    return res.json({
      user: {
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        department: u.department ?? null,
        avatarUrl: u.avatar_filename ? `/uploads/avatars/${u.avatar_filename}` : null,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    }
    next(err);
  }
}

function avatarStorageUserFilename(userId, ext) {
  return `${userId}${ext}`;
}

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), env.uploadDir, "avatars");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const useExt = allowed.includes(ext) ? ext : ".jpg";
      cb(null, avatarStorageUserFilename(req.user.id, useExt));
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
    if (!ok) return cb(new Error("Only JPEG, PNG, GIF, or WebP images are allowed."));
    cb(null, true);
  },
});

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file uploaded." });

    const filename = req.file.filename;
    const dir = path.join(process.cwd(), env.uploadDir, "avatars");
    try {
      const entries = fs.readdirSync(dir);
      for (const name of entries) {
        if (name.startsWith(`${req.user.id}.`) && name !== filename) {
          try {
            fs.unlinkSync(path.join(dir, name));
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }

    try {
      await pool.query(
        "UPDATE users SET avatar_filename=$1, updated_at=now() WHERE id=$2",
        [filename, req.user.id]
      );
    } catch (dbErr) {
      if (dbErr.code === "42703") {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore
        }
        return res.status(503).json({
          error:
            "Avatar storage is not set up. Run: node db/run-sql.js db/migrations/add_user_avatar.sql",
        });
      }
      throw dbErr;
    }

    const { rows } = await pool.query(
      "SELECT id, full_name, email, role, department, avatar_filename FROM users WHERE id=$1",
      [req.user.id]
    );
    const u = rows[0];
    return res.json({
      user: {
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        department: u.department ?? null,
        avatarUrl: u.avatar_filename ? `/uploads/avatars/${u.avatar_filename}` : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteAvatar(req, res, next) {
  try {
    const { rows } = await pool.query(
      "SELECT avatar_filename FROM users WHERE id=$1",
      [req.user.id]
    );
    const prev = rows[0]?.avatar_filename;
    if (prev) {
      const full = path.join(process.cwd(), env.uploadDir, "avatars", prev);
      try {
        fs.unlinkSync(full);
      } catch {
        // ignore missing file
      }
    }
    await pool.query(
      "UPDATE users SET avatar_filename=NULL, updated_at=now() WHERE id=$1",
      [req.user.id]
    );
    const { rows: urows } = await pool.query(
      "SELECT id, full_name, email, role, department, avatar_filename FROM users WHERE id=$1",
      [req.user.id]
    );
    const u = urows[0];
    return res.json({
      user: {
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        department: u.department ?? null,
        avatarUrl: null,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  me,
  changePassword,
  updateProfile,
  uploadAvatar,
  avatarUpload,
  deleteAvatar,
};

