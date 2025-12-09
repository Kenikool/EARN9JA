# Real Estate Platform - Dependencies

## Client Dependencies

### Core

```json
{
  "next": "^15.5.6",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "typescript": "^5.0.0"
}
```

### State Management

```json
{
  "zustand": "^4.4.7",
  "@tanstack/react-query": "^5.8.4"
}
```

### Form Handling

```json
{
  "react-hook-form": "^7.49.2",
  "yup": "^1.3.3",
  "@hookform/resolvers": "^3.3.2"
}
```

### HTTP & API

```json
{
  "axios": "^1.6.2"
}
```

### Maps Integration

```json
{
  "@react-google-maps/api": "^2.19.2",
  "mapbox-gl": "^3.0.1",
  "react-map-gl": "^7.1.7"
}
```

### UI & Styling

```json
{
  "tailwindcss": "^4.0.0",
  "daisyui": "^5.5.3",
  "lucide-react": "^0.294.0",
  "framer-motion": "^10.16.16",
  "react-hot-toast": "^2.4.1"
}
```

### Image Handling

```json
{
  "next/image": "^15.5.6",
  "sharp": "^0.33.1"
}
```

### Utilities

```json
{
  "date-fns": "^3.0.6",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

## Server Dependencies (Next.js API Routes)

### Core

```json
{
  "next": "^15.5.6",
  "mongoose": "^8.0.3",
  "dotenv": "^16.3.1"
}
```

### Authentication

```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2"
}
```

### Geocoding & Maps

```json
{
  "@googlemaps/google-maps-services-js": "^3.3.42",
  "node-geocoder": "^4.3.0"
}
```

### File Upload

```json
{
  "cloudinary": "^1.41.0",
  "sharp": "^0.33.1"
}
```

### Email

```json
{
  "nodemailer": "^6.9.7"
}
```

### Validation & Security

```json
{
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "cors": "^2.8.5"
}
```

### Utilities

```json
{
  "slugify": "^1.6.6",
  "uuid": "^9.0.1"
}
```

## Installation Commands

### Client Setup

```bash
cd client
npm install next@latest react@latest react-dom@19 typescript@5
npm install zustand@4 @tanstack/react-query@5
npm install react-hook-form@7 yup@1
npm install axios@1
npm install @react-google-maps/api@2 mapbox-gl@3 react-map-gl@7
npm install tailwindcss@4 daisyui@5 lucide-react@0 framer-motion@10 react-hot-toast@2
npm install date-fns@3 clsx@2 tailwind-merge@2
```

### Database (MongoDB Atlas)

No additional installation needed - connect directly via connection string

## Environment Variables

### Client (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# OR for Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Server (Next.js API Routes)

```
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/real-estate-platform?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Google Maps Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@realestate.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

NODE_ENV=development
```

## Package.json Scripts

### Client

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "type-check": "tsc --noEmit"
  }
}
```

## Google Maps API Setup

### Required APIs

Enable these APIs in Google Cloud Console:

- Maps JavaScript API
- Geocoding API
- Places API
- Geolocation API

### API Key Restrictions

- Set HTTP referrer restrictions for client key
- Set IP address restrictions for server key
- Limit to required APIs only

## Mapbox Alternative

If using Mapbox instead of Google Maps:

```bash
npm install mapbox-gl react-map-gl
```

Get your access token from: https://account.mapbox.com/

## Optional Dependencies

### For Advanced Features

```json
{
  "react-chartjs-2": "^5.2.0",
  "chart.js": "^4.4.1",
  "react-pdf": "^7.6.0",
  "html2canvas": "^1.4.1"
}
```

### For Testing

```json
{
  "jest": "^29.7.0",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5"
}
```

### For Development

```json
{
  "eslint": "^9",
  "eslint-config-next": "^15.5.6",
  "prettier": "^3.0.0"
}
```

## MongoDB Atlas Setup

### Create Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new project
3. Create a cluster (choose free tier for development)
4. Configure network access (allow your IP)
5. Create database user with read/write permissions
6. Get connection string

### Connection String Format

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/real-estate-platform?retryWrites=true&w=majority
```

### Database Collections Needed

- users (with role-based fields)
- properties (with geospatial indexes)
- inquiries
- appointments
- reviews
- favorites

## Deployment Notes

### Vercel (Recommended for Next.js)

- Connect GitHub repository
- Set environment variables in Vercel dashboard
- Automatic deployment on push

### Environment Setup

- Development: localhost:3000
- Production: your-domain.com
- API routes: same domain (/api/\*)

### Database Migration

- MongoDB Atlas is cloud-based, no migration needed
- Simply update connection string for different environments
