# Clerk Google OAuth Setup Guide

## Where to Find Webhooks in Clerk Dashboard

If you want to use webhooks (optional), here's where to find them:

1. Go to https://dashboard.clerk.com
2. Select your application
3. In the left sidebar, look for **"Webhooks"** 
   - It might be under **"Configure"** section
   - Or under **"Developers"** section
   - Direct path: Configure → Webhooks

**Note:** If you don't see webhooks, they might not be available on your plan, or Clerk has moved to a different sync approach.

## Recommended Approach: Client-Side Sync (No Webhooks Needed)

Since webhooks can be hard to find/configure, we'll use **client-side synchronization** instead. This is simpler and works perfectly for your use case.

## Setup Steps

### 1. Get Your Clerk Keys

1. Go to https://dashboard.clerk.com
2. Select your application  
3. Click **"API Keys"** in the sidebar
4. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. Add Keys to Environment Files

**Client** (`client/.env`):
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Server** (`server/.env`):
```
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### 3. Enable Google OAuth

1. In Clerk Dashboard, go to **"User & Authentication"** → **"Social Connections"**
2. Toggle **Google** to ON
3. Clerk provides test credentials automatically
4. For production, you can add your own Google OAuth credentials

### 4. Install Required Packages

**Client:**
```bash
cd client
npm install @clerk/clerk-react
```

**Server:**
```bash
cd server
npm install @clerk/clerk-sdk-node
```

## How It Works

1. User clicks "Sign in with Google"
2. Clerk handles the OAuth flow
3. After successful sign-in, frontend automatically syncs user to your backend
4. Backend creates/updates user in MongoDB
5. Backend returns your app's JWT token
6. User is now authenticated in both Clerk and your system

## API Endpoints (Already Implemented)

- `POST /api/auth/clerk/sync` - Sync user from Clerk to your database
- `POST /api/auth/clerk/link` - Link Clerk account to existing user
- `POST /api/auth/clerk/unlink` - Unlink Clerk account
- `GET /api/auth/clerk/status` - Check Clerk link status

## Testing

1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Open http://localnet.com:5173
4. Click "Sign in with Google"
5. Check MongoDB - user should be created automatically

## Advantages of This Approach

✅ No webhook configuration needed
✅ Works with localhost (no ngrok required)
✅ Simpler setup
✅ Real-time sync on sign-in
✅ No external dependencies

## Troubleshooting

**"Clerk key not found"**
- Make sure environment variables are set correctly
- Restart dev servers after adding env variables

**Google sign-in not working**
- Verify Google is enabled in Clerk dashboard
- Check browser console for errors

**User not syncing**
- Check server logs for errors
- Verify MongoDB connection is working
- Check network tab for failed API calls
