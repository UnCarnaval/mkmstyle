-- Add separate hero image for mobile view
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_image_mobile_url TEXT DEFAULT NULL;
