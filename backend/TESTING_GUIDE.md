# Offer Wall System Testing Guide

## Prerequisites

1. MongoDB running
2. Redis running
3. Backend server running
4. Test user account created
5. Provider credentials configured

## Manual Testing Checklist

### 1. Provider Setup ✓

```bash
# Seed providers
cd backend
npm run seed:providers

# Verify providers created
curl http://localhost:5000/api/v1/providers
```

### 2. Currency Conversion ✓

```bash
# Test currency conversion
curl http://localhost:5000/api/v1/currency/convert?amount=10&from=USD&to=NGN

# Check exchange rates
curl http://localhost:5000/api/v1/currency/rates
```

### 3. Postback Webhook ✓

```bash
# Test postback (replace USER_ID with actual user ID)
curl -X POST http://localhost:5000/api/v1/postback/cpagrip \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID",
    "transaction_id": "test_'$(date +%s)'",
    "amount": "1.50",
    "currency": "USD",
    "offer_name": "Test Offer"
  }'

# Check transaction was created
curl http://localhost:5000/api/v1/postback/user/USER_ID/transactions
```

### 4. Fraud Prevention ✓

```bash
# Check user fraud status
curl http://localhost:5000/api/v1/fraud/check/USER_ID

# Get fraud report
curl http://localhost:5000/api/v1/fraud/report

# Get flagged users
curl http://localhost:5000/api/v1/fraud/flagged-users
```

### 5. Analytics ✓

```bash
# Get provider analytics
curl http://localhost:5000/api/v1/offerwall-analytics/provider/cpagrip

# Get revenue report
curl http://localhost:5000/api/v1/offerwall-analytics/revenue-report

# Compare providers
curl http://localhost:5000/api/v1/offerwall-analytics/compare-providers
```

### 6. Provider Management ✓

```bash
# List all providers
curl http://localhost:5000/api/v1/providers

# Get specific provider
curl http://localhost:5000/api/v1/providers/cpagrip

# Update provider status
curl -X PATCH http://localhost:5000/api/v1/providers/cpagrip/status \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive", "reason": "Testing"}'

# Get provider stats
curl http://localhost:5000/api/v1/providers/cpagrip/stats

# Get dashboard stats
curl http://localhost:5000/api/v1/providers/dashboard/stats
```

## Mobile App Testing

### 1. Offer Wall List Screen

- Navigate to /offerwalls
- Verify providers are displayed
- Check provider logos and descriptions
- Tap on a provider

### 2. Offer Wall Viewer

- WebView should load provider URL
- User ID should be in URL parameters
- Close button should work
- Back navigation should work

### 3. Earnings History

- Navigate to /offerwalls/earnings
- Verify transactions are displayed
- Check filtering (all/completed/pending)
- Verify amounts are correct

### 4. Admin Screens

- Navigate to /admin/providers
- Create new provider
- Edit existing provider
- View provider stats
- Check fraud monitor
- View analytics dashboard

## Integration Testing

### Test Complete Flow

1. User opens offer wall
2. Completes an offer on provider site
3. Provider sends postback to webhook
4. System processes postback:
   - Fraud check passes
   - Currency converted
   - Commission calculated
   - Wallet credited
   - Notification sent
5. User sees updated balance
6. Transaction appears in history
7. Analytics updated

### Verify Each Step

```bash
# 1. Check initial wallet balance
curl http://localhost:5000/api/v1/wallet/USER_ID

# 2. Simulate postback
curl -X POST http://localhost:5000/api/v1/postback/cpagrip?user_id=USER_ID&transaction_id=test123&amount=2.00&currency=USD&offer_name=TestOffer

# 3. Verify wallet updated
curl http://localhost:5000/api/v1/wallet/USER_ID

# 4. Check transaction created
curl http://localhost:5000/api/v1/postback/user/USER_ID/transactions

# 5. Verify analytics updated
curl http://localhost:5000/api/v1/offerwall-analytics/provider/cpagrip
```

## Automated Tests

### Run Unit Tests

```bash
cd backend
npm test
```

### Run Integration Tests

```bash
npm run test:integration
```

### Run E2E Tests

```bash
npm run test:e2e
```

## Performance Testing

### Load Test Postback Endpoint

```bash
# Install artillery if not installed
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:5000/api/v1/postback/test
```

### Monitor Performance

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/v1/providers

# Monitor Redis
redis-cli monitor

# Monitor MongoDB
mongo --eval "db.currentOp()"
```

## Security Testing

### Test Fraud Prevention

```bash
# 1. Send multiple rapid postbacks (should be rate limited)
for i in {1..25}; do
  curl -X POST http://localhost:5000/api/v1/postback/cpagrip?user_id=USER_ID&transaction_id=rapid_$i&amount=1.00&currency=USD&offer_name=Rapid
done

# 2. Send duplicate transaction (should be rejected)
curl -X POST http://localhost:5000/api/v1/postback/cpagrip?user_id=USER_ID&transaction_id=duplicate123&amount=1.00&currency=USD&offer_name=Dup1
curl -X POST http://localhost:5000/api/v1/postback/cpagrip?user_id=USER_ID&transaction_id=duplicate123&amount=1.00&currency=USD&offer_name=Dup2

# 3. Check fraud detection triggered
curl http://localhost:5000/api/v1/fraud/check/USER_ID
```

### Test Signature Verification

```bash
# Send postback without signature (should fail if verification enabled)
curl -X POST http://localhost:5000/api/v1/postback/cpagrip?user_id=USER_ID&transaction_id=nosig&amount=1.00&currency=USD&offer_name=NoSig
```

## Troubleshooting

### Common Issues

1. **Postback not received**

   - Check server logs
   - Verify provider configuration
   - Test with /postback/test endpoint

2. **User not credited**

   - Check transaction status
   - Verify wallet exists
   - Check fraud prevention logs

3. **Analytics not updating**

   - Verify transactions are completed
   - Check provider metrics
   - Refresh analytics cache

4. **Redis connection issues**
   - Verify Redis is running
   - Check connection string
   - Test with redis-cli ping

### Debug Commands

```bash
# Check server logs
tail -f backend/logs/combined.log

# Check error logs
tail -f backend/logs/error.log

# Check MongoDB collections
mongo earn9ja --eval "db.offerwallTransactions.find().pretty()"

# Check Redis keys
redis-cli keys "*"

# Check specific Redis key
redis-cli get "user:preferences:USER_ID"
```

## Success Criteria

- [ ] All providers load correctly
- [ ] Postback webhooks process successfully
- [ ] Fraud prevention blocks suspicious activity
- [ ] Currency conversion works accurately
- [ ] Wallet crediting is correct
- [ ] Analytics display accurate data
- [ ] Mobile UI renders properly
- [ ] Admin screens function correctly
- [ ] No memory leaks or performance issues
- [ ] All automated tests pass

## Production Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Provider credentials configured
- [ ] Postback URLs registered with providers
- [ ] Redis configured and secured
- [ ] MongoDB indexes created
- [ ] Rate limiting configured
- [ ] Monitoring and alerts set up
- [ ] Backup strategy in place
- [ ] Error tracking configured (Sentry)
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Documentation updated
