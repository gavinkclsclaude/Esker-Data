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

## GitHub/Version Control

### Repository
- **GitHub URL**: https://github.com/gavinkclsclaude/Esker-Data
- **Clone via HTTPS**: `git clone https://github.com/gavinkclsclaude/Esker-Data.git`
- **Clone via SSH**: `git clone git@github.com:gavinkclsclaude/Esker-Data.git`

### SSH Setup for GitHub
1. Generate SSH key (if not already done):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Add SSH key to ssh-agent:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```
3. Copy SSH public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
4. Add the key to GitHub: Settings → SSH and GPG keys → New SSH key

### Common Git Commands for This Project
```bash
# Check current status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your descriptive commit message"

# Push to main branch
git push origin main

# Pull latest changes
git pull origin main

# Create and switch to new branch
git checkout -b feature/your-feature-name

# Push new branch
git push -u origin feature/your-feature-name

# Switch back to main
git checkout main

# View commit history
git log --oneline
```

## Notes
- Backend runs on port 5000
- Frontend runs on port 3000
- PM2 ecosystem config in `backend/ecosystem.config.js`
- Logs stored in `backend/logs/`
