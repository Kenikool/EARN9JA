# Platform Settings Management - Quick Start

## ✅ Issue Fixed: "Admin user not found"

The seed script has been updated to automatically create a system admin user if none exists. You can now run the seed script without any prerequisites!

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Migration

```bash
cd backend
npm run migrate:platform-settings
```

**What this does:**

- Creates all database collections
- Creates indexes for performance
- Seeds default platform settings
- Migrates existing FCM tokens

**Expected output:**

```
🚀 Starting Platform Settings Management migration...
✅ Connected to MongoDB
📝 Creating PlatformSettings collection...
✅ Default platform settings created
📊 Creating indexes...
✅ All indexes created
🔄 Migrating existing User FCM tokens...
✅ Migrated X users with old FCM token format
✨ Migration completed successfully!
```

### Step 2: Seed Templates

```bash
npm run seed:templates
```

**What this does:**

- Creates 7 default message templates
- Automatically creates a system admin user if needed (inactive, can't login)

**Expected output:**

```
🚀 Starting template seeding...
✅ Connected to MongoDB
✅ Found admin user: user@example.com
(or)
⚠️  No admin user found. Creating a system admin user...
✅ Created system admin user for template seeding

✅ Created template: welcome_message
✅ Created template: maintenance_notice
✅ Created template: payment_confirmation
✅ Created template: task_approval
✅ Created template: withdrawal_processed
✅ Created template: kyc_approved
✅ Created template: referral_bonus

📊 Summary:
   Created: 7
   Skipped: 0
   Total: 7
✨ Template seeding completed successfully!
```

### Step 3: Test the Features

**Start backend:**

```bash
npm run dev
```

**Start admin panel (new terminal):**

```bash
cd admin
npm run dev
```

**Access admin panel:**

- Open: `http://localhost:5173`
- Login with your admin credentials
- Navigate to: **Platform Management** → **Platform Settings**

## 📋 What You Can Test Now

### 1. Platform Settings (`/dashboard/platform/settings`)

- View and update financial settings
- Configure user limits
- Toggle operational controls (maintenance mode, registration, KYC)
- Manage task settings
- Reset settings to defaults

### 2. Messaging Center (`/dashboard/messaging`)

- Compose bulk messages
- Use message templates
- Schedule messages for later
- View message history
- Track delivery status

### 3. Version Manager (`/dashboard/versions`)

- Manage Android app versions
- Manage iOS app versions
- Set mandatory/optional updates
- Add release notes
- View version analytics

## 🎯 Quick Test Checklist

- [ ] Migration completed successfully
- [ ] Templates seeded successfully
- [ ] Backend server running
- [ ] Admin panel accessible
- [ ] Can view Platform Settings page
- [ ] Can update a setting and save
- [ ] Can view Messaging Center page
- [ ] Can see message templates
- [ ] Can view Version Manager page
- [ ] Can update version configuration

## 🔧 Troubleshooting

### Migration fails with connection error

**Solution:** Check your MongoDB connection string in `backend/.env`

### Seed script fails

**Solution:** The script now auto-creates a system admin user, so this shouldn't happen. If it does, check MongoDB connection.

### Can't access admin panel pages

**Solution:**

1. Ensure you're logged in with an admin account
2. Check browser console for errors
3. Verify backend is running on port 6000

### Settings not saving

**Solution:**

1. Check backend logs for errors
2. Verify admin authentication token is valid
3. Check MongoDB connection

## 📚 Full Documentation

For detailed testing instructions, API endpoints, and troubleshooting, see:

- `PLATFORM_SETTINGS_TESTING_GUIDE.md` - Complete testing guide
- `.kiro/specs/platform-settings-management/requirements.md` - Feature requirements
- `.kiro/specs/platform-settings-management/design.md` - Technical design
- `.kiro/specs/platform-settings-management/tasks.md` - Implementation tasks

## ✨ What's New

**Fixed Issues:**

- ✅ "Admin user not found" error - Script now auto-creates system user
- ✅ Import/export errors in admin panel - Fixed TypeScript imports
- ✅ Sidebar navigation - Added Platform Settings Management links
- ✅ FCM token structure - Updated to support multiple devices
- ✅ TypeScript compilation errors - All fixed

**New Features:**

- ✅ Platform Settings Management UI
- ✅ Bulk Messaging System
- ✅ Message Templates
- ✅ Push Notifications
- ✅ App Version Management
- ✅ Version Analytics
- ✅ Settings Audit Log
- ✅ Mobile App Update Checker

## 🎉 You're Ready!

Everything is set up and ready to test. Just run the two commands above and start exploring the new features!
