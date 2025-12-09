# Complete Authentication System - Implementation Plan

## Overview

This document outlines all authentication features to be implemented for a production-ready e-commerce platform.

---

## ✅ PHASE 9: Authentication UI (COMPLETED)

### Task 9.1: Basic Authentication ✅

- [x] Login page with validation
- [x] Register page with validation
- [x] Protected routes component
- [x] User authentication hook
- [x] Form error handling
- [x] Loading states
- [x] Toast notifications

### Task 9.2: Email Verification System ✅

- [x] Password strength indicator
- [x] Email verification flow
- [x] Verification sent page
- [x] Email verification handler page
- [x] Backend email integration
- [x] Welcome email after verification

---

## 🔄 PHASE 9.5: Complete Authentication Features (IN PROGRESS)

### Task 9.5.1: Password Reset Flow

**Backend (Already exists, needs verification):**

- [ ] Verify forgot password endpoint exists
- [ ] Verify reset password endpoint exists
- [ ] Verify password reset email template

**Frontend (To implement):**

- [ ] Forgot password page (`/forgot-password`)
  - Email input field
  - Validation
  - Submit button
  - Success message
- [ ] Reset password page (`/reset-password?token=xxx`)
  - New password field with strength indicator
  - Confirm password field
  - Token validation
  - Success/error states
- [ ] Password reset success page
- [ ] Add routes to App.tsx
- [ ] Update useAuth hook with reset functions

**Files to create:**

- `client/src/pages/ForgotPassword.tsx`
- `client/src/pages/ResetPassword.tsx`
- `client/src/pages/ResetPasswordSuccess.tsx`

---

### Task 9.5.2: Resend Verification Email

**Backend:**

- [ ] Create resend verification endpoint
  - `POST /api/auth/resend-verification`
  - Rate limiting (max 3 per hour)
  - Generate new token
  - Send new email

**Frontend:**

- [ ] Add resend button functionality to VerifyEmailSent page
- [ ] Add loading state
- [ ] Add success/error messages
- [ ] Add cooldown timer (60 seconds between resends)
- [ ] Update useAuth hook with resend function

**Files to modify:**

- `server/src/controllers/authController.js`
- `server/src/routes/authRoutes.js`
- `client/src/pages/VerifyEmailSent.tsx`
- `client/src/hooks/useAuth.ts`

---

### Task 9.5.3: Block Unverified Users from Login

**Backend:**

- [ ] Update login controller to check `isEmailVerified`
- [ ] Return specific error for unverified users
- [ ] Include resend verification option in response

**Frontend:**

- [ ] Handle unverified user error
- [ ] Show helpful message
- [ ] Provide "Resend verification" link
- [ ] Redirect to verification sent page

**Files to modify:**

- `server/src/controllers/authController.js`
- `client/src/hooks/useAuth.ts`
- `client/src/pages/Login.tsx`

---

### Task 9.5.4: Remember Me Functionality

**Backend:**

- [ ] Add "Remember Me" option to login
- [ ] Extend refresh token expiration (30 days vs 7 days)
- [ ] Store remember preference

**Frontend:**

- [ ] Add "Remember Me" checkbox to login page
- [ ] Store preference in localStorage
- [ ] Adjust token refresh logic based on preference

**Files to modify:**

- `server/src/controllers/authController.js`
- `client/src/pages/Login.tsx`
- `client/src/hooks/useAuth.ts`
- `client/src/utils/storage.ts`

---

### Task 9.5.5: Account Settings Page

**Backend (Already exists):**

- [x] Update profile endpoint
- [x] Change password endpoint

**Frontend:**

- [ ] Create Account Settings page (`/settings`)
- [ ] Profile information section
  - Name, email display
  - Edit profile button
- [ ] Change password section
  - Current password
  - New password with strength indicator
  - Confirm new password
- [ ] Email preferences section
  - Marketing emails toggle
  - Order notifications toggle
- [ ] Danger zone section
  - Delete account button
  - Confirmation modal

**Files to create:**

- `client/src/pages/Settings.tsx`
- `client/src/components/settings/ProfileSection.tsx`
- `client/src/components/settings/PasswordSection.tsx`
- `client/src/components/settings/EmailPreferences.tsx`
- `client/src/components/settings/DangerZone.tsx`

---

### Task 9.5.6: Session Management

**Backend:**

- [ ] Create sessions table/model
- [ ] Store device info, IP, login time
- [ ] Create get active sessions endpoint
- [ ] Create logout from device endpoint
- [ ] Create logout from all devices endpoint

**Frontend:**

- [ ] Create Sessions page (`/settings/sessions`)
- [ ] Display active sessions list
  - Device name
  - Browser
  - Location (IP-based)
  - Last active time
  - Current session indicator
- [ ] Logout from specific session button
- [ ] Logout from all other sessions button
- [ ] Confirmation modals

**Files to create:**

- `server/src/models/Session.js`
- `server/src/controllers/sessionController.js`
- `server/src/routes/sessionRoutes.js`
- `client/src/pages/Sessions.tsx`
- `client/src/components/SessionCard.tsx`

---

### Task 9.5.7: Rate Limiting UI Feedback

