-- Create games table to store match results
CREATE TABLE IF NOT EXISTS games (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  home_team VARCHAR(255) NOT NULL,
  away_team VARCHAR(255) NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on date for filtering
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date DESC);

-- Create index on teams for quick lookups
CREATE INDEX IF NOT EXISTS idx_games_home_team ON games(home_team);
CREATE INDEX IF NOT EXISTS idx_games_away_team ON games(away_team);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "games_select_policy" ON games
  FOR SELECT
  USING (true);

-- Allow service role to manage games
CREATE POLICY "games_insert_policy" ON games
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "games_update_policy" ON games
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "games_delete_policy" ON games
  FOR DELETE
  USING (true);

-- Update league_standings to include calculated fields
ALTER TABLE IF EXISTS league_standings ADD COLUMN IF NOT EXISTS recalculated_at TIMESTAMP WITH TIME ZONE;
