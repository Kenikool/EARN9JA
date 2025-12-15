# Admin Panel Diagnostic Report

## Quick Checks

Run these commands to identify issues:

### 1. Check Backend Server

```bash
cd backend
npm run dev
```

Look for:

- ✅ Server running on port 6000
- ✅ MongoDB connected
- ✅ Redis connected (optional)
- ❌ Any error messages

### 2. Check Admin Panel

```bash
cd admin
npm run dev
```

Look for:

- ✅ Vite server running on port 5173
- ✅ No compilation errors
- ❌ Any import errors

### 3. Check Browser Console

Open admin panel in browser and check console for:

- ❌ 404 errors (API endpoints not found)
- ❌ 401 errors (Authentication issues)
- ❌ 403 errors (Permission issues)
- ❌ 500 errors (Server errors)
- ❌ CORS errors
- ❌ Network errors

## Common Issues & Fixes

### Issue 1: API Endpoints Return 404

**Symptoms:** Pages show "Failed to load" or empty data
**Check:**

```bash
# Test if backend is running
curl http://localhost:6000/health

# Test admin endpoint (replace TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:6000/api/v1/admin/stats
```

**Fix:** Ensure backend server is running and routes are registered

### Issue 2: Authentication Errors (401)

**Symptoms:** Redirected to login, "Unauthorized" errors
**Check:**

- Is admin user logged in?
- Is token valid and not expired?
- Does user have admin role?

**Fix:**

1. Login again
2. Check token in localStorage: `localStorage.getItem('token')`
3. Verify user has admin role in database

### Issue 3: Permission Errors (403)

**Symptoms:** "Access denied. Admin role required"
**Check:** User roles in database

```javascript
// In MongoDB
db.users.findOne({ email: "your@email.com" }, { roles: 1 });
```

**Fix:** Add admin role to user:

```javascript
db.users.updateOne({ email: "your@email.com" }, { $set: { roles: ["admin"] } });
```

### Issue 4: CORS Errors

**Symptoms:** "CORS policy" errors in console
**Check:** backend/src/server.ts CORS configuration
**Fix:** Already configured to allow all origins in development

### Issue 5: Data Not Loading

**Symptoms:** Spinner keeps loading, no data appears
**Possible Causes:**

1. Backend not running
2. Wrong API URL in admin/.env
3. Database empty (no data to show)
4. API endpoint not implemented

**Check:**

```bash
# Verify API URL
cat admin/.env | grep VITE_API_URL

# Should be: http://localhost:6000/api/v1 (dev) or https://api.earn9ja.site/api/v1 (prod)
```

### Issue 6: Platform Settings Not Loading

**Symptoms:** Platform Settings page shows error
**Fix:** Run migration:

```bash
cd backend
npm run migrate:platform-settings
```

### Issue 7: Message Templates Not Loading

**Symptoms:** Messaging Center shows no templates
**Fix:** Run seed script:

```bash
cd backend
npm run seed:templates
```

## Page-by-Page Status Check

### Dashboard (`/dashboard`)

**Expected:** Stats cards, charts, recent activity
**API Calls:**

- GET /admin/stats
- GET /admin/revenue-report

**Check:**

1. Open browser DevTools → Network tab
2. Navigate to dashboard
3. Look for API calls
4. Check response status and data

### Users (`/dashboard/users`)

**Expected:** List of users with filters
**API Calls:**

- GET /admin/users?page=1&limit=20

**Common Issues:**

- Empty list: No users in database
- Error loading: Backend not running or endpoint issue

### Tasks (`/dashboard/tasks`)

**Expected:** List of tasks with status filters
**API Calls:**

- GET /admin/tasks?page=1&limit=20
- GET /admin/tasks/pending

**Common Issues:**

- Empty list: No tasks in database
- Filters not working: Check query parameters

### Withdrawals (`/dashboard/withdrawals`)

**Expected:** List of withdrawal requests
**API Calls:**

- GET /admin/withdrawals/pending

**Common Issues:**

- Empty list: No withdrawal requests
- Can't approve: Check admin permissions

### Disputes (`/dashboard/disputes`)

**Expected:** List of disputes
**API Calls:**

- GET /admin/disputes/pending

**Common Issues:**

- Empty list: No disputes in database

### Platform Settings (`/dashboard/platform/settings`)

**Expected:** Form with settings grouped by category
**API Calls:**

- GET /admin/settings
- PATCH /admin/settings

**Common Issues:**

- "Failed to load settings": Run migration script
- Can't save: Check admin permissions

### Messaging Center (`/dashboard/messaging`)

**Expected:** Tabs for Compose, Scheduled, History
**API Calls:**

- GET /admin/templates
- GET /admin/messages
- POST /admin/messages

**Common Issues:**

- No templates: Run seed script
- Can't send: Check Firebase configuration

### Version Manager (`/dashboard/versions`)

**Expected:** Android/iOS tabs with version config
**API Calls:**

- GET /admin/versions
- POST /admin/versions
- GET /admin/versions/analytics

**Common Issues:**

- No versions: Create first version config
- Analytics empty: No version checks yet

## Testing Checklist

Run through this checklist:

- [ ] Backend server starts without errors
- [ ] Admin panel starts without errors
- [ ] Can login with admin credentials
- [ ] Dashboard loads and shows stats
- [ ] Users page loads user list
- [ ] Tasks page loads task list
- [ ] Withdrawals page loads
- [ ] Disputes page loads
- [ ] Platform Settings page loads
- [ ] Can update and save platform settings
- [ ] Messaging Center loads
- [ ] Can see message templates
- [ ] Version Manager loads
- [ ] Can update version config
- [ ] No console errors in browser
- [ ] No 404/401/403/500 errors in Network tab

## Quick Fix Commands

```bash
# Fix: Platform Settings not loading
cd backend && npm run migrate:platform-settings

# Fix: No message templates
cd backend && npm run seed:templates

# Fix: Backend not starting
cd backend && npm install && npm run dev

# Fix: Admin panel not starting
cd admin && npm install && npm run dev

# Fix: Clear browser cache
# In browser: Ctrl+Shift+Delete → Clear cache

# Fix: Reset admin panel state
# In browser console:
localStorage.clear()
# Then refresh and login again
```

## Get Detailed Error Info

If something's not working, get detailed error info:

1. **Browser Console:**

   - F12 → Console tab
   - Look for red error messages
   - Copy full error message

2. **Network Tab:**

   - F12 → Network tab
   - Click on failed request
   - Check Response tab for error details

3. **Backend Logs:**

   - Look at terminal where backend is running
   - Check for error stack traces

4. **Check Database:**

```javascript
// In MongoDB shell or Compass
db.platformsettings.findOne();
db.messagetemplates.find();
db.appversions.find();
db.users.findOne({ roles: "admin" });
```

## Report Issues

When reporting issues, include:

1. Which page/feature is not working
2. Error message from browser console
3. Error message from backend logs
4. Network tab screenshot showing failed requests
5. What you were trying to do when it failed
