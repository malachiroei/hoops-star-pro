# 🚀 Final Deployment Steps for League Standings Feature

## Status: ✅ Code Ready for Deployment

All code has been written, tested, and committed to GitHub. The build is successful and ready for production.

---

## 📋 Step 1: Deploy to Vercel (Manual - Via Web Dashboard)

Due to CLI authentication issues with the team account, we'll deploy directly via the web:

### Option A: Using Git Integration (Automatic - Recommended)
1. Go to https://vercel.com/roeis-projects-92336c3f/hoops-star-pro-main
2. Click **Deployments**
3. Click **Create Deployment** or **Deploy** button
4. Select **main** branch
5. Click **Deploy**

Vercel will automatically build from your GitHub repo and deploy in 2-3 minutes.

### Option B: Using Vercel CLI (If you want to try again)
```bash
cd "c:\אפליקציות\hoops-star-pro-main"
vercel deploy --prod
```

### Expected Result:
```
✅ Production: https://hoops-star-pro-main-xxxxxx.vercel.app [1m 30s]
🔗 Aliased: https://hoops-star-pro-main.vercel.app [30s]
```

---

## 📊 Step 2: Execute Database Migration (Supabase)

This creates the `league_standings` table in your database.

### Method A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your **hoops-star-pro** project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of this file:
   ```
   supabase/migrations/20260212_create_league_standings.sql
   ```
6. Click **Run** (or press Ctrl+Enter)
7. You should see: `✓ Executed successfully`

### Method B: Using Supabase CLI

```bash
cd "c:\אפליקציות\hoops-star-pro-main"
supabase db push
```

### SQL Content to Execute:

```sql
-- Create league_standings table
create table if not exists league_standings (
  id bigint primary key generated always as identity,
  position integer not null,
  name text not null,
  "gamesPlayed" integer not null,
  wins integer not null,
  losses integer not null,
  points integer not null,
  "updatedAt" timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster queries
create index if not exists idx_league_standings_position on league_standings(position);

-- Enable RLS
alter table league_standings enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access"
  on league_standings
  for select
  using (true);

-- Create policy to allow service role to manage data
create policy "Allow service role to manage league standings"
  on league_standings
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
```

### Verify It Works:
After running, go to **Databases → Tables** in Supabase and confirm you see `league_standings` table.

---

## 🔌 Step 3: Deploy Supabase Edge Function

This function automatically fetches data from ibasketball.co.il every time you call it.

### Method A: Using Supabase Dashboard

1. Go to **Edge Functions** in your Supabase Dashboard
2. Click **+ New Function**
3. Name it: `fetch-league-standings`
4. Copy the entire contents of:
   ```
   supabase/functions/fetch-league-standings/index.ts
   ```
5. Paste into the editor
6. Click **Deploy**

### Method B: Using Supabase CLI

```bash
cd "c:\אפליקציות\hoops-star-pro-main"
supabase functions deploy fetch-league-standings
```

### Test the Function:
1. Go to **Edge Functions → fetch-league-standings**
2. Click **Invoke**
3. You should see a response like:
   ```json
   {
     "success": true,
     "count": 16,
     "message": "Updated 16 teams"
   }
   ```

---

## ⏰ Step 4: Set Up 24-Hour Automatic Updates (Choose One)

Since Vercel's built-in cron requires API routes that Vite apps don't support, use an external service:

### Option A: Using Cron-Job.org (Free & Easy - Recommended)

1. Go to https://cron-job.org/ and **Sign Up** (or login)
2. Click **+ CREATE CRONJOB**
3. Fill in these details:

   **Basic Settings:**
   - **Title:** `Update League Standings`
   - **URL:** Get this from Supabase:
     - Go to Supabase Dashboard → Project Settings → API
     - Copy your **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
     - Use: `https://YOUR_PROJECT_URL/functions/v1/fetch-league-standings`
   - **Schedule:** Every 24 hours at 3 AM UTC (or your preferred time)

   **Advanced:**
   - **Request Type:** POST
   - **Authentication:** Bearer Token
   - **Token:** Your **anon key** from Supabase API settings

