const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private (Admin only)
router.put('/', protect, async (req, res) => {
  try {
    const {
      startHour,
      endHour,
      sessionDuration,
      daysOff,
      advanceBookingDays,
      minAdvanceHours
    } = req.body;
    
    // Update settings
    const settings = await Settings.update({
      startHour,
      endHour,
      sessionDuration,
      daysOff,
      advanceBookingDays,
      minAdvanceHours
    });
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
