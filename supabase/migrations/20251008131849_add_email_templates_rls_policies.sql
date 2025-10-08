/*
  # Add RLS policies for email_templates table

  1. Changes
    - Add policy to allow public SELECT access to email_templates
    - Add policy to allow public INSERT access to email_templates
    - Add policy to allow public UPDATE access to email_templates
    - Add policy to allow public DELETE access to email_templates

  2. Security
    - Policies allow anonymous access for this internal tool
    - RLS is already enabled on the table
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to read email templates" ON email_templates;
DROP POLICY IF EXISTS "Allow public to insert email templates" ON email_templates;
DROP POLICY IF EXISTS "Allow public to update email templates" ON email_templates;
DROP POLICY IF EXISTS "Allow public to delete email templates" ON email_templates;

-- Allow public to read all templates
CREATE POLICY "Allow public to read email templates"
  ON email_templates
  FOR SELECT
  TO anon
  USING (true);

-- Allow public to insert templates
CREATE POLICY "Allow public to insert email templates"
  ON email_templates
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow public to update templates
CREATE POLICY "Allow public to update email templates"
  ON email_templates
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow public to delete templates
CREATE POLICY "Allow public to delete email templates"
  ON email_templates
  FOR DELETE
  TO anon
  USING (true);
