#!/bin/bash

echo "Starting Esker Data Application..."

# Start backend with PM2
echo "Starting backend server..."
cd backend
npx pm2 delete esker-backend 2>/dev/null
npx pm2 start ecosystem.config.js
npx pm2 save

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm start &

echo "Application started!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "To view backend logs: cd backend && npx pm2 logs"
echo "To stop backend: cd backend && npx pm2 stop esker-backend"
echo "To restart backend: cd backend && npx pm2 restart esker-backend"