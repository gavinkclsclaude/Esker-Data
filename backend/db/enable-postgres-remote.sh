#!/bin/bash

# Script to enable remote access for PostgreSQL postgres superuser
# This script requires sudo privileges

echo "=== PostgreSQL Superuser Remote Access Configuration ==="
echo "This script will configure PostgreSQL to accept remote connections for the postgres superuser"
echo ""
echo "WARNING: Allowing remote superuser access is a security risk!"
echo "Only use this for development/testing environments."
echo ""
read -p "Do you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 1
fi

# First, set a password for postgres user if not already set
echo ""
echo "1. Setting password for postgres user..."
echo "Enter the password you want to set for the postgres superuser:"
read -s postgres_password
echo ""
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$postgres_password';"
echo "   Password set for postgres user"

# Add remote access rule to pg_hba.conf
echo ""
echo "2. Adding remote access rule for postgres to pg_hba.conf..."
# Check if the rule already exists
if ! sudo grep -q "host.*all.*postgres.*0.0.0.0/0" /etc/postgresql/16/main/pg_hba.conf; then
    echo "host    all             postgres        0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf > /dev/null
    echo "   Remote access rule added for postgres user"
else
    echo "   Remote access rule for postgres already exists"
fi

# Restart PostgreSQL
echo ""
echo "3. Restarting PostgreSQL service..."
sudo systemctl restart postgresql
echo "   PostgreSQL restarted"

# Check PostgreSQL status
echo ""
echo "4. Checking PostgreSQL status..."
sudo systemctl status postgresql --no-pager

# Display connection information
echo ""
echo "=== Configuration Complete ==="
echo ""
echo "Remote superuser access is now enabled for:"
echo "  User: postgres"
echo "  Databases: all"
echo "  Port: 5432"
echo ""
echo "To connect remotely as superuser, use:"
echo "  psql -h YOUR_SERVER_IP -p 5432 -U postgres"
echo ""
echo "SECURITY WARNING: The postgres superuser has full access to all databases!"
echo "For production, consider:"
echo "1. Using SSL/TLS connections (hostssl instead of host)"
echo "2. Restricting to specific IP ranges instead of 0.0.0.0/0"
echo "3. Using a less privileged user for remote connections"