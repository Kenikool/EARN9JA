# Server Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)

## Installation Steps

### 1. Install Dependencies
```cmd
cd server
npm install nodemailer
```

### 2. Configure Environment Variables
The `.env` file has been created with default values. Update these values:

**Required:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Change to a secure random string
- `JWT_REFRESH_SECRET` - Change to a different secure random string

**Optional (can configure later):**
- Email settings (for password reset, order confirmations)
- Payment gateway keys (Stripe, Flutterwave, Paystack)
- Cloudinary settings (for image uploads)

### 3. Start MongoDB
Make sure MongoDB is running:
```cmd
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

### 4. Start the Server
```cmd
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on http://localhost:8081

## Testing the API

### Health Check
```cmd
curl http://localhost:8081/health
```

### Test Endpoints

#### 1. Register a User
```cmd
curl -X POST http://localhost:8081/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

#### 2. Login
```cmd
curl -X POST http://localhost:8081/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Save the `accessToken` from the response for authenticated requests.

#### 3. Get Current User (Protected)
```cmd
curl http://localhost:8081/api/auth/me ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Create Category (Admin only)
```cmd
curl -X POST http://localhost:8081/api/categories ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" ^
  -d "{\"name\":\"Electronics\",\"description\":\"Electronic devices and gadgets\"}"
```

#### 5. Get All Categories
```cmd
curl http://localhost:8081/api/categories
```

#### 6. Create Product (Admin/Vendor)
```cmd
curl -X POST http://localhost:8081/api/products ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" ^
  -d "{\"name\":\"iPhone 15\",\"description\":\"Latest iPhone\",\"price\":999,\"category\":\"CATEGORY_ID\",\"images\":[\"https://example.com/image.jpg\"],\"stock\":10}"
```

#### 7. Get All Products
```cmd
curl http://localhost:8081/api/products
```

#### 8. Search Products
```cmd
curl "http://localhost:8081/api/products?search=iphone&minPrice=500&maxPrice=1500"
```

## Common Issues

### Issue: MongoDB Connection Error
**Solution:** Make sure MongoDB is running and the connection string in `.env` is correct.

### Issue: JWT Error
**Solution:** Make sure `JWT_SECRET` is set in `.env` file.

### Issue: Email Not Sending
**Solution:** Email is optional. Configure email settings in `.env` when ready. The API will work without email configuration.

### Issue: Port Already in Use
**Solution:** Change the `PORT` in `.env` file or stop the process using port 8081.

## Next Steps

1. Install nodemailer: `npm install nodemailer`
2. Configure email settings for password reset and notifications
3. Set up payment gateways (Stripe, Flutterwave, Paystack)
4. Configure Cloudinary for image uploads
5. Create admin user and test product management
6. Continue with Phase 4 implementation

## API Documentation

All endpoints are documented in the implementation plan. Key routes:

**Authentication:**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (protected)
- PUT `/api/auth/profile` - Update profile (protected)
- PUT `/api/auth/password` - Change password (protected)
- POST `/api/auth/forgot-password` - Request password reset
- PUT `/api/auth/reset-password/:token` - Reset password

**Categories:**
- GET `/api/categories` - Get all categories
- GET `/api/categories/:slug` - Get single category
- POST `/api/categories` - Create category (admin)
- PUT `/api/categories/:id` - Update category (admin)
- DELETE `/api/categories/:id` - Delete category (admin)

**Products:**
- GET `/api/products` - Get all products (with filters)
- GET `/api/products/featured` - Get featured products
- GET `/api/products/:slug` - Get single product
- GET `/api/products/:id/related` - Get related products
- POST `/api/products` - Create product (admin/vendor)
- PUT `/api/products/:id` - Update product (admin/vendor)
- DELETE `/api/products/:id` - Delete product (admin/vendor)

## Development Tips

1. Use Postman or Thunder Client for easier API testing
2. Check server logs for detailed error messages
3. Use MongoDB Compass to view database contents
4. Enable `NODE_ENV=development` for detailed error messages
5. Test authentication flow before testing protected routes
