const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  startHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23,
    default: 8 // Default start hour: 8 AM
  },
  endHour: {
    type: Number,
    required: true,
    min: 1,
    max: 24,
    default: 19 // Default end hour: 7 PM
  },
  sessionDuration: {
    type: Number,
    required: true,
    min: 15,
    max: 240,
    default: 60 // Default session duration: 60 minutes
  },
  daysOff: {
    type: [String],
    default: ['0'], // Default day off: Sunday (0)
    validate: {
      validator: function(v) {
        // Validate that each value is a day number (0-6)
        return v.every(day => /^[0-6]$/.test(day));
      },
      message: props => `${props.value} contains invalid day numbers. Use 0-6 (Sunday-Saturday)`
    }
  },
  advanceBookingDays: {
    type: Number,
    required: true,
    min: 1,
    max: 365,
    default: 30 // Allow booking up to 30 days in advance
  },
  minAdvanceHours: {
    type: Number,
    required: true,
    min: 0,
    max: 72,
    default: 24 // Require bookings at least 24 hours in advance
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure there's only one settings document
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({});
  }
  
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
