# Reading Time Update Guide

## Issue

Reading time is showing as 0 or not updating for existing posts in the database.

## Root Cause

The reading time calculation logic is working correctly in the code, but existing posts in the database may have been created before the reading time feature was properly implemented, or they have a default value of 0.

## Solution

### Automatic Calculation (Already Working)

The reading time is automatically calculated for:

1. **New Posts**: When creating a post via `POST /api/posts`
2. **Updated Posts**: When editing a post via `PUT /api/posts/:id`

The calculation happens in:
- `server/src/controllers/postController.js` - `createPost()` and `updatePost()` functions
- `server/src/utils/readingTime.js` - `calculateReadingTime()` function

### Formula

```javascript
readingTime = Math.ceil(wordCount / 200)
```

- Removes HTML tags from content
- Counts words (split by whitespace)
- Divides by 200 (average reading speed in words per minute)
- Rounds up to nearest minute

### Update Existing Posts

To fix existing posts with incorrect reading times, run the utility script:

```bash
# Navigate to server directory
cd server

# Run the update script
node src/utils/updateReadingTimes.js
```

This script will:
1. Connect to your MongoDB database
2. Find all posts
3. Recalculate reading time for each post based on content
4. Update posts that have incorrect reading times
5. Show progress and results

### Expected Output

```
✅ Connected to MongoDB
📚 Found 15 posts to update
✅ Updated post "My First Post" - Reading time: 3 min
✅ Updated post "React Tutorial" - Reading time: 5 min
⏭️  Skipped post "Quick Tip" - Already correct (1 min)
...
✨ Update complete! Updated 12 out of 15 posts
👋 Disconnected from MongoDB
```

## Verification

After running the script:

1. **Refresh your browser** or navigate to any post
2. **Check the reading time** displayed on post cards and detail pages
3. **Edit a post** and verify the reading time updates when you save

## Testing New Posts

1. Create a new post with substantial content (e.g., 400+ words)
2. Save the post
3. View the post - should show "2 min read" or more
4. Edit the post and add/remove content
5. Save and verify the reading time updates

## Code Locations

### Backend
- **Model**: `server/src/models/Post.js` - `readingTime` field (Number, default: 0)
- **Controller**: `server/src/controllers/postController.js` - `createPost()` and `updatePost()`
- **Utility**: `server/src/utils/readingTime.js` - `calculateReadingTime()`
- **Update Script**: `server/src/utils/updateReadingTimes.js`

### Frontend
- **Display**: Reading time is shown in:
  - `client/src/pages/PostDetailPage.tsx`
  - `client/src/pages/HomePage.tsx`
  - `client/src/pages/DashboardPage.tsx`
  - `client/src/pages/PostsPage.tsx`

## Troubleshooting

### Script Fails to Connect
- Check your `.env` file has correct `MONGODB_URI`
- Ensure MongoDB is running
- Verify network connectivity

### Reading Time Still Shows 0
- Run the update script
- Clear browser cache
- Check if post has content (empty posts = 0 min)

### Reading Time Not Updating on Edit
- Check browser console for errors
- Verify the post is being saved successfully
- Check network tab for API response

## Prevention

Going forward, all new posts and edited posts will automatically have the correct reading time calculated. The update script is only needed once to fix existing posts.
