# Wallet Payment Debug Guide

## Issue
Frontend not updating after payment completion.

## Debugging Steps

### Step 1: Check Browser Console
After completing payment and returning to the wallet page, open browser console (F12) and look for:

```
Payment return detected: {
  flwStatus: "successful",
  flwTransactionId: "3847563",
  paystackRef: null,
  paymentStatus: null,
  genericRef: null,
  fullURL: "http://localhost:5173/wallet?status=successful&tx_ref=WALLET-xxx&transaction_id=3847563"
}
```

**If you see this:** The frontend is detecting the payment return ✅

**If you don't see this:** The URL parameters are different than expected ❌

### Step 2: Check Server Console
Look for these logs in your server terminal:

```
Verifying flutterwave payment with reference: 3847563
Payment verification result: { success: true, amount: 50, ... }
Added 50 to wallet for user 507f1f77bcf86cd799439011
```

**If you see this:** The backend is verifying correctly ✅

**If you don't see this:** The verification request isn't reaching the server ❌

### Step 3: Check Network Tab
In browser DevTools → Network tab, look for:

**Request:**
```
POST /api/wallet/verify-payment
{
  "reference": "3847563",
  "gateway": "flutterwave"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment verified and funds added successfully",
  "data": {
    "wallet": {
      "balance": 50,
      "transactions": [...]
    }
  }
}
```

### Step 4: Manual Test
If automatic verification isn't working, use the manual script:

```bash
cd server
node scripts/verifyFlutterwavePayment.js <transaction_id> <your_email>
```

Example:
```bash
node scripts/verifyFlutterwavePayment.js 3847563 user@example.com
```

## Common Issues & Solutions

### Issue 1: Console shows "Payment return detected" but no verification
**Cause:** useEffect not triggering mutation
**Solution:** Check if `verifyPaymentMutation` is defined before useEffect

### Issue 2: Verification request returns 401 Unauthorized
**Cause:** User not authenticated
**Solution:** Make sure you're logged in and token is valid

### Issue 3: Verification returns "Payment already processed"
**Cause:** Payment was already verified
**Solution:** This is actually success! Just refresh the page to see updated balance

### Issue 4: Verification returns "Payment verification failed"
**Cause:** Flutterwave API error or invalid transaction ID
**Solution:** 
- Check Flutterwave dashboard to confirm payment status
- Verify FLUTTERWAVE_SECRET_KEY_TEST is correct in .env
- Use manual verification script

### Issue 5: Balance updates but UI doesn't refresh
**Cause:** React Query cache not invalidating
**Solution:** Hard refresh browser (Ctrl+Shift+R) or clear cache

## Quick Fix Commands

### Force refresh wallet data:
Open browser console and run:
```javascript
window.location.reload(true);
```

### Check current URL parameters:
```javascript
console.log(window.location.search);
```

### Manually trigger verification (in console):
```javascript
// Get transaction ID from URL
const params = new URLSearchParams(window.location.search);
const txId = params.get('transaction_id');
console.log('Transaction ID:', txId);

// Then use manual script with this ID
```

## Testing Checklist

After making a payment:

1. [ ] Check browser console for "Payment return detected"
2. [ ] Check if transaction_id is in the log
3. [ ] Check server console for "Verifying flutterwave payment"
4. [ ] Check Network tab for POST /api/wallet/verify-payment
5. [ ] Check response status (should be 200)
6. [ ] Check if balance updated in response
7. [ ] Wait 3 seconds for UI to update
8. [ ] If not updated, hard refresh (Ctrl+Shift+R)

## Expected Flow

1. User completes payment on Flutterwave
2. Flutterwave redirects to: `/wallet?status=successful&transaction_id=xxx`
3. Frontend detects URL parameters
4. Shows "Verifying payment..." toast
5. Sends POST request to `/api/wallet/verify-payment`
6. Backend verifies with Flutterwave API
7. Backend adds funds to wallet
8. Backend returns updated wallet
9. Frontend shows "Funds added successfully! 🎉"
10. Frontend invalidates React Query cache
11. Frontend refetches wallet data
12. UI updates with new balance
13. After 3 seconds, URL cleaned up

## Still Not Working?

### Option 1: Use Manual Verification
```bash
cd server
node scripts/verifyFlutterwavePayment.js <transaction_id> <your_email>
```

### Option 2: Check Database Directly
```bash
# Connect to MongoDB
mongosh

# Use your database
use your_database_name

# Find your wallet
db.wallets.findOne({ user: ObjectId("your-user-id") })

# Check if transaction exists
db.wallets.findOne(
  { user: ObjectId("your-user-id") },
  { transactions: 1, balance: 1 }
)
```

### Option 3: Add More Logging
Add this to WalletPro.tsx after the useEffect:

```typescript
useEffect(() => {
  console.log('Current search params:', searchParams.toString());
  console.log('Payment step:', paymentStep);
  console.log('Wallet balance:', wallet?.balance);
}, [searchParams, paymentStep, wallet]);
```

## Contact Support
If none of these work, provide:
1. Browser console logs
2. Server console logs
3. Network tab screenshot
4. Transaction ID from Flutterwave
5. Your email address

We'll manually verify and add the funds.
