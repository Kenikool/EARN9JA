import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Meal plan must belong to a user"],
    },
    date: {
      type: Date,
      required: [true, "Please add a date for the meal plan"],
    },
    meals: {
      breakfast: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
      lunch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
      dinner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
      snacks: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Recipe",
        },
      ],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes will be handled by MongoDB Atlas if needed

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

export default MealPlan;
