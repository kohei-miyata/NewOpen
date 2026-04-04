-- Migration 6: Add status column to stores table
-- status: 'active' | 'closed' | 'temporarily_closed'
ALTER TABLE stores ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'closed', 'temporarily_closed'));
