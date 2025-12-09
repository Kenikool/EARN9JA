# Recipe Sharing App - Dependencies

## Client Dependencies

### Core (Current Setup)

```json
{
  "react": "latest",
  "react-dom": "latest"
}
```

### Development Dependencies (Current Setup)

```json
{
  "@eslint/js": "latest",
  "@types/node": "latest",
  "@types/react": "latest",
  "@types/react-dom": "latest",
  "@vitejs/plugin-react": "latest",
  "daisyui": "latest",
  "eslint": "latest",
  "eslint-plugin-react-hooks": "latest",
  "eslint-plugin-react-refresh": "latest",
  "globals": "latest",
  "typescript": "latest",
  "typescript-eslint": "latest",
  "vite": "latest"
}
```

### Note

Your current client setup uses React 18.2.0 with TypeScript and Vite. The @types/react version (^19.1.16) is higher than your React version, which is fine for type definitions.

### Recommended Additional Dependencies for Recipe App

```json
{
  "react-router-dom": "latest",
  "zustand": "latest",
  "@tanstack/react-query": "latest",
  "react-hook-form": "latest",
  "zod": "latest",
  "axios": "latest",
  "tailwindcss": "latest",
  "@headlessui/react": "latest",
  "react-big-calendar": "latest",
  "date-fns": "latest",
  "react-hot-toast": "latest",
  "react-helmet-async": "latest",
  "framer-motion": "latest"
}
```

## Server Dependencies

### Core

```json
{
  "express": "latest",
  "mongoose": "latest",
  "dotenv": "latest"
}
```

### Authentication

```json
{
  "bcryptjs": "latest",
  "jsonwebtoken": "latest"
}
```

### File Upload

```json
{
  "multer": "latest",
  "cloudinary": "latest"
}
```

### Validation & Security

```json
{
  "express-validator": "latest",
  "express-rate-limit": "latest",
  "helmet": "latest",
  "cors": "latest",
  "xss-clean": "latest",
  "express-mongo-sanitize": "latest"
}
```

### Utilities

```json
{
  "slugify": "latest"
}
```

### Development

```json
{
  "nodemon": "latest",
  "morgan": "latest"
}
```

### Additional Dependencies from Current Server

```json
{
  "compression": "latest",
  "reading-time": "latest",
  "sanitize-html": "latest"
}
```

## Installation Commands

### Client Setup

```bash
cd client
npm install react react-dom
npm install -D @eslint/js @types/node @types/react @types/react-dom @vitejs/plugin-react daisyui eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript typescript-eslint vite
```

### Server Setup

```bash
cd server
npm install express mongoose dotenv
npm install bcryptjs jsonwebtoken
npm install multer cloudinary
npm install express-validator express-rate-limit helmet cors xss-clean express-mongo-sanitize
npm install slugify
npm install -D nodemon morgan
npm install compression reading-time sanitize-html
```

## Environment Variables

### Client (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Server (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipe-app
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional - Nutrition API (if using external service)
NUTRITION_API_KEY=your_nutrition_api_key

NODE_ENV=development
```

## Package.json Scripts

### Client

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

### Server

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "seed": "node src/utils/seedRecipes.js"
  }
}
```

## Optional Dependencies

### For Advanced Features

```json
{
  "react-dropzone": "latest",
  "react-select": "latest",
  "recharts": "latest",
  "react-share": "latest"
}
```

### For Testing

```json
{
  "jest": "latest",
  "@testing-library/react": "latest",
  "@testing-library/jest-dom": "latest",
  "supertest": "latest"
}
```
