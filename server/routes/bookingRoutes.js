const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/authMiddleware');
const { sendBookingNotification } = require('../utils/emailService');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get bookings for a specific date
// @route   GET /api/bookings/date/:date
// @access  Public
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const bookings = await Booking.findByDate(date);
    
    // Format response as an object with time slots as keys
    const bookingsMap = {};
    bookings.forEach(booking => {
      bookingsMap[booking.time] = {
        isBooked: true,
        isBlocked: booking.is_blocked
      };
    });
    
    res.status(200).json({
      success: true,
      date,
      data: bookingsMap
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, date, time, notes } = req.body;
    
    // Check if required fields are provided
    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Check if the slot is already booked
    const existingBooking = await Booking.findOne(date, time);
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    // Get settings to validate booking
    let settings;
    try {
      settings = await Settings.getSettings();
    } catch (settingsError) {
      console.error('Error getting settings:', settingsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to load booking settings. Please try again later.'
      });
    }
    
    // Check if booking is within allowed advance time
    const bookingDate = new Date(date + 'T' + time);
    const now = new Date();
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);
    
    if (hoursDifference < settings.min_advance_hours) {
      return res.status(400).json({
        success: false,
        message: `Bookings must be made at least ${settings.min_advance_hours} hours in advance`
      });
    }
    
    // Check if booking is not too far in the future
    const daysDifference = hoursDifference / 24;
    if (daysDifference > settings.advance_booking_days) {
      return res.status(400).json({
        success: false,
        message: `Bookings can only be made up to ${settings.advance_booking_days} days in advance`
      });
    }
    
    // Check if the day is a day off
    const dayOfWeek = new Date(date).getDay().toString();
    if (settings.days_off.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: 'This day is not available for bookings'
      });
    }
    
    // Check if the time is within working hours
    const bookingHour = parseInt(time.split(':')[0]);
    if (bookingHour < settings.start_hour || bookingHour >= settings.end_hour) {
      return res.status(400).json({
        success: false,
        message: 'This time is outside of working hours'
      });
    }
    
    // Create booking
    const booking = await Booking.create({
      name,
      email,
      phone,
      date,
      time,
      notes
    });
    
    // Send email notification to trainer (don't wait for it)
    sendBookingNotification({
      name,
      email,
      phone,
      date,
      time,
      notes
    }).catch(err => {
      console.error('Failed to send booking notification email:', err);
      // Don't fail the booking if email fails
    });
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    // Log the full error for debugging
    console.error('Booking creation error:', err);
    
    // Check for validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Check for duplicate key error (PostgreSQL unique constraint violation)
    if (err.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    // Check for database connection errors
    if (err.message && err.message.includes('fetch')) {
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please check your Supabase configuration.'
      });
    }
    
    // Return more specific error message
    res.status(500).json({
      success: false,
      message: err.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    await Booking.deleteById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting booking:', err);
    if (err.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
