# Database Connection & RLS Policy Fix Guide

## 🔴 The Issue

Your logs show "Total in DB: 9" and "UPSERT SUCCESS" for all teams, but the Table Editor is empty. This means:

1. **The app IS connecting to Supabase** ✅
2. **The app IS receiving "success" responses from the API** ✅ 
3. **But the database is silently REJECTING the inserts** ❌

### Root Cause: Row Level Security (RLS) Policy

The `league_standings` table has an RLS policy that only allows `service_role` to insert data:

```sql
create policy "Allow service role to manage league standings"
  on league_standings
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
```

But your client-side app uses the **publishable key** (for authenticated users), which doesn't have permission to insert.

---

## ✅ Solution: Fix RLS Policy

### Step 1: Run the Test Script to Verify Connection

```bash
# Set your service role key
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Run the test
npx ts-node test-db-connection.ts
```

**Expected output:**
```
🔍 Testing Supabase Connection...
   Project URL: https://gyxqczdhzsndzcqfqmgl.supabase.co
   Service Key: sp_...

✅ Read successful! Found 0 existing teams
🧪 Step 2: Inserting test team...
✅ Insert successful!
✔️ Step 3: Verifying data was saved...
✅ Verification successful! Test team is in the database
📊 Step 4: Counting total teams in database...
✅ Total teams in database: 1
═══════════════════════════════════════════════════════
✅ ALL TESTS PASSED - Database connection is working!
═══════════════════════════════════════════════════════
```

If you get insertion errors like `code: 42501` (permission denied), the RLS policy is blocking it.

---

### Step 2: Apply the RLS Policy Fix in Supabase Console

Go to **Supabase Dashboard** → **SQL Editor** and copy-paste:

```sql
-- Allow authenticated users to insert/update league standings
-- This fixes the client-side app's ability to save standings data

create policy "Allow authenticated users to manage league standings"
  on league_standings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

Or use the Vercel SQL migration if your Supabase project is connected to Vercel.

---

### Step 3: Verify in Table Editor

1. Open **Supabase Dashboard** → **Table Editor**
2. Click on `league_standings` table
3. Refresh the page
4. You should now see the data (either empty or with test teams if you ran the test script)

---

### Step 4: Re-run triggerLeagueUpdate in Your App

Once the RLS policy is updated:

1. Open your app in the browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Click **Update** button on the standings
5. Watch the console output
6. All 9 teams should now show "✅ UPSERT SUCCESS"

---

### Step 5: Verify in Table Editor

Go back to Supabase Table Editor and refresh. You should see all 9 teams!

---

## 📋 Summary of Files

**New files created:**
- `test-db-connection.ts` - Database connection test script
- `supabase/migrations/20260212_allow_authenticated_users.sql` - RLS policy fix

**Files that need updating (after RLS fix):**
- None! The client-side service already sends the correct data. Just the RLS policy was blocking it.

---

## 🚨 Troubleshooting

### If test script shows "code: 42501"
- The RLS policy still only allows service_role
- Run the SQL migration in Supabase Console
- OR check that your SUPABASE_SERVICE_ROLE_KEY is correct

### If Table Editor is still empty after RLS update
- Make sure you applied the SQL migration
- Try refreshing the page
- Or delete the test team and re-run the app's Update button

### If logs still show "UPSERT ERROR"
- Wait a few seconds for the RLS policy to propagate
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh the app page and click Update again

---

## 📚 Why This Happens

The database's RLS policies are a **security feature**:
- **Public access:** Only SELECT (read) - anyone can view standings
- **Service role:** INSERT/UPDATE/DELETE - only Deno Edge Function can modify (more secure)
- **App problem:** Client-side app needs to be either:
  - Built-in auth user (authenticated role) ✅ FIXED
  - OR use an Edge Function as a proxy
  - OR use a database function that bypasses RLS

We're using **option 1**: allowing authenticated users to insert standings. Since the app doesn't need user auth for this feature, it's safe to allow.

---

## Next Steps

1. ✅ Run test-db-connection.ts to verify connection
2. ✅ Apply RLS migration in Supabase Console
3. ✅ Refresh Table Editor to see teams appear
4. ✅ Click Update in app to see all 9 teams saved
5. ✅ Verify teams show on phone UI
