# Database Seeding Guide

## Overview

This guide explains how to seed your Recipe Sharing App database with sample data including users, recipes, reviews, collections, meal plans, shopping lists, and social features.

## Prerequisites

- MongoDB running locally or MongoDB Atlas connection string in `.env`
- Node.js installed
- All dependencies installed (`npm install`)

## Environment Setup

Make sure your `server/.env` file has the MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/recipe-app
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-app
```

## Seeding Options

### Option 1: Enhanced Seed (Recommended)

Seeds everything including Phase 16 features (collections, follows, meal plans, shopping lists):

```bash
cd server
npm run seed
```

### Option 2: Basic Seed

Seeds only users, recipes, and reviews:

```bash
cd server
npm run seed:basic
```

## What Gets Seeded

### Enhanced Seed Includes:

**Users (5)**

- John Doe (john@example.com)
- Jane Smith (jane@example.com)
- Chef Mario (mario@example.com)
- Lisa Chen (lisa@example.com)
- Ahmed Hassan (ahmed@example.com)

**Password for all users:** `password123`

**Recipes (10)**

- Classic Italian Spaghetti Carbonara
- Perfect Chicken Tikka Masala
- Fresh Garden Salad
- Homemade Chocolate Chip Cookies
- Authentic Pad Thai
- Mediterranean Quinoa Bowl
- Beef Tacos with Pico de Gallo
- Creamy Mushroom Risotto
- Classic Caesar Salad
- Thai Green Curry

**Reviews**

- 2-6 reviews per recipe with 4-5 star ratings

**Collections (6)**

- Italian Favorites
- Quick Weeknight Meals
- Healthy Options
- Asian Cuisine Collection
- Comfort Food (Private)
- Party Favorites

**Social Features**

- Follow relationships between users
- Favorite recipes for users

**Meal Plans**

- 7 days of meal plans for 2 users
- Includes breakfast, lunch, dinner, and snacks

**Shopping Lists**

- 2 shopping lists with categorized items
- Some items marked as checked

## After Seeding

### Test Login Credentials

You can log in with any of these accounts:

| Email             | Password    | Description                    |
| ----------------- | ----------- | ------------------------------ |
| john@example.com  | password123 | Has collections and meal plans |
| jane@example.com  | password123 | Has healthy recipe collections |
| mario@example.com | password123 | Professional chef profile      |
| lisa@example.com  | password123 | Asian cuisine specialist       |
| ahmed@example.com | password123 | Mediterranean cooking          |

### What to Test

1. **Authentication**

   - Log in with any test account
   - View your profile

2. **Recipes**

   - Browse all recipes
   - View recipe details
   - Search and filter recipes
   - Create new recipes

3. **Reviews**

   - View existing reviews
   - Add your own reviews
   - Edit/delete your reviews

4. **Collections (Phase 16)**

   - View user collections
   - Create new collections
   - Add recipes to collections
   - Make collections public/private

5. **Social Features (Phase 16)**

   - Follow/unfollow users
   - View followers and following
   - Browse other user profiles

6. **Meal Planning**

   - View meal calendar
   - Add recipes to meal plan
   - Generate shopping list from meal plan

7. **Shopping Lists**
   - View shopping list
   - Check/uncheck items
   - Add items manually
   - Clear checked items

## Troubleshooting

### Connection Error

If you get a MongoDB connection error:

- Make sure MongoDB is running locally: `mongod`
- Or check your MongoDB Atlas connection string in `.env`

### Duplicate Key Error

If you get duplicate key errors:

- The database already has data
- Drop the database first: `mongo recipe-app --eval "db.dropDatabase()"`
- Or use MongoDB Compass to delete all collections

### Module Not Found

If you get module errors:

- Make sure you're in the server directory: `cd server`
- Install dependencies: `npm install`

## Re-seeding

To re-seed the database:

1. Drop existing data (the seed script does this automatically)
2. Run the seed command again: `npm run seed`

The seed script will:

- Clear all existing data
- Create fresh seed data
- Display a summary of what was created

## Custom Seeding

To modify the seed data:

- Edit `server/src/utils/seedData.js` for basic data
- Edit `server/src/utils/seedDataEnhanced.js` for Phase 16 features

## Notes

- All passwords are hashed with bcrypt
- Recipe images use Unsplash URLs
- User avatars use Unsplash portrait URLs
- All data is realistic and production-ready
- Collections include both public and private examples
- Follow relationships create a realistic social graph
- Meal plans span the current week
- Shopping lists include categorized items

## Support

If you encounter any issues:

1. Check the console output for specific error messages
2. Verify your MongoDB connection
3. Ensure all dependencies are installed
4. Check that models are properly imported

Happy testing! 🎉
