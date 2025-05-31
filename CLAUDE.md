# Project: Esker Data PostgreSQL Frontend

## Current Status (v1.0)
- Full-stack database viewer/querying application with React frontend and Express backend
- PostgreSQL database with authentication system implemented
- PM2 process management configured for resilience
- Login system with JWT authentication
- User management with admin controls

## Key Features Implemented
1. Authentication system (login/logout)
2. User management (admin panel)
3. Table data viewer with filtering
4. Export functionality (CSV, JSON)
5. PM2 for backend resilience
6. Graceful shutdown handling

## Default Credentials
- Username: admin
- Password: admin123

## Quick Commands
- Start app: `./start.sh`
- Stop app: `./stop.sh`
- Backend logs: `cd backend && pm2 logs`
- Backend status: `cd backend && pm2 status`

## Recent Issues Resolved
- Backend server crashes - fixed with PM2 process management
- Database connection resilience - added connection pooling and retry logic
- Added startup/shutdown scripts for easy management

## Next Steps (suggested)
- Change default admin password
- Consider adding data pagination for large tables
- Add user profile editing
- Implement password reset functionality
- Add audit logging for data changes

## Notes
- Backend runs on port 5000
- Frontend runs on port 3000
- PM2 ecosystem config in `backend/ecosystem.config.js`
- Logs stored in `backend/logs/`
