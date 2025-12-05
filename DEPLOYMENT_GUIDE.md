# Earn9ja Production Deployment Guide

This guide covers the complete deployment process for the Earn9ja platform with the profitable launch strategy.

## Pre-Deployment Checklist

### 1. Environment Variables

#### Backend (.env)

```bash
# Server
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/earn9ja-prod?retryWrites=true&w=majority

# Redis
REDIS_URL=redis://<username>:<password>@<host>:6379

# JWT
JWT_SECRET=<generate-strong-secret-256-bit>
JWT_REFRESH_SECRET=<generate-strong-secret-256-bit>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email (Production SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<production-email>
EMAIL_PASSWORD=<app-specific-password>
EMAIL_FROM=noreply@earn9ja.com

# SMS (Twilio Production)
TWILIO_ACCOUNT_SID=<production-sid>
TWILIO_AUTH_TOKEN=<production-token>
TWILIO_PHONE_NUMBER=<production-number>

# Payment Gateways
PAYSTACK_SECRET_KEY=<production-secret>
PAYSTACK_PUBLIC_KEY=<production-public>
FLUTTERWAVE_SECRET_KEY=<production-secret>
FLUTTERWAVE_PUBLIC_KEY=<production-public>
FLUTTERWAVE_ENCRYPTION_KEY=<production-encryption>

# Firebase Admin SDK
FIREBASE_PROJECT_ID=earn9ja-21ae7
FIREBASE_CLIENT_EMAIL=<service-account-email>
FIREBASE_PRIVATE_KEY=<private-key-from-json>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<production-cloud>
CLOUDINARY_API_KEY=<production-key>
CLOUDINARY_API_SECRET=<production-secret>

# Sentry
SENTRY_DSN=<production-dsn>

# AdMob
ADMOB_APP_ID_ANDROID=<production-android-id>
ADMOB_APP_ID_IOS=<production-ios-id>
```

#### Mobile App (.env)

```bash
# API
API_URL=https://api.earn9ja.com/api/v1

# AdMob (Production IDs)
ADMOB_APP_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
ADMOB_APP_ID_IOS=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
ADMOB_BANNER_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_BANNER_ID_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_INTERSTITIAL_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_INTERSTITIAL_ID_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_REWARDED_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_REWARDED_ID_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX

# Sentry
SENTRY_DSN=<mobile-production-dsn>

# Environment
NODE_ENV=production
```

### 2. MongoDB Indexes

Run these commands in MongoDB shell or Compass:

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phoneNumber: 1 }, { unique: true });
db.users.createIndex({ referralCode: 1 }, { unique: true, sparse: true });
db.users.createIndex({ roles: 1 });
db.users.createIndex({ "sponsorPackage.expiresAt": 1 });

// Tasks collection
db.tasks.createIndex({ sponsorId: 1, status: 1 });
db.tasks.createIndex({ category: 1, status: 1 });
db.tasks.createIndex({ createdAt: -1 });
db.tasks.createIndex({ expiresAt: 1 });

// TaskSubmissions collection
db.tasksubmissions.createIndex({ taskId: 1, workerId: 1 });
db.tasksubmissions.createIndex({ workerId: 1, status: 1 });
db.tasksubmissions.createIndex({ status: 1, createdAt: -1 });

// Transactions collection
db.transactions.createIndex({ userId: 1, createdAt: -1 });
db.transactions.createIndex({ type: 1, createdAt: -1 });
db.transactions.createIndex({ status: 1 });

// FinancialTransactions collection
db.financialtransactions.createIndex({ type: 1, createdAt: -1 });
db.financialtransactions.createIndex({ userId: 1, createdAt: -1 });

// DailyFinancialSummary collection
db.dailyfinancialsummaries.createIndex({ date: -1 }, { unique: true });

// EscrowAccounts collection
db.escrowaccounts.createIndex({ sponsorId: 1 }, { unique: true });

// Referrals collection
db.referrals.createIndex({ referrerId: 1 });
db.referrals.createIndex({ referredUserId: 1 }, { unique: true });
db.referrals.createIndex({ status: 1, expiresAt: 1 });

// DailyBonus collection
db.dailybonuses.createIndex({ userId: 1, date: 1 }, { unique: true });
db.dailybonuses.createIndex({ userId: 1, claimed: 1, date: -1 });

// Notifications collection
db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, read: 1 });
```

### 3. Redis Configuration

Ensure Redis is configured with:

- Persistence enabled (AOF + RDB)
- Max memory policy: `allkeys-lru`
- Password authentication enabled
- SSL/TLS for production

## Deployment Steps

### Step 1: Backend Deployment

#### Option A: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create earn9ja-backend

# Add MongoDB addon or use MongoDB Atlas
heroku addons:create mongolab:sandbox

# Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=<your-secret>
# ... set all other env vars

# Deploy
git push heroku main

# Run migrations if needed
heroku run npm run migrate

# Check logs
heroku logs --tail
```

#### Option B: Deploy to DigitalOcean/AWS/Azure

