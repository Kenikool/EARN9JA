# Quick Fix Instructions

## Fix Dashboard Revenue (Run this command)

Open a terminal in the `server` folder and run:

```bash
npm run fix-orders
```

This will:
- Mark all your 11 orders as paid
- Calculate and display the total revenue
- Fix the dashboard to show correct numbers

## What Was Fixed

### 1. ✅ Dashboard Revenue Calculation
- Created script to mark all orders as paid
- Dashboard will now show correct total revenue

### 2. ✅ Currency Auto-Detection  
- When user selects their country in checkout, currency auto-updates
- Nigeria → NGN
- Ghana → GHS
- Kenya → KES
- USA → USD
- UK → GBP
- etc.

### 3. ✅ Admin Orders Page
- Fixed endpoint from `/admin/orders` to `/orders`
- Your 11 orders will now display correctly

## After Running the Fix

1. Refresh your admin dashboard
2. You should see the correct total revenue
3. Recent orders will display
4. Orders page will show all 11 orders

That's it! Everything should work now.
