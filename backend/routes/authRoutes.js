const express = require("express");
const { login, me, changePassword } = require("../controllers/authController");
const { authRequired } = require("../middlewares/auth");

const router = express.Router();

router.post("/login", login);
router.get("/me", authRequired, me);
router.post("/change-password", authRequired, changePassword);

module.exports = router;

