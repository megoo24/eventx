// eventx-backend/routes/events.js
import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAdminEvents,
  updateEventStatus,
  getEventSeatingPlan
} from "../controllers/eventController.js";
import { auth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected routes
router.post("/", auth, createEvent);
router.put("/:id", auth, updateEvent);
router.delete("/:id", auth, deleteEvent);

// Admin routes
router.get("/admin/my-events", auth, getAdminEvents);
router.patch("/:id/status", auth, updateEventStatus);
router.get("/:id/seating-plan", auth, getEventSeatingPlan);

export default router;
