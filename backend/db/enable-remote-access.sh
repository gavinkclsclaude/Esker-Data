#!/bin/bash

# Script to enable remote access to PostgreSQL database
# This script requires sudo privileges

echo "=== PostgreSQL Remote Access Configuration ==="
echo "This script will configure PostgreSQL to accept remote connections"
echo ""

# Backup the original files
echo "1. Creating backups of configuration files..."
sudo cp /etc/postgresql/16/main/postgresql.conf /etc/postgresql/16/main/postgresql.conf.backup
sudo cp /etc/postgresql/16/main/pg_hba.conf /etc/postgresql/16/main/pg_hba.conf.backup
echo "   Backups created with .backup extension"

# Update postgresql.conf
echo ""
echo "2. Updating postgresql.conf to listen on all interfaces..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/16/main/postgresql.conf
echo "   postgresql.conf updated"

# Update pg_hba.conf
echo ""
echo "3. Adding remote access rule to pg_hba.conf..."
echo "host    crudapp_db      crudapp         0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf > /dev/null
echo "   pg_hba.conf updated"

# Restart PostgreSQL
echo ""
echo "4. Restarting PostgreSQL service..."
sudo systemctl restart postgresql
echo "   PostgreSQL restarted"

# Check PostgreSQL status
echo ""
echo "5. Checking PostgreSQL status..."
sudo systemctl status postgresql --no-pager

# Check if firewall is active and open port
echo ""
echo "6. Checking firewall status..."
if sudo ufw status | grep -q "Status: active"; then
    echo "   Firewall is active. Opening port 5432..."
    sudo ufw allow 5432/tcp
    echo "   Port 5432 opened for TCP connections"
else
    echo "   Firewall is not active. No action needed."
fi

# Display connection information
echo ""
echo "=== Configuration Complete ==="
echo ""
echo "Remote connections are now enabled for:"
echo "  Database: crudapp_db"
echo "  User: crudapp"
echo "  Port: 5432"
echo ""
echo "To connect remotely, use:"
echo "  psql -h YOUR_SERVER_IP -p 5432 -U crudapp -d crudapp_db"
echo ""
echo "Make sure to replace YOUR_SERVER_IP with your actual server IP address."
echo ""
echo "Security Note: This configuration allows connections from any IP address (0.0.0.0/0)."
echo "For production use, consider restricting to specific IP ranges."