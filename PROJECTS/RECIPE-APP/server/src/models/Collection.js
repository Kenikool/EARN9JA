import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
      maxlength: [100, "Collection name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

collectionSchema.index({ user: 1, createdAt: -1 });
collectionSchema.index({ isPublic: 1, createdAt: -1 });

collectionSchema.virtual("recipeCount").get(function () {
  return this.recipes.length;
});

collectionSchema.set("toJSON", { virtuals: true });
collectionSchema.set("toObject", { virtuals: true });

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
