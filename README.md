# Auzins.lv Fitness Trainer Website

A professional website for fitness trainer Deivids Auzins with an integrated booking system.

## Features

- Responsive design for all devices
- Online booking system for training sessions
- Admin panel for managing bookings and settings
- Secure server-side database for storing booking information
- HTTPS support for secure communication

## Project Structure

```
FitnessTrainer/
├── index.html              # Homepage
├── about.html              # About page
├── service.html            # Services page
├── contact.html            # Contact page
├── booking.html            # Booking page
├── admin.html              # Admin panel
├── css/                    # Stylesheets
│   ├── style.css           # Main styles
│   ├── responsive.css      # Responsive styles
│   ├── booking.css         # Booking page styles
│   └── admin.css           # Admin panel styles
├── js/                     # JavaScript files
│   ├── api.js              # API service for backend communication
│   ├── booking.js          # Booking page functionality
│   └── admin.js            # Admin panel functionality
├── images/                 # Image assets
└── server/                 # Backend server
    ├── server.js           # Main server file
    ├── models/             # Database models
    ├── routes/             # API routes
    ├── middleware/         # Custom middleware
    └── config/             # Configuration files
```

## Frontend

The frontend is built with HTML, CSS, and JavaScript. It uses:

- Bootstrap for responsive layout
- jQuery for DOM manipulation
- Custom JavaScript for the booking system

## Backend

The backend is built with Node.js and Express. It uses:

- MongoDB for database storage
- JWT for authentication
- RESTful API for communication with the frontend

## Deployment

For detailed deployment instructions, see [deployment_plan.md](deployment_plan.md).

### Quick Start (Development)

1. Clone the repository
2. Install dependencies:

```bash
cd server
npm install
```

3. Create a `.env` file based on `.env.example`
4. Start the server:

```bash
npm run dev
```

5. Open `index.html` in your browser

### Production Deployment

For production deployment, follow these steps:

1. Register the domain (Auzins.lv)
2. Set up a server (DigitalOcean recommended)
3. Configure Nginx as a reverse proxy
4. Set up SSL with Let's Encrypt
5. Deploy the application
6. Configure MongoDB

## Security

The application implements several security measures:

- HTTPS for secure communication
- JWT for secure authentication
- Password hashing with bcrypt
- Input validation on both client and server
- CORS protection
- XSS prevention

## Admin Access

The admin panel is accessible at `/admin.html`. The default credentials are:

- Username: `admin`
- Password: `admin123`

**Important:** Change the default password after the first login.

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For any questions or support, please contact:

- Email: info@auzins.lv
- Phone: +371 XXXXXXXX
