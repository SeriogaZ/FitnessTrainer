const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1, time: 1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
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
    
    const bookings = await Booking.find({ date }).select('time isBlocked');
    
    // Format response as an object with time slots as keys
    const bookingsMap = {};
    bookings.forEach(booking => {
      bookingsMap[booking.time] = {
        isBooked: true,
        isBlocked: booking.isBlocked
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
    const existingBooking = await Booking.findOne({ date, time });
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    // Get settings to validate booking
    const settings = await Settings.getSettings();
    
    // Check if booking is within allowed advance time
    const bookingDate = new Date(date + 'T' + time);
    const now = new Date();
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);
    
    if (hoursDifference < settings.minAdvanceHours) {
      return res.status(400).json({
        success: false,
        message: `Bookings must be made at least ${settings.minAdvanceHours} hours in advance`
      });
    }
    
    // Check if booking is not too far in the future
    const daysDifference = hoursDifference / 24;
    if (daysDifference > settings.advanceBookingDays) {
      return res.status(400).json({
        success: false,
        message: `Bookings can only be made up to ${settings.advanceBookingDays} days in advance`
      });
    }
    
    // Check if the day is a day off
    const dayOfWeek = new Date(date).getDay().toString();
    if (settings.daysOff.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: 'This day is not available for bookings'
      });
    }
    
    // Check if the time is within working hours
    const bookingHour = parseInt(time.split(':')[0]);
    if (bookingHour < settings.startHour || bookingHour >= settings.endHour) {
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
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    // Check for validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Check for duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    await booking.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
