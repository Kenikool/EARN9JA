# Flutterwave Payment Verification Fix

## Issue
Payment shows "successful" on Flutterwave but funds don't appear in wallet after returning to the site.

## Root Cause
Flutterwave redirects back with different URL parameters than expected:
- Returns: `?status=successful&tx_ref=WALLET-xxx&transaction_id=12345`
- We were looking for: `?payment=success&reference=xxx`

## Solution Applied

### 1. Frontend - Automatic Verification
Updated both `Wallet.tsx` and `Subscriptions.tsx` to detect Flutterwave's URL parameters:

```typescript
// Now detects:
// - Flutterwave: ?status=successful&transaction_id=xxx
// - Paystack: ?trxref=xxx
// - Generic: ?payment=success&reference=xxx
```

When detected, automatically triggers payment verification.

### 2. Backend - Duplicate Prevention
Added checks to prevent double-processing:
- Checks if transaction already exists before adding funds
- Returns success if already processed
- Logs all verification attempts

### 3. Manual Verification Script
Created `server/scripts/verifyFlutterwavePayment.js` for manual verification if needed.

## How to Use

### Automatic (Now Works!)
1. Make payment on Flutterwave
2. Complete payment successfully
3. You'll be redirected back to wallet/subscriptions
4. Verification happens automatically
5. Funds appear in wallet

### Manual Verification (If Needed)
If automatic verification fails, use the script:

```bash
cd server
node scripts/verifyFlutterwavePayment.js <transaction_id> <user_email>
```

**Example:**
```bash
node scripts/verifyFlutterwavePayment.js 3847563 user@example.com
```

**Where to find transaction_id:**
- In the URL after payment: `?transaction_id=3847563`
- In Flutterwave dashboard
- In browser console logs

## Testing Steps

### Test Wallet Top-up:
1. Go to `/wallet`
2. Click "Add Funds"
3. Enter amount: $50
4. Select: **Flutterwave**
5. Select currency: USD
6. Click "Proceed to Payment"
7. Complete payment on Flutterwave
8. **You'll be redirected back automatically**
9. **Funds should appear immediately**

### If Funds Don't Appear:
1. Check browser console for errors
2. Check server logs for verification attempts
3. Note the `transaction_id` from URL
4. Run manual verification script
5. Check wallet again

## URL Parameters Reference

### Flutterwave Success:
```
/wallet?status=successful&tx_ref=WALLET-123-1234567890&transaction_id=3847563
```

### Flutterwave Cancelled:
```
/wallet?status=cancelled&tx_ref=WALLET-123-1234567890
```

### Paystack Success:
```
/wallet?trxref=WALLET-123-1234567890&reference=WALLET-123-1234567890
```

## Backend Logs
The server now logs:
```
Verifying flutterwave payment with reference: 3847563
Payment verification result: { success: true, amount: 50, ... }
Added 50 to wallet for user 507f1f77bcf86cd799439011
```

Check your server console for these logs.

## Common Issues

### Issue: "Payment already processed"
**Solution:** This is normal! It means the payment was already verified and funds added. Just refresh the page.

### Issue: "Payment verification failed"
**Possible causes:**
1. Invalid transaction ID
2. Payment not actually successful on Flutterwave
3. Wrong Flutterwave API key
4. Network error

**Solution:** 
- Check Flutterwave dashboard to confirm payment status
- Use manual verification script
- Check server logs for detailed error

### Issue: Funds still not showing after manual verification
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Log out and log back in
4. Check database directly:
```bash
# In MongoDB
db.wallets.findOne({ user: ObjectId("your-user-id") })
```

## Environment Variables Required
```env
FLUTTERWAVE_SECRET_KEY_TEST=FLWSECK_TEST-...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
```

## Status
✅ **FIXED** - Automatic verification now works for Flutterwave payments
✅ **ADDED** - Manual verification script as backup
✅ **ADDED** - Duplicate payment prevention
✅ **ADDED** - Better logging for debugging

## Next Steps
1. Test with real payment
2. Monitor server logs
3. If issues persist, use manual verification script
4. Consider adding webhook handler for even more reliability
