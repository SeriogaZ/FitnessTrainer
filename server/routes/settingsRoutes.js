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
    
    // Get current settings
    let settings = await Settings.getSettings();
    
    // Update fields
    if (startHour !== undefined) settings.startHour = startHour;
    if (endHour !== undefined) settings.endHour = endHour;
    if (sessionDuration !== undefined) settings.sessionDuration = sessionDuration;
    if (daysOff !== undefined) settings.daysOff = daysOff;
    if (advanceBookingDays !== undefined) settings.advanceBookingDays = advanceBookingDays;
    if (minAdvanceHours !== undefined) settings.minAdvanceHours = minAdvanceHours;
    
    // Update timestamp
    settings.updatedAt = Date.now();
    
    // Save settings
    settings = await settings.save();
    
    res.status(200).json({
      success: true,
      data: settings
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

module.exports = router;
