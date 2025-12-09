# Blog Platform with Rich Text Editor

## 🎯 Project Overview
A full-featured blogging platform with rich text editing, image uploads, comments, likes, and user profiles. Perfect for demonstrating content management, file handling, and social features.

## ✨ Key Features
- Rich text editor (React Quill)
- Image upload and management (Cloudinary)
- Categories and tags
- Comments system with nested replies
- Like/bookmark functionality
- User profiles and author pages
- Search and filtering
- Draft/publish workflow
- Reading time estimation
- Social sharing

## 🛠️ Tech Stack

### Frontend (✅ Installed)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router v7
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS v4 + DaisyUI
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

### Backend (✅ Installed)
- **Runtime**: Node.js with Express 5
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Logging**: Morgan
- **Compression**: Compression middleware

### To Be Added
- **Rich Text Editor**: React Quill
- **File Upload**: Multer + Cloudinary
- **Form Handling**: React Hook Form + Zod
- **HTML Sanitization**: DOMPurify
- **SEO**: React Helmet Async
- **Utilities**: Slugify, Reading Time

## 📁 Current Status

### ✅ Completed
- Project structure created
- All dependencies installed
- Minimal frontend (React + Vite + TypeScript)
- Minimal backend (Express + CORS)
- Empty folder structure ready for development
- Documentation updated

### 🚧 Ready to Build
- Database configuration
- Authentication system
- Blog post CRUD
- Rich text editor integration
- Image upload system
- Comments system
- Search functionality
- User profiles
- Categories & tags

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Cloudinary account (for image uploads)

### Installation

1. **Clone and navigate to project**
```bash
cd blog-platform
```

2. **Install client dependencies**
```bash
cd client
npm install
```

3. **Install server dependencies**
```bash
cd ../server
npm install
```

4. **Set up environment variables**

Client `.env`:
```env
VITE_API_URL=http://localhost:8081/api
```

Server `.env`:
```env
PORT=8081
MONGODB_URI=mongodb://localhost:27017/blog-platform
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

5. **Run development servers**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8081

## 📚 Documentation

- **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** - Detailed 15-phase implementation guide
- **[PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)** - Current project structure
- **[DEPENDENCIES.md](./DEPENDENCIES.md)** - Installed and needed dependencies

## 🎓 Learning Outcomes
- Rich text editor integration
- File upload handling with cloud storage
- Complex data relationships (users, posts, comments)
- Authentication and authorization
- RESTful API design
- TypeScript in full-stack development
- Modern React patterns (hooks, context, query)
- SEO optimization
- Performance optimization for content-heavy apps

## 📊 Difficulty Level
**Intermediate** ⭐⭐⭐☆☆

## ⏱️ Estimated Time
**2-3 weeks** for full implementation

## 💼 Portfolio Value
Demonstrates ability to build:
- Content management systems
- File upload and cloud storage integration
- Social features (comments, likes)
- Authentication systems
- RESTful APIs
- Modern React applications with TypeScript
- Full-stack MERN applications

Perfect for showcasing to potential employers!