**Backend (Already has rate limiting):**

- [x] Rate limiting middleware exists

**Frontend:**

- [ ] Detect rate limit errors (429 status)
- [ ] Show countdown timer
- [ ] Disable form during cooldown
- [ ] Show helpful message

**Files to modify:**

- `client/src/hooks/useAuth.ts`
- `client/src/pages/Login.tsx`
- `client/src/pages/Register.tsx`

---

### Task 9.5.8: Email Preferences

**Backend:**

- [ ] Add email preferences to User model
  - marketingEmails (boolean)
  - orderNotifications (boolean)
  - securityAlerts (boolean)
- [ ] Create update preferences endpoint
- [ ] Respect preferences when sending emails

**Frontend:**

- [ ] Add to Settings page
- [ ] Toggle switches for each preference
- [ ] Save button
- [ ] Success feedback

**Files to modify:**

- `server/src/models/User.js`
- `server/src/controllers/authController.js`
- `client/src/pages/Settings.tsx`

---

### Task 9.5.9: Account Deletion

**Backend:**

- [ ] Create delete account endpoint
- [ ] Require password confirmation
- [ ] Soft delete (mark as deleted, keep data)
- [ ] Send confirmation email
- [ ] Schedule permanent deletion (30 days)

**Frontend:**

- [ ] Delete account button in settings
- [ ] Confirmation modal with password input
- [ ] Warning about data loss
- [ ] Success page with undo option

**Files to create:**

- `server/src/controllers/accountController.js`
- `client/src/components/DeleteAccountModal.tsx`
- `client/src/pages/AccountDeleted.tsx`

---

## 🔮 PHASE 18+: Advanced Authentication (Future)

### Social Login

- [ ] Google OAuth integration
- [ ] Facebook Login integration
- [ ] Apple Sign In integration
- [ ] Link/unlink social accounts

### Two-Factor Authentication (2FA)

- [ ] SMS OTP integration
- [ ] Authenticator app (TOTP)
- [ ] Backup codes generation
- [ ] 2FA setup wizard
- [ ] 2FA enforcement for admins

### Advanced Security

- [ ] Login history/audit log
- [ ] Suspicious activity detection
- [ ] Email alerts for new logins
- [ ] Password breach detection
- [ ] Security questions
- [ ] Biometric authentication (WebAuthn)

---

## Implementation Order (Recommended)

### Priority 1: Critical Features (Do Now)

1. ✅ Password strength indicator
2. ✅ Email verification flow
3. ⏳ Forgot password / Reset password
4. ⏳ Resend verification email
5. ⏳ Block unverified login

### Priority 2: Important Features (Do Next)

6. ⏳ Remember me checkbox
7. ⏳ Account settings page
8. ⏳ Change password (while logged in)
9. ⏳ Rate limiting UI feedback

### Priority 3: Nice to Have (Do Later)

10. ⏳ Session management
11. ⏳ Email preferences
12. ⏳ Account deletion
13. ⏳ Login history

### Priority 4: Advanced (Future Phases)

14. ⏳ Social login
15. ⏳ Two-factor authentication
16. ⏳ Advanced security features

---

## Testing Checklist

### Registration Flow

- [ ] Register with valid data
- [ ] Register with existing email (should fail)
- [ ] Register with weak password (should show warning)
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Receive welcome email
- [ ] Try to login before verification (should fail)
- [ ] Login after verification (should succeed)

### Password Reset Flow

- [ ] Request password reset
- [ ] Receive reset email
- [ ] Click reset link
- [ ] Set new password
- [ ] Login with new password
- [ ] Try expired reset link (should fail)

### Session Management

- [ ] Login from multiple devices
- [ ] View all active sessions
- [ ] Logout from specific session
- [ ] Logout from all sessions
- [ ] Verify tokens are invalidated

### Security

- [ ] Rate limiting works (too many attempts)
- [ ] Tokens expire correctly
- [ ] Refresh token rotation works
- [ ] Protected routes redirect to login
- [ ] Admin routes require admin role

---

## Success Criteria

✅ **Core Authentication:**

- Users can register, verify email, and login
- Password reset works end-to-end
- Email verification is enforced
- Protected routes work correctly

✅ **User Experience:**

- Clear error messages
- Loading states on all actions
- Success confirmations
- Helpful guidance throughout

✅ **Security:**

- Passwords are hashed
- Tokens are secure and expire
- Rate limiting prevents abuse
- Email verification prevents spam
- Sessions can be managed

✅ **Production Ready:**

- All emails are sent correctly
- Error handling is comprehensive
- Mobile responsive
- Accessible (WCAG compliant)
- Performance optimized

---

## Estimated Timeline

- **Priority 1 (Critical):** 2-3 hours
- **Priority 2 (Important):** 3-4 hours
- **Priority 3 (Nice to Have):** 4-5 hours
- **Priority 4 (Advanced):** 10+ hours (future phases)

**Total for complete auth system:** ~10-12 hours

---

## Current Status

**Completed:** Phase 9 + Email Verification + Password Strength
**Next:** Priority 1 features (Forgot Password, Resend Email, Block Unverified)
**Progress:** ~40% complete
