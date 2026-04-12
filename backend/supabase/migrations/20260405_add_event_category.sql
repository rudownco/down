-- Add category column to events table
-- Stores the "what are we doing?" selection (Food, Drinks, Movie, etc.)
ALTER TABLE events ADD COLUMN IF NOT EXISTS category text;
