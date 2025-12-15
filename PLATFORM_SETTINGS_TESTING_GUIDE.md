# Platform Settings Management - Testing Guide

## ✅ Implementation Status

All components have been implemented and are ready for testing:

### Backend (Complete)

- ✅ 6 Database Models created
- ✅ 4 Services implemented
- ✅ 4 Controllers created
- ✅ All API routes registered
- ✅ Migration script ready
- ✅ Seed script ready
- ✅ TypeScript compilation errors fixed

### Frontend (Complete)

- ✅ Platform Settings page
- ✅ Messaging Center page
- ✅ Version Manager page
- ✅ All service files created
- ✅ Navigation links added to sidebar
- ✅ Import/export errors fixed

### Mobile App (Complete)

- ✅ UpdateChecker component integrated
- ✅ FCM token registration on login
- ✅ FCM token unregistration on logout
- ✅ Version check API integration

## 🚀 Setup Instructions

### 1. Run Database Migration

```bash
cd backend
npm run migrate:platform-settings
```

This will:

- Create all necessary collections
- Create database indexes
- Seed default platform settings
- Migrate existing FCM tokens to new format

### 2. Seed Message Templates

```bash
npm run seed:templates
```

This will create 7 default message templates:

- Welcome message
- Maintenance notice
- Payment confirmation
- Task approval
- Withdrawal processed
- KYC approved
- Referral bonus

### 3. Start Backend Server

```bash
npm run dev
```

Server will start on: `http://localhost:6000`

### 4. Start Admin Panel

```bash
cd admin
npm run dev
```

Admin panel will start on: `http://localhost:5173`

## 🧪 Testing Checklist

### Platform Settings Page (`/dashboard/platform/settings`)

**Financial Settings:**

- [ ] Load current settings successfully
- [ ] Update minimum withdrawal amount (min: ₦100)
- [ ] Update platform commission rate (0-50%)
- [ ] Update referral bonus amount
- [ ] Update minimum task reward (min: ₦10)
- [ ] Save changes successfully
- [ ] Reset individual settings to defaults

**User Limits:**

- [ ] Update max active tasks per user (1-100)
- [ ] Update max submissions per task
- [ ] Update daily spin limit
- [ ] Save changes successfully

**Operational Controls:**

- [ ] Toggle maintenance mode (with confirmation)
- [ ] Toggle registration enabled/disabled
- [ ] Toggle KYC required
- [ ] Save changes successfully

**Task Management:**

- [ ] Update approval auto-timeout days (1-30)
- [ ] Update max task duration days (1-365)
- [ ] Save changes successfully

**General:**

- [ ] Reset all settings to defaults (with confirmation)
- [ ] View success/error messages
- [ ] Settings persist after page reload

### Messaging Center Page (`/dashboard/messaging`)

**Compose Tab:**

- [ ] Select target audience (All Users, Filtered, Specific Users)
- [ ] Apply filters (roles, KYC status, registration date)
- [ ] Select specific users by search
- [ ] Choose message template
- [ ] Customize title and body
- [ ] Preview message with variable substitution
- [ ] Send immediately
- [ ] Schedule for later
- [ ] Save as draft

**Scheduled Tab:**

- [ ] View all scheduled messages
- [ ] See message details (title, audience, scheduled time)
- [ ] Cancel scheduled message
- [ ] Edit scheduled message

**History Tab:**

- [ ] View sent messages
- [ ] See delivery statistics (sent, delivered, failed)
- [ ] Filter by date range
- [ ] Filter by status
- [ ] View message details

**Templates:**

- [ ] Create new template
- [ ] Edit existing template
- [ ] Delete template
- [ ] Use template in compose

### Version Manager Page (`/dashboard/versions`)

**Android Tab:**

- [ ] View current version configuration
- [ ] Update latest version number
- [ ] Update minimum required version
- [ ] Set update as mandatory/optional
- [ ] Add release notes
- [ ] Add download URL
- [ ] Save configuration
- [ ] View version analytics (adoption rate, active users per version)

**iOS Tab:**

- [ ] Same tests as Android tab

**Analytics:**

- [ ] View total checks
- [ ] View unique users
- [ ] View version distribution chart
- [ ] View update compliance rate

### Backend API Endpoints

**Platform Settings:**

```bash
# Get settings
GET http://localhost:6000/api/v1/admin/settings

# Update settings
PATCH http://localhost:6000/api/v1/admin/settings
Body: { "financial": { "minimumWithdrawal": 1500 } }

# Reset settings
POST http://localhost:6000/api/v1/admin/settings/reset
Body: { "settingKeys": ["financial.minimumWithdrawal"] }

# Get audit log
GET http://localhost:6000/api/v1/admin/settings/audit

# Export audit log
GET http://localhost:6000/api/v1/admin/settings/audit/export
```

