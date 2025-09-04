// eventx-backend/routes/tickets.js
import express from "express";
import {
  bookTicket,
  getUserTickets,
  getEventTickets,
  validateTicket,
  cancelTicket
} from "../controllers/ticketController.js";
import { auth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

// User routes
router.post("/book", auth, bookTicket);
router.get("/my-tickets", auth, getUserTickets);
router.delete("/:ticketId", auth, cancelTicket);

// Admin/Organizer routes
router.get("/event/:eventId", auth, getEventTickets);
router.put("/:ticketId/validate", auth, validateTicket);

export default router;
