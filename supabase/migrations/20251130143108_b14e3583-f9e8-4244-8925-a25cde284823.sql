-- Add mock_mode column to fastcast_content_settings table
ALTER TABLE fastcast_content_settings 
ADD COLUMN mock_mode BOOLEAN DEFAULT true;