# Quick Reference - View Logs & Debug

## TL;DR - See the Logs in 3 Steps

### 1. **Open Browser Console**
   - Press `F12` (Windows) or `Cmd+Option+I` (Mac)
   - Click "Console" tab

### 2. **Click "Update" Button**
   - In app standings screen

### 3. **Watch Console Output**
   - You'll see detailed logs of:
     - Fetching HTML from IBBA
     - Parsing 13 teams  
     - Upsert success/failure for each team
     - Final stats

---

## Expected Successful Log Output

```
🏀 [LeagueTable] User clicked refresh button

════════════════════════════════════════════════════════════════
📲 [useHook] Triggering client-side standings scrape...
   URL: https://ibasketball.co.il/league/2025-270/ ✓
════════════════════════════════════════════════════════════════

🌐 [Client] Fetching standings from: https://ibasketball.co.il/league/2025-270/
✅ [Client] HTML fetched successfully (45821 bytes)

📋 [Client] Parsing standings table...
📊 [Client] Found 47 total table rows
...
📊 [Client] Parsing complete: 13 teams extracted

💾 [Client] Saving 13 teams to Supabase...
   URL: https://ibasketball.co.il/league/2025-270/ ✓

  -> Attempting to save: "בני יהודה"
     Data: { name: "בני יהודה", position: 5, points: 10, games_played: 8 }
  -> ✅ UPSERT SUCCESS: "בני יהודה" saved to DB

✅ [Client] Save complete: 13/13 teams saved

════════════════════════════════════════════════════════════════
✅ [useHook] Successfully scraped and saved 13 teams
   Invalidating React Query cache for instant UI refresh...
════════════════════════════════════════════════════════════════

📋 DB Update Result: SUCCESS
   Teams saved: 13
   UI refreshed via React Query invalidation ✓
   Timestamp: 2026-02-12T14:35:22.123Z
```

✅ **If you see this, everything works!**

---

## Troubleshooting Errors

### ❌ `UPSERT ERROR: row-level security policy error`
**Cause:** Supabase RLS policy blocking insert  
**Fix:** 
1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to "Authentication" → "Policies"
4. Check `league_standings` table policies
5. Should allow: `service_role` OR `authenticated` users

### ❌ `UPSERT ERROR: duplicate key value violates unique constraint`
**Cause:** Unique constraint issue (shouldn't happen with `onConflict`)  
**Fix:** 
1. Check Supabase `league_standings` table schema
2. Verify `unique_team_name` constraint exists on `name` column
3. Try manual browser refresh

### ❌ `HTML fetched successfully` but `0 teams extracted`
**Cause:** Cell indices changed or HTML structure different  
**Fix:**
1. Check IBBA website if it changed
2. Open [https://ibasketball.co.il/league/2025-270/](https://ibasketball.co.il/league/2025-270/) in browser
3. Right-click → Inspect Element on a team row
4. Check if `cells[0]`, `cells[1]`, `cells[8]`, `cells[10]` still match mapping

### ❌ No Logs Appear at All
**Cause:** Console filter hiding logs  
**Fix:**
1. In console, clear any text filter at top
2. Select "All" from dropdown (if filtered by level)
3. Scroll up - logs might be above view
4. Close/reopen console (Ctrl+Shift+K twice)

### ❌ Success Logs But UI Doesn't Update
**Cause:** React Query cache not invalidated  
**Fix:**
1. Try manual browser refresh (`Ctrl+R`)
2. Check React DevTools if available
3. Verify `useTriggerLeagueUpdate` hook is being used (not old function)

---

## What Each Log Means

| Log | Meaning |
|-----|---------|
| `🌐 [Client] Fetching standings from:` | Downloading HTML from IBBA website |
| `✅ HTML fetched successfully` | Download succeeded, parsing starts |
| `📋 Parsing standings table` | Using cheerio to extract team data |
| `📊 Found 47 total table rows` | Total rows in HTML table |
| `DEBUG ROW` | Details about each row (for advanced debugging) |
| `📊 Parsing complete: 13 teams` | Finished finding teams in HTML |
| `💾 Saving 13 teams to Supabase` | Starting database inserts |
| `Attempting to save: "בני יהודה"` | Processing specific team |
| `✅ UPSERT SUCCESS` | Team saved to database |
| `UPSERT ERROR` | Database save failed (see error code) |
| `✅ Save complete: 13/13` | All teams saved successfully |
| `Invalidating React Query cache` | Refreshing UI with new data |
| `📋 DB Update Result: SUCCESS` | Overall operation succeeded |

---

## Files Changed (For Reference)

✅ **src/services/standingsService.ts**
- Enhanced error logging in `saveToDatabase()`
- Added URL verification logs
- Full error details (code + message)

✅ **src/hooks/useLeagueStandings.ts**
- NEW: `useTriggerLeagueUpdate()` hook with React Query invalidation
- Enhanced logging with separators
- Success/failure reporting

✅ **src/components/LeagueTable.tsx**
- Import new hook instead of function
- Automatic UI refresh when database updates
- User action logging

---

## Next Steps

1. ✅ **Deploy app** - No server changes needed
2. ✅ **Click "Update" button** - Should work immediately
3. ✅ **Watch console** - See all logs
4. ✅ **Verify standings update** - UI refreshes with new data
5. ✅ **Check toast** - "League standings updated successfully"

---

**Bnei Yehuda is ready! 🏀**
