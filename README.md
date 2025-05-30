# Full-Stack CRUD Application

A full-stack web application with React frontend and Node.js/Express backend for performing CRUD operations on a PostgreSQL database.

## Prerequisites

- Node.js and npm installed
- PostgreSQL installed and running
- PostgreSQL user with database creation privileges

## Setup Instructions

### 1. Database Setup

First, create the database and tables:

```bash
# Connect to PostgreSQL
psql -U your_postgres_user

# Run the schema file
\i /path/to/fullstack-crud-app/backend/db/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Update the .env file with your database credentials
# Edit backend/.env and set:
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password

# Install dependencies
npm install

# Start the backend server
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will run on http://localhost:3000

## API Endpoints

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get a single item
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item

## Features

- Create new items with name, description, price, and quantity
- View all items in a table format
- Edit existing items
- Delete items with confirmation
- Real-time updates after CRUD operations
- Error handling and loading states

## Project Structure

```
fullstack-crud-app/
├── backend/
│   ├── db/
│   │   ├── db.js          # Database connection
│   │   └── schema.sql     # Database schema
│   ├── routes/
│   │   └── items.js       # CRUD API routes
│   ├── .env               # Environment variables
│   ├── package.json
│   └── server.js          # Express server
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── itemsApi.js    # API client
    │   ├── components/
    │   │   ├── ItemForm.js    # Form component
    │   │   └── ItemList.js    # List component
    │   ├── App.js             # Main App component
    │   └── App.css            # Styles
    └── package.json
```