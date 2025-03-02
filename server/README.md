# Auzins.lv Fitness Trainer Server

This is the backend server for the Auzins.lv fitness trainer booking system. It provides a RESTful API for managing bookings, admin authentication, and settings.

## Features

- RESTful API for booking management
- Secure admin authentication with JWT
- MongoDB database for persistent storage
- Configurable booking settings
- Input validation and error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

5. Edit the `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Configure other settings as needed

## Running the Server

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts when you make changes.

### Production Mode

```bash
npm start
```

## API Endpoints

### Bookings

- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/bookings/date/:date` - Get bookings for a specific date
- `POST /api/bookings` - Create a new booking
- `DELETE /api/bookings/:id` - Cancel a booking (admin only)

### Admin

- `POST /api/admin/login` - Admin login
- `GET /api/admin/logout` - Admin logout
- `GET /api/admin/me` - Get current admin
- `POST /api/admin/block-slot` - Block a time slot
- `POST /api/admin/unblock-slot` - Unblock a time slot

### Settings

- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings (admin only)

## Default Admin Account

A default admin account is created when the server starts for the first time:

- Username: `admin`
- Password: `admin123`

**Important:** Change the default password after the first login for security reasons.

## Deployment

For deployment instructions, see the main `deployment_plan.md` file in the project root.

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
