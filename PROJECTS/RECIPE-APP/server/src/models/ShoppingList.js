import mongoose from "mongoose";

const shoppingListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Shopping list must belong to a user"],
    },
    title: {
      type: String,
      default: "Shopping List",
    },
    items: [
      {
        ingredient: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          min: [0.01, "Amount must be greater than 0"],
        },
        unit: {
          type: String,
          required: true,
          enum: [
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
          ],
        },
        checked: {
          type: Boolean,
          default: false,
        },
        category: {
          type: String,
          enum: [
            "produce",
            "dairy",
            "meat",
            "seafood",
            "bakery",
            "pantry",
            "frozen",
            "beverages",
            "snacks",
            "spices",
            "other",
          ],
          default: "other",
        },
        recipes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe",
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes will be handled by MongoDB Atlas if needed

const ShoppingList = mongoose.model("ShoppingList", shoppingListSchema);

export default ShoppingList;
