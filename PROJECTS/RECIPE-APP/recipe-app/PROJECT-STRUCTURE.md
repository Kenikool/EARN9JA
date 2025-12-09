# Recipe Sharing App - Project Structure

```
recipe-app/
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── FilterPanel.jsx
│   │   │   │   └── Loader.jsx
│   │   │   ├── recipe/
│   │   │   │   ├── RecipeCard.jsx
│   │   │   │   ├── RecipeGrid.jsx
│   │   │   │   ├── RecipeDetail.jsx
│   │   │   │   ├── IngredientList.jsx
│   │   │   │   ├── InstructionSteps.jsx
│   │   │   │   ├── RecipeForm.jsx
│   │   │   │   └── NutritionInfo.jsx
│   │   │   ├── review/
│   │   │   │   ├── ReviewSection.jsx
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   ├── ReviewForm.jsx
│   │   │   │   └── RatingStars.jsx
│   │   │   ├── mealplan/
│   │   │   │   ├── MealCalendar.jsx
│   │   │   │   ├── DayView.jsx
│   │   │   │   └── MealSlot.jsx
│   │   │   ├── shopping/
│   │   │   │   ├── ShoppingList.jsx
│   │   │   │   ├── ShoppingItem.jsx
│   │   │   │   └── CategoryGroup.jsx
│   │   │   └── profile/
│   │   │       ├── UserProfile.jsx
│   │   │       ├── RecipeCollection.jsx
│   │   │       └── FollowButton.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── RecipeDetail.jsx
│   │   │   ├── CreateRecipe.jsx
│   │   │   ├── EditRecipe.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── MealPlanner.jsx
│   │   │   ├── ShoppingList.jsx
│   │   │   ├── Favorites.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── recipeSlice.js
│   │   │   │   ├── mealPlanSlice.js
│   │   │   │   └── shoppingSlice.js
│   │   │   └── api/
│   │   │       ├── recipeApi.js
│   │   │       ├── reviewApi.js
│   │   │       ├── mealPlanApi.js
│   │   │       └── userApi.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── hooks/
│   │   │   ├── useRecipes.js
│   │   │   ├── useMealPlan.js
│   │   │   └── useShoppingList.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env
│
├── server/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Recipe.js
│   │   │   ├── Review.js
│   │   │   ├── MealPlan.js
│   │   │   ├── ShoppingList.js
│   │   │   └── Collection.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── recipes.js
│   │   │   ├── reviews.js
│   │   │   ├── mealPlans.js
│   │   │   ├── shopping.js
│   │   │   ├── users.js
│   │   │   └── upload.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── recipeController.js
│   │   │   ├── reviewController.js
│   │   │   ├── mealPlanController.js
│   │   │   ├── shoppingController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── upload.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   ├── cloudinary.js
│   │   │   ├── nutritionCalculator.js
│   │   │   └── shoppingListAggregator.js
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── cloudinary.js
│   │   └── server.js
│   ├── uploads/
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
```

## Key Directories Explained

### Client Structure
- **components/recipe**: Recipe display and form components with dynamic ingredient/instruction fields
- **components/mealplan**: Calendar view for meal planning
- **components/shopping**: Shopping list with ingredient aggregation
- **store**: Redux state for recipes, meal plans, and shopping lists

### Server Structure
- **models**: Complex schemas for Recipe (with embedded ingredients/instructions), MealPlan, ShoppingList
- **utils**: Helper functions for nutrition calculation and shopping list aggregation
- **controllers**: Business logic for recipe management, meal planning, and social features
