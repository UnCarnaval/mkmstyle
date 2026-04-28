-- Add hero_image_url column to site_settings for the static homepage cover.
-- Nullable: when NULL, the home page renders the hero with no background image.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
