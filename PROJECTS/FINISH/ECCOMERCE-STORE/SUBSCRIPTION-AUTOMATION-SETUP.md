# Subscription Automation Setup

## Professional Recurring Payment System

Your subscription system now includes automatic recurring payments, email notifications, failure handling, and analytics - just like Amazon Subscribe & Save, Dollar Shave Club, and other professional platforms.

## Features Implemented

### ✅ Automatic Processing
- Processes subscriptions on schedule
- Charges from wallet automatically
- Creates orders and updates inventory
- Sends email notifications
- Handles payment failures gracefully

### ✅ Smart Failure Handling
- Retries failed payments
- Cancels after 3 failed attempts
- Notifies customers of issues
- Tracks failure reasons

### ✅ Customer Notifications
- Order created confirmation
- Payment failure alerts
- Upcoming delivery reminders (3 days before)
- Cancellation notices

### ✅ Delivery History
- Tracks all deliveries
- Links to orders
- Shows amounts and dates
- Status tracking

### ✅ Analytics Dashboard
- Total subscriptions
- Active/Paused/Cancelled counts
- Monthly Recurring Revenue (MRR)
- Upcoming deliveries

## Setup Instructions

### Option 1: Cron Job (Linux/Mac)

1. **Make script executable:**
```bash
chmod +x server/scripts/processSubscriptions.js
```

2. **Test manually:**
```bash
cd server
node scripts/processSubscriptions.js
```

3. **Setup cron job:**
```bash
crontab -e
```

4. **Add this line (runs daily at 2 AM):**
```
0 2 * * * cd /path/to/your/project/server && node scripts/processSubscriptions.js >> /var/log/subscriptions.log 2>&1
```

**Other schedules:**
- Every hour: `0 * * * *`
- Every 6 hours: `0 */6 * * *`
- Twice daily (2 AM & 2 PM): `0 2,14 * * *`

### Option 2: Node-Cron (Cross-platform)

1. **Install node-cron:**
```bash
npm install node-cron
```

2. **Add to server.js:**
```javascript
import cron from 'node-cron';
import subscriptionProcessor from './services/subscriptionProcessor.js';

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running subscription processor...');
  try {
    await subscriptionProcessor.processDueSubscriptions();
  } catch (error) {
    console.error('Subscription processing failed:', error);
  }
});

// Send reminders every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Sending delivery reminders...');
  try {
    await subscriptionProcessor.sendUpcomingDeliveryReminders();
  } catch (error) {
    console.error('Failed to send reminders:', error);
  }
});
```

### Option 3: PM2 (Production)

1. **Create ecosystem file:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'subscription-processor',
    script: './scripts/processSubscriptions.js',
    cron_restart: '0 2 * * *',
    autorestart: false,
  }]
};
```

2. **Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
```

### Option 4: Cloud Scheduler

**AWS Lambda:**
- Create Lambda function with script
- Use EventBridge to trigger daily

**Google Cloud:**
- Use Cloud Scheduler
- Trigger Cloud Function

**Heroku:**
- Use Heroku Scheduler add-on
- Run: `node server/scripts/processSubscriptions.js`

## Manual Processing

### Via API (Admin only):
```bash
POST /api/subscriptions/process
Authorization: Bearer <admin-token>
```

### Via Script:
```bash
cd server
node scripts/processSubscriptions.js
```

## How It Works

### 1. Subscription Created
- Customer pays for first delivery
- Payment method stored
- Next delivery date calculated
- 10% discount applied

### 2. Automatic Processing (Daily)
- System finds subscriptions due today
- Checks product availability
- Attempts to charge wallet
- Creates order if payment successful
- Updates inventory
- Sends confirmation email
- Schedules next delivery

### 3. Payment Failure
- Records failure reason
- Increments failure counter
- Sends alert to customer
- Retries on next scheduled date
- Cancels after 3 failures

### 4. Delivery Reminders
- Sent 3 days before delivery
- Includes order details
- Option to skip or modify

## Email Notifications

### Order Created
```
Subject: Subscription Order Created - #12345
- Order details
- Amount charged
- Next delivery date
- Manage subscription link
```

### Payment Failed
```
Subject: Subscription Payment Failed - Action Required
- Failure reason
- Failed attempts count
- Update payment method link
- Cancellation warning (if 3rd attempt)
```

### Upcoming Delivery
```
Subject: Upcoming Delivery - Product Name
- Delivery date
- Product details
- Amount to be charged
- Skip/modify options
```

## Analytics

### View Analytics:
```bash
GET /api/subscriptions/analytics
Authorization: Bearer <admin-token>
```

### Response:
```json
{
  "total": 150,
  "active": 120,
  "paused": 20,
  "cancelled": 10,
  "monthlyRecurringRevenue": 5400.00,
  "upcomingDeliveriesThisWeek": 45
}
```

## Monitoring

### Check Logs:
```bash
# Cron job logs
tail -f /var/log/subscriptions.log

# PM2 logs
pm2 logs subscription-processor

# Manual run
node scripts/processSubscriptions.js
```

### Success Indicators:
- ✓ Connected to MongoDB
- ✓ Found X subscriptions due
- ✓ Created order #12345
- ✓ Charged $50.00 from wallet
- ✓ Processing complete: X successful, Y failed

## Testing

### Test with Sample Subscription:
```bash
# 1. Create subscription via frontend
# 2. Update nextDelivery to now
db.subscriptions.updateOne(
  { _id: ObjectId("...") },
  { $set: { nextDelivery: new Date() } }
)

# 3. Run processor
node scripts/processSubscriptions.js

# 4. Check results
db.orders.find({ isSubscription: true }).sort({ createdAt: -1 })
```

## Troubleshooting

### Issue: Subscriptions not processing
**Check:**
- Cron job is running
- Database connection works
- Subscriptions have status: 'active'
- nextDelivery date is in the past

### Issue: Payment failures
**Check:**
- User has sufficient wallet balance
- Product is in stock
- Product still exists

### Issue: Emails not sending
**Check:**
- Email service configured
- SMTP credentials correct
- Email templates valid

## Production Checklist

- [ ] Email service configured (SendGrid/AWS SES)
- [ ] Cron job or scheduler setup
- [ ] Monitoring/alerting enabled
- [ ] Logs being collected
- [ ] Backup strategy in place
- [ ] Test subscriptions processed successfully
- [ ] Email notifications working
- [ ] Failure handling tested
- [ ] Analytics accessible

## Best Practices

1. **Run during low-traffic hours** (2-4 AM)
2. **Monitor failure rates** (should be < 5%)
3. **Review cancelled subscriptions** weekly
4. **Check MRR trends** monthly
5. **Test with small batches** first
6. **Keep logs for 30+ days**
7. **Alert on high failure rates**
8. **Backup before major changes**

## Support

If subscriptions aren't processing:
1. Check server logs
2. Run manual processing
3. Verify database connectivity
4. Check product availability
5. Review customer wallet balances

Your subscription system is now production-ready! 🎉
