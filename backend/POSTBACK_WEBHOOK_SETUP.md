# Postback Webhook Setup Guide

This guide explains how to configure postback webhooks for offer wall providers to automatically credit users when they complete offers.

## Overview

When a user completes an offer on an external provider's platform, the provider sends a postback (webhook) to our server with transaction details. Our system then:

1. Verifies the postback authenticity
2. Checks for duplicates
3. Converts currency to NGN
4. Calculates commission
5. Credits the user's wallet
6. Sends a notification

## Webhook Endpoint

```
POST https://your-domain.com/api/v1/postback/:providerId
GET https://your-domain.com/api/v1/postback/:providerId
```

Replace `:providerId` with the provider's ID (e.g., `cpagrip`, `ogads`, `adgatemedia`, `offertoro`)

## Provider-Specific Setup

### CPAGrip

**Postback URL:**

```
https://your-domain.com/api/v1/postback/cpagrip?user_id=[SUBID]&transaction_id=[TID]&amount=[PAYOUT]&currency=USD&offer_name=[OFFER_NAME]&signature=[SIGNATURE]
```

**Configuration Steps:**

1. Log in to CPAGrip dashboard
2. Go to Settings → Postback URL
3. Enter the postback URL above
4. Set SubID parameter to pass user ID
5. Enable signature verification
6. Save settings

**Environment Variables:**

```env
CPAGRIP_API_KEY=your_api_key
CPAGRIP_SECRET_KEY=your_secret_key
```

### OGAds

**Postback URL:**

```
https://your-domain.com/api/v1/postback/ogads?aff_sub=[USER_ID]&transaction_id=[TXN_ID]&amount=[AMOUNT]&currency=USD&offer_title=[OFFER_NAME]&hash=[HASH]
```

**Configuration Steps:**

1. Log in to OGAds dashboard
2. Go to Tools → Postback
3. Enter the postback URL above
4. Set aff_sub parameter to pass user ID
5. Enable hash verification
6. Save settings

**Environment Variables:**

```env
OGADS_API_KEY=your_api_key
OGADS_SECRET_KEY=your_secret_key
```

### AdGate Media

**Postback URL:**

```
https://your-domain.com/api/v1/postback/adgatemedia?subid=[USER_ID]&id=[TRANSACTION_ID]&point_value=[AMOUNT]&currency=USD&offer_name=[OFFER_NAME]&signature=[SIGNATURE]
```

**Configuration Steps:**

1. Log in to AdGate Media dashboard
2. Go to Settings → Postback Settings
3. Enter the postback URL above
4. Set subid parameter to pass user ID
5. Enable signature verification
6. Save settings

**Environment Variables:**

```env
ADGATE_API_KEY=your_api_key
ADGATE_SECRET_KEY=your_secret_key
```

### OfferToro

**Postback URL:**

```
https://your-domain.com/api/v1/postback/offertoro?oid=[USER_ID]&o_id=[TRANSACTION_ID]&amount=[AMOUNT]&currency=USD&offer_name=[OFFER_NAME]&sig=[SIGNATURE]
```

**Configuration Steps:**

1. Log in to OfferToro dashboard
2. Go to Settings → Postback URL
3. Enter the postback URL above
4. Set oid parameter to pass user ID
5. Enable signature verification
6. Save settings

**Environment Variables:**

```env
OFFERTORO_API_KEY=your_api_key
OFFERTORO_SECRET_KEY=your_secret_key
```

## Security

### Signature Verification

The system verifies postbacks using HMAC-SHA256 signatures:

```typescript
const dataString = `${userId}:${transactionId}:${amount}:${currency}`;
const signature = crypto
  .createHmac("sha256", secretKey)
  .update(dataString)
  .digest("hex");
```

### Hash Verification

Some providers use MD5 hashes:

```typescript
const dataString = `${userId}${transactionId}${amount}${secretKey}`;
const hash = crypto.createHash("md5").update(dataString).digest("hex");
```

### IP Whitelisting

Configure IP whitelists in the provider configuration:

```typescript
const provider = {
  ipWhitelist: ["52.89.214.238", "34.212.75.30", "104.18.0.0/16"],
};
```

## Testing

### Test Endpoint

Use the test endpoint to simulate postbacks (development only):

