# Like Notification & Reading Time Fixes

## Issues Fixed

### 1. Like/Dislike Toast Notifications ✅

**Problem:** The toast notification always showed "Post liked!" or "Post unliked" regardless of the actual action.

**Solution:** Updated the toast messages to be more descriptive:
- When liking a post: "❤️ You liked this post!"
- When disliking a post: "💔 You disliked this post"

**Files Modified:**
- `client/src/pages/PostDetailPage.tsx` - Updated like mutation success handler
- `client/src/pages/HomePage.tsx` - Updated like mutation success handler

### 2. Reading Time Calculation ✅

**Problem:** Reading time wasn't updating when editing posts.

**Solution:** The backend already recalculates reading time automatically when a post is updated. The calculation happens in:
- `server/src/controllers/postController.js` - `updatePost` function
- `server/src/utils/readingTime.js` - `calculateReadingTime` function

The reading time is recalculated based on:
- Word count from the content (HTML tags removed)
- Average reading speed: 200 words per minute
- Rounded up to the nearest minute

**Files Modified:**
- `client/src/pages/EditPostPage.tsx` - Updated success message to confirm reading time recalculation

## How It Works

### Like/Dislike Logic
1. User clicks the heart icon on a post
2. Backend checks if user already liked the post
3. If liked: removes like (dislike action)
4. If not liked: adds like (like action)
5. Returns `isLiked: true/false` to indicate the new state
6. Frontend shows appropriate toast message

### Reading Time Calculation
1. User edits post content and saves
2. Backend receives the updated content
3. `calculateReadingTime()` function:
   - Strips HTML tags from content
   - Counts words (split by whitespace)
   - Divides by 200 (average reading speed)
   - Rounds up to nearest minute
4. Updated reading time is saved with the post
5. Frontend displays the new reading time automatically

## Testing

To test the fixes:

1. **Like/Dislike Notifications:**
   - Login to your account
   - Go to any post
   - Click the heart icon - should see "❤️ You liked this post!"
   - Click again - should see "💔 You disliked this post"

2. **Reading Time:**
   - Create or edit a post
   - Add/remove significant content
   - Save the post
   - View the post - reading time should reflect the new content length
   - Check the success message: "Post updated successfully! Reading time recalculated."

## Technical Details

**Reading Time Formula:**
```javascript
readingTime = Math.ceil(wordCount / 200)
```

**Like State Management:**
```javascript
// Backend returns:
{
  likes: number,      // Total like count
  isLiked: boolean    // true if just liked, false if just unliked
}
```
