/*
  # Fix storage policies for launcher bucket

  1. Changes
    - Drop and recreate storage policies for the launchers bucket
    - Admins can upload/update/delete files
    - Verified Discord users can download files
    
  2. Security
    - Ensures proper RLS policies on storage.objects for the launchers bucket
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Verified Discord users can download launchers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload launchers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update launchers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete launchers" ON storage.objects;

-- Allow verified Discord users to download
CREATE POLICY "Verified Discord users can download launchers"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'launchers' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.discord_verified = true
    )
  );

-- Allow admins to upload files
CREATE POLICY "Admins can upload launchers"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'launchers' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Allow admins to update files
CREATE POLICY "Admins can update launchers"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'launchers' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    bucket_id = 'launchers' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Allow admins to delete files
CREATE POLICY "Admins can delete launchers"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'launchers' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
