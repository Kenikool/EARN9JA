import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { RecipeForm } from "../components/recipe/RecipeForm";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuthStore } from "../stores/authStore";
import { recipeAPI, uploadAPI } from "../services/api";
import type {
  RecipeIngredient,
  RecipeInstruction,
  RecipeNutrition,
} from "../types/recipe";
import type { AxiosError } from "axios";

interface CreateRecipeData {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  cuisine: string;
  dietaryTags: string[];
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  nutrition?: RecipeNutrition;
}

interface ValidationError {
  msg?: string;
  message?: string;
}

export const CreateRecipePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (recipeData: CreateRecipeData) => {
    setIsLoading(true);

    try {
      // Upload images first if any
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const imageFiles = fileInput?.files;
      let imageUrls: string[] = [];

      if (imageFiles && imageFiles.length > 0) {
        const uploadPromises = Array.from(imageFiles).map((file) => {
          return uploadAPI.uploadSingle(file);
        });

        const uploadResponses = await Promise.all(uploadPromises);
        imageUrls = uploadResponses.map((response) => response.data.data.url);
      }

      // Add images to recipe data
      const finalRecipeData = {
        ...recipeData,
        images: imageUrls,
      };

      // Create the recipe
      const response = await recipeAPI.createRecipe(finalRecipeData);

      // Show success message
      toast.success("Recipe created successfully!");

      // Redirect to the new recipe detail page
      navigate(`/recipes/${response.data.data.slug}`);
    } catch (error: unknown) {
      console.error("Error creating recipe:", error);

      if (error instanceof Error) {
        // Type guard for Error
        if ("response" in error) {
          const axiosError = error as AxiosError;
          const response = axiosError.response;

          if (response?.status === 400) {
            // Validation errors
            const validationErrors = (response.data as any)?.errors;
            if (validationErrors && Array.isArray(validationErrors)) {
              validationErrors.forEach((err: ValidationError) => {
                toast.error(err.msg || err.message || "Validation error");
              });
            } else {
              toast.error(
                (response.data as any)?.message ||
                  "Please check your input data"
              );
            }
          } else if (response?.status === 401) {
            toast.error("You must be logged in to create recipes");
          } else if (response?.status === 413) {
            toast.error("Image file too large. Please use images under 10MB");
          } else if (axiosError.code === "NETWORK_ERROR") {
            toast.error("Network error. Please check your connection");
          } else {
            toast.error(
              (response?.data as any)?.message ||
                "Failed to create recipe. Please try again."
            );
          }
        } else {
          toast.error(error.message || "An unexpected error occurred");
        }
      } else {
        toast.error("Failed to create recipe. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement(
    ProtectedRoute,
    null,
    React.createElement(
      "div",
      { className: "min-h-screen bg-gray-50 py-8" },
      React.createElement(
        "div",
        { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" },

        // Header
        React.createElement(
          "div",
          { className: "mb-8" },
          React.createElement(
            "button",
            {
              onClick: () => navigate(-1),
              className:
                "flex items-center text-gray-600 hover:text-gray-900 mb-4",
            },
            React.createElement(ArrowLeft, { className: "w-5 h-5 mr-2" }),
            "Back"
          ),
          React.createElement(
            "h1",
            { className: "text-3xl font-bold text-gray-900" },
            "Create New Recipe"
          ),
          React.createElement(
            "p",
            { className: "text-gray-600 mt-2" },
            `Share your culinary creation with the ${user?.name || "community"}`
          )
        ),

        // Form
        React.createElement(RecipeForm, {
          onSubmit: handleSubmit,
          isLoading,
          submitText: "Create Recipe",
        })
      )
    )
  );
};

export default CreateRecipePage;
