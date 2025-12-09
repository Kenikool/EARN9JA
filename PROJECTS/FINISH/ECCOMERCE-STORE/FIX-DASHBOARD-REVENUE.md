# Fix Dashboard Revenue Display

## Problem
Dashboard shows $0.00 total revenue despite having 11 orders in the database.

## Root Cause
Orders exist but are not marked as `isPaid: true`, so the revenue aggregation returns 0.

## Solution

### Option 1: Update Existing Orders (Quick Fix)

If you have orders that were paid but not marked as paid, run this in MongoDB:

```javascript
// Check current status
db.orders.find({}, { orderNumber: 1, isPaid: 1, totalPrice: 1, paymentResult: 1 }).pretty()

// Update orders that have payment results but aren't marked as paid
db.orders.updateMany(
  { 
    paymentResult: { $exists: true },
    isPaid: { $ne: true }
  },
  { 
    $set: { 
      isPaid: true, 
      paidAt: new Date() 
    } 
  }
)

// Or update ALL orders (if testing)
db.orders.updateMany(
  {},
  { 
    $set: { 
      isPaid: true, 
      paidAt: new Date() 
    } 
  }
)
```

### Option 2: Verify Payment Webhooks

Ensure payment gateway webhooks are properly configured:

**Stripe:**
- Webhook URL: `https://yourdomain.com/api/payment/webhook/stripe`
- Events: `payment_intent.succeeded`

**Flutterwave:**
- Webhook URL: `https://yourdomain.com/api/payment/webhook/flutterwave`  
- Events: `charge.completed`

**Paystack:**
- Webhook URL: `https://yourdomain.com/api/payment/webhook/paystack`
- Events: `charge.success`

### Option 3: Manual Order Update via API

Create a test order and verify it gets marked as paid:

```bash
# After creating an order, manually mark it as paid
curl -X PUT http://localhost:8000/api/orders/{orderId}/pay \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_payment_id",
    "status": "completed",
    "update_time": "2024-01-01T00:00:00Z",
    "email_address": "test@example.com"
  }'
```

## Verification

After applying the fix, verify:

1. **Check orders in database:**
```javascript
db.orders.find({ isPaid: true }).count()
```

2. **Check dashboard API:**
```bash
curl http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

3. **Refresh admin dashboard** - Should now show correct total revenue

## Expected Result

Dashboard should display:
- **Total Revenue**: Sum of all `totalPrice` where `isPaid: true`
- **Total Orders**: Count of all orders (11 in your case)
- **Recent Orders**: List of 5 most recent orders

---

## Currency Enhancement Applied

✅ Added automatic currency detection based on shipping country
✅ Currency auto-updates when user selects their country
✅ Payment methods filtered by selected currency
✅ Currency stored with order for proper tracking

### Supported Country-Currency Mappings:
- Nigeria (NG) → NGN
- Ghana (GH) → GHS  
- Kenya (KE) → KES
- South Africa (ZA) → ZAR
- United States (US) → USD
- United Kingdom (GB) → GBP
- Canada (CA) → CAD
- Australia (AU) → AUD
- European Union (EU) → EUR