```bash
curl -X POST http://localhost:5000/api/v1/postback/test \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_here",
    "amount": 1.5,
    "currency": "USD",
    "offerName": "Test Offer",
    "providerId": "cpagrip"
  }'
```

### Provider Test Postbacks

Most providers offer test postback functionality in their dashboards. Use this to verify your setup before going live.

## Monitoring

### View Postback Logs

```bash
# Get recent postback logs
GET /api/v1/postback/logs?limit=50

# Get logs for specific provider
GET /api/v1/postback/logs?providerId=cpagrip

# Get logs for specific user
GET /api/v1/postback/logs?userId=user_id_here
```

### Check Transaction Status

```bash
# Get transaction by external ID
GET /api/v1/postback/transaction/:transactionId

# Get user's transactions
GET /api/v1/postback/user/:userId/transactions
```

### Provider Statistics

```bash
# Get provider stats
GET /api/v1/postback/provider/:providerId/stats

# Get stats for date range
GET /api/v1/postback/provider/:providerId/stats?startDate=2024-01-01&endDate=2024-01-31
```

## Troubleshooting

### Postback Not Received

1. Check provider dashboard for postback status
2. Verify postback URL is correct
3. Check server logs for incoming requests
4. Ensure server is accessible from provider's IP
5. Verify firewall rules allow incoming connections

### Verification Failed

1. Check secret key matches provider dashboard
2. Verify signature/hash calculation method
3. Check parameter names match provider's format
4. Review postback logs for error details

### User Not Credited

1. Check transaction status in database
2. Verify user ID is correct
3. Check wallet balance and transaction history
4. Review error logs for wallet crediting issues

### Duplicate Transactions

The system automatically prevents duplicates by checking:

- External transaction ID
- Same user, amount, and provider within 1 minute

## Commission Rates

Default commission rates by provider:

| Provider     | Commission Rate |
| ------------ | --------------- |
| CPAGrip      | 20%             |
| OGAds        | 18%             |
| AdGate Media | 18%             |
| OfferToro    | 15%             |

Commission rates can be configured per provider in the database.

## Database Models

### OfferWallTransaction

Stores completed offer wall transactions:

```typescript
{
  userId: ObjectId,
  providerId: string,
  providerName: string,
  externalTransactionId: string,
  offerName: string,
  offerCategory: string,
  originalAmount: number,
  originalCurrency: string,
  convertedAmount: number,
  commissionRate: number,
  commissionAmount: number,
  userEarnings: number,
  status: "pending" | "completed" | "failed" | "duplicate",
  verificationStatus: "verified" | "unverified" | "failed",
  processedAt: Date
}
```

### PostbackLog

Logs all postback attempts:

```typescript
{
  providerId: string,
  externalTransactionId: string,
  userId: string,
  requestData: object,
  requestHeaders: object,
  ipAddress: string,
  processingResult: {
    success: boolean,
    message: string,
    error?: string
  },
  processingTime: number
}
```

## API Reference

### Process Postback

```
POST /api/v1/postback/:providerId
```

**Parameters:** Provider-specific (see provider setup above)

**Response:**

```json
{
  "success": true,
  "message": "Transaction processed successfully",
  "transactionId": "transaction_id",
  "userEarnings": 1200.5
}
```

### Get Transaction Status

```
GET /api/v1/postback/transaction/:transactionId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactionId": "transaction_id",
    "externalTransactionId": "external_id",
    "status": "completed",
    "amount": 1200.5,
    "currency": "NGN",
    "processedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get User Transactions

```
GET /api/v1/postback/user/:userId/transactions?limit=50
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "transaction_id",
      "offerName": "Complete Survey",
      "provider": "CPAGrip",
      "amount": 1200.5,
      "status": "completed",
      "completedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Provider Stats

```
GET /api/v1/postback/provider/:providerId/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalTransactions": 1500,
    "totalRevenue": 1500000,
    "totalCommission": 300000,
    "totalUserEarnings": 1200000,
    "avgTransactionValue": 1000
  }
}
```

## Support

For issues or questions:

1. Check server logs: `backend/logs/`
2. Review postback logs in database
3. Contact provider support for provider-specific issues
4. Check this documentation for common solutions
