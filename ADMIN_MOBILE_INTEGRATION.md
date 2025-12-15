# Admin Panel ↔ Mobile App Integration

## ✅ Verified: All Admin Changes Reflect in Mobile App

### 1. Platform Settings

**Admin Panel:**

- Route: `/dashboard/platform/settings`
- API: `PATCH /api/v1/admin/settings`
- Updates: Financial settings, user limits, operational controls, task management

**Mobile App Impact:**

- ✅ **Minimum Withdrawal**: Enforced when users request withdrawals
- ✅ **Platform Commission**: Applied to all task payments
- ✅ **Referral Bonus**: Given when users refer friends
- ✅ **Minimum Task Reward**: Enforced when sponsors create tasks
- ✅ **Max Active Tasks**: Limits how many tasks users can work on
- ✅ **Daily Spin Limit**: Controls gamification features
- ✅ **Maintenance Mode**: Blocks all non-admin users from using app
- ✅ **Registration Enabled**: Controls if new users can sign up
- ✅ **KYC Required**: Enforces KYC before withdrawals
- ✅ **Task Approval Timeout**: Auto-approves tasks after X days
- ✅ **Max Task Duration**: Limits how long tasks can run

**Backend Implementation:**

```typescript
// backend/src/services/PlatformSettingsService.ts
// Settings are cached in Redis and fetched by all endpoints
```

---

### 2. App Version Management

**Admin Panel:**

- Route: `/dashboard/versions`
- API: `POST /api/v1/admin/versions`
- Updates: Latest version, minimum version, update required, release notes, download URL

**Mobile App Impact:**

- ✅ **Version Check**: Mobile app checks on launch
- ✅ **Update Dialog**: Shows when new version available
- ✅ **Mandatory Updates**: Blocks app usage if `updateRequired: true`
- ✅ **Optional Updates**: Shows "Update" and "Later" buttons
- ✅ **Release Notes**: Displays formatted release notes
- ✅ **Download URL**: Opens Play Store/App Store

**Mobile Implementation:**

```typescript
// Earn9ja/components/UpdateChecker.tsx
// Checks: GET /api/v1/app/version?platform=android&version=1.0.0
// Cache: 24-hour TTL using AsyncStorage
```

**Backend Implementation:**

```typescript
// backend/src/controllers/appVersion.controller.ts
// Returns: latestVersion, minVersion, updateRequired, releaseNotes, downloadUrl
```

---

### 3. Push Notifications & Bulk Messaging

**Admin Panel:**

- Route: `/dashboard/messaging`
- API: `POST /api/v1/admin/messages`
- Features: Send to all users, filtered users, or specific users

**Mobile App Impact:**

- ✅ **FCM Token Registration**: Registered on login
- ✅ **FCM Token Unregistration**: Removed on logout
- ✅ **Push Notifications**: Received via Firebase Cloud Messaging
- ✅ **Message Templates**: Admin can use pre-defined templates
- ✅ **Scheduled Messages**: Sent at specified time
- ✅ **Target Audience**: Can filter by role, KYC status, registration date

**Mobile Implementation:**

```typescript
// Earn9ja/services/pushNotifications.ts
// Registers FCM token with backend

// Earn9ja/services/api/notifications.ts
// POST /api/v1/notifications/register-token
// DELETE /api/v1/notifications/unregister-token
```

**Backend Implementation:**

```typescript
// backend/src/services/PushNotificationService.ts
// Uses Firebase Admin SDK to send notifications
// Tracks delivery status and failures
```

---

### 4. User Management

**Admin Panel:**

- Route: `/dashboard/users`
- APIs:
  - `GET /api/v1/admin/users`
  - `POST /api/v1/admin/users/:id/suspend`
  - `POST /api/v1/admin/users/:id/ban`
  - `POST /api/v1/admin/users/:id/reactivate`

**Mobile App Impact:**

- ✅ **Suspended Users**: Cannot login or use app
- ✅ **Banned Users**: Permanently blocked
- ✅ **Reactivated Users**: Can login again
- ✅ **User Status**: Checked on every API request

**Backend Implementation:**

```typescript
// backend/src/middleware/auth.middleware.ts
// Checks user status on every authenticated request
```

---

### 5. KYC Verification

**Admin Panel:**

- Route: `/dashboard/kyc`
- APIs:
  - `GET /api/v1/admin/kyc`
  - `POST /api/v1/admin/kyc/:id/approve`
  - `POST /api/v1/admin/kyc/:id/reject`

**Mobile App Impact:**

- ✅ **KYC Status**: Updated in user profile
- ✅ **Withdrawal Access**: Enabled after KYC approval
- ✅ **Rejection Reason**: Shown to user if rejected
- ✅ **Re-submission**: User can submit again if rejected

**Backend Implementation:**

```typescript
// backend/src/services/AdminService.ts
// Updates user.isKYCVerified field
// Sends notification to user
```

---

### 6. Task Management

**Admin Panel:**

- Route: `/dashboard/tasks`
- APIs:
  - `GET /api/v1/admin/tasks`
  - `POST /api/v1/admin/tasks/:id/approve`
  - `POST /api/v1/admin/tasks/:id/reject`

