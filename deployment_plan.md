# Deployment Plan for Auzins.lv

## Overview
This document outlines the steps to secure the FitnessTrainer website and deploy it to Auzins.lv with a server-side database.

## 1. Backend Development

### Technology Stack
- **Server**: Node.js with Express.js
- **Database**: MongoDB (NoSQL database suitable for booking systems)
- **Authentication**: JWT (JSON Web Tokens) for secure admin authentication
- **API**: RESTful API endpoints for booking operations

### Backend Structure
```
server/
├── config/             # Configuration files
│   ├── db.js           # Database connection
│   └── auth.js         # Authentication configuration
├── controllers/        # Request handlers
│   ├── bookingController.js
│   ├── adminController.js
│   └── settingsController.js
├── models/             # Database models
│   ├── Booking.js
│   ├── Admin.js
│   └── Settings.js
├── routes/             # API routes
│   ├── bookingRoutes.js
│   ├── adminRoutes.js
│   └── settingsRoutes.js
├── middleware/         # Custom middleware
│   └── authMiddleware.js
├── utils/              # Utility functions
├── .env                # Environment variables (not in version control)
├── package.json        # Dependencies
└── server.js           # Entry point
```

### API Endpoints
- **Bookings**
  - `GET /api/bookings` - Get all bookings (admin only)
  - `GET /api/bookings/date/:date` - Get bookings for a specific date
  - `POST /api/bookings` - Create a new booking
  - `DELETE /api/bookings/:id` - Cancel a booking (admin only)

- **Admin**
  - `POST /api/admin/login` - Admin login
  - `POST /api/admin/block-slot` - Block a time slot
  - `POST /api/admin/unblock-slot` - Unblock a time slot

- **Settings**
  - `GET /api/settings` - Get current settings
  - `PUT /api/settings` - Update settings (admin only)

## 2. Frontend Modifications

### Changes Required
- Replace localStorage calls with API requests
- Implement proper error handling for API requests
- Add loading states during API calls
- Implement secure authentication for admin panel
- Update form submissions to use the API

### Example API Integration (JavaScript)
```javascript
// Before (localStorage)
function getBookings() {
  const bookingsJSON = localStorage.getItem('bookings');
  return bookingsJSON ? JSON.parse(bookingsJSON) : {};
}

// After (API)
async function getBookings() {
  try {
    const response = await fetch('/api/bookings');
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {};
  }
}
```

## 3. Hosting Setup

### Recommended Hosting Providers
1. **Heroku**
   - Pros: Easy deployment, free tier available, supports Node.js
   - Cons: Free tier has limitations, sleeps after inactivity

2. **DigitalOcean**
   - Pros: Reliable, good performance, fixed pricing
   - Cons: Requires more server management knowledge

3. **AWS (Amazon Web Services)**
   - Pros: Highly scalable, many services available
   - Cons: Complex pricing, steeper learning curve

### Recommended Choice: DigitalOcean
- **Plan**: Basic Droplet ($5-10/month)
- **Features**: 
  - 1GB RAM
  - 25GB SSD
  - 1TB transfer
  - Ubuntu 20.04

### Deployment Process
1. Create a DigitalOcean account
2. Create a new Droplet (Ubuntu 20.04)
3. Set up SSH access
4. Install Node.js, MongoDB, and Nginx
5. Configure Nginx as a reverse proxy
6. Set up PM2 for Node.js process management
7. Deploy the application code
8. Configure environment variables

## 4. Domain Registration and Configuration

### Domain Registration
1. Register Auzins.lv through a domain registrar like Namecheap or GoDaddy
   - Estimated cost: €15-25/year for a .lv domain

### DNS Configuration
1. Point the domain to your hosting provider's nameservers
2. Set up DNS records:
   - A record: @ → Your server IP
   - CNAME record: www → @
   - MX records (if you need email)

## 5. SSL/HTTPS Setup

### Let's Encrypt (Free SSL)
1. Install Certbot on your server
2. Obtain SSL certificate:
   ```
   certbot --nginx -d auzins.lv -d www.auzins.lv
   ```
3. Set up auto-renewal:
   ```
   certbot renew --dry-run
   ```
4. Configure Nginx to force HTTPS

## 6. Security Enhancements

### Server Security
1. Configure firewall (UFW)
2. Set up fail2ban to prevent brute force attacks
3. Keep software updated
4. Implement regular backups

### Application Security
1. Input validation on both client and server
2. Rate limiting for API endpoints
3. CSRF protection
4. XSS prevention
5. Secure HTTP headers

### Database Security
1. Use strong password for MongoDB
2. Restrict database access to localhost
3. Implement data validation
4. Regular backups

## 7. Monitoring and Maintenance

### Monitoring
1. Set up uptime monitoring (UptimeRobot, free tier)
2. Implement error logging (Sentry, free tier available)
3. Monitor server resources

### Maintenance
1. Regular updates for dependencies
2. Database optimization
3. Performance monitoring
4. Regular backups

## 8. Cost Estimation

| Item | Monthly Cost | Annual Cost |
|------|--------------|-------------|
| Domain (Auzins.lv) | €1.67-2.08 | €20-25 |
| Hosting (DigitalOcean) | $5-10 | $60-120 |
| SSL Certificate (Let's Encrypt) | Free | Free |
| **Total** | **€6-11** | **€75-135** |

## 9. Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Backend Development | 1-2 weeks | Create server, API, and database |
| Frontend Modifications | 1 week | Update frontend to use API |
| Hosting Setup | 1-2 days | Set up server and deploy application |
| Domain & SSL | 1 day | Register domain and configure SSL |
| Testing | 2-3 days | Test all functionality |
| **Total** | **2-3 weeks** | |

## 10. Next Steps

1. Choose and register with a hosting provider
2. Register the Auzins.lv domain
3. Begin backend development
4. Modify frontend code
5. Deploy and test
