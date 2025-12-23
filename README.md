# Fitness Booking App

A simple and easy-to-use fitness booking application for clients to book training sessions with Deivids Auzins.

## Features

- **Simple Booking Interface**: Clean, intuitive calendar-based booking system
- **Real-time Availability**: See available time slots instantly
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Backend Integration**: Secure API-based booking system with MongoDB

## Project Structure

```
FitnessTrainer/
├── index.html              # Main homepage with booking interface
├── css/                    # Stylesheets
│   ├── style.css          # Main styles
│   ├── responsive.css     # Responsive styles
│   └── booking.css        # Booking page styles
├── js/                     # JavaScript files
│   ├── api.js             # API service for backend communication
│   └── booking.js         # Booking page functionality
├── images/                 # Image assets
└── server/                 # Backend server
    ├── server.js          # Main server file
    ├── models/            # Database models
    ├── routes/            # API routes
    └── middleware/        # Custom middleware
```

## Quick Start

### Prerequisites

- Node.js (>=14.0.0)
- MongoDB database
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:

```bash
cd server
npm install
```

3. Create a `.env` file in the `server` directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Start the backend server:

```bash
npm run dev
```

5. Open `index.html` in your browser or serve it using a local server

### Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your `.env` file
2. Build and deploy the frontend files
3. Deploy the Node.js server
4. Configure MongoDB connection
5. Set up SSL/HTTPS for secure communication

## Usage

### For Clients

1. Visit the homepage
2. Scroll to the booking section
3. Select a date from the calendar
4. Choose an available time slot
5. Fill in your information (name, email, phone)
6. Add any special notes (optional)
7. Click "Confirm Booking"

## API Endpoints

### Booking Endpoints

- `GET /api/bookings/date/:date` - Get bookings for a specific date
- `POST /api/bookings` - Create a new booking
- `GET /api/settings` - Get booking settings (working hours, etc.)

## Technology Stack

### Frontend
- HTML5
- CSS3 (with modern gradients and animations)
- JavaScript (ES6+)
- Bootstrap (for responsive layout)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Contact Information

- **Trainer**: Deivids Auzins
- **Location**: Tornado – Fitnesa klubs
- **Phone**: +375 26735814
- **Email**: auzinsdeivids181@gmail.com

## Security

The application implements several security measures:

- HTTPS for secure communication
- JWT for secure authentication
- Password hashing with bcrypt
- Input validation on both client and server
- CORS protection
- XSS prevention

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Support

For any questions or support, please contact:
- Email: auzinsdeivids181@gmail.com
- Phone: +375 26735814