```bash
# Build backend
cd backend
npm install --production
npm run build

# Start with PM2
pm2 start dist/server.js --name earn9ja-backend
pm2 save
pm2 startup

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/earn9ja

# Nginx configuration
server {
    listen 80;
    server_name api.earn9ja.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/earn9ja /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d api.earn9ja.com
```

### Step 2: Mobile App Deployment

#### Android (Google Play Store)

```bash
cd Earn9ja

# Update version in app.json
# Increment versionCode and version

# Build production APK/AAB
eas build --platform android --profile production

# Or build locally
cd android
./gradlew bundleRelease

# Upload to Google Play Console
# 1. Go to https://play.google.com/console
# 2. Create new release in Production track
# 3. Upload AAB file from android/app/build/outputs/bundle/release/
# 4. Fill in release notes
# 5. Review and rollout
```

#### iOS (App Store)

```bash
# Build production IPA
eas build --platform ios --profile production

# Or build with Xcode
# 1. Open ios/Earn9ja.xcworkspace
# 2. Select "Any iOS Device" as target
# 3. Product > Archive
# 4. Distribute App > App Store Connect
# 5. Upload

# Submit for review in App Store Connect
# 1. Go to https://appstoreconnect.apple.com
# 2. Fill in app information
# 3. Add screenshots
# 4. Submit for review
```

### Step 3: Database Migrations

```bash
# Backup production database first
mongodump --uri="<production-mongodb-uri>" --out=backup-$(date +%Y%m%d)

# Run any pending migrations
npm run migrate:prod

# Verify data integrity
npm run verify:data
```

### Step 4: Configure Monitoring

#### Sentry Setup

```bash
# Backend Sentry
# Already configured in backend/src/config/sentry.ts
# Verify DSN is set in production .env

# Mobile Sentry
# Already configured in Earn9ja/lib/sentry.ts
# Verify DSN is set in production .env
```

#### Financial Alerts

```bash
# Verify AlertService is configured
# Check backend/src/services/AlertService.ts

# Test alert system
curl -X POST https://api.earn9ja.com/api/v1/admin/test-alert \
  -H "Authorization: Bearer <admin-token>"
```

#### Performance Monitoring

```bash
# Setup New Relic (optional)
npm install newrelic
# Add newrelic.js configuration

# Setup DataDog (optional)
npm install dd-trace
# Add DD_AGENT_HOST and DD_TRACE_AGENT_PORT to .env
```

### Step 5: Launch Phase Initialization

```bash
# Initialize launch phase in database
curl -X POST https://api.earn9ja.com/api/v1/admin/initialize-launch \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPhase": 1,
    "phase1": {
      "sponsorCount": 0,
      "escrowBalance": 0,
      "tasksReady": 0,
      "userCount": 0,
      "completed": false
    }
  }'
```

## Post-Deployment Verification

### 1. Health Checks

```bash
# Backend health
curl https://api.earn9ja.com/health

# API status
curl https://api.earn9ja.com/api/v1/status

# Database connectivity
curl https://api.earn9ja.com/api/v1/admin/db-status \
  -H "Authorization: Bearer <admin-token>"
```

### 2. Functional Tests

```bash
# Test user registration
curl -X POST https://api.earn9ja.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phoneNumber": "+2348012345678",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "roles": ["service_worker"]
  }'

# Test ad reward system
# Login and watch ad through mobile app

# Test sponsor onboarding
# Complete onboarding flow through mobile app

# Test financial monitoring
curl https://api.earn9ja.com/api/v1/admin/financial-summary \
  -H "Authorization: Bearer <admin-token>"
```

### 3. Performance Tests

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 https://api.earn9ja.com/health

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.earn9ja.com/api/v1/tasks
```

## Monitoring Dashboard URLs

- **Backend API**: https://api.earn9ja.com
- **Sentry (Backend)**: https://sentry.io/organizations/earn9ja/projects/backend
- **Sentry (Mobile)**: https://sentry.io/organizations/earn9ja/projects/mobile
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Redis Cloud**: https://app.redislabs.com
- **Google Play Console**: https://play.google.com/console
- **App Store Connect**: https://appstoreconnect.apple.com
- **Firebase Console**: https://console.firebase.google.com

## Rollback Procedure

If issues are detected:

```bash
# Backend rollback
heroku rollback  # For Heroku
# OR
pm2 stop earn9ja-backend
git checkout <previous-commit>
npm install
npm run build
pm2 restart earn9ja-backend

# Database rollback
mongorestore --uri="<production-mongodb-uri>" backup-<date>

# Mobile app rollback
# 1. Go to Google Play Console
# 2. Create new release with previous version
# 3. Rollout to production
```

## Support Contacts

- **DevOps Lead**: devops@earn9ja.com
- **Backend Team**: backend@earn9ja.com
- **Mobile Team**: mobile@earn9ja.com
- **On-Call**: +234-XXX-XXX-XXXX

## Maintenance Windows

- **Scheduled Maintenance**: Sundays 2:00 AM - 4:00 AM WAT
- **Emergency Maintenance**: As needed with 1-hour notice

---

**Last Updated**: December 2024
**Version**: 1.0.0
