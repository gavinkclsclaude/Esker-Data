#!/bin/bash

# Database import script for the CRUD application

echo "Database Import Helper"
echo "====================="

# Default values
LOCAL_DB="crudapp_db"
LOCAL_USER="crudapp"
LOCAL_PASS="crudapp123"
LOCAL_HOST="localhost"

# Get source database information
read -p "Enter source database host: " SOURCE_HOST
read -p "Enter source database name: " SOURCE_DB
read -p "Enter source database user: " SOURCE_USER
read -sp "Enter source database password: " SOURCE_PASS
echo

# Choose import method
echo -e "\nChoose import method:"
echo "1. Direct copy (source server must be accessible)"
echo "2. Import from local backup file"
echo "3. Export from source first, then import"
read -p "Enter choice (1-3): " CHOICE

case $CHOICE in
    1)
        echo "Performing direct database copy..."
        PGPASSWORD=$SOURCE_PASS pg_dump -h $SOURCE_HOST -U $SOURCE_USER -d $SOURCE_DB | PGPASSWORD=$LOCAL_PASS psql -U $LOCAL_USER -d $LOCAL_DB -h $LOCAL_HOST
        ;;
    2)
        read -p "Enter path to backup file: " BACKUP_FILE
        if [[ -f "$BACKUP_FILE" ]]; then
            echo "Importing from $BACKUP_FILE..."
            PGPASSWORD=$LOCAL_PASS psql -U $LOCAL_USER -d $LOCAL_DB -h $LOCAL_HOST -f "$BACKUP_FILE"
        else
            echo "Error: File not found!"
            exit 1
        fi
        ;;
    3)
        BACKUP_FILE="database_backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "Exporting database to $BACKUP_FILE..."
        PGPASSWORD=$SOURCE_PASS pg_dump -h $SOURCE_HOST -U $SOURCE_USER -d $SOURCE_DB -f "$BACKUP_FILE"
        
        if [[ -f "$BACKUP_FILE" ]]; then
            echo "Importing to local database..."
            PGPASSWORD=$LOCAL_PASS psql -U $LOCAL_USER -d $LOCAL_DB -h $LOCAL_HOST -f "$BACKUP_FILE"
            echo "Backup saved as: $BACKUP_FILE"
        else
            echo "Error: Export failed!"
            exit 1
        fi
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac

echo -e "\nDatabase import completed!"
echo "To use a different database name, update the .env file:"
echo "  DB_NAME=$LOCAL_DB"

# Test the connection
echo -e "\nTesting database connection..."
PGPASSWORD=$LOCAL_PASS psql -U $LOCAL_USER -d $LOCAL_DB -h $LOCAL_HOST -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" && echo "Connection successful!"