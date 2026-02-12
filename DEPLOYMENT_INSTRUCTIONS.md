# League Standings Feature - Deployment Instructions

## ✅ What's Been Completed

### Code Changes
- ✅ Created Supabase Edge Function for fetching standings
- ✅ Created database migration for `league_standings` table  
- ✅ Created React component `LeagueTable.tsx` to display standings
- ✅ Created hook `useLeagueStandings.ts` for data fetching
- ✅ Added cron job scripts for automated updates (24-hour schedule)
- ✅ Updated `package.json` with required dependencies
- ✅ Updated `vercel.json` with cron configuration
- ✅ Created comprehensive setup documentation

### GitHub Status
- ✅ Changes committed to GitHub: https://github.com/malachiroei/hoops-star-pro
- ✅ Latest commit: `Add automated league standings update system with Supabase Edge Function and cron scheduling`

## 🚀 Next Steps (Complete Manually)

### Step 1: Complete Vercel Deployment
Since the Vercel CLI requires interactive authentication, complete it with this command in your terminal:

```bash
cd "c:\אפליקציות\hoops-star-pro-main"
vercel deploy --prod
```

Follow the browser authentication prompt. It will deploy automatically.

**Expected Result:**
```
✅  Production: https://hoops-star-pro-main-xxxxxx.vercel.app [time]
🔗  Aliased: https://hoops-star-pro-main.vercel.app
```

### Step 2: Deploy Supabase Edge Function

Run in your terminal:

```bash
cd "c:\אפליקציות\hoops-star-pro-main"
supabase functions deploy fetch-league-standings
```

Or visit your Supabase Dashboard and manually deploy the function from:
`supabase/functions/fetch-league-standings/index.ts`

### Step 3: Apply Database Migration

In your Supabase Dashboard:

1. Go to **SQL Editor**
2. Create a new query and paste the contents of:
   `supabase/migrations/20260212_create_league_standings.sql`
3. Run the query

Or use Supabase CLI:

```bash
supabase db push
```

### Step 4: Set Up Automatic Updates on Vercel

#### Option A: External Cron Service (Recommended - Free)

1. Go to https://cron-job.org/ and create an account
2. Create a new cron job:
   - **URL:** `https://your-supabase-project.supabase.co/functions/v1/fetch-league-standings`
   - **Method:** POST
   - **Status:** Enabled
   - **Schedule:** Every 24 hours (e.g., daily at 3 AM)
   - **Headers:** Add header
     - **Key:** `Authorization`
     - **Value:** `Bearer YOUR_ANON_KEY`

3. Find your Supabase keys in: Project Settings → API → Project API keys

#### Option B: Vercel Cron Jobs (Built-in)

If you want to use Vercel's built-in cron:

1. Set environment variable `CRON_SECRET` in Vercel
2. Create an API route that calls the Supabase function
3. Update `vercel.json` cron configuration

## 📱 Testing on Your Phone

Once Vercel deployment completes:

1. Open: **https://hoops-star-pro-main.vercel.app** on your phone
2. Log in with password: **2101**
3. The league standings should appear in the Home or Stats tab
4. Click the **Update** button to manually refresh

## 🔍 How League Data Works

### Data Source
- **URL:** https://ibasketball.co.il/team/5458-בני-יהודה-תל-אביב/
- **Table:** טבלה (League Table) tab
- **Columns:** Position, Team Name, Games Played, Wins, Losses, Points

### Update Schedule
- **Frequency:** Every 24 hours
- **Time:** 3:00 AM UTC (configurable)
- **Method:** Automatic via cron job

### Data Flow
```
ibasketball.co.il 
    ↓ (Fetches HTML)
Supabase Edge Function
    ↓ (Parses with Cheerio)
Database (league_standings table)
    ↓ (Queries data)
React App (LeagueTable component)
```

## 📊 Components Added

### Files Created:
1. `src/components/LeagueTable.tsx` - Display component
2. `src/hooks/useLeagueStandings.ts` - Data fetch hook
3. `supabase/functions/fetch-league-standings/index.ts` - Edge Function
4. `scripts/update-league-standings.ts` - Node.js cron script
5. `supabase/migrations/20260212_create_league_standings.sql` - Database schema

### Integration:
Add the component to any page:

```tsx
import { LeagueTable } from "@/components/LeagueTable";

export default function YourPage() {
  return (
    <div className="p-4">
      <LeagueTable />
    </div>
  );
}
```

## 🛠️ Manual Update Commands

### From Console (TypeScript):
```bash
npm run update-league:manual
```

### From Frontend (React):
```tsx
import { triggerLeagueUpdate } from "@/hooks/useLeagueStandings";

const handleUpdate = async () => {
  await triggerLeagueUpdate();
  // Data will auto-refetch
};
```

## ✨ Features Included

- ✅ Automatic 24-hour updates
- ✅ Manual refresh button in UI
- ✅ Last update timestamp display
- ✅ Beautiful responsive table
- ✅ Hebrew/RTL support
- ✅ Error handling
- ✅ Loading states

## 📋 Checklist for Full Setup

- [ ] Complete Vercel deployment (run `vercel deploy --prod`)
- [ ] Deploy Supabase Edge Function (`supabase functions deploy`)
- [ ] Apply database migration (run SQL or `supabase db push`)
- [ ] Set up cron job (EasyCron or cron-job.org)
- [ ] Test on phone: https://hoops-star-pro-main.vercel.app
- [ ] Verify data appears in standings table
- [ ] Click "Update" button to test manual refresh
- [ ] Check last update timestamp updates correctly

## 🎯 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Code Done | ✅ | All files created and committed |
| GitHub | ✅ | Pushed and synced |
| Vercel Deploy | ⏳ | Requires interactive auth |
| Supabase Function | ⏳ | Needs deployment |
| Database | ⏳ | Needs migration |
| Auto Updates | ⏳ | Needs cron setup |

## 📞 Support

For detailed setup: See `LEAGUE_STANDINGS_SETUP.md`

For issues:
1. Check Supabase Function logs
2. Check browser console (F12)
3. Verify database table exists: `SELECT COUNT(*) FROM league_standings;`
