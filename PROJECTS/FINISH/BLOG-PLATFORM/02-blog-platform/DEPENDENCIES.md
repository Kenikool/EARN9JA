# Blog Platform - Dependencies

## ✅ Currently Installed

### Client Dependencies

#### Core (Installed)

```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.9.4"
}
```

#### State Management (Installed)

```json
{
  "@tanstack/react-query": "^5.90.5"
}
```

#### UI & Styling (Installed)

```json
{
  "tailwindcss": "^4.1.16",
  "@tailwindcss/vite": "^4.1.16",
  "daisyui": "^5.3.10",
  "lucide-react": "^0.548.0"
}
```

#### HTTP Client (Installed)

```json
{
  "axios": "^1.12.2"
}
```

#### Utilities (Installed)

```json
{
  "date-fns": "^4.1.0",
  "react-hot-toast": "^2.6.0"
}
```

#### Dev Dependencies (Installed)

```json
{
  "typescript": "~5.9.3",
  "@types/react": "^19.1.16",
  "@types/react-dom": "^19.1.9",
  "@types/node": "^24.6.0",
  "@vitejs/plugin-react": "^5.0.4",
  "vite": "^7.1.7",
  "eslint": "^9.36.0"
}
```

### Server Dependencies

#### Core (Installed)

```json
{
  "express": "^5.1.0",
  "mongoose": "^8.19.2",
  "dotenv": "^17.2.3",
  "cors": "^2.8.5"
}
```

#### Authentication (Installed)

```json
{
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2"
}
```

#### Security & Validation (Installed)

```json
{
  "helmet": "^8.1.0",
  "express-rate-limit": "^8.1.0",
  "express-validator": "^7.3.0"
}
```

#### Utilities (Installed)

```json
{
  "compression": "^1.8.1",
  "morgan": "^1.10.1"
}
```

#### Dev Dependencies (Installed)

```json
{
  "nodemon": "^3.1.10"
}
```

---

## 📦 Still Needed for Blog Platform

### Client - To Install

#### Rich Text Editor

```bash
npm install react-quill quill
npm install -D @types/react-quill @types/quill
```

_Alternative options: tiptap, lexical, slate_

#### Form Handling

```bash
npm install react-hook-form zod @hookform/resolvers
```

#### HTML Sanitization

```bash
npm install dompurify
npm install -D @types/dompurify
```

#### SEO

```bash
npm install react-helmet-async
```

### Server - To Install

#### File Upload

```bash
npm install multer cloudinary
npm install -D @types/multer
```

#### HTML Sanitization

```bash
npm install sanitize-html
npm install -D @types/sanitize-html
```

#### Utilities

```bash
npm install slugify reading-time
```

#### Security (Optional)

```bash
npm install express-mongo-sanitize
```

---

## 🔧 Configuration Files

### Client - Already Configured

**package.json scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

**vite.config.ts** - ✅ Configured
**tsconfig.json** - ✅ Configured
**tailwind.config.js** - ✅ Configured with DaisyUI

### Server - Already Configured

**package.json scripts:**

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

---

## 🌍 Environment Variables

### Client (.env)

```env
VITE_API_URL=http://localhost:8081/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Server (.env)

```env
PORT=8081
MONGODB_URI=mongodb://localhost:27017/blog-platform
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration (when needed)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

---

## 📋 Installation Commands

### Install Rich Text Editor

```bash
cd client
npm install react-quill quill
npm install -D @types/react-quill @types/quill
```

### Install Form Handling

```bash
cd client
npm install react-hook-form zod @hookform/resolvers
```

### Install File Upload (Server)

```bash
cd server
npm install multer cloudinary slugify reading-time sanitize-html
npm install -D @types/multer @types/sanitize-html
```

### Install HTML Sanitization (Client)

```bash
cd client
npm install dompurify react-helmet-async
npm install -D @types/dompurify
```

---

## ✅ Summary

**Client:**

- ✅ React 19 with TypeScript
- ✅ Vite build tool
- ✅ Tailwind CSS v4 + DaisyUI
- ✅ React Router v7
- ✅ TanStack Query (React Query)
- ✅ Axios for HTTP
- ✅ Lucide React icons
- ✅ Date-fns for dates
- ✅ React Hot Toast for notifications
- ⏳ Need: Rich text editor, form handling, DOMPurify

**Server:**

- ✅ Express 5
- ✅ Mongoose for MongoDB
- ✅ JWT authentication
- ✅ Bcrypt for passwords
- ✅ Helmet for security
- ✅ Rate limiting
- ✅ CORS enabled
- ✅ Morgan for logging
- ⏳ Need: File upload (Multer/Cloudinary), slugify, reading-time

**Ready to start building!** 🚀
