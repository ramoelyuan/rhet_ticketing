const express = require("express");
const {
  createTicket,
  listTickets,
  getTicketDetails,
  addReply,
  updateStatus,
  takeTicket,
  technicianWorkload,
} = require("../controllers/ticketController");
const { authRequired } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/rbac");

const router = express.Router();

router.use(authRequired);

router.get("/", listTickets);
router.post("/", requireRole("EMPLOYEE"), createTicket);

router.get("/technicians/workload", requireRole("TECHNICIAN", "ADMIN"), technicianWorkload);

router.get("/:id", getTicketDetails);
router.post("/:id/replies", addReply);
router.post("/:id/take", requireRole("TECHNICIAN", "ADMIN"), takeTicket);
router.post("/:id/status", requireRole("TECHNICIAN", "ADMIN"), updateStatus);

module.exports = router;

