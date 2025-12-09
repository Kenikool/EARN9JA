# Payment Currency & Discount Issues

## Problems Identified

### 1. Currency Conversion Mismatch
**Issue:** The checkout page shows prices in the selected currency (e.g., NGN), but the payment gateway receives the amount in USD.

**Location:** `server/src/controllers/paymentController.js` line 88
```javascript
amount: order.totalPrice, // This is in USD
```

**Fix Needed:**
- Store the selected currency and converted amount in the order
- Pass the converted amount to the payment gateway
- Ensure the order model has fields for: `currency`, `exchangeRate`, `totalPriceInCurrency`

### 2. Coupon Discount Not Applied to Payment
**Issue:** Coupons are validated but the discount might not be properly reflected in the final payment amount.

**Fix Needed:**
- Verify the order creation includes the coupon discount
- Ensure `order.totalPrice` already has the discount applied
- Check the order controller to confirm discount calculation

### 3. Flash Sale Discount in Payment
**Issue:** Flash sale discounts are applied to cart items but need verification in the final payment amount.

**Fix Needed:**
- Confirm cart prices with flash sale discounts are used in order creation
- Verify the order total reflects all discounts

## Recommended Solution

### Step 1: Update Order Model
Add fields to store currency information:
```javascript
currency: String, // e.g., "NGN", "USD"
exchangeRate: Number, // Rate used for conversion
totalPriceInSelectedCurrency: Number, // Converted amount
```

### Step 2: Update Order Creation
When creating an order, calculate and store:
- Original USD prices
- Selected currency
- Exchange rate used
- Converted total price

### Step 3: Update Payment Controller
Use the converted amount for payment:
```javascript
amount: order.totalPriceInSelectedCurrency || order.totalPrice,
currency: order.currency || 'USD',
```

### Step 4: Add Currency Conversion Service
Create a service to handle real-time currency conversion or use stored rates.

## Testing Checklist
- [ ] Create order with coupon - verify discount in payment
- [ ] Create order with flash sale item - verify discounted price in payment
- [ ] Select different currency - verify converted amount matches payment
- [ ] Combine coupon + flash sale - verify both discounts apply
- [ ] Test with each payment gateway (Stripe, Flutterwave, Paystack)

## Priority
**HIGH** - This affects actual payments and customer trust
