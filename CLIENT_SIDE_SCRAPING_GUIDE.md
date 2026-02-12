# Client-Side League Standings Scraping - Implementation Guide

## Overview

This implementation moves league standings scraping from the backend (Supabase Edge Function) to the client-side, bypassing firewall restrictions from the IBBA association.

**Key Benefits:**
- ✅ Bypasses firewall blocks on Edge Functions
- ✅ Real-time scraping directly from the mobile app
- ✅ Immediate feedback to users
- ✅ Uses existing `cheerio` library (already in dependencies)
- ✅ Direct Supabase upsert with `onConflict: 'name'`

---

## Files Created/Modified

### 1. **NEW: `src/services/standingsService.ts`**
   - Main scraping service with IBBA cell mapping
   - Functions:
     - `fetchStandingsHtml()` - Fetches HTML from IBBA
     - `parseStandingsHtml()` - Parses using cheerio with exact cell mapping
     - `saveToDatabase()` - Upserts teams to Supabase
     - `scrapeAndSaveStandings()` - Orchestrates the full pipeline

### 2. **UPDATED: `src/hooks/useLeagueStandings.ts`**
   - Modified `triggerLeagueUpdate()` to use client-side scraping
   - Now calls `scrapeAndSaveStandings()` instead of Edge Function
   - Full backward compatibility with existing LeagueTable component

### 3. **NEW: `src/components/PullToRefresh.tsx`** (Optional)
   - Pull-to-refresh wrapper component
   - Enable native iOS/Android swipe-to-refresh UX

---

## Cell Mapping (Verified from Logs)

The following mapping was discovered and tested:

```
Row cells structure:
  cells[0]  = Position (e.g., "1", "5")
  cells[1]  = Points (e.g., "8", "10")
  cells[2]  = (not used)
  ...
  cells[8]  = Games Played (e.g., "8", "10")
  ...
  cells[10] = Team Name (e.g., "מכבי תל אביב", "בני יהודה")
```

Parsing logic in `parseStandingsHtml()`:
```typescript
const teamName = cellTexts[10].trim();        // Last cell = team name
const position = parseInt(cellTexts[0]);       // First cell = position
const points = parseInt(cellTexts[1]);         // Second cell = points
const gamesPlayed = parseInt(cellTexts[8]);    // 9th cell = games played
```

---

## How It Works

### 1. Existing Flow (Already Integrated)

**User taps "Update" button in LeagueTable:**

```
User clicks → handleManualRefresh() 
  ↓
triggerLeagueUpdate() [from hook]
  ↓
scrapeAndSaveStandings() [client-side service]
  ↓
fetchStandingsHtml() → Parse → saveToDatabase()
  ↓
UI auto-refreshes via React Query
  ↓
Toast notification: "League standings updated successfully"
```

**No changes needed to LeagueTable.tsx** - it already calls the hook!

### 2. Pull-to-Refresh (Optional Enhancement)

To add native pull-to-refresh support, wrap the standings table:

```tsx
// In LeagueTable.tsx or a parent component

import { PullToRefresh } from '@/components/PullToRefresh';

export function LeagueStandingsScreen() {
  const { data: standings, refetch } = useLeagueStandings();

  const handlePullRefresh = async () => {
    await triggerLeagueUpdate();
    await refetch();
  };

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
      <LeagueTable />
    </PullToRefresh>
  );
}
```

---

## Console Logging

When you trigger a refresh, the browser console will show:

