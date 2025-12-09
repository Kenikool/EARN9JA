import React from "react";
import { Plus, X, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import type {
  Recipe,
  RecipeIngredient,
  RecipeInstruction,
  RecipeNutrition,
} from "../../types/recipe";

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: {
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
  }) => Promise<void>;
  isLoading?: boolean;
  submitText?: string;
}

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const CUISINE_OPTIONS = [
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "Thai",
  "French",
  "American",
  "Greek",
  "Spanish",
  "Korean",
  "Mediterranean",
  "Middle Eastern",
];

const DIETARY_TAGS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "keto",
  "paleo",
  "low-carb",
  "high-protein",
];

const UNIT_OPTIONS = [
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
];

interface FormData {
  title: string;
  description: string;
  images: string[];
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

export const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  onSubmit,
  isLoading = false,
  submitText = "Create Recipe",
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    title: recipe?.title || "",
    description: recipe?.description || "",
    images: recipe?.images || [],
    prepTime: recipe?.prepTime || 0,
    cookTime: recipe?.cookTime || 0,
    servings: recipe?.servings || 1,
    difficulty: recipe?.difficulty || "medium",
    cuisine: recipe?.cuisine || "",
    dietaryTags: recipe?.dietaryTags || [],
    ingredients: recipe?.ingredients?.length
      ? recipe.ingredients
      : [{ name: "", amount: 0, unit: "", notes: "" }],
    instructions: recipe?.instructions?.length
      ? recipe.instructions
      : [{ stepNumber: 1, description: "", image: "" }],
    nutrition: recipe?.nutrition || {
      calories: undefined,
      protein: undefined,
      carbs: undefined,
      fat: undefined,
      fiber: undefined,
    },
  });

  const [imageFiles, setImageFiles] = React.useState<File[]>([]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof RecipeIngredient,
    value: string | number
  ) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    const newIngredients = [
      ...formData.ingredients,
      { name: "", amount: 0, unit: "", notes: "" },
    ];
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const handleInstructionChange = (
    index: number,
    field: keyof RecipeInstruction,
    value: string | number
  ) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = { ...newInstructions[index], [field]: value };
    setFormData((prev) => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    const newInstructions = [
      ...formData.instructions,
      {
        stepNumber: formData.instructions.length + 1,
        description: "",
        image: "",
      },
    ];
    setFormData((prev) => ({ ...prev, instructions: newInstructions }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter(
        (_, i) => i !== index
      );
      const updatedInstructions = newInstructions.map((instruction, i) => ({
        ...instruction,
        stepNumber: i + 1,
      }));
      setFormData((prev) => ({ ...prev, instructions: updatedInstructions }));
    }
  };

  const handleDietaryTagToggle = (tag: string) => {
    const newTags = formData.dietaryTags.includes(tag)
      ? formData.dietaryTags.filter((t) => t !== tag)
      : [...formData.dietaryTags, tag];
    setFormData((prev) => ({ ...prev, dietaryTags: newTags }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleNutritionChange = (
    field: keyof RecipeNutrition,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: value ? parseFloat(value) : undefined,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a recipe title");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a recipe description");
      return;
    }
    if (formData.ingredients.some((ing) => !ing.name.trim())) {
      toast.error("All ingredients must have a name");
      return;
    }
    if (formData.instructions.some((inst) => !inst.description.trim())) {
      toast.error("All instructions must have a description");
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        difficulty: formData.difficulty,
        cuisine: formData.cuisine,
        dietaryTags: formData.dietaryTags,
        ingredients: formData.ingredients,
        instructions: formData.instructions,
        nutrition: formData.nutrition,
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return React.createElement(
    "form",
    { onSubmit: handleSubmit, className: "space-y-8" },

    // Basic Information Section
    React.createElement(
      "div",
      { className: "bg-white p-6 rounded-lg shadow-sm border" },
      React.createElement(
        "h2",
        { className: "text-2xl font-bold text-gray-900 mb-6" },
        "Recipe Information"
      ),

      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },

        // Title
        React.createElement(
          "div",
          { className: "md:col-span-2" },
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Recipe Title *"
          ),
          React.createElement("input", {
            type: "text",
            value: formData.title,
            onChange: (e) => handleInputChange("title", e.target.value),
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
            placeholder: "Enter recipe title",
            required: true,
          })
        ),

        // Description
        React.createElement(
          "div",
          { className: "md:col-span-2" },
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Description *"
          ),
          React.createElement("textarea", {
            value: formData.description,
            onChange: (e) => handleInputChange("description", e.target.value),
            rows: 3,
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
            placeholder: "Describe your recipe",
            required: true,
          })
        ),

        // Prep Time
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Prep Time (minutes) *"
          ),
          React.createElement("input", {
            type: "number",
            value: formData.prepTime,
            onChange: (e) =>
              handleInputChange("prepTime", parseInt(e.target.value) || 0),
            min: 0,
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
            required: true,
          })
        ),

        // Cook Time
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Cook Time (minutes) *"
          ),
          React.createElement("input", {
            type: "number",
            value: formData.cookTime,
            onChange: (e) =>
              handleInputChange("cookTime", parseInt(e.target.value) || 0),
            min: 0,
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
            required: true,
          })
        ),

        // Servings
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Servings *"
          ),
          React.createElement("input", {
            type: "number",
            value: formData.servings,
            onChange: (e) =>
              handleInputChange("servings", parseInt(e.target.value) || 1),
            min: 1,
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
            required: true,
          })
        ),

        // Difficulty
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Difficulty *"
          ),
          React.createElement(
            "select",
            {
              value: formData.difficulty,
              onChange: (e) =>
                handleInputChange(
                  "difficulty",
                  e.target.value as "easy" | "medium" | "hard"
                ),
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
              required: true,
            },
            DIFFICULTY_OPTIONS.map((option) =>
              React.createElement(
                "option",
                { key: option.value, value: option.value },
                option.label
              )
            )
          )
        ),

        // Cuisine
        React.createElement(
          "div",
          { className: "md:col-span-2" },
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Cuisine *"
          ),
          React.createElement(
            "select",
            {
              value: formData.cuisine,
              onChange: (e) => handleInputChange("cuisine", e.target.value),
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
              required: true,
            },
            React.createElement("option", { value: "" }, "Select cuisine type"),
            CUISINE_OPTIONS.map((cuisine) =>
              React.createElement(
                "option",
                { key: cuisine, value: cuisine },
                cuisine
              )
            )
          )
        )
      ),

      // Dietary Tags
      React.createElement(
        "div",
        { className: "mt-6" },
        React.createElement(
          "label",
          { className: "block text-sm font-medium text-gray-700 mb-3" },
          "Dietary Tags"
        ),
        React.createElement(
          "div",
          { className: "grid grid-cols-2 md:grid-cols-4 gap-3" },
          DIETARY_TAGS.map((tag) =>
            React.createElement(
              "label",
              { key: tag, className: "flex items-center" },
              React.createElement("input", {
                type: "checkbox",
                checked: formData.dietaryTags.includes(tag),
                onChange: () => handleDietaryTagToggle(tag),
                className:
                  "mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500",
              }),
              React.createElement(
                "span",
                { className: "text-sm text-gray-700 capitalize" },
                tag
              )
            )
          )
        )
      )
    ),

    // Ingredients Section
    React.createElement(
      "div",
      { className: "bg-white p-6 rounded-lg shadow-sm border" },
      React.createElement(
        "div",
        { className: "flex justify-between items-center mb-6" },
        React.createElement(
          "h2",
          { className: "text-2xl font-bold text-gray-900" },
          "Ingredients *"
        ),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: addIngredient,
            className:
              "flex items-center px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100",
          },
          React.createElement(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Ingredient"
        )
      ),

      React.createElement(
        "div",
        { className: "space-y-4" },
        formData.ingredients.map((ingredient, index) =>
          React.createElement(
            "div",
            {
              key: index,
              className:
                "flex gap-3 items-end p-4 border border-gray-200 rounded-md",
            },

            // Name
            React.createElement(
              "div",
              { className: "flex-1" },
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-1" },
                "Name"
              ),
              React.createElement("input", {
                type: "text",
                value: ingredient.name,
                onChange: (e) =>
                  handleIngredientChange(index, "name", e.target.value),
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
                placeholder: "e.g., All-purpose flour",
                required: true,
              })
            ),

            // Amount
            React.createElement(
              "div",
              { className: "w-20" },
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-1" },
                "Amount"
              ),
              React.createElement("input", {
                type: "number",
                value: ingredient.amount,
                onChange: (e) =>
                  handleIngredientChange(
                    index,
                    "amount",
                    parseFloat(e.target.value) || 0
                  ),
                step: "0.01",
                min: "0",
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
                required: true,
              })
            ),

            // Unit
            React.createElement(
              "div",
              { className: "w-20" },
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-1" },
                "Unit"
              ),
              React.createElement(
                "select",
                {
                  value: ingredient.unit,
                  onChange: (e) =>
                    handleIngredientChange(index, "unit", e.target.value),
                  className:
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
                  required: true,
                },
                React.createElement("option", { value: "" }, "Unit"),
                UNIT_OPTIONS.map((unit) =>
                  React.createElement(
                    "option",
                    { key: unit, value: unit },
                    unit
                  )
                )
              )
            ),

            // Notes
            React.createElement(
              "div",
              { className: "flex-1" },
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-1" },
                "Notes"
              ),
              React.createElement("input", {
                type: "text",
                value: ingredient.notes || "",
                onChange: (e) =>
                  handleIngredientChange(index, "notes", e.target.value),
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
                placeholder: "optional",
              })
            ),

            // Remove button
            formData.ingredients.length > 1 &&
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => removeIngredient(index),
                  className: "p-2 text-red-600 hover:text-red-800",
                },
                React.createElement(X, { className: "w-5 h-5" })
              )
          )
        )
      )
    ),

    // Instructions Section
    React.createElement(
      "div",
      { className: "bg-white p-6 rounded-lg shadow-sm border" },
      React.createElement(
        "div",
        { className: "flex justify-between items-center mb-6" },
        React.createElement(
          "h2",
          { className: "text-2xl font-bold text-gray-900" },
          "Instructions *"
        ),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: addInstruction,
            className:
              "flex items-center px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100",
          },
          React.createElement(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Step"
        )
      ),

      React.createElement(
        "div",
        { className: "space-y-4" },
        formData.instructions.map((instruction, index) =>
          React.createElement(
            "div",
            { key: index, className: "p-4 border border-gray-200 rounded-md" },
            React.createElement(
              "div",
              { className: "flex items-center justify-between mb-3" },
              React.createElement(
                "h3",
                { className: "text-lg font-medium text-gray-900" },
                `Step ${instruction.stepNumber}`
              ),
              formData.instructions.length > 1 &&
                React.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: () => removeInstruction(index),
                    className: "p-1 text-red-600 hover:text-red-800",
                  },
                  React.createElement(X, { className: "w-5 h-5" })
                )
            ),

            // Description
            React.createElement(
              "div",
              { className: "mb-3" },
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-1" },
                "Description *"
              ),
              React.createElement("textarea", {
                value: instruction.description,
                onChange: (e) =>
                  handleInstructionChange(index, "description", e.target.value),
                rows: 3,
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
                placeholder: "Describe this step...",
                required: true,
              })
            ),

            // Image URL (optional)
            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-1" },
                "Step Image URL (optional)"
              ),
              React.createElement("input", {
                type: "url",
                value: instruction.image || "",
                onChange: (e) =>
                  handleInstructionChange(index, "image", e.target.value),
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
                placeholder: "https://example.com/image.jpg",
              })
            )
          )
        )
      )
    ),

    // Nutrition Information Section (Optional)
    React.createElement(
      "div",
      { className: "bg-white p-6 rounded-lg shadow-sm border" },
      React.createElement(
        "h2",
        { className: "text-2xl font-bold text-gray-900 mb-6" },
        "Nutrition Information (Optional)"
      ),

      React.createElement(
        "div",
        { className: "grid grid-cols-2 md:grid-cols-5 gap-4" },
        Object.entries({
          calories: "Calories",
          protein: "Protein (g)",
          carbs: "Carbs (g)",
          fat: "Fat (g)",
          fiber: "Fiber (g)",
        }).map(([key, label]) =>
          React.createElement(
            "div",
            { key },
            React.createElement(
              "label",
              { className: "block text-sm font-medium text-gray-700 mb-1" },
              label
            ),
            React.createElement("input", {
              type: "number",
              value: formData.nutrition?.[key as keyof RecipeNutrition] || "",
              onChange: (e) =>
                handleNutritionChange(
                  key as keyof RecipeNutrition,
                  e.target.value
                ),
              step: "0.1",
              min: "0",
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
            })
          )
        )
      )
    ),

    // Image Upload Section
    React.createElement(
      "div",
      { className: "bg-white p-6 rounded-lg shadow-sm border" },
      React.createElement(
        "h2",
        { className: "text-2xl font-bold text-gray-900 mb-6" },
        "Recipe Images"
      ),

      React.createElement(
        "div",
        { className: "space-y-4" },

        // File upload input
        React.createElement(
          "div",
          { className: "flex items-center justify-center w-full" },
          React.createElement(
            "label",
            {
              className:
                "flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100",
            },
            React.createElement(
              "div",
              {
                className:
                  "flex flex-col items-center justify-center pt-5 pb-6",
              },
              React.createElement(Upload, {
                className: "w-8 h-8 mb-4 text-gray-500",
              }),
              React.createElement(
                "p",
                { className: "mb-2 text-sm text-gray-500" },
                "Click to upload images",
                React.createElement(
                  "span",
                  { className: "font-semibold" },
                  " or drag and drop"
                )
              ),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500" },
                "PNG, JPG, GIF up to 10MB"
              )
            ),
            React.createElement("input", {
              type: "file",
              multiple: true,
              accept: "image/*",
              onChange: handleImageUpload,
              className: "hidden",
            })
          )
        ),

        // Uploaded images preview
        imageFiles.length > 0 &&
          React.createElement(
            "div",
            { className: "grid grid-cols-3 md:grid-cols-6 gap-3 mt-4" },
            imageFiles.map((file, index) =>
              React.createElement(
                "div",
                { key: index, className: "relative" },
                React.createElement("img", {
                  src: URL.createObjectURL(file),
                  alt: `Preview ${index + 1}`,
                  className: "w-full h-20 object-cover rounded-md",
                }),
                React.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: () => removeImage(index),
                    className:
                      "absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600",
                  },
                  React.createElement(X, { className: "w-3 h-3" })
                )
              )
            )
          )
      )
    ),

    // Submit Button
    React.createElement(
      "div",
      { className: "flex justify-end" },
      React.createElement(
        "button",
        {
          type: "submit",
          disabled: isLoading,
          className:
            "px-8 py-3 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        },
        isLoading ? "Creating..." : submitText
      )
    )
  );
};

export default RecipeForm;