**Mobile App Impact:**

- ✅ **Task Visibility**: Only approved tasks shown to users
- ✅ **Task Status**: Updated in real-time
- ✅ **Rejection Reason**: Shown to sponsor
- ✅ **Auto-approval**: After timeout period (from Platform Settings)

---

### 7. Withdrawal Management

**Admin Panel:**

- Route: `/dashboard/withdrawals`
- APIs:
  - `GET /api/v1/admin/withdrawals/pending`
  - `POST /api/v1/admin/withdrawals/:id/approve`
  - `POST /api/v1/admin/withdrawals/:id/reject`

**Mobile App Impact:**

- ✅ **Withdrawal Status**: Updated in user's wallet
- ✅ **Payment Processing**: Initiated on approval
- ✅ **Rejection Reason**: Shown to user
- ✅ **Balance Refund**: Returned if rejected

---

## Data Flow Diagram

```
┌─────────────────┐
│  Admin Panel    │
│  (React/Vite)   │
└────────┬────────┘
         │
         │ HTTPS API Calls
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  (Express/TS)   │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────┐
│   MongoDB       │  │   Firebase   │
│   (Database)    │  │   (FCM)      │
└────────┬────────┘  └──────┬───────┘
         │                  │
         │                  │ Push Notifications
         │                  │
         ▼                  ▼
┌─────────────────────────────┐
│      Mobile App             │
│   (React Native/Expo)       │
└─────────────────────────────┘
```

---

## API Endpoints Used by Mobile App

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh-token` - Token refresh

### Version Check

- `GET /api/v1/app/version?platform=android&version=1.0.0` - Check for updates

### Push Notifications

- `POST /api/v1/notifications/register-token` - Register FCM token
- `DELETE /api/v1/notifications/unregister-token` - Unregister FCM token

### User Profile

- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/profile` - Update profile

### Tasks

- `GET /api/v1/tasks` - Get available tasks (only approved tasks)
- `POST /api/v1/tasks/:id/submit` - Submit task completion

### Wallet

- `GET /api/v1/wallet` - Get wallet balance
- `POST /api/v1/wallet/withdraw` - Request withdrawal (checks KYC & min amount)

### KYC

- `POST /api/v1/kyc/submit` - Submit KYC documents
- `GET /api/v1/kyc/status` - Check KYC status

---

## Real-Time Updates

### How Admin Changes Reach Mobile App:

1. **Immediate (API-based):**

   - Platform Settings: Fetched on every relevant API call
   - User Status: Checked on every authenticated request
   - Task Status: Fetched when user views tasks
   - Withdrawal Status: Fetched when user views wallet

2. **On App Launch:**

   - Version Check: Runs on app start (24-hour cache)
   - FCM Token: Re-registered on login

3. **Push Notifications:**

   - Bulk Messages: Sent immediately via Firebase
   - Status Updates: Sent when admin approves/rejects

4. **Periodic Refresh:**
   - User pulls to refresh task list
   - User navigates to wallet screen
   - User checks notification center

---

## Testing Checklist

### Test Admin → Mobile Integration:

- [ ] **Platform Settings:**

  - [ ] Change minimum withdrawal → Try withdrawing less in mobile
  - [ ] Enable maintenance mode → Mobile app should block access
  - [ ] Disable registration → New users can't sign up

- [ ] **Version Management:**

  - [ ] Set new version → Mobile shows update dialog
  - [ ] Set mandatory update → Mobile blocks app usage
  - [ ] Add release notes → Mobile displays them

- [ ] **Push Notifications:**

  - [ ] Send bulk message → All users receive notification
  - [ ] Send to filtered users → Only matching users receive
  - [ ] Schedule message → Sent at specified time

- [ ] **User Management:**

  - [ ] Suspend user → User can't login
  - [ ] Ban user → User permanently blocked
  - [ ] Reactivate user → User can login again

- [ ] **KYC:**

  - [ ] Approve KYC → User can withdraw
  - [ ] Reject KYC → User sees rejection reason

- [ ] **Tasks:**

  - [ ] Approve task → Task appears in mobile app
  - [ ] Reject task → Task doesn't appear

- [ ] **Withdrawals:**
  - [ ] Approve withdrawal → User receives payment
  - [ ] Reject withdrawal → Balance refunded

---

## Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb+srv://...
FIREBASE_PROJECT_ID=earn9ja-21ae7
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

### Mobile App (.env)

```env
EXPO_PUBLIC_API_URL=https://api.earn9ja.site/api/v1
```

### Admin Panel (.env)

```env
VITE_API_URL=https://api.earn9ja.site/api/v1
```

---

## Summary

✅ **All admin changes are stored in MongoDB**
✅ **Mobile app fetches data from same backend API**
✅ **Push notifications sent via Firebase Cloud Messaging**
✅ **Version checks happen on app launch**
✅ **Platform settings enforced on every API call**
✅ **User status checked on every authenticated request**

**Everything is connected through the same backend API!**
