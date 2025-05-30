# Application Resilience Setup

## Overview
The application has been configured with PM2 process management and improved error handling to prevent crashes and ensure automatic recovery.

## Key Improvements

### 1. PM2 Process Management
- Backend runs under PM2 with automatic restart on crash
- Logs are saved to `backend/logs/` directory
- Memory limits prevent resource exhaustion
- Graceful shutdown handling

### 2. Database Connection Pool
- Connection pooling with retry logic
- Automatic reconnection on connection loss
- Connection health monitoring
- Proper resource cleanup

### 3. Error Handling
- Graceful shutdown on SIGTERM/SIGINT
- Database connection validation
- Health check endpoint with database status

## Usage

### Start the Application
```bash
./start.sh
```

### Stop the Application
```bash
./stop.sh
```

### Backend Management Commands
```bash
# Check status
cd backend && npm run pm2:status

# View logs
cd backend && npm run pm2:logs

# Restart backend
cd backend && npm run pm2:restart

# Stop backend
cd backend && npm run pm2:stop
```

### Monitoring
- Backend logs: `backend/logs/`
- PM2 status: `npx pm2 status`
- Health check: `http://localhost:5000/api/health`

## Default Credentials
- Username: admin
- Password: admin123

## Troubleshooting

### Backend Issues
1. Check PM2 logs: `cd backend && npx pm2 logs`
2. Check database connection in `.env` file
3. Ensure PostgreSQL is running
4. Check health endpoint: `http://localhost:5000/api/health`

### Frontend Issues
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check CORS configuration if API calls fail