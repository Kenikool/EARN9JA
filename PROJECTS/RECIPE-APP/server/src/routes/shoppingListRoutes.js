import express from "express";
import { body } from "express-validator";
import {
  getUserShoppingLists,
  getShoppingList,
  createShoppingListFromRecipes,
  createShoppingListFromMealPlan,
  createCustomShoppingList,
  updateShoppingList,
  deleteShoppingList,
  updateItemStatus,
  addItem,
  removeItem,
} from "../controllers/shoppingListController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/", getUserShoppingLists);
router.get("/:id", getShoppingList);

router.post(
  "/from-recipes",
  [
    body("recipeIds")
      .isArray({ min: 1 })
      .withMessage("At least one recipe ID is required"),
    body("recipeIds.*").isMongoId().withMessage("Invalid recipe ID"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title must be between 1 and 100 characters"),
  ],
  createShoppingListFromRecipes
);

router.post(
  "/from-meal-plan",
  [
    body("mealPlanId")
      .isMongoId()
      .withMessage("Valid meal plan ID is required"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title must be between 1 and 100 characters"),
  ],
  createShoppingListFromMealPlan
);

router.post(
  "/custom",
  [
    body("title")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage(
        "Title is required and must be between 1 and 100 characters"
      ),
    body("items")
      .isArray({ min: 1 })
      .withMessage("At least one item is required"),
    body("items.*.name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Item name is required"),
    body("items.*.amount")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be greater than 0"),
    body("items.*.unit")
      .optional()
      .isIn([
        "cup",
        "cups",
        "tbsp",
        "tsp",
        "oz",
        "lb",
        "g",
        "kg",
        "ml",
        "l",
        "piece",
        "pieces",
        "clove",
        "cloves",
        "slice",
        "slices",
        "pinch",
        "to taste",
      ])
      .withMessage("Invalid unit"),
  ],
  createCustomShoppingList
);

router.put(
  "/:id",
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title must be between 1 and 100 characters"),
  ],
  updateShoppingList
);

router.delete("/:id", deleteShoppingList);

// Item management routes
router.patch(
  "/:id/items/:itemIndex",
  [body("checked").isBoolean().withMessage("Checked status must be a boolean")],
  updateItemStatus
);

router.post(
  "/:id/items",
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Item name is required"),
    body("amount")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be greater than 0"),
    body("unit")
      .optional()
      .isIn([
        "cup",
        "cups",
        "tbsp",
        "tsp",
        "oz",
        "lb",
        "g",
        "kg",
        "ml",
        "l",
        "piece",
        "pieces",
        "clove",
        "cloves",
        "slice",
        "slices",
        "pinch",
        "to taste",
      ])
      .withMessage("Invalid unit"),
  ],
  addItem
);

router.delete("/:id/items", removeItem);

export default router;
