# Admin Setup Guide

## How to Create an Admin Account

There are three ways to create an admin account:

### Method 1: Use Admin Registration Page (Easiest)

1. **Navigate to** `/admin/register`
2. **Fill in the registration form**:
   - Full Name
   - Email Address
   - Password (min. 8 characters)
   - Confirm Password
   - **Admin Registration Code**: `ADMIN2024` (default code - change this in production!)
3. **Click "Create Admin Account"**
4. **Login at** `/admin/login`
5. **Access admin panel** at `/admin`

**Note:** 
- The admin registration code is validated on both frontend and backend
- Frontend: `client/src/pages/admin/AdminRegister.tsx` (default: `ADMIN2024`)
- Backend: `server/src/controllers/authController.js` (uses `ADMIN_REGISTRATION_CODE` env variable or defaults to `ADMIN2024`)
- **Admin accounts are automatically verified** - no email verification needed!
- Change the code in production by setting `ADMIN_REGISTRATION_CODE` in your server `.env` file

**Admin Registration Limits:**

✅ **Maximum 2 Super-Admins** can register via `/admin/register` with the secret code.

**How It Works:**
1. **First Admin** registers with code → ✅ Approved
2. **Second Admin** registers with code → ✅ Approved
3. **Third Admin** tries to register → ❌ Blocked with message:
   > "Maximum of 2 super-admins allowed via registration. Contact an existing admin to be promoted."

**Adding More Admins:**
After 2 super-admins are registered, they can promote additional users to admin via:
1. Login to admin panel at `/admin`
2. Go to **Users Management** (`/admin/users`)
3. Find the user you want to promote
4. Change their role from "User" to "Admin" using the dropdown
5. User can now access admin panel

**Changing the Limit:**
To change the maximum number of super-admins, edit `server/src/controllers/authController.js`:
```javascript
const MAX_SUPER_ADMINS = 2; // Change this number
```

**Why 2 Super-Admins?**
- ✅ Redundancy: If one admin is unavailable, the other can manage
- ✅ Security: Limited number of people with registration code
- ✅ Control: Super-admins control who else becomes admin
- ✅ Accountability: Clear hierarchy and audit trail

### Method 2: Update Existing User to Admin

1. **Register a normal user account** through the website at `/register`
2. **Connect to your MongoDB database** using MongoDB Compass or mongosh
3. **Find your user** in the `users` collection
4. **Update the role field** from `"user"` to `"admin"`:

```javascript
// Using MongoDB Compass: Edit the document and change role to "admin"

// Using mongosh:
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

5. **Logout and login again** to refresh your session
6. **Access the admin panel** at `/admin`

### Method 3: Create Admin User Directly in Database

```javascript
// Using mongosh:
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$YourHashedPasswordHere", // You need to hash the password first
  role: "admin",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note:** You'll need to hash the password using bcrypt before inserting. It's easier to use Method 1.

### Method 4: Using Backend Script (Create this file)

Create a file `server/src/scripts/createAdmin.js`:

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = 'admin@example.com';
    const password = 'Admin@123'; // Change this!
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email,
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
    });
    
    console.log('Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
```

Run it with:
```bash
cd server
node src/scripts/createAdmin.js
```

## Accessing the Admin Panel

1. **Login** with your admin account at `/admin/login`
2. **Navigate to** `/admin` (you'll be redirected automatically after login)
3. You should see the admin dashboard with:
   - Dashboard (stats overview)
   - Products management
   - Orders management
   - Users management
   - Coupons (coming in Phase 15)
   - Shipping management
   - Analytics
   - Settings

## Admin Features Implemented (Phase 14)

### ✅ Admin Layout
- Dedicated admin sidebar with navigation
- Admin navbar with search and notifications
- Protected admin routes (only accessible by admin users)

### ✅ Dashboard Page
- Total revenue, orders, products, and users stats
- Percentage change indicators
- Visual stat cards with icons

### ✅ Products Management
- View all products in a table
- Search products
- Edit product details
- Delete products
- View product status (active/inactive)
- Stock level indicators

### ✅ Orders Management
- View all orders
- Search orders by order number
- Filter by status (pending, processing, shipped, delivered, cancelled)
- Update order status directly from table
- View customer details
- Payment method display

### ✅ Users Management
- View all users
- Search users
- Update user roles (user/admin)
- Delete users (except admins)
- View email verification status
- See join dates

### 🔜 Coming Soon (Phase 15+)
- Coupons management
- Shipping zones and rates
- Detailed analytics and reports
- Settings configuration

## Security Notes

1. **Never commit admin credentials** to version control
2. **Change default passwords** immediately after first login
3. **Use strong passwords** for admin accounts
4. **Enable 2FA** for admin accounts (when implemented)
5. **Regularly audit** admin access logs
6. **Limit admin accounts** to only necessary personnel

## Troubleshooting

### "Access Denied" when accessing /admin
- Make sure your user role is set to "admin" in the database
- Logout and login again to refresh your session
- Check browser console for any errors

### Admin panel not loading
- Verify the backend is running
- Check that admin routes are properly configured
- Ensure you're logged in with an admin account

### Can't update user roles
- Verify you have admin permissions
- Check backend logs for errors
- Ensure the admin endpoints are working

## Next Steps

After setting up your admin account:

1. ✅ Test all admin features
2. ✅ Add some products through the admin panel
3. ✅ Manage test orders
4. ✅ Configure user roles as needed
5. 🔜 Wait for Phase 15 to implement coupons and advanced features

---

**Phase 14 Complete!** 🎉

You now have a fully functional admin dashboard to manage your e-commerce platform.
