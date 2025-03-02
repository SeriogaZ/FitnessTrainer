const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    // Format: YYYY-MM-DD
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Please provide a valid date in YYYY-MM-DD format']
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    // Format: HH:MM (24-hour)
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
  },
  notes: {
    type: String,
    trim: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index on date and time to ensure uniqueness
BookingSchema.index({ date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);