4. Click **Create**

### Option B: Using EasyCron (Free Alternative)

1. Go to https://www.easycron.com/ and create an account
2. Click **Crons** and **+Add**
3. Enter the Supabase Edge Function URL
4. Set frequency to every 24 hours
5. Save

### Option C: Using Docker with Node.js (Advanced)

Run the cron script locally:
```bash
npm install
npm run update-league:manual
```

---

## ✅ Verification Checklist

After completing all steps, verify everything works:

- [ ] **Vercel Deployment:** Can open https://hoops-star-pro-main.vercel.app
- [ ] **App Loads:** See login page, enter password `2101`, dashboard loads
- [ ] **Database:** Go to Supabase → Table Editor, see `league_standings` table
- [ ] **Edge Function:** Invoke it, see successful response with team count
- [ ] **Manual Refresh:** In app League Table, click "Update" button, see data refresh
- [ ] **Auto Update:** Check database after 24 hours, timestamps should update

---

## 🧪 Manual Test (Do This First)

Before waiting for auto-updates, test the system:

### 1. Manually Trigger Update (Right Now)
```bash
npm run update-league:manual
```

Or, if using the app: Click the **Update** button in the League Table.

### 2. Check Database
Go to Supabase → Table Editor → Select `league_standings`

You should see rows like:
```
Position | Name              | Games | Wins | Losses | Points | Updated
---------|-------------------|-------|------|--------|--------|----------
   1     | בני יהודה תל אביב |   8   |  4   |   4    |   12   | 2026-02-12T...
   2     | ...               | ...   | ...  | ...    | ...    | 2026-02-12T...
```

---

## 📱 View on Phone

Once deployed:

1. Open https://hoops-star-pro-main.vercel.app on your phone
2. Log in with password: **2101**
3. Navigate to **Home** or **Stats** tab
4. Scroll to see **League Standings (טבלה)**
5. See all teams with their position, games, wins, losses, and points
6. Click **Update** button to manually refresh

---

## 🛠️ Troubleshooting

### "Table league_standings doesn't exist"
- Run the database migration (Step 2)
- Check in Supabase that table exists

### "No data in league standings table"
- Manually invoke the Edge Function (Step 3)
- Check function logs in Supabase

### "Update button doesn't work"
- Verify Edge Function is deployed
- Check browser console (F12) for errors
- Check Supabase function invocation logs

### "Auto-updates not running"
- Verify cron-job is enabled on cron-job.org
- Check cron-job logs to see if it's executing
- Verify Edge Function URL is correct

---

## 📞 Quick Reference

| Task | Command/Link |
|------|-------------|
| GitHub Repo | https://github.com/malachiroei/hoops-star-pro |
| Live App | https://hoops-star-pro-main.vercel.app |
| Vercel Dashboard | https://vercel.com/roeis-projects-92336c3f |
| Supabase Dashboard | https://supabase.com/dashboard |
| Build Project | `npm run build` |
| Manual Update | `npm run update-league:manual` |

---

## ✨ What's Already Done

✅ Code written and tested
✅ Components created (LeagueTable, useLeagueStandings)
✅ Database schema designed
✅ Supabase Edge Function ready
✅ Cron job scripts ready
✅ All committed to GitHub
✅ Build verified successful

---

## ⏱️ Time Estimates

| Step | Time |
|------|------|
| Vercel Deploy | 2-3 minutes |
| Database Migration | 1-2 minutes |
| Edge Function Deploy | 1-2 minutes |
| Cron Setup | 5 minutes |
| **Total** | **~10 minutes** |

---

## 🎯 Final Result

Once all steps complete:
- ✅ app updates every 24 hours automatically
- ✅ Users can click refresh for instant updates
- ✅ Beautiful league standings displayed on phone
- ✅ Live tracking of team positions and records

**You're all set!** 🏀