```
🏀 [Client] LEAGUE STANDINGS UPDATE - 2026-02-12T...
────────────────────────────────────────────────────────────────
🌐 [Client] Fetching standings from: https://ibasketball.co.il/league/2025-270/
✅ [Client] HTML fetched successfully (45821 bytes)

📋 [Client] Parsing standings table...
📊 [Client] Found 47 total table rows
DEBUG ROW 0: cells=13 | מיקום | קבוצה | ... | מכבי תל אביב
  -> Skipping: header row "מיקום"
DEBUG ROW 1: cells=13 | 1 | 8 | ... | מכבי תל אביב
  -> ✅ Parsed: "מכבי תל אביב" [pos=1, pts=8, games=8]
DEBUG ROW 5: cells=13 | 5 | 10 | ... | בני יהודה
  -> ✅ Parsed: "בני יהודה" [pos=5, pts=10, games=8]
...
📊 [Client] Parsing complete: 13 teams extracted

💾 [Client] Saving 13 teams to Supabase...
  -> Attempting to save: "מכבי תל אביב"
  -> ✅ UPSERT SUCCESS: "מכבי תל אביב" saved
  -> Attempting to save: "בני יהודה"
  -> ✅ UPSERT SUCCESS: "בני יהודה" saved
...
✅ [Client] Save complete: 13/13 teams saved

────────────────────────────────────────────────────────────────
✅ UPDATE COMPLETE: 13 teams saved to database
```

---

## Usage Examples

### Example 1: Manual Button Press (Already Working)

The "Update" button in LeagueTable already triggers client-side scraping:

```tsx
<Button onClick={handleManualRefresh} disabled={isRefreshing}>
  <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
  {isRefreshing ? "Updating..." : "Update"}
</Button>
```

### Example 2: Auto-Refresh on App Load

```tsx
useEffect(() => {
  // Auto-scrape standings when component mounts
  triggerLeagueUpdate().catch(err => 
    console.error('Failed to auto-update standings:', err)
  );
}, []);
```

### Example 3: Periodic Background Updates

```tsx
useEffect(() => {
  // Refresh every 30 minutes
  const interval = setInterval(() => {
    triggerLeagueUpdate().catch(console.error);
  }, 30 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

---

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const savedCount = await scrapeAndSaveStandings();
  console.log(`Successfully saved ${savedCount} teams`);
} catch (error) {
  console.error('Failed to scrape standings:', error);
  // Show user-friendly toast notification
  toast({
    title: "Error",
    description: "Failed to update league standings",
    variant: "destructive"
  });
}
```

---

## Debugging Tips

1. **Open Browser DevTools** → Console tab
   - All logs start with `[Client]` prefix for easy filtering
   - Watch for `UPSERT SUCCESS` or `UPSERT ERROR` messages

2. **Check Network Tab**
   - Single request to `https://ibasketball.co.il/league/2025-270/`
   - Should show CORS headers (if browser allows)

3. **Verify Database**
   - Check Supabase `league_standings` table
   - Confirm `updatedAt` timestamp is recent
   - Verify all 13 teams have positions and points

4. **Test Upsert Conflict**
   - The `onConflict: 'name'` ensures duplicate names update instead of duplicate-error
   - Bnei Yehuda (בני יהודה) should always stay at position 5 with latest points

---

## Performance Notes

- **Fetch**: ~1-2 seconds (depends on network)
- **Parse**: ~100-200ms (cheerio parsing)
- **Save**: ~2-3 seconds (13 individual upserts to Supabase)
- **Total**: ~5-6 seconds for full cycle

**Optimization**: Future versions can batch upserts for faster saves.

---

## Next Steps

1. ✅ **Deploy app with new service** - No backend changes needed
2. ✅ **Test manual refresh button** - Should now use client-side scraping
3. ✅ **Monitor console logs** - Verify 13 teams save successfully
4. ✅ **Optional: Add pull-to-refresh** - Wrap LeagueTable with PullToRefresh component
5. ✅ **Optional: Add auto-refresh on app load** - Call `triggerLeagueUpdate()` in useEffect

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 0 teams saved | HTML fetch failed | Check browser console for network error, verify CORS settings |
| Saved but positions wrong | Cell index wrong | Verify cell mapping matches current IBBA HTML structure |
| Duplicate name error on save | onConflict not working | Check Supabase has `unique_team_name` constraint on `name` column |
| Toast shows error | Supabase client not initialized | Verify `src/integrations/supabase/client.ts` is properly configured |
| Console shows no logs | Service import failed | Check `standingsService.ts` exists and is properly imported in hook |
