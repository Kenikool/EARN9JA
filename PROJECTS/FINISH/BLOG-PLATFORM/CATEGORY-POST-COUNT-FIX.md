# Category Post Count Fix

## Issue
The Technology category (and potentially other categories) was showing `-1` or incorrect post counts in the sidebar.

## Root Cause
The `getCategories` API endpoint was returning categories directly from the database without calculating the actual number of published posts in each category.

## Solution

### 1. Updated Category Controller
Modified `server/src/controllers/categoryController.js` to dynamically calculate post counts:

```javascript
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    // Calculate actual post count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const postCount = await Post.countDocuments({ 
          category: category._id, 
          status: "published" 
        });
        return {
          ...category.toObject(),
          postCount
        };
      })
    );
    
    res.json(categoriesWithCount);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: error.message });
  }
};
```

### 2. Created Utility Script
Created `server/src/utils/updateCategoryPostCounts.js` to fix existing database records.

## How to Fix Existing Data

Run this command from the server directory:

```bash
node src/utils/updateCategoryPostCounts.js
```

This will:
- Connect to your MongoDB database
- Count published posts for each category
- Update the `postCount` field in the database
- Display progress for each category

## Benefits

✅ **Accurate Counts** - Shows real-time post counts for each category
✅ **Dynamic Updates** - Counts are calculated on each request (always accurate)
✅ **No Manual Updates** - No need to manually update counts when posts are added/removed
✅ **Better UX** - Users see accurate category statistics

## Testing

1. Restart your server
2. Check the sidebar - all categories should show correct post counts
3. Create a new post in a category
4. Refresh - the count should update automatically

## Performance Note

The current implementation calculates counts on each request. For very large databases with many categories, consider:
- Caching the results
- Using MongoDB aggregation pipeline
- Updating counts via post hooks in the Post model
