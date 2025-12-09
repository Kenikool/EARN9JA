# Quick Start Guide - Blog Platform

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB running (local or Atlas)
- Both servers running

### Start the Application

```bash
# Terminal 1 - Start Backend
cd server
npm run dev
# Server runs on http://localhost:8081

# Terminal 2 - Start Frontend  
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## 🎯 Quick Feature Guide

### 1. Search for Posts
- **Location**: Home page or Posts page
- **How**: Type in search bar and press Enter
- **Result**: Redirects to `/search?q=your-query`
- **Features**: Pagination, result count, relevance sorting

### 2. Create a Post
- **Location**: Click "Write a Post" or navigate to `/create`
- **Requirements**: Must be logged in
- **Steps**:
  1. Enter title (required)
  2. Write content using rich text editor (required)
  3. Add excerpt (optional, max 300 chars)
  4. Add featured image URL (optional)
  5. Select category (optional)
  6. Add tags, comma-separated (optional)
  7. Choose Draft or Published
  8. Click "Publish Post" or "Save Draft"

### 3. Edit a Post
- **Location**: Post detail page → "Edit Post" button
- **Requirements**: Must be post author or admin
- **Steps**:
  1. Click "Edit Post" on your post
  2. Modify any fields
  3. Click "Update Post"
  4. Or click "Delete" to remove post

### 4. Like a Post
- **Location**: Post detail page
- **Requirements**: Must be logged in
- **How**: Click the heart icon
- **Result**: Like count increases, heart fills red

### 5. Comment on a Post
- **Location**: Post detail page, below content
- **Requirements**: Must be logged in
- **Steps**:
  1. Type comment in textarea
  2. Click "Post Comment"
  3. To reply: Click "Reply" on any comment

### 6. Delete a Comment
- **Location**: Your own comments
- **Requirements**: Must be comment author or admin
- **How**: Click trash icon on comment

---

## 🔑 User Roles

### Regular User
- Create, edit, delete own posts
- Comment on any post
- Like posts
- Search posts
- View all published posts

### Admin
- All user permissions
- Edit/delete any post
- Delete any comment

---

## 📍 Routes Reference

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home page | No |
| `/login` | Login page | No |
| `/register` | Register page | No |
| `/posts` | All posts listing | No |
| `/posts/:slug` | Post detail | No |
| `/search` | Search results | No |
| `/create` | Create new post | Yes |
| `/edit/:id` | Edit post | Yes (author/admin) |

---

## 🎨 Rich Text Editor Toolbar

| Button | Function |
|--------|----------|
| H1, H2, H3 | Headers |
| **B** | Bold |
| *I* | Italic |
| U | Underline |
| ~~S~~ | Strikethrough |
| 1. | Ordered list |
| • | Bullet list |
| " | Blockquote |
| `</>` | Code block |
| 🔗 | Insert link |
| 🧹 | Clean formatting |

---

## 🔍 Search Tips

- Search looks in: title, content, and tags
- Results sorted by relevance
- Only published posts appear
- Use specific keywords for better results
- Pagination available for many results

---

## 💡 Pro Tips

### Creating Great Posts
1. Use descriptive titles
2. Add a featured image for visual appeal
3. Write a compelling excerpt (shows in search results)
4. Use headers to structure content
5. Add relevant tags for discoverability
6. Choose appropriate category

### Using the Editor
- Use headers (H1, H2, H3) to organize content
- Bold important points
- Use lists for better readability
- Add blockquotes for emphasis
- Use code blocks for technical content
- Preview by viewing the post after publishing

### Managing Posts
- Save as draft to work on later
- Edit anytime before publishing
- Change from draft to published in edit page
- Delete posts you no longer need

---

## 🐛 Troubleshooting

### Can't Create Post
- ✅ Check if logged in
- ✅ Verify title and content are filled
- ✅ Check browser console for errors

### Can't Edit Post
- ✅ Verify you're the post author
- ✅ Check if logged in
- ✅ Admins can edit any post

### Search Not Working
- ✅ Verify backend server is running
- ✅ Check if posts exist in database
- ✅ Try different search terms

### Editor Not Loading
- ✅ Check browser console for errors
- ✅ Verify react-quill is installed
- ✅ Refresh the page

---

## 📊 API Endpoints (for testing)

### Search
```bash
GET http://localhost:8081/api/search?q=keyword&page=1&limit=10
```

### Posts
```bash
# Get all posts
GET http://localhost:8081/api/posts

# Get single post (by slug or ID)
GET http://localhost:8081/api/posts/:slug
GET http://localhost:8081/api/posts/:id

# Create post (requires auth)
POST http://localhost:8081/api/posts
Headers: Authorization: Bearer <token>
Body: { title, content, ... }

# Update post (requires auth)
PUT http://localhost:8081/api/posts/:id
Headers: Authorization: Bearer <token>
Body: { title, content, ... }

# Delete post (requires auth)
DELETE http://localhost:8081/api/posts/:id
Headers: Authorization: Bearer <token>

# Like post (requires auth)
POST http://localhost:8081/api/posts/:id/like
Headers: Authorization: Bearer <token>
```

### Comments
```bash
# Get comments for post
GET http://localhost:8081/api/posts/:postId/comments

# Create comment (requires auth)
POST http://localhost:8081/api/posts/:postId/comments
Headers: Authorization: Bearer <token>
Body: { content, parentComment? }

# Delete comment (requires auth)
DELETE http://localhost:8081/api/comments/:id
Headers: Authorization: Bearer <token>
```

---

## 🎓 Learning Resources

### Technologies Used
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, DaisyUI
- **Backend**: Node.js, Express 5, MongoDB, Mongoose
- **Editor**: ReactQuill (Quill.js)
- **State**: TanStack Query (React Query)
- **Auth**: JWT, bcrypt
- **Security**: DOMPurify, CORS, Helmet

### Key Concepts
- **Rich Text Editing**: HTML content with sanitization
- **Full-Text Search**: MongoDB text indexes
- **Authentication**: JWT tokens in localStorage
- **Authorization**: Role-based access control
- **Nested Comments**: Parent-child relationships
- **Pagination**: Limit/skip pattern

---

## 📞 Support

### Check These First
1. **PHASE-7-11-TEST-PLAN.md** - Comprehensive testing checklist
2. **PHASE-7-11-COMPLETION-SUMMARY.md** - Feature documentation
3. **IMPLEMENTATION-PLAN.md** - Full project plan

### Common Issues
- **Port already in use**: Change PORT in .env file
- **MongoDB connection error**: Check MONGODB_URI in .env
- **CORS errors**: Verify backend CORS configuration
- **Auth errors**: Check JWT_SECRET in .env

---

## ✨ Enjoy Your Blog Platform!

You now have a fully functional blog platform with:
- ✅ Search functionality
- ✅ Rich text editor
- ✅ User authentication
- ✅ Post management (CRUD)
- ✅ Comments system
- ✅ Like functionality
- ✅ Authorization controls

Happy blogging! 🎉
