import express from "express";
import { body } from "express-validator";
import {
  getUserMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getMealPlanByDate,
  getMealPlansByDateRange,
  generateShoppingList,
} from "../controllers/mealPlanController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Query routes must come before parameterized routes
router.get("/range", getMealPlansByDateRange);

router.get("/", getUserMealPlans);
router.get("/date/:date", getMealPlanByDate);
router.get("/:id", getMealPlan);
router.get("/:id/shopping-list", generateShoppingList);

router.post(
  "/",
  [
    body("date").isISO8601().withMessage("Please provide a valid date"),
    body("meals").isObject().withMessage("Meals object is required"),
    body("meals.breakfast")
      .optional()
      .isMongoId()
      .withMessage("Invalid breakfast recipe ID"),
    body("meals.lunch")
      .optional()
      .isMongoId()
      .withMessage("Invalid lunch recipe ID"),
    body("meals.dinner")
      .optional()
      .isMongoId()
      .withMessage("Invalid dinner recipe ID"),
    body("meals.snacks")
      .optional()
      .isArray()
      .withMessage("Snacks must be an array"),
    body("meals.snacks.*.recipe")
      .optional()
      .isMongoId()
      .withMessage("Invalid snack recipe ID"),
    body("meals.snacks.*.time")
      .optional()
      .isIn(["morning", "afternoon", "evening"])
      .withMessage("Snack time must be morning, afternoon, or evening"),
  ],
  createMealPlan
);

router.put(
  "/:id",
  [
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid date"),
    body("meals").optional().isObject().withMessage("Meals object is required"),
    body("meals.breakfast")
      .optional()
      .isMongoId()
      .withMessage("Invalid breakfast recipe ID"),
    body("meals.lunch")
      .optional()
      .isMongoId()
      .withMessage("Invalid lunch recipe ID"),
    body("meals.dinner")
      .optional()
      .isMongoId()
      .withMessage("Invalid dinner recipe ID"),
    body("meals.snacks")
      .optional()
      .isArray()
      .withMessage("Snacks must be an array"),
    body("meals.snacks.*.recipe")
      .optional()
      .isMongoId()
      .withMessage("Invalid snack recipe ID"),
    body("meals.snacks.*.time")
      .optional()
      .isIn(["morning", "afternoon", "evening"])
      .withMessage("Snack time must be morning, afternoon, or evening"),
  ],
  updateMealPlan
);

router.delete("/:id", deleteMealPlan);

export default router;
