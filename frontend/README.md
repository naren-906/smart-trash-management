# Waste Management System - Frontend

Frontend views and static assets for the Waste Management System.

## Running Frontend Standalone

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the frontend server:
```bash
npm run dev
```

The frontend will run on `http://localhost:8080`

**Note:** This runs the frontend in standalone mode for UI development/testing. For full functionality with backend API, run the backend server as well.

## Structure

- **views/** - EJS templates
  - **admin/** - Admin dashboard and management views
  - **driver/** - Driver dashboard and request views
  - **user/** - User interface for waste pickup requests
  - **common/** - Shared components (header, footer, navbar)
- **css/** - Stylesheets
- **images/** - Image assets

## Views

### User Views
- Homepage
- Login/Signup
- User Dashboard
- Request Pickup
- My Requests

### Driver Views
- Driver Login
- Driver Dashboard
- Pending Requests
- History

### Admin Views
- Admin Login
- Admin Dashboard
- All Requests
- All Drivers
- Create Driver

## Technologies

- EJS (Embedded JavaScript templates)
- CSS
- Served by Express.js backend
