const supabase = require('../db/supabase');

const Booking = {
  /**
   * Find all bookings
   */
  findAll: async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  /**
   * Find bookings for a specific date
   */
  findByDate: async (date) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('time, is_blocked')
      .eq('date', date);
    
    if (error) throw error;
    return data;
  },

  /**
   * Find one booking by date and time
   */
  findOne: async (date, time) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', date)
      .eq('time', time)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  /**
   * Create a new booking
   */
  create: async (bookingData) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes || null,
        is_blocked: bookingData.isBlocked || false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a booking by ID
   */
  deleteById: async (id) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

module.exports = Booking;
