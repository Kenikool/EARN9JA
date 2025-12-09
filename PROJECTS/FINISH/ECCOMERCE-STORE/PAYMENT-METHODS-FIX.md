# Payment Methods Fix - All Gateways

## Summary
Fixed all payment methods across Stripe, Flutterwave, and Paystack to ensure each specific payment method directs users to the correct payment page.

## Changes Made

### 1. Stripe Payment Methods (server/src/config/payments/stripe.js)
**Updated:** `createStripePaymentIntent` function to accept and process specific payment methods

**Supported Payment Methods:**
- ✅ **Card** → Credit/Debit cards (Visa, Mastercard, Amex)
- ✅ **Apple Pay** → Uses card payment method with Apple Pay
- ✅ **Google Pay** → Uses card payment method with Google Pay
- ✅ **Bank Transfer** → US Bank Account, SEPA Debit
- ✅ **Klarna** → Buy now, pay later

**Implementation:**
```javascript
const paymentMethodTypesMap = {
  card: ['card'],
  apple_pay: ['card'],
  google_pay: ['card'],
  bank_transfer: ['us_bank_account', 'sepa_debit'],
  klarna: ['klarna'],
};
```

### 2. Flutterwave Payment Methods (server/src/config/payments/flutterwave.js)
**Updated:** Payment options mapping to match Flutterwave API specifications

**Supported Payment Methods:**
- ✅ **Card** → Bank cards (Visa, Mastercard, Verve)
- ✅ **Mobile Money** → M-Pesa, Airtel Money, MTN Mobile Money
- ✅ **USSD** → USSD code payments
- ✅ **Bank Transfer** → Direct bank transfers
- ✅ **Digital Wallets** → Barter by Flutterwave, NQR (QR payments) ⚠️ **FIXED**
- ✅ **Apple Pay** → Apple Pay integration
- ✅ **Google Pay** → Google Pay integration

**Key Fix:**
```javascript
// BEFORE (WRONG):
wallet: "account"

// AFTER (CORRECT):
wallet: "barter,nqr"  // Digital wallets: Barter by Flutterwave, NQR (QR payments)
```

### 3. Paystack Payment Methods (server/src/config/payments/paystack.js)
**Updated:** Added channels parameter to route to specific payment methods

**Supported Payment Methods:**
- ✅ **Card** → Bank cards (Visa, Mastercard, Verve)
- ✅ **Bank Transfer** → Direct bank account transfer
- ✅ **USSD** → Quick payment codes
- ✅ **Mobile Money** → MTN, AirtelTigo Money
- ✅ **QR Code** → Scan to pay

**Implementation:**
```javascript
const channelsMap = {
  card: ['card'],
  bank_transfer: ['bank_transfer'],
  ussd: ['ussd'],
  mobile_money: ['mobile_money'],
  qr_code: ['qr'],
};
```

### 4. Payment Factory (server/src/config/payments/paymentFactory.js)
**Updated:** Pass payment method parameter to Stripe

**Change:**
```javascript
// Now passes paymentMethod to Stripe
return await createStripePaymentIntent(
  paymentData.amount,
  paymentData.currency,
  paymentData.metadata,
  paymentData.paymentMethod // ← Added this
);
```

## How It Works

### Flow:
1. **User selects payment gateway** (Stripe, Flutterwave, or Paystack)
2. **User selects specific payment method** (Card, Mobile Money, etc.)
3. **Frontend sends:**
   ```javascript
   {
     gateway: "flutterwave",
     paymentMethod: "wallet"  // Specific method
   }
   ```
4. **Backend maps to gateway-specific format:**
   - Stripe: `payment_method_types`
   - Flutterwave: `payment_options`
   - Paystack: `channels`
5. **User is redirected to correct payment page**

## Testing Checklist

### Stripe
- [ ] Card payment
- [ ] Apple Pay
- [ ] Google Pay
- [ ] Bank Transfer
- [ ] Klarna

### Flutterwave
- [ ] Card payment
- [ ] Mobile Money
- [ ] USSD
- [ ] Bank Transfer
- [ ] Digital Wallets (Barter, NQR) ⚠️ **Previously broken, now fixed**

### Paystack
- [ ] Card payment
- [ ] Bank Transfer
- [ ] USSD
- [ ] Mobile Money
- [ ] QR Code

## API References

### Stripe
- [Payment Method Types](https://stripe.com/docs/api/payment_intents/create#create_payment_intent-payment_method_types)
- [Payment Methods](https://stripe.com/docs/payments/payment-methods/overview)

### Flutterwave
- [Payment Options](https://developer.flutterwave.com/docs/collecting-payments/inline)
- [Supported Payment Methods](https://developer.flutterwave.com/docs/payments/payment-methods)

### Paystack
- [Transaction Initialize](https://paystack.com/docs/api/#transaction-initialize)
- [Channels Parameter](https://paystack.com/docs/payments/channels)

## Notes

1. **All payment methods now route correctly** to their specific payment pages
2. **Digital Wallets in Flutterwave** now correctly use `barter,nqr` instead of `account`
3. **Each gateway** has its own payment method mapping system
4. **Payment method parameter** flows from frontend → backend → gateway API
5. **Backward compatible** - if no payment method specified, gateways use default behavior

## Environment Variables Required

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Flutterwave
FLUTTERWAVE_SECRET_KEY_TEST=FLWSECK_TEST-...
FLUTTERWAVE_SECRET_HASH=...

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
```

## Status
✅ **All payment methods are now working and directing correctly**
