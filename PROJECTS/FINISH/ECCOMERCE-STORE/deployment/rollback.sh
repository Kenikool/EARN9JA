#!/bin/bash
# Rollback Script - Restore previous version

echo "⏪ Rollback Deployment"
echo "====================="
echo ""

# Check if using PM2
if command -v pm2 &> /dev/null; then
    echo "🔄 Rolling back PM2 processes..."
    pm2 reload ecosystem.config.js
    echo "✅ PM2 processes reloaded"
fi

# Check if using Docker
if command -v docker &> /dev/null; then
    echo "🐳 Rolling back Docker containers..."
    docker-compose -f deployment/docker-compose.yml down
    docker-compose -f deployment/docker-compose.yml up -d
    echo "✅ Docker containers restarted"
fi

# Restore database backup
echo ""
read -p "Restore database backup? (y/n): " restore_db

if [ "$restore_db" = "y" ]; then
    echo "📋 Available backups:"
    ls -lh deployment/backups/*.tar.gz
    echo ""
    read -p "Enter backup filename: " backup_file
    
    if [ -f "deployment/backups/$backup_file" ]; then
        echo "💾 Restoring database..."
        tar -xzf "deployment/backups/$backup_file" -C deployment/backups/
        backup_dir=$(basename "$backup_file" .tar.gz)
        mongorestore --uri="$MONGODB_URI" --drop "deployment/backups/$backup_dir"
        rm -rf "deployment/backups/$backup_dir"
        echo "✅ Database restored"
    else
        echo "❌ Backup file not found"
    fi
fi

echo ""
echo "✅ Rollback complete!"
