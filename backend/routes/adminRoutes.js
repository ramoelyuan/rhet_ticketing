const express = require("express");
const { authRequired } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/rbac");
const {
  listCategories,
  createCategory,
  toggleCategory,
  listEmployees,
  createEmployee,
  listActivity,
  listTechnicians,
  createTechnician,
  toggleTechnicianAvailability,
  toggleUserActive,
  assignTicket,
  adminDashboard,
  reportTicketsPerTechnician,
  reportCategoryDistribution,
  reportMonthlyTrends,
  reportTechnicianPerformance,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authRequired, requireRole("ADMIN"));

router.get("/dashboard", adminDashboard);

router.get("/activity", listActivity);

router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.patch("/categories/:id/toggle", toggleCategory);

router.get("/employees", listEmployees);
router.post("/employees", createEmployee);

router.get("/technicians", listTechnicians);
router.post("/technicians", createTechnician);
router.patch("/technicians/:id/toggle-availability", toggleTechnicianAvailability);
router.patch("/users/:id/toggle-active", toggleUserActive);

router.post("/tickets/:id/assign", assignTicket);

router.get("/reports/tickets-per-technician", reportTicketsPerTechnician);
router.get("/reports/category-distribution", reportCategoryDistribution);
router.get("/reports/monthly-trends", reportMonthlyTrends);
router.get("/reports/technician-performance", reportTechnicianPerformance);

module.exports = router;

