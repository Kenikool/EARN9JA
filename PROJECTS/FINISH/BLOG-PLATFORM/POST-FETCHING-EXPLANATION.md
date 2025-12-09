# Post Fetching Explanation

## Why HomePage and SavedPostsPage Show Different Posts

### HomePage (Logged-in Users)
**API Endpoint:** `GET /api/posts?limit=6`

**What it returns:**
- The **6 most recent published posts** from ALL users
- Sorted by `publishedAt` date (newest first)
- Shows posts from everyone on the platform

**Purpose:** 
- Discover new content
- See what's trending
- Browse recent posts from the community

---

### SavedPostsPage
**API Endpoint:** `GET /api/posts/saved/posts`

**What it returns:**
- **Only posts YOU have bookmarked**
- Retrieved from `user.savedPosts` array
- Personal collection of saved posts

**Purpose:**
- Read later functionality
- Personal reading list
- Bookmarked content

---

### PostsPage (All Posts)
**API Endpoint:** `GET /api/posts` (no limit)

**What it returns:**
- **All published posts** with pagination
- Default: 10 posts per page
- Can be filtered by category, tag, author
- Can be sorted by date, popularity, trending

**Purpose:**
- Browse all available content
- Filter and search posts
- Paginated view of entire blog

---

### CategoryPage
**API Endpoint:** `GET /api/categories/:slug`

**What it returns:**
- **Posts in a specific category**
- Only published posts with matching category
- Includes category metadata

**Purpose:**
- Browse posts by topic
- Category-specific content
- Filtered view

---

## Recent Changes

### SavedPostsPage Refactored ✅
- Now uses the reusable `PostCard` component
- Added like/bookmark functionality
- Consistent UI across all pages
- When you unbookmark a post, it removes from the list

### All Pages Now Use PostCard ✅
- **HomePage** - Uses PostCard (via custom markup, but similar)
- **PostsPage** - Uses PostCard component
- **CategoryPage** - Uses PostCard component  
- **SavedPostsPage** - Uses PostCard component

## Summary

The pages show different posts because they serve different purposes:

| Page | Shows | Source |
|------|-------|--------|
| **HomePage** | Recent posts from everyone (limited to 6) | `/api/posts?limit=6` |
| **PostsPage** | All published posts (paginated) | `/api/posts` |
| **CategoryPage** | Posts in specific category | `/api/categories/:slug` |
| **SavedPostsPage** | Only YOUR bookmarked posts | `/api/posts/saved/posts` |

This is **intentional design** - each page has a specific purpose and shows relevant content for that purpose.
