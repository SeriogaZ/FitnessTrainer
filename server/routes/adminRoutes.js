const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }
    
    // Check for admin
    const admin = await Admin.findOne({ username }).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await admin.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create token
    const token = admin.getSignedJwtToken();
    
    // Set cookie options
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
    
    // Add secure flag in production
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
    
    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        token
      });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Logout admin
// @route   GET /api/admin/logout
// @access  Private
router.get('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged in admin
// @route   GET /api/admin/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Block a time slot
// @route   POST /api/admin/block-slot
// @access  Private
router.post('/block-slot', protect, async (req, res) => {
  try {
    const { date, time } = req.body;
    
    // Validate input
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date and time'
      });
    }
    
    // Check if the slot is already booked
    let booking = await Booking.findOne({ date, time });
    
    if (booking) {
      // If it's already blocked, return success
      if (booking.isBlocked) {
        return res.status(200).json({
          success: true,
          message: 'Time slot is already blocked',
          data: booking
        });
      }
      
      // If it's a real booking, don't allow blocking
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked by a customer'
      });
    }
    
    // Create a blocked booking
    booking = await Booking.create({
      name: 'BLOCKED',
      email: 'admin@example.com',
      phone: '0000000000',
      date,
      time,
      notes: 'This slot has been manually blocked by the admin',
      isBlocked: true
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
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Unblock a time slot
// @route   POST /api/admin/unblock-slot
// @access  Private
router.post('/unblock-slot', protect, async (req, res) => {
  try {
    const { date, time } = req.body;
    
    // Validate input
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date and time'
      });
    }
    
    // Find the booking
    const booking = await Booking.findOne({ date, time });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No booking found for this time slot'
      });
    }
    
    // Check if it's a blocked slot
    if (!booking.isBlocked) {
      return res.status(400).json({
        success: false,
        message: 'This is a customer booking and cannot be unblocked'
      });
    }
    
    // Remove the blocked booking
    await booking.remove();
    
    res.status(200).json({
      success: true,
      message: 'Time slot has been unblocked',
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Initialize admin user
Admin.createDefaultAdmin().catch(err => console.error('Error creating default admin:', err));

module.exports = router;
