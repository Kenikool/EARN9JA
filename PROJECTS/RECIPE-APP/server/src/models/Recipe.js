import mongoose from "mongoose";
import slugify from "slugify";

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+/.test(v);
          },
          message: "Image must be a valid URL",
        },
      },
    ],
    prepTime: {
      type: Number,
      required: [true, "Please add preparation time"],
      min: [1, "Preparation time must be at least 1 minute"],
    },
    cookTime: {
      type: Number,
      required: [true, "Please add cooking time"],
      min: [0, "Cooking time cannot be negative"],
    },
    servings: {
      type: Number,
      required: [true, "Please add number of servings"],
      min: [1, "Servings must be at least 1"],
    },
    difficulty: {
      type: String,
      required: [true, "Please add difficulty level"],
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Difficulty must be either: easy, medium, or hard",
      },
    },
    cuisine: {
      type: String,
      required: [true, "Please add cuisine type"],
      trim: true,
    },
    dietaryTags: [
      {
        type: String,
        enum: [
          "vegetarian",
          "vegan",
          "gluten-free",
          "dairy-free",
          "keto",
          "paleo",
          "low-carb",
          "high-protein",
        ],
      },
    ],
    ingredients: [
      {
        name: {
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
        notes: {
          type: String,
          trim: true,
          maxlength: [100, "Notes cannot be more than 100 characters"],
        },
      },
    ],
    instructions: [
      {
        stepNumber: {
          type: Number,
          required: true,
          min: [1, "Step number must be at least 1"],
        },
        description: {
          type: String,
          required: true,
          trim: true,
          maxlength: [
            500,
            "Instruction description cannot be more than 500 characters",
          ],
        },
        image: {
          type: String,
          validate: {
            validator: function (v) {
              return !v || /^https?:\/\/.+/.test(v);
            },
            message: "Instruction image must be a valid URL",
          },
        },
      },
    ],
    nutrition: {
      calories: {
        type: Number,
        min: [0, "Calories cannot be negative"],
      },
      protein: {
        type: Number,
        min: [0, "Protein cannot be negative"],
      },
      carbs: {
        type: Number,
        min: [0, "Carbs cannot be negative"],
      },
      fat: {
        type: Number,
        min: [0, "Fat cannot be negative"],
      },
      fiber: {
        type: Number,
        min: [0, "Fiber cannot be negative"],
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipe must have an author"],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
      set: (val) => Math.round(val * 10) / 10,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Total reviews cannot be negative"],
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews
recipeSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "recipe",
});

// Indexes will be handled by MongoDB Atlas if needed

// Pre-save middleware to generate slug
recipeSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    if (this.slug.length === 0) {
      this.slug = `recipe-${Date.now()}`;
    }
  }
  next();
});

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
