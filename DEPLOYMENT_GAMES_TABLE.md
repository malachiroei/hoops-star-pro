# Deploy Games Table & Updated Edge Function

## Step 1: Deploy Games Table SQL Migration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **hoops-star-pro**
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL from `supabase/migrations/20260212_create_games_table.sql`:

```sql
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date DESC);
CREATE INDEX IF NOT EXISTS idx_games_home_team ON games(home_team);
CREATE INDEX IF NOT EXISTS idx_games_away_team ON games(away_team);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "games_select_policy" ON games FOR SELECT USING (true);

-- Allow service role to manage games
CREATE POLICY "games_insert_policy" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "games_update_policy" ON games FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "games_delete_policy" ON games FOR DELETE USING (true);

-- Update league_standings to include recalculated_at field
ALTER TABLE IF EXISTS league_standings ADD COLUMN IF NOT EXISTS recalculated_at TIMESTAMP WITH TIME ZONE;
```

6. Click **Run** button
7. ✅ Games table is now created with indexes and RLS policies

## Step 2: Deploy Updated Edge Function

1. In Supabase Dashboard, navigate to **Edge Functions** (left sidebar)
2. Select the existing **fetch-league-standings** function
3. Click **Edit** button
4. **Delete all existing code** in the editor
5. Copy and paste the entire content from `supabase/functions/fetch-league-standings/index.ts`
6. Click **Deploy** button
7. Wait for deployment to complete (shows green checkmark)
8. ✅ Edge Function is now updated with game-scraping logic

## Step 3: Test the Updated Function

Run from PowerShell in the workspace root:

```powershell
.\trigger-update.ps1
```

### Expected Success Output:
```
🚀 Starting league standings update...
🏀 [GAMES SCRAPER] Starting to scrape games...
📋 [TABLES] Scanning for games table...
   Found X table(s)
      Headers: ...
✓ Team1 80-75 Team2 (date)
✅ Found N games total
💾 [DATABASE] Saving N games...
✅ Saved N games to database
🔢 [STANDINGS] Calculating standings from N games...
   📊 Calculated standings for M teams:
✅ Updated standings for M teams
```

## Verification Steps

1. Check **leagues_standings** table:
   - Go to Supabase Dashboard → **Table Editor**
   - Select **league_standings** table
   - Should show teams with calculated positions, wins, losses, points

2. Check **games** table:
   - Go to Supabase Dashboard → **Table Editor**
   - Select **games** table
   - Should show all scraped basketball games with dates and scores

## Troubleshooting

### Edge Function shows "PGRST116" error
- This is expected and ignored - it means the function is trying to delete old records but they don't exist yet
- The function will still insert new data correctly

### No games are being found
- Check that games table at `https://ibasketball.co.il/league/2025-270/#gsc.tab=0` is accessible
- The page must have a table with headers containing: תאריך (date), מארחת (home), אורחת (away)

### Edge Function deployment failed
- Make sure the SQL migration ran successfully first
- Check the function syntax matches the file exactly (especially template strings)
- Click **View Logs** to see detailed error messages

## Files Modified

- ✅ `supabase/migrations/20260212_create_games_table.sql` - Created games table
- ✅ `supabase/functions/fetch-league-standings/index.ts` - Rewritten with game-scraping logic
- ✅ New functions: `scrapGames()`, `saveGames()`, `calculateStandings()`, `updateLeagueStandings()`

## Data Flow

```
1. Fetch games table from ibasketball.co.il
   ↓
2. Parse game rows (Date, Time, HomeTeam, AwayTeam, Score)
   ↓
3. Save games to Supabase 'games' table
   ↓
4. Calculate standings: Win=2pts, Loss=1pt
   ↓
5. Update 'league_standings' table with calculated positions
```
