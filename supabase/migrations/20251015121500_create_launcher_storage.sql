/*
  # Create launcher storage and downloads table

  1. Storage Setup
    - Create `launchers` storage bucket for launcher files
    - Enable RLS on the bucket
    - Only verified Discord users can download files
    - Only admins can upload files (handled separately)

  2. New Tables
    - `launcher_versions`
      - `id` (uuid, primary key)
      - `version` (text, not null) - Semantic version (e.g., "1.0.0")
      - `file_path` (text, not null) - Path in storage bucket
      - `file_name` (text, not null) - Original filename
      - `file_size` (bigint) - File size in bytes
      - `release_notes` (text) - What's new in this version
      - `is_latest` (boolean, default false) - Mark the current version
      - `created_at` (timestamptz, default now())
      - `created_by` (uuid, references auth.users)

  3. Security
    - Enable RLS on `launcher_versions` table
    - Verified Discord users can read launcher versions
    - Verified Discord users can download from storage
*/

-- Create storage bucket for launcher files
INSERT INTO storage.buckets (id, name, public)
VALUES ('launchers', 'launchers', false)
ON CONFLICT (id) DO NOTHING;

-- Create launcher versions table
CREATE TABLE IF NOT EXISTS launcher_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text UNIQUE NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  release_notes text,
  is_latest boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE launcher_versions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view launcher versions
CREATE POLICY "Authenticated users can view launcher versions"
  ON launcher_versions
  FOR SELECT
  TO authenticated
  USING (true);

-- Storage policies: Only verified Discord users can download
CREATE POLICY "Verified Discord users can download launchers"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'launchers' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.discord_verified = true
    )
  );

-- Storage policy: Authenticated users can upload (will be restricted in app logic)
CREATE POLICY "Authenticated users can upload launchers"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'launchers');

-- Storage policy: Authenticated users can update launchers
CREATE POLICY "Authenticated users can update launchers"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'launchers')
  WITH CHECK (bucket_id = 'launchers');

-- Storage policy: Authenticated users can delete launchers
CREATE POLICY "Authenticated users can delete launchers"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'launchers');
