# Console Logging Guide - League Standings Update

## How to View Logs

1. **Open Browser DevTools:**
   - Windows/Linux: Press `F12` or `Ctrl+Shift+I`
   - Mac: Press `Cmd+Option+I`

2. **Go to Console Tab**
   - Click the "Console" tab at the top

3. **Click the "Update" Button**
   - Trigger the standings refresh

4. **Watch Console Logs**
   - All logs start with emoji + `[Client]`, `[Hook]`, or `[LeagueTable]` prefix
   - Errors appear in RED
   - Success messages appear in normal text

---

## Expected Console Output (Line-by-Line)

### Step 1: User Clicks Update Button
```
🏀 [LeagueTable] User clicked refresh button
```

### Step 2: Hook Initialization
```
════════════════════════════════════════════════════════════════
📲 [useHook] Triggering client-side standings scrape...
   URL: https://ibasketball.co.il/league/2025-270/ ✓
════════════════════════════════════════════════════════════════
```

### Step 3: HTML Fetch
```
🌐 [Client] Fetching standings from: https://ibasketball.co.il/league/2025-270/
✅ [Client] HTML fetched successfully (45821 bytes)
```

### Step 4: HTML Parsing
```
📋 [Client] Parsing standings table...
📊 [Client] Found 47 total table rows

DEBUG ROW 0: cells=13 | מיקום | קבוצה | ... | משהו
  -> Skipping: header row "מיקום"

DEBUG ROW 1: cells=13 | 1 | 8 | ... | מכבי תל אביב
  -> ✅ Parsed: "מכבי תל אביב" [pos=1, pts=8, games=8]

DEBUG ROW 5: cells=13 | 5 | 10 | ... | בני יהודה
  -> ✅ Parsed: "בני יהודה" [pos=5, pts=10, games=8]

DEBUG ROW 6: cells=13 | 6 | 9 | ... | אחרת
  -> ✅ Parsed: "אחרת" [pos=6, pts=9, games=8]

... (more teams) ...

📊 [Client] Parsing complete: 13 teams extracted
```

### Step 5: Database Upsert (Most Important for Debugging!)
```
💾 [Client] Saving 13 teams to Supabase...
   URL: https://ibasketball.co.il/league/2025-270/ ✓

  -> Attempting to save: "מכבי תל אביב"
     Data: { name: "מכבי תל אביב", position: 1, points: 8, games_played: 8 }
  -> ✅ UPSERT SUCCESS: "מכבי תל אביב" saved to DB

  -> Attempting to save: "בני יהודה"
     Data: { name: "בני יהודה", position: 5, points: 10, games_played: 8 }
  -> ✅ UPSERT SUCCESS: "בני יהודה" saved to DB

  -> Attempting to save: "אחרת"
     Data: { name: "אחרת", position: 6, points: 9, games_played: 8 }
  -> ✅ UPSERT SUCCESS: "אחרת" saved to DB

... (more teams) ...

✅ [Client] Save complete: 13/13 teams saved
```

### Step 6: Final Success Report
```
════════════════════════════════════════════════════════════════
✅ [useHook] Successfully scraped and saved 13 teams
   Invalidating React Query cache for instant UI refresh...
════════════════════════════════════════════════════════════════

📋 DB Update Result: SUCCESS
   Teams saved: 13
   UI refreshed via React Query invalidation ✓
   Timestamp: 2026-02-12T14:35:22.123Z
```

---

## Error Cases - What to Look For

### ❌ Case 1: HTML Fetch Failed
```
❌ [Client] Failed to fetch standings: Failed to fetch
   (Could be CORS, firewall, or network issue)
```
**Fix:** Check network in DevTools → Network tab to see the actual error

### ❌ Case 2: Parsing Failed (0 Teams)
```
📊 [Client] Parsing complete: 0 teams extracted
```
**Fix:** Check if HTML structure changed. Look at "DEBUG ROW" logs to see if rows are being detected.

### ❌ Case 3: UPSERT Failed (RLS or DB Issue)
```
  -> Attempting to save: "מכבי תל אביב"
  -> UPSERT ERROR: row-level security policy error
     Code: 42501
     Details: {...}
```
**Fix:** Check Supabase RLS policies on `league_standings` table. Should allow service role OR authenticated users.

### ❌ Case 4: UPSERT Failed (Constraint Error)
```
  -> UPSERT ERROR: duplicate key value violates unique constraint "unique_team_name"
```
**Fix:** This shouldn't happen with `onConflict: 'name'`. Check Supabase hasn't changed since last update.

---

## Key Indicators of Success

✅ **All** of these should appear:
1. `✅ [Client] HTML fetched successfully` - HTML fetched OK
2. `📊 [Client] Parsing complete: 13 teams extracted` - Parsing found teams
3. `✅ [Client] Save complete: 13/13 teams saved` - All teams saved
4. `✅ [useHook] Successfully scraped and saved 13 teams` - Overall success
5. **UI updates** - Standing positions update on screen

❌ **If any of these is missing**, something went wrong.

---

## Expected URL Verification

Look for this line EXACTLY:
```
URL: https://ibasketball.co.il/league/2025-270/ ✓
```

If you see a different URL, the service mapping changed.

---

## Testing Checklist

- [ ] Click "Update" button
- [ ] Open Browser DevTools (F12)
- [ ] Go to Console tab
- [ ] See `🏀 [LeagueTable] User clicked refresh button`
- [ ] See `🌐 [Client] Fetching standings from:` 
- [ ] See `✅ [Client] HTML fetched successfully`
- [ ] See `📊 [Client] Parsing complete: 13 teams extracted`
- [ ] See at least 3-5 `✅ UPSERT SUCCESS` messages
- [ ] See `✅ [Client] Save complete: 13/13 teams saved`
- [ ] See `📋 DB Update Result: SUCCESS`
- [ ] **UI updates** - standings table refreshes with new data
- [ ] See toast: "League standings updated successfully"

---

## Quick Troubleshooting

### Logs don't appear at all
- Browser console filter is hiding them
- Clear the filter: click "All" or remove text filter
- Scroll up in console (logs might be above current view)

### URL shows wrong domain
- service `STANDINGS_URL` constant changed
- Check `src/services/standingsService.ts` line 11

### Says "0 teams extracted"
- HTML structure changed on IBBA website
- Cell indices [0], [1], [8], [10] may be different now
- Run local test to re-discover cell mapping

### UPSERT ERROR but parse worked
- Supabase RLS policy blocking insert
- Check `league_standings` table policies in Supabase dashboard
- Should allow service_role OR authenticated users

### UI doesn't update despite SUCCESS logs
- React Query cache not invalidated properly
- Try manual browser refresh (Ctrl+R) as workaround
- Check if `useTriggerLeagueUpdate` is properly imported

---

## Additional Debugging

If logs still confusing, add extra logs yourself:

```typescript
// In standingsService.ts, after upsert call:
console.log('Full upsert response:', { data, error });
console.log('Team object sent:', JSON.stringify({
  name: team.name,
  position: team.position,
  points: team.points,
  games_played: team.games_played
}));
```

This will show EXACTLY what was sent to Supabase and what came back.
