const express = require("express");
const { authRequired } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/rbac");
const {
  getTechnicianOfTheMonthCertificate,
  getTechnicianOfTheMonthByRatingCertificate,
} = require("../controllers/certificateController");

const router = express.Router();

router.use(authRequired, requireRole("ADMIN"));

router.get("/technician-of-the-month", getTechnicianOfTheMonthCertificate);
router.get("/technician-of-the-month-by-rating", getTechnicianOfTheMonthByRatingCertificate);

module.exports = router;
