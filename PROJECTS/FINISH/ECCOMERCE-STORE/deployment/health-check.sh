#!/bin/bash
# Production Health Check Script

API_URL=${1:-"http://localhost:8000"}

echo "🏥 Running Health Checks on: $API_URL"
echo "========================================"
echo ""

# Test 1: Server Health
echo -n "1. Server Health... "
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ $response -eq 200 ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL (HTTP $response)"
fi

# Test 2: Products API
echo -n "2. Products API... "
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/products)
if [ $response -eq 200 ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL (HTTP $response)"
fi

# Test 3: Categories API
echo -n "3. Categories API... "
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/categories)
if [ $response -eq 200 ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL (HTTP $response)"
fi

# Test 4: Admin Protection
echo -n "4. Admin Protection... "
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/admin/analytics)
if [ $response -eq 401 ] || [ $response -eq 403 ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL (HTTP $response)"
fi

# Test 5: CORS Headers
echo -n "5. CORS Headers... "
cors=$(curl -s -I $API_URL/health | grep -i "access-control-allow-origin")
if [ ! -z "$cors" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi

echo ""
echo "Health check complete!"
