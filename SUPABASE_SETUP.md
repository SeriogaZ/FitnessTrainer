# Supabase Setup Guide

## Quick Setup (5 minutes)

### 1. Create Supabase Account
- Go to: https://supabase.com
- Click "Start your project"
- Sign up with GitHub (recommended) or email
- It's **completely free** for small projects!

### 2. Create a New Project
- Click "New Project"
- Fill in:
  - **Name:** `fitness-trainer` (or any name)
  - **Database Password:** Create a strong password (save it!)
  - **Region:** Choose closest to you
  - **Pricing Plan:** Free tier is fine
- Click "Create new project"
- Wait 2-3 minutes for setup

### 3. Get Your API Keys
- Once project is ready, go to **Settings** (gear icon) → **API**
- You'll see:
  - **Project URL** (looks like: `https://xxxxx.supabase.co`)
  - **anon public** key (long string starting with `eyJ...`)

### 4. Create Database Tables
- Go to **SQL Editor** (left sidebar)
- Click **"New query"**
- Copy and paste the entire contents of `server/db/schema.sql`
- Click **"Run"** (or press Ctrl+Enter)
- You should see "Success. No rows returned"

### 5. Update Your .env File
- Open `server/.env` file
- Remove or comment out the MongoDB line:
  ```
  # MONGODB_URI=mongodb://localhost:27017/fitness-trainer
  ```
- Add your Supabase credentials:
  ```
  SUPABASE_URL=https://xxxxx.supabase.co
  SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- Replace `xxxxx` with your actual project URL
- Replace the key with your actual anon key

### 6. Install Dependencies
```powershell
cd server
npm install
```

This will install `@supabase/supabase-js` package.

### 7. Start Your Server
```powershell
npm run dev
```

You should see: `✅ Connected to Supabase`

## That's It! 🎉

Your booking system is now using Supabase! Try booking again.

---

## Database Schema

The schema creates two tables:

### `bookings`
- Stores all booking information
- Has unique constraint on `(date, time)` to prevent double bookings

### `settings`
- Stores booking system settings
- Automatically creates default settings on first use

---

## Security Notes

- The `anon` key is safe to use in client-side code
- Row Level Security (RLS) is enabled but set to allow public access for bookings
- For production, you may want to add authentication policies

---

## Troubleshooting

### "Missing Supabase credentials" error
- Check your `.env` file has `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Make sure there are no extra spaces or quotes

### "Failed to connect" error
- Verify your Project URL is correct
- Check your anon key is correct
- Make sure you ran the SQL schema

### "Table does not exist" error
- Go to SQL Editor in Supabase
- Run the schema.sql file again

---

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check server console for detailed error messages

