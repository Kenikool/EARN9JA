import express from "express";
import { body } from "express-validator";
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getUserRecipes,
  getFavoriteRecipes,
  addToFavorites,
  removeFromFavorites,
  getPopularRecipes,
  getRecipesByCuisine,
} from "../controllers/recipeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getRecipes);
router.get("/popular", getPopularRecipes);
router.get("/cuisine/:cuisine", getRecipesByCuisine);
router.get("/:slug", getRecipe);

// Protected routes
router.use(protect); // All routes below require authentication

router.get("/user/:userId", getUserRecipes);
router.get("/favorites/list", getFavoriteRecipes);

router.post(
  "/",
  [
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("description")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be between 10 and 1000 characters"),
    body("prepTime")
      .isInt({ min: 1 })
      .withMessage("Preparation time must be at least 1 minute"),
    body("cookTime")
      .isInt({ min: 0 })
      .withMessage("Cooking time cannot be negative"),
    body("servings")
      .isInt({ min: 1 })
      .withMessage("Servings must be at least 1"),
    body("difficulty")
      .isIn(["easy", "medium", "hard"])
      .withMessage("Difficulty must be easy, medium, or hard"),
    body("cuisine").trim().notEmpty().withMessage("Cuisine is required"),
    body("ingredients")
      .isArray({ min: 1 })
      .withMessage("At least one ingredient is required"),
    body("ingredients.*.name")
      .trim()
      .notEmpty()
      .withMessage("Ingredient name is required"),
    body("ingredients.*.amount")
      .isFloat({ min: 0.01 })
      .withMessage("Ingredient amount must be greater than 0"),
    body("ingredients.*.unit")
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
    body("instructions")
      .isArray({ min: 1 })
      .withMessage("At least one instruction is required"),
    body("instructions.*.stepNumber")
      .isInt({ min: 1 })
      .withMessage("Step number must be at least 1"),
    body("instructions.*.description")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage(
        "Instruction description must be between 10 and 500 characters"
      ),
  ],
  createRecipe
);

router.put(
  "/:id",
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be between 10 and 1000 characters"),
    body("prepTime")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Preparation time must be at least 1 minute"),
    body("cookTime")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Cooking time cannot be negative"),
    body("servings")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Servings must be at least 1"),
    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Difficulty must be easy, medium, or hard"),
    body("cuisine")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Cuisine is required"),
  ],
  updateRecipe
);

router.delete("/:id", deleteRecipe);

// Favorites routes
router.post("/:id/favorite", addToFavorites);
router.delete("/:id/favorite", removeFromFavorites);

export default router;
