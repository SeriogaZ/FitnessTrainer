-- Supabase Database Schema for Fitness Trainer Booking System

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  notes TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, time)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  start_hour INTEGER NOT NULL DEFAULT 8 CHECK (start_hour >= 0 AND start_hour <= 23),
  end_hour INTEGER NOT NULL DEFAULT 19 CHECK (end_hour >= 1 AND end_hour <= 24),
  session_duration INTEGER NOT NULL DEFAULT 60 CHECK (session_duration >= 15 AND session_duration <= 240),
  days_off TEXT[] DEFAULT ARRAY['0']::TEXT[],
  advance_booking_days INTEGER NOT NULL DEFAULT 30 CHECK (advance_booking_days >= 1 AND advance_booking_days <= 365),
  min_advance_hours INTEGER NOT NULL DEFAULT 24 CHECK (min_advance_hours >= 0 AND min_advance_hours <= 72),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date, time);

-- Enable Row Level Security (RLS) - optional, for security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read/write (for booking system)
-- You can make these more restrictive later
CREATE POLICY "Allow public read access to bookings" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to settings" ON settings
  FOR SELECT USING (true);

-- Note: For admin operations (update/delete), you'll need to add authentication policies
-- For now, these basic policies allow the booking system to work


