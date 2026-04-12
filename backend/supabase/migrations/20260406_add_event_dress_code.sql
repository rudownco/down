-- Add dress code columns to events table
-- dress_code: the "what's the fit?" selection (Chill / Casual, Fancy / Dressy, Themed, Active)
-- dress_code_note: optional free-text elaboration ("wear your worst holiday sweater")
ALTER TABLE events ADD COLUMN IF NOT EXISTS dress_code text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS dress_code_note text;
