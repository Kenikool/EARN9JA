import { Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get schedule statistics
router.get("/stats", ScheduleController.getStats);

// Check schedule conflicts
router.post("/check-conflicts", ScheduleController.checkConflicts);

// Get all schedules for sponsor
router.get("/", ScheduleController.getSponsorSchedules);

// Create schedule
router.post("/", ScheduleController.createSchedule);

// Get schedule by ID
router.get("/:id", ScheduleController.getSchedule);

// Update schedule
router.put("/:id", ScheduleController.updateSchedule);

// Cancel schedule
router.delete("/:id", ScheduleController.cancelSchedule);

export default router;
