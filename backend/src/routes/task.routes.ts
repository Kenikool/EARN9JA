import { Router } from "express";
import { taskController } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import {
  createTaskSchema,
  browseTasksSchema,
  submitTaskSchema,
  reviewSubmissionSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "../validators/task.validator.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/tasks
 * @desc    Browse available tasks (Worker)
 * @access  Private
 */
router.get("/", validateRequest(browseTasksSchema), taskController.browseTasks);

/**
 * @route   GET /api/v1/tasks/my-tasks
 * @desc    Get worker's accepted tasks
 * @access  Private
 */
router.get(
  "/my-tasks",
  validateRequest(taskQuerySchema),
  taskController.getMyTasks
);

/**
 * @route   GET /api/v1/tasks/my-campaigns
 * @desc    Get sponsor's created tasks
 * @access  Private
 */
router.get(
  "/my-campaigns",
  validateRequest(taskQuerySchema),
  taskController.getMyCampaigns
);

/**
 * @route   GET /api/v1/tasks/dashboard-stats
 * @desc    Get sponsor dashboard statistics
 * @access  Private
 */
router.get("/dashboard-stats", taskController.getDashboardStats);

/**
 * @route   GET /api/v1/tasks/:taskId
 * @desc    Get task details
 * @access  Private
 */
router.get("/:taskId", taskController.getTask);

/**
 * @route   POST /api/v1/tasks
 * @desc    Create a new task (Sponsor)
 * @access  Private
 */
router.post("/", validateRequest(createTaskSchema), taskController.createTask);

/**
 * @route   PUT /api/v1/tasks/:taskId
 * @desc    Update task (Sponsor)
 * @access  Private
 */
router.put(
  "/:taskId",
  validateRequest(updateTaskSchema),
  taskController.updateTask
);

/**
 * @route   POST /api/v1/tasks/:taskId/toggle-status
 * @desc    Pause/Resume task (Sponsor)
 * @access  Private
 */
router.post("/:taskId/toggle-status", taskController.toggleTaskStatus);

/**
 * @route   DELETE /api/v1/tasks/:taskId
 * @desc    Delete task (Sponsor)
 * @access  Private
 */
router.delete("/:taskId", taskController.deleteTask);

/**
 * @route   POST /api/v1/tasks/:taskId/accept
 * @desc    Accept task (Worker)
 * @access  Private
 */
router.post("/:taskId/accept", taskController.acceptTask);

/**
 * @route   POST /api/v1/tasks/submissions/:submissionId/submit
 * @desc    Submit task completion (Worker)
 * @access  Private
 */
router.post(
  "/submissions/:submissionId/submit",
  validateRequest(submitTaskSchema),
  taskController.submitTask
);

/**
 * @route   GET /api/v1/tasks/:taskId/submissions
 * @desc    Get task submissions (Sponsor)
 * @access  Private
 */
router.get(
  "/:taskId/submissions",
  validateRequest(taskQuerySchema),
  taskController.getTaskSubmissions
);

/**
 * @route   POST /api/v1/tasks/submissions/:submissionId/review
 * @desc    Review submission (Sponsor)
 * @access  Private
 */
router.post(
  "/submissions/:submissionId/review",
  validateRequest(reviewSubmissionSchema),
  taskController.reviewSubmission
);

/**
 * @route   PATCH /api/v1/tasks/:taskId/pause
 * @desc    Pause task (Sponsor)
 * @access  Private
 */
router.patch("/:taskId/pause", taskController.pauseTask);

/**
 * @route   PATCH /api/v1/tasks/:taskId/resume
 * @desc    Resume task (Sponsor)
 * @access  Private
 */
router.patch("/:taskId/resume", taskController.resumeTask);

/**
 * @route   DELETE /api/v1/tasks/:taskId/cancel
 * @desc    Cancel task and refund escrow (Sponsor)
 * @access  Private
 */
router.delete("/:taskId/cancel", taskController.cancelTask);

/**
 * @route   GET /api/v1/tasks/:taskId/details
 * @desc    Get detailed task information (Sponsor)
 * @access  Private
 */
router.get("/:taskId/details", taskController.getTaskDetails);

export default router;
