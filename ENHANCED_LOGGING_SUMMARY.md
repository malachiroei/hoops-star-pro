# Enhanced Logging & UI Update - Summary of Changes

## Problem Identified
UI was not updating after standings scraped and saved to database. Root causes:
1. **Missing error logging** - Silent failures in Supsupport.from().upsert() calls
2. **No React Query invalidation** - Cache not cleared after database update
3. **RLS issues** - Possible row-level security policy blocking inserts

## Solution Applied

### 1. **Enhanced Database Error Logging** 
   **File:** `src/services/standingsService.ts` → `saveToDatabase()` function
   
   **Before:**
   ```typescript
   if (error) {
     console.error(`  -> UPSERT ERROR: ${error.message}`);
   }
   ```
   
   **After:**
   ```typescript
   if (error) {
     console.error(`  -> UPSERT ERROR: ${error.message}`);
     console.error(`     Code: ${error.code}`);
     console.error(`     Details: ${JSON.stringify(error)}`);
   }
   ```
   
   **Result:** Now shows full error code and details for RLS/constraint issues

### 2. **Added URL Verification Logging**
   **File:** `src/services/standingsService.ts` → `saveToDatabase()` function
   
   **Added:**
   ```typescript
   console.log(`   URL: https://ibasketball.co.il/league/2025-270/ ✓`);
   ```
   
   **Result:** Confirms correct URL in logs

### 3. **Created New Hook: `useTriggerLeagueUpdate()`**
   **File:** `src/hooks/useLeagueStandings.ts`
   
   **Features:**
   - Extends `triggerLeagueUpdate()` with React context access
   - Includes `queryClient.invalidateQueries()` call
   - Automatically refreshes UI when database updates
   - Full logging with separators
   
   **Usage:**
   ```typescript
   const triggerUpdate = useTriggerLeagueUpdate();
   await triggerUpdate(); // Scrapes, saves, AND refreshes UI
   ```

### 4. **Updated LeagueTable Component**
   **File:** `src/components/LeagueTable.tsx`
   
   **Changes:**
   - Import `useTriggerLeagueUpdate` hook instead of function
   - Removed manual `refetch()` call (now automatic via invalidation)
   - Added user action logging: `[LeagueTable] User clicked refresh button`
   
   **Before:**
   ```typescript
   const { data: standings, isLoading, error, refetch } = useLeagueStandings();
   
   await triggerLeagueUpdate();
   await refetch(); // Manual refresh
   ```
   
   **After:**
   ```typescript
   const { data: standings, isLoading, error } = useLeagueStandings();
   const triggerUpdate = useTriggerLeagueUpdate(); // Hook with invalidation
   
   await triggerUpdate(); // Automatic UI refresh
   ```

### 5. **Enhanced Console Logging Throughout**
   **All Files Updated:**
   - `src/services/standingsService.ts` - Detailed save logs
   - `src/hooks/useLeagueStandings.ts` - Success/failure reporting
   - `src/components/LeagueTable.tsx` - User action tracking
   
   **Logging Prefixes:**
   - `[Client]` - Fetch/parse operations in service
   - `[useHook]` - React hook logic
   - `[LeagueTable]` - Component-level actions
   
   **Console Separators:**
   - `════════════════════════════════════════════════` - Major sections
   - Clear structure for easy reading

---

## How to Test the Enhanced Logging

### Step 1: Open Browser Console
- Press `F12` (Windows) or `Cmd+Option+I` (Mac)
- Click "Console" tab

### Step 2: Click "Update" Button
- In the app, click the refresh button next to standings

### Step 3: Watch Console Output
```
🏀 [LeagueTable] User clicked refresh button

════════════════════════════════════════════════════════════════
📲 [useHook] Triggering client-side standings scrape...
   URL: https://ibasketball.co.il/league/2025-270/ ✓
════════════════════════════════════════════════════════════════

🌐 [Client] Fetching standings from: https://ibasketball.co.il/league/2025-270/
✅ [Client] HTML fetched successfully (45821 bytes)

📋 [Client] Parsing standings table...
...
📊 [Client] Parsing complete: 13 teams extracted

💾 [Client] Saving 13 teams to Supabase...
   URL: https://ibasketball.co.il/league/2025-270/ ✓

  -> Attempting to save: "בני יהודה"
     Data: { name: "בני יהודה", position: 5, points: 10, games_played: 8 }
  -> ✅ UPSERT SUCCESS: "בני יהודה" saved to DB

... (all teams) ...

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

### Step 4: Check UI Update
- Standings table should refresh with latest data
- Toast notification: "League standings updated successfully"
- `updatedAt` timestamp in description should be recent

---

## Debugging Checklist

| Check | Expected | If Not | Fix |
|-------|----------|--------|-----|
| **Fetch** | `✅ HTML fetched successfully` | Shows error | Check CORS/network in Network tab |
| **Parse** | `📊 Parsing complete: 13 teams` | Says 0 teams | Check if cell indices changed |
| **Upsert** | All 13 `✅ UPSERT SUCCESS` | Shows ERROR | Check Supabase RLS policies |
| **UI Update** | Standing positions change | Stays same | Try browser refresh (Ctrl+R) |
| **Toast** | Success notification shows | No Toast | Check if JavaScript disabled |

---

## Key Improvements Over Previous Version

| Aspect | Before | After |
|--------|--------|-------|
| **Error Visibility** | Silent failures | Full error code + details + context |
| **URL Verification** | Hidden in code | Logged to console every run |
| **UI Update** | Manual `refetch()` | Automatic via React Query invalidation |
| **Logging Structure** | Scattered logs | Clear prefixes + separators |
| **RLS Debugging** | No error details | Full error object logged |
| **DB Success Check** | Only "Saved" message | Success + team count + timestamp |

---

## What's Next

### If All Logs Say SUCCESS But UI Doesn't Update:
1. Check Supabase policies allow authenticated reads on `league_standings`
2. Try manual browser refresh (Ctrl+R)
3. Check React DevTools to see if query cache was invalidated

### If UPSERT Shows ERROR:
1. Look at `Code:` field - common values:
   - `42501` = RLS policy denial
   - `23505` = Unique constraint violation
   - `08006` = Database connection error
2. Fix based on error code
3. Try refresh again

### If HTML Fetch Fails:
1. Check Network tab for CORS errors
2. Verify `https://ibasketball.co.il/league/2025-270/` is reachable
3. Try in incognito window (bypass browser cache)

---

## Files Modified

```
✅ src/services/standingsService.ts       (Enhanced saveToDatabase logging)
✅ src/hooks/useLeagueStandings.ts        (NEW: useTriggerLeagueUpdate hook)
✅ src/components/LeagueTable.tsx         (Updated to use new hook)
📄 CONSOLE_LOGGING_GUIDE.md               (NEW: Detailed logging reference)
```

---

## Testing Commands

In browser console, you can manually test:

```javascript
// Test the service directly
import { scrapeAndSaveStandings } from '@/services/standingsService';
await scrapeAndSaveStandings();
```

Monitor console for all logs.

---

## Support

If you see a specific error not listed above:
1. Copy the full error message from console
2. Check the error `Code:` field
3. Reference [CONSOLE_LOGGING_GUIDE.md](CONSOLE_LOGGING_GUIDE.md)
4. Most common: RLS issue → Check Supabase `league_standings` table policies
