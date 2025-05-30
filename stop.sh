#!/bin/bash

echo "Stopping Esker Data Application..."

# Stop PM2 backend
cd backend
npx pm2 stop esker-backend
npx pm2 delete esker-backend

# Kill frontend process
pkill -f "react-scripts start"

echo "Application stopped!"