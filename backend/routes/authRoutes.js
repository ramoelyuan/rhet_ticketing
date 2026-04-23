const express = require("express");
const {
  login,
  me,
  changePassword,
  updateProfile,
  uploadAvatar,
  avatarUpload,
  deleteAvatar,
} = require("../controllers/authController");
const { authRequired } = require("../middlewares/auth");

const router = express.Router();

router.post("/login", login);
router.get("/me", authRequired, me);
router.post("/change-password", authRequired, changePassword);
router.patch("/profile", authRequired, updateProfile);
router.post("/profile/avatar", authRequired, avatarUpload.single("avatar"), uploadAvatar);
router.delete("/profile/avatar", authRequired, deleteAvatar);

module.exports = router;

