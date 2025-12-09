#!/bin/bash
# Database Backup Script

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ecommerce_backup_$DATE"

# Load environment variables
if [ -f "../server/.env.production" ]; then
    export $(cat ../server/.env.production | grep MONGODB_URI | xargs)
fi

echo "💾 Starting database backup..."
echo "Backup file: $BACKUP_FILE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Run mongodump
mongodump --uri="$MONGODB_URI" --out="$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "📁 Location: $BACKUP_FILE"
    
    # Compress backup
    tar -czf "$BACKUP_FILE.tar.gz" -C "$BACKUP_DIR" "$(basename $BACKUP_FILE)"
    rm -rf "$BACKUP_FILE"
    
    echo "📦 Compressed: $BACKUP_FILE.tar.gz"
    
    # Keep only last 7 backups
    ls -t $BACKUP_DIR/*.tar.gz | tail -n +8 | xargs -r rm
    echo "🧹 Cleaned old backups (keeping last 7)"
else
    echo "❌ Backup failed!"
    exit 1
fi
