// eventx-backend/routes/analytics.js
import express from "express";
import {
  getDashboardStats,
  getEventAnalytics,
  getTopEvents,
  getMonthlyStats
} from "../controllers/analyticsController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get("/dashboard", getDashboardStats);
router.get("/event/:eventId", getEventAnalytics);
router.get("/top-events", getTopEvents);
router.get("/monthly", getMonthlyStats);

export default router;
