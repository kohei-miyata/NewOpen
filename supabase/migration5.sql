-- Migration 5: Add SNS post URL columns to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS twitter_post_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS instagram_post_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS tiktok_post_url TEXT;
