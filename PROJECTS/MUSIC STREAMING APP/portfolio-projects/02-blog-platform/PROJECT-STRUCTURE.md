# Blog Platform - Project Structure

```
blog-platform/
├── client/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Loader.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   ├── editor/
│   │   │   │   ├── RichTextEditor.tsx
│   │   │   │   ├── ImageUploader.tsx
│   │   │   │   └── EditorToolbar.tsx
│   │   │   ├── blog/
│   │   │   │   ├── BlogCard.tsx
│   │   │   │   ├── BlogList.tsx
│   │   │   │   ├── BlogDetail.tsx
│   │   │   │   ├── CategoryFilter.tsx
│   │   │   │   └── TagCloud.tsx
│   │   │   ├── comments/
│   │   │   │   ├── CommentSection.tsx
│   │   │   │   ├── CommentItem.tsx
│   │   │   │   └── CommentForm.tsx
│   │   │   └── profile/
│   │   │       ├── UserProfile.tsx
│   │   │       ├── AuthorCard.tsx
│   │   │       └── UserStats.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── BlogPost.tsx
│   │   │   ├── CreatePost.tsx
│   │   │   ├── EditPost.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Category.tsx
│   │   │   └── Search.tsx
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── blogStore.ts
│   │   │   └── uiStore.ts
│   │   ├── services/
│   │   │   ├── api.tsogSlice.js
│   │   │   │   ├── commentSlice.js
│   │   │   │   └── uiSlice.js
│   │   │   └── api/
│   │   │       ├── authApi.js
│   │   │       ├── blogApi.js
│   │   │       ├── commentApi.js
│   │   │       └── uploadApi.js
│   │   ├── utils/
│   │   │   ├── formatDate.js
│   │   │   ├── readingTime.js
│   │   │   ├── slugify.js
│   │   │   └── validation.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useBlog.js
│   │   │   └── useDebounce.js
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
│   │   │   ├── Blog.js
│   │   │   ├── Comment.js
│   │   │   ├── Category.js
│   │   │   └── Tag.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── blogs.js
│   │   │   ├── comments.js
│   │   │   ├── users.js
│   │   │   ├── categories.js
│   │   │   └── upload.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── blogController.js
│   │   │   ├── commentController.js
│   │   │   ├── userController.js
│   │   │   └── uploadController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── upload.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   ├── cloudinary.js
│   │   │   ├── slugify.js
│   │   │   └── sanitize.js
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
- **components/editor**: Rich text editor and image upload components
- **components/blog**: Blog display and listing components
- **components/comments**: Comment system with nested replies
- **store**: Redux state management with slices for different features
- **utils**: Helper functions for formatting, validation, etc.

### Server Structure
- **models**: Mongoose schemas for User, Blog, Comment, Category, Tag
- **routes**: API endpoints organized by feature
- **controllers**: Business logic for each route
- **middleware**: Authentication, file upload, validation
- **uploads**: Local storage for uploaded images (if not using Cloudinary)
