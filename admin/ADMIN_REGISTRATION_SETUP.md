# Admin Registration Setup Complete

## What Was Created

### 1. Admin Registration Page (`src/pages/RegisterPage.tsx`)

- Full registration flow with OTP verification
- Uses same backend API as mobile app
- Two-step process:
  1. Fill registration form → Send OTP
  2. Verify OTP → Create admin account

### 2. Updated Routes (`src/App.tsx`)

- Added `/register` route
- Protected route (redirects to dashboard if already logged in)

### 3. Updated Login Page (`src/pages/LoginPage.tsx`)

- Added link to registration page
- Users can now navigate between login and register

## How It Works

### Registration Flow:

1. **User fills form** with:

   - First Name
   - Last Name
   - Email
   - Phone Number
   - Password
   - Confirm Password

2. **System sends OTP** to email via backend API:

   ```
   POST /api/v1/auth/register/send-otp
   ```

3. **User enters OTP** (6-digit code)

4. **System verifies OTP**:

   ```
   POST /api/v1/auth/register/verify
   ```

5. **System creates admin account**:

   ```
   POST /api/v1/auth/register
   Body: { roles: ["admin"] }
   ```

6. **Redirect to login** page

## Backend Integration

All data comes from your existing backend:

- ✅ Uses `/api/v1/auth/register/send-otp`
- ✅ Uses `/api/v1/auth/register/verify`
- ✅ Uses `/api/v1/auth/register`
- ✅ Sets role as `["admin"]`
- ✅ Same validation as mobile app

## How to Use

### Start the Admin Panel:

```cmd
cd admin
npm install
npm run dev
```

### Access Registration:

1. Go to `http://localhost:5173/register`
2. Or click "Register as Admin" on login page

### Test Registration:

1. Fill in your details
2. Check email for OTP code
3. Enter OTP
4. Account created!
5. Login with your credentials

## Security Features

- ✅ Email verification required (OTP)
- ✅ Password confirmation
- ✅ Minimum 8 characters password
- ✅ Admin role automatically assigned
- ✅ Same backend validation as mobile app
- ✅ Protected routes (can't access if logged in)

## Next Steps

1. **Test the registration flow**
2. **Verify admin can login**
3. **Check admin has access to all dashboard features**
4. **Deploy admin panel** to `https://admin.earn9ja.site`

## Notes

- Registration uses the same backend as mobile app
- Admin role is automatically assigned during registration
- OTP is sent via Resend email service
- All validation is handled by backend
- Frontend just displays errors/success from backend
