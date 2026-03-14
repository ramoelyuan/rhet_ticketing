const express = require("express");
const { authRequired } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/rbac");
const { getTechnicianOfTheMonthCertificate } = require("../controllers/certificateController");

const router = express.Router();

router.use(authRequired, requireRole("ADMIN"));

router.get("/technician-of-the-month", getTechnicianOfTheMonthCertificate);

module.exports = router;