**Bulk Messaging:**

```bash
# Create message
POST http://localhost:6000/api/v1/admin/messages
Body: {
  "title": "Test Message",
  "body": "Hello {{user_name}}",
  "targetAudience": { "type": "all" }
}

# Send message
POST http://localhost:6000/api/v1/admin/messages/:id/send

# Schedule message
POST http://localhost:6000/api/v1/admin/messages/:id/schedule
Body: { "scheduledFor": "2024-12-20T10:00:00Z" }

# Get messages
GET http://localhost:6000/api/v1/admin/messages

# Get message status
GET http://localhost:6000/api/v1/admin/messages/:id/status

# Cancel message
DELETE http://localhost:6000/api/v1/admin/messages/:id
```

**Message Templates:**

```bash
# Create template
POST http://localhost:6000/api/v1/admin/templates
Body: {
  "name": "custom_template",
  "title": "Custom Title",
  "body": "Custom body with {{variable}}",
  "variables": ["variable"]
}

# Get templates
GET http://localhost:6000/api/v1/admin/templates

# Update template
PATCH http://localhost:6000/api/v1/admin/templates/:id

# Delete template
DELETE http://localhost:6000/api/v1/admin/templates/:id
```

**Push Notifications:**

```bash
# Send push notification
POST http://localhost:6000/api/v1/admin/push-notifications
Body: {
  "title": "Test Notification",
  "body": "Test message",
  "targetAudience": { "type": "all" }
}
```

**App Versions:**

```bash
# Get all versions
GET http://localhost:6000/api/v1/admin/versions

# Update version config
POST http://localhost:6000/api/v1/admin/versions
Body: {
  "platform": "android",
  "latestVersion": "1.0.1",
  "minimumVersion": "1.0.0",
  "updateRequired": false,
  "releaseNotes": ["Bug fixes", "Performance improvements"],
  "downloadUrl": "https://play.google.com/store/apps/details?id=com.earn9ja"
}

# Get version analytics
GET http://localhost:6000/api/v1/admin/versions/analytics?platform=android
```

**Mobile App Version Check:**

```bash
# Check for updates (from mobile app)
POST http://localhost:6000/api/v1/app/version/check
Body: {
  "platform": "android",
  "currentVersion": "1.0.0",
  "deviceInfo": {
    "model": "Pixel 5",
    "osVersion": "13"
  }
}
```

## 🔍 Common Issues & Solutions

### Issue: "Failed to load settings"

**Solution:**

1. Ensure backend server is running
2. Run migration script: `npm run migrate:platform-settings`
3. Check MongoDB connection in backend logs

### Issue: "No admin user found" when seeding templates

**Solution:** ✅ FIXED!

The seed script now automatically creates a system admin user if none exists. The system user is inactive and can't be used for login - it's only used as the creator for default templates. Just run the seed script again:

```bash
npm run seed:templates
```

### Issue: Import errors in admin panel

**Solution:** Already fixed - types are now imported using `import type { }` syntax

### Issue: FCM token errors

**Solution:** Already fixed - FCM tokens now use object structure instead of string array

### Issue: TypeScript compilation errors

**Solution:** Already fixed - all type casting issues resolved

## 📊 Database Collections

The following collections will be created:

1. **platformsettings** - Stores platform-wide settings
2. **settingsauditlogs** - Tracks all settings changes
3. **bulkmessages** - Stores bulk message campaigns
4. **messagetemplates** - Stores reusable message templates
5. **appversions** - Stores app version configurations
6. **versionchecklogs** - Tracks version check requests
7. **users** - Updated with new FCM token structure

## 🎯 Success Criteria

All features are working if:

- ✅ Admin can view and update platform settings
- ✅ Changes are saved and persist after reload
- ✅ Audit log tracks all changes
- ✅ Admin can compose and send bulk messages
- ✅ Messages can be scheduled for later
- ✅ Message templates can be created and used
- ✅ Admin can manage app versions for Android/iOS
- ✅ Mobile app checks for updates on launch
- ✅ Update dialog shows with release notes
- ✅ Mandatory updates block app usage
- ✅ Optional updates can be dismissed
- ✅ FCM tokens are registered/unregistered properly
- ✅ Push notifications can be sent to users

## 📝 Notes

- All sensitive settings (payment keys, API secrets) remain in backend .env file
- Frontend only displays non-sensitive operational settings
- All API endpoints require admin authentication
- Audit logs are kept for 90 days (TTL index)
- Version check logs are kept for 90 days (TTL index)
- Message delivery is handled asynchronously via Firebase Cloud Messaging
