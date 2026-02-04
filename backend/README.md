# Waste Management System - Backend

Backend API server for the Waste Management System built with Node.js and Express.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following:
```
db_url="your_mongodb_connection_string"
jwt_secret="your_jwt_secret"
```

3. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Structure

- **Routes**: `/routes` - API endpoint definitions
- **Controllers**: `/controllers` - Business logic
- **Middleware**: `/middleware` - Authentication and request handling
- **Config**: `/config` - Database configuration
- **Utils**: `/utils` - Helper functions (bcrypt, JWT)

## Technologies

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- EJS template engine
