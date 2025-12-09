# Currency and Revenue Calculation Fixes

## Issue 1: Dashboard Revenue Not Calculating

### Problem
The dashboard shows $0.00 for total revenue even though there are 11 orders in the database.

### Root Cause
Orders are not being marked as `isPaid: true` when payment is completed.

### Solution
The backend already calculates revenue correctly:
```javascript
const totalRevenue = await Order.aggregate([
  { $match: { isPaid: true } },  // Only counts paid orders
  { $group: { _id: null, total: { $sum: "$totalPrice" } } },
]);
```

**Action Required**: Ensure that when payment is successful, the order's `isPaid` field is set to `true` and `paidAt` is set to the current date.

Check `server/src/controllers/paymentController.js` - the payment success webhook/callback should update:
```javascript
order.isPaid = true;
order.paidAt = Date.now();
await order.save();
```

---

## Issue 2: Currency Handling in Checkout

### Current Implementation
✅ Currency selection is already implemented in checkout
✅ Payment gateways are filtered by supported currencies
✅ Currency is passed to payment initiation

### Enhancement Needed: Country-Based Currency Detection

Add automatic currency detection based on shipping country:

```javascript
const COUNTRY_CURRENCY_MAP = {
  'Nigeria': 'NGN',
  'Ghana': 'GHS',
  'Kenya': 'KES',
  'South Africa': 'ZAR',
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'Canada': 'CAD',
  'Australia': 'AUD',
  // Add more countries as needed
};
```

### Implementation Steps

1. **Auto-detect currency when country is selected**
2. **Validate currency matches payment gateway**
3. **Store currency in order**
4. **Display prices in selected currency**

---

## Current Status

### ✅ Already Working
- Currency selection dropdown
- Payment gateway filtering by currency
- Currency validation before payment
- Currency passed to payment API

### ⚠️ Needs Fix
1. Orders not marked as paid (causing $0 revenue)
2. Auto-currency detection based on country
3. Currency conversion rates (if supporting multiple currencies)

---

## Quick Fix for Revenue Issue

Run this MongoDB query to check if orders are marked as paid:
```javascript
db.orders.find({}, { orderNumber: 1, isPaid: 1, totalPrice: 1 })
```

If `isPaid` is false for completed orders, update them:
```javascript
db.orders.updateMany(
  { paymentResult: { $exists: true } },
  { $set: { isPaid: true, paidAt: new Date() } }
)
```
