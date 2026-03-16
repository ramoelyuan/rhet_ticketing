const path = require("path");
const fs = require("fs");
const { pool } = require("../config/db");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getImageBase64(relativePath) {
  const candidates = [
    path.join(process.cwd(), "frontend", "public", relativePath),
    path.join(process.cwd(), "..", "frontend", "public", relativePath),
    path.join(__dirname, "..", "..", "frontend", "public", relativePath),
    path.join(__dirname, "..", "assets", relativePath),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        const ext = path.extname(p).toLowerCase();
        const mime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
        return `data:${mime};base64,${buf.toString("base64")}`;
      }
    } catch {
      // continue
    }
  }
  return null;
}

function getSupportCertificateBase64() {
  if (process.env.CERTIFICATE_IMAGE_PATH) {
    const p = path.isAbsolute(process.env.CERTIFICATE_IMAGE_PATH)
      ? process.env.CERTIFICATE_IMAGE_PATH
      : path.join(process.cwd(), process.env.CERTIFICATE_IMAGE_PATH);
    if (fs.existsSync(p)) {
      try {
        const buf = fs.readFileSync(p);
        const ext = path.extname(p).toLowerCase();
        const mime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
        return `data:${mime};base64,${buf.toString("base64")}`;
      } catch {
        // fall through to getImageBase64
      }
    }
  }
  return getImageBase64("supportcertificate.png");
}

async function getTopTechnicianForMonth(month, year) {
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  if (!monthNum || monthNum < 1 || monthNum > 12 || !yearNum || yearNum < 2000) {
    return null;
  }
  const monthStart = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
  const { rows } = await pool.query(
    `
    SELECT
      u.full_name AS technician,
      COUNT(t.id)::int AS resolved_count
    FROM users u
    JOIN technicians tech ON tech.user_id = u.id
    LEFT JOIN tickets t ON t.assigned_technician_id = u.id
      AND t.status = 'RESOLVED'
      AND (t.resolved_at IS NOT NULL OR t.closed_at IS NOT NULL)
      AND COALESCE(t.resolved_at, t.closed_at) >= $1::date
      AND COALESCE(t.resolved_at, t.closed_at) < ($1::date + interval '1 month')
    WHERE u.role = 'TECHNICIAN' AND u.is_active = true
    GROUP BY u.full_name
    ORDER BY resolved_count DESC, technician ASC
    LIMIT 1
    `,
    [monthStart]
  );
  const row = rows[0];
  if (!row || row.resolved_count === 0) return null;
  return {
    technicianName: row.technician,
    resolvedCount: row.resolved_count,
    monthYearLabel: `${MONTHS[monthNum - 1]} ${yearNum}`,
    month: monthNum,
    year: yearNum,
  };
}

async function getTopTechnicianByRatingForMonth(month, year) {
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  if (!monthNum || monthNum < 1 || monthNum > 12 || !yearNum || yearNum < 2000) {
    return null;
  }
  const monthStart = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
  const { rows } = await pool.query(
    `
    SELECT
      u.full_name AS technician,
      ROUND(AVG(t.employee_rating)::numeric, 2)::float AS avg_rating,
      COUNT(t.id)::int AS rating_count
    FROM users u
    JOIN technicians tech ON tech.user_id = u.id
    INNER JOIN tickets t ON t.assigned_technician_id = u.id
      AND t.employee_rating IS NOT NULL
      AND (t.resolved_at IS NOT NULL OR t.closed_at IS NOT NULL)
      AND COALESCE(t.resolved_at, t.closed_at) >= $1::date
      AND COALESCE(t.resolved_at, t.closed_at) < ($1::date + interval '1 month')
    WHERE u.role = 'TECHNICIAN' AND u.is_active = true
    GROUP BY u.full_name
    ORDER BY avg_rating DESC, rating_count DESC, technician ASC
    LIMIT 1
    `,
    [monthStart]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    technicianName: row.technician,
    avgRating: row.avg_rating,
    ratingCount: row.rating_count,
    monthYearLabel: `${MONTHS[monthNum - 1]} ${yearNum}`,
    month: monthNum,
    year: yearNum,
  };
}

function buildCertificateHtml(data) {
  const certBgBase64 = getSupportCertificateBase64();
  if (!certBgBase64) {
    throw new Error("Certificate template image not found: frontend/public/supportcertificate.png");
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>IT Support of the Month</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      width: 297mm;
      height: 210mm;
      margin: 0;
      position: relative;
      overflow: hidden;
    }
    .cert-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
    .overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .technician-name {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 48%;
      font-size: 44px;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.2;
      text-align: center;
      text-shadow: 0 1px 2px rgba(255,255,255,0.8);
    }
    .date-issued {
      position: absolute;
      left: 75%;
      transform: translateX(-50%);
      top: 75%;
      font-size: 22px;
      color: #2d3748;
      font-weight: 600;
      text-align: center;
    }
  </style>
</head>
<body>
  <img src="${certBgBase64}" alt="" class="cert-bg" aria-hidden="true" />
  <div class="overlay">
    <p class="technician-name">${escapeHtml(data.technicianName)}</p>
    <p class="date-issued">${escapeHtml(data.dateIssued)}</p>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(s) {
  if (typeof s !== "string") return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function generatePdf(html) {
  const puppeteer = require("puppeteer");
  const launchOpts = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
    ],
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  let browser;
  try {
    browser = await puppeteer.launch(launchOpts);
  } catch (launchErr) {
    const msg = launchErr.message || String(launchErr);
    throw new Error(
      "PDF generation failed: could not start browser. " +
      "On Linux servers (e.g. Proxmox), install Chromium: apt install -y chromium-browser (or chromium), " +
      "then set env PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium (or /usr/bin/chromium-browser). " +
      "Details: " + msg
    );
  }
  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 10000,
    });
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: {
        top: "10mm",
        right: "15mm",
        bottom: "10mm",
        left: "15mm",
      },
      preferCSSPageSize: false,
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = {
  getTopTechnicianForMonth,
  getTopTechnicianByRatingForMonth,
  buildCertificateHtml,
  generatePdf,
  MONTHS,
};
