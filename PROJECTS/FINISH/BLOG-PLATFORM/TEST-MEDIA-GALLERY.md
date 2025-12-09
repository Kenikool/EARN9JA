# Testing Media Gallery Feature

## Why Gallery Isn't Showing

The media gallery will **ONLY** display if:
1. The post has a `mediaFiles` array with items
2. You uploaded multiple files when creating the post
3. The post was created **AFTER** the mediaFiles feature was added

## Old Posts vs New Posts

### Old Posts (Created Before Feature)
- ❌ Will NOT show gallery
- ❌ Only have `featuredImage` field
- ❌ Don't have `mediaFiles` array

### New Posts (Created After Feature)
- ✅ Will show gallery if multiple files uploaded
- ✅ Have both `featuredImage` and `mediaFiles`
- ✅ Gallery displays after content

## How to Test

### Step 1: Create a New Post with Multiple Media
1. Go to `/create` (Create Post page)
2. Fill in title and content
3. **Upload 2-3 images or videos** using the MediaUploader
4. Click "Publish Post"

### Step 2: View the Post
1. Navigate to the newly created post
2. Scroll down past the content
3. You should see **"Media Gallery"** section
4. Gallery shows all uploaded media in a grid

### Step 3: Verify Gallery Features
- ✅ Images display in 2-3 column grid
- ✅ Click images to open lightbox
- ✅ Videos play inline with controls
- ✅ Hover effects on images
- ✅ Badge showing media type (📷 or 🎥)

## Debugging

### Check if Post Has Media Files

Open browser console on post detail page and run:
```javascript
// This will show you the post data
console.log(window.__POST_DATA__);
```

Or check the React DevTools to inspect the `post` object.

### Expected Data Structure

A post with media files should have:
```javascript
{
  _id: "...",
  title: "My Post",
  content: "...",
  featuredImage: "https://...",  // First image
  mediaFiles: [                   // All uploaded media
    {
      url: "https://...",
      type: "image",
      publicId: "..."
    },
    {
      url: "https://...",
      type: "video",
      publicId: "..."
    }
  ]
}
```

## Common Issues

### Issue 1: Gallery Not Showing
**Cause:** Viewing an old post without `mediaFiles`
**Solution:** Create a NEW post with multiple files

### Issue 2: Only One Image Shows
**Cause:** Only uploaded one file
**Solution:** Upload 2+ files when creating post

### Issue 3: MediaFiles Empty Array
**Cause:** Files uploaded but not saved
**Solution:** Check browser console for upload errors

## Quick Test Checklist

- [ ] Create new post
- [ ] Upload 2-3 images/videos
- [ ] Publish post
- [ ] View post detail page
- [ ] Scroll to bottom of content
- [ ] See "Media Gallery" heading
- [ ] See grid of uploaded media
- [ ] Click image to test lightbox
- [ ] Play video to test controls

## Example Posts to Create

### Test Post 1: Multiple Images
- Title: "Photo Gallery Test"
- Upload: 3 different images
- Expected: Gallery with 3 images in grid

### Test Post 2: Mixed Media
- Title: "Mixed Media Test"
- Upload: 2 images + 1 video
- Expected: Gallery with 2 images and 1 video

### Test Post 3: Videos Only
- Title: "Video Gallery Test"
- Upload: 2-3 videos
- Expected: Gallery with videos (with controls)

## Success Criteria

✅ Gallery appears below post content
✅ All uploaded media displays
✅ Images open in lightbox when clicked
✅ Videos play with native controls
✅ Responsive grid layout
✅ Hover effects work
✅ Media type badges show

---

**Note:** If you're still not seeing the gallery after creating a new post with multiple files, check the browser console for errors and verify the post data includes the `mediaFiles` array.
