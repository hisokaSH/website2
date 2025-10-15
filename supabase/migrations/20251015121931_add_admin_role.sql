/*
  # Add admin role to users

  1. Changes
    - Add `is_admin` column to users table (default false)
    - Only admins can upload launcher files

  2. Instructions to make yourself admin:
    - Sign up on your website
    - Go to Supabase Dashboard > SQL Editor
    - Run this query (replace YOUR_EMAIL with your actual email):

    UPDATE users
    SET is_admin = true
    WHERE email = 'YOUR_EMAIL';
*/

-- Add is_admin column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;