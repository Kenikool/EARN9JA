import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { RecipeForm } from "../components/recipe/RecipeForm";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuthStore } from "../stores/authStore";
import { recipeAPI, uploadAPI } from "../services/api";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import type { Recipe } from "../types/recipe";
import type { AxiosError } from "axios";

interface RecipeFormData {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  cuisine: string;
  dietaryTags: string[];
  ingredients: any[];
  instructions: any[];
  nutrition?: any;
}

interface ValidationError {
  msg?: string;
  message?: string;
}

export const EditRecipePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [recipe, setRecipe] = React.useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = React.useState(true);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  // Load recipe data on component mount
  React.useEffect(() => {
    const loadRecipe = async () => {
      if (!id) {
        toast.error("Recipe ID not provided");
        navigate("/");
        return;
      }

      try {
        setIsLoadingRecipe(true);
        const response = await recipeAPI.getRecipe(id);
        const recipeData = response.data.data;

        // Check if user is the author or admin
        if (recipeData.author._id !== user?._id && user?.role !== "admin") {
          toast.error("You are not authorized to edit this recipe");
          navigate(`/recipes/${recipeData.slug}`);
          return;
        }

        setRecipe(recipeData);
      } catch (error: unknown) {
        console.error("Error loading recipe:", error);

        if (error instanceof Error) {
          const axiosError = error as AxiosError;
          const response = axiosError.response;

          if (response?.status === 404) {
            toast.error("Recipe not found");
          } else if (response?.status === 401) {
            toast.error("You must be logged in to edit recipes");
          } else {
            toast.error("Failed to load recipe. Please try again.");
          }
        } else {
          toast.error("Failed to load recipe. Please try again.");
        }

        navigate("/");
      } finally {
        setIsLoadingRecipe(false);
      }
    };

    if (user) {
      loadRecipe();
    }
  }, [id, user, navigate]);

  const handleSubmit = async (recipeData: RecipeFormData) => {
    if (!recipe) return;

    setIsLoading(true);

    try {
      // Upload new images first if any
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const imageFiles = fileInput?.files;
      let imageUrls: string[] = recipe.images; // Keep existing images

      if (imageFiles && imageFiles.length > 0) {
        const uploadPromises = Array.from(imageFiles).map((file) => {
          return uploadAPI.uploadSingle(file);
        });

        const uploadResponses = await Promise.all(uploadPromises);
        const newImageUrls = uploadResponses.map(
          (response) => response.data.data.url
        );
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Add images to recipe data
      const finalRecipeData = {
        ...recipeData,
        images: imageUrls,
      };

      // Update the recipe
      const response = await recipeAPI.updateRecipe(
        recipe._id,
        finalRecipeData
      );

      // Show success message
      toast.success("Recipe updated successfully!");

      // Redirect to the updated recipe detail page
      navigate(`/recipes/${response.data.data.slug}`);
    } catch (error: unknown) {
      console.error("Error updating recipe:", error);

      if (error instanceof Error) {
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
              (response.data as any)?.message || "Please check your input data"
            );
          }
        } else if (response?.status === 401) {
          toast.error("You must be logged in to edit recipes");
        } else if (response?.status === 403) {
          toast.error("You are not authorized to edit this recipe");
        } else if (response?.status === 404) {
          toast.error("Recipe not found");
        } else if (response?.status === 413) {
          toast.error("Image file too large. Please use images under 10MB");
        } else {
          toast.error(
            (response?.data as any)?.message ||
              "Failed to update recipe. Please try again."
          );
        }
      } else {
        toast.error("Failed to update recipe. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;

    try {
      setIsLoading(true);
      await recipeAPI.deleteRecipe(recipe._id);

      toast.success("Recipe deleted successfully!");
      navigate("/");
    } catch (error: unknown) {
      console.error("Error deleting recipe:", error);

      if (error instanceof Error) {
        const axiosError = error as AxiosError;
        const response = axiosError.response;

        if (response?.status === 401) {
          toast.error("You must be logged in to delete recipes");
        } else if (response?.status === 403) {
          toast.error("You are not authorized to delete this recipe");
        } else if (response?.status === 404) {
          toast.error("Recipe not found");
        } else {
          toast.error(
            (response?.data as any)?.message ||
              "Failed to delete recipe. Please try again."
          );
        }
      } else {
        toast.error("Failed to delete recipe. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoadingRecipe) {
    return React.createElement(
      ProtectedRoute,
      null,
      React.createElement(
        "div",
        {
          className: "min-h-screen bg-gray-50 flex items-center justify-center",
        },
        React.createElement(LoadingSpinner)
      )
    );
  }

  if (!recipe) {
    return React.createElement(
      ProtectedRoute,
      null,
      React.createElement(
        "div",
        {
          className: "min-h-screen bg-gray-50 flex items-center justify-center",
        },
        React.createElement(
          "div",
          { className: "text-center" },
          React.createElement(
            "h2",
            { className: "text-2xl font-bold text-gray-900" },
            "Recipe not found"
          ),
          React.createElement(
            "button",
            {
              onClick: () => navigate("/"),
              className:
                "mt-4 px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700",
            },
            "Go Home"
          )
        )
      )
    );
  }

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
            "div",
            { className: "flex justify-between items-start" },
            React.createElement(
              "div",
              null,
              React.createElement(
                "h1",
                { className: "text-3xl font-bold text-gray-900" },
                `Edit: ${recipe.title}`
              ),
              React.createElement(
                "p",
                { className: "text-gray-600 mt-2" },
                `Make changes to your recipe ${user?.name || "recipe"}`
              )
            ),
            React.createElement(
              "button",
              {
                onClick: () => setShowDeleteModal(true),
                className:
                  "flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 border border-red-200",
              },
              React.createElement(Trash2, { className: "w-4 h-4 mr-2" }),
              "Delete Recipe"
            )
          )
        ),

        // Form
        React.createElement(RecipeForm, {
          recipe,
          onSubmit: handleSubmit,
          isLoading,
          submitText: "Update Recipe",
        }),

        // Delete Confirmation Modal
        showDeleteModal &&
          React.createElement(
            "div",
            {
              className:
                "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
            },
            React.createElement(
              "div",
              { className: "bg-white rounded-lg p-6 max-w-md mx-4" },
              React.createElement(
                "h3",
                { className: "text-lg font-bold text-gray-900 mb-4" },
                "Delete Recipe"
              ),
              React.createElement(
                "p",
                { className: "text-gray-600 mb-6" },
                `Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`
              ),
              React.createElement(
                "div",
                { className: "flex justify-end space-x-3" },
                React.createElement(
                  "button",
                  {
                    onClick: () => setShowDeleteModal(false),
                    className:
                      "px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200",
                  },
                  "Cancel"
                ),
                React.createElement(
                  "button",
                  {
                    onClick: handleDelete,
                    disabled: isLoading,
                    className:
                      "px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50",
                  },
                  isLoading ? "Deleting..." : "Delete Recipe"
                )
              )
            )
          )
      )
    )
  );
};

export default EditRecipePage;
