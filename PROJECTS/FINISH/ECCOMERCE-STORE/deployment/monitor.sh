#!/bin/bash
# Production Monitoring Script

API_URL=${1:-"http://localhost:8000"}
INTERVAL=30

echo "📊 Monitoring: $API_URL"
echo "Checking every $INTERVAL seconds (Ctrl+C to stop)"
echo "=================================================="
echo ""

while true; do
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Health check
    health=$(curl -s $API_URL/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    # Response time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" $API_URL/health)
    
    # HTTP status
    http_status=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
    
    # Display status
    if [ "$health" = "success" ] && [ "$http_status" = "200" ]; then
        echo "[$timestamp] ✅ Status: $health | HTTP: $http_status | Response: ${response_time}s"
    else
        echo "[$timestamp] ❌ Status: $health | HTTP: $http_status | Response: ${response_time}s"
        # Send alert (add your notification logic here)
    fi
    
    sleep $INTERVAL
done
