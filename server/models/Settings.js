const supabase = require('../db/supabase');

const Settings = {
  /**
   * Get settings (creates default if none exist)
   */
  getSettings: async () => {
    // Try to get existing settings
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();
    
    // If no settings exist, create default ones
    if (error && error.code === 'PGRST116') {
      const defaultSettings = {
        start_hour: 8,
        end_hour: 19,
        session_duration: 60,
        days_off: ['0'], // Sunday
        advance_booking_days: 30,
        min_advance_hours: 24
      };
      
      const { data: newData, error: insertError } = await supabase
        .from('settings')
        .insert(defaultSettings)
        .select()
        .single();
      
      if (insertError) throw insertError;
      return newData;
    }
    
    if (error) throw error;
    return data;
  },

  /**
   * Update settings
   */
  update: async (settingsData) => {
    // Get current settings ID
    const current = await Settings.getSettings();
    
    const { data, error } = await supabase
      .from('settings')
      .update({
        start_hour: settingsData.startHour,
        end_hour: settingsData.endHour,
        session_duration: settingsData.sessionDuration,
        days_off: settingsData.daysOff,
        advance_booking_days: settingsData.advanceBookingDays,
        min_advance_hours: settingsData.minAdvanceHours,
        updated_at: new Date().toISOString()
      })
      .eq('id', current.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

module.exports = Settings;
