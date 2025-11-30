# Payment Webhook Setup Guide

## Overview

Webhooks allow Paystack and Flutterwave to automatically notify your server when a payment is completed, eliminating the need for manual payment verification.

## How It Works

1. User initiates top-up → Payment link generated
2. User pays on Paystack/Flutterwave
3. Payment gateway sends webhook to your server
4. Server automatically credits user's wallet
5. User sees updated balance immediately

## Setup Instructions

### 1. Expose Your Local Server (Development)

Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start your backend server
npm run dev

# In another terminal, expose port 5000
ngrok http 5000
```

You'll get a URL like: `https://abc123.ngrok.io`

### 2. Configure Paystack Webhook

1. Go to https://dashboard.paystack.com
2. Navigate to Settings → Webhooks
3. Add webhook URL: `https://abc123.ngrok.io/api/v1/webhooks/paystack`
4. Save your webhook secret in `.env`:
   ```
   PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### 3. Configure Flutterwave Webhook

1. Go to https://dashboard.flutterwave.com
2. Navigate to Settings → Webhooks
3. Add webhook URL: `https://abc123.ngrok.io/api/v1/webhooks/flutterwave`
4. Your secret hash is already in `.env`:
   ```
   FLUTTERWAVE_SECRET_HASH=earnnaija-webhook-secret-2024
   ```

### 4. Test the Webhook

1. Make a test payment using Paystack/Flutterwave test cards
2. Check your server logs for:
   ```
   📥 Paystack webhook received: charge.success
   ✅ Wallet credited: userId - ₦amount - reference
   ```
3. Verify the user's wallet balance increased

## Production Setup

For production, replace the ngrok URL with your actual server URL:

- `https://api.earn9ja.com/api/v1/webhooks/paystack`
- `https://api.earn9ja.com/api/v1/webhooks/flutterwave`

## Webhook Endpoints

### Paystack Webhook

- **URL**: `POST /api/v1/webhooks/paystack`
- **Events Handled**: `charge.success`
- **Security**: Verified using HMAC SHA512 signature

### Flutterwave Webhook

- **URL**: `POST /api/v1/webhooks/flutterwave`
- **Events Handled**: `charge.completed`
- **Security**: Verified using secret hash

## Testing Webhook Locally

You can test webhooks manually using curl:

```bash
# Test Paystack webhook
curl -X POST http://localhost:5000/api/v1/webhooks/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: YOUR_SIGNATURE" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "TEST-REF-123",
      "amount": 100000,
      "status": "success",
      "metadata": {
        "userId": "USER_ID_HERE",
        "type": "wallet_topup"
      }
    }
  }'
```

## Troubleshooting

### Webhook not receiving events

- Check if ngrok is running
- Verify webhook URL in payment gateway dashboard
- Check server logs for incoming requests

### Signature verification failing

- Ensure `PAYSTACK_SECRET_KEY` matches your dashboard
- Check `FLUTTERWAVE_SECRET_HASH` is correct
- Verify webhook secret is properly configured

### Duplicate transactions

- The system automatically checks for duplicate references
- Each transaction is processed only once

## Security Notes

- Webhooks are verified using cryptographic signatures
- Never expose webhook endpoints without signature verification
- Always check transaction status before crediting wallet
- Log all webhook events for audit trail
