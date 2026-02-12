# Get Your Supabase Service Role Key

## 🔴 Current Status
Your `.env` file is **missing the Service Role Key**, which is why inserts are failing silently.

---

## 📍 Step 1: Find Your Keys in Supabase Dashboard

### Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: **hoops-star-pro** (or whichever project you're using)
3. Click **Settings** (gear icon) in left sidebar
4. Click **API** tab

### Get SUPABASE_URL
- Look for **Project URL**
- Looks like: `https://gyxqczdhzsndzcqfqmgl.supabase.co`
- **Copy this value**

### Get SUPABASE_SERVICE_ROLE_KEY ⚠️ SECRET
- Look for **service_role secret**
- Starts with: `sp_xxxxx...`
- **⚠️ KEEP THIS PRIVATE!** Never commit to GitHub
- **Copy this value**

---

## 📝 Step 2: Create .env.local File

In your project root (`c:\אפליקציות\hoops-star-pro-main\`), create a file named `.env.local`:

```dotenv
SUPABASE_URL="https://gyxqczdhzsndzcqfqmgl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sp_YOUR_SECRET_KEY_HERE"
```

**⚠️ Important:**
- Replace `sp_YOUR_SECRET_KEY_HERE` with your actual key
- Keep this file **PRIVATE** - never commit to GitHub
- `.env.local` is already in `.gitignore`

---

## 🧪 Step 3: Run Connection Test

Open PowerShell in project root and run:

```powershell
node test-simple.mjs
```

### Expected Output:
```
═══════════════════════════════════════════════════════
🧪 CONNECTION TEST - Minimal Insert
═══════════════════════════════════════════════════════

📍 Project URL: https://gyxqczdhzsndzcqfqmgl.supabase.co
🔑 Service Key: sp_XXXX...

💾 Inserting test row...
✅ INSERT SUCCESSFUL!

Data inserted:
{
  "id": 123,
  "name": "CONNECTION_TEST",
  "position": 999,
  ...
}

🔍 Verifying row exists...
✅ Row verified in database!

═══════════════════════════════════════════════════════
✅ CONNECTION TEST PASSED!
═══════════════════════════════════════════════════════
```

### If You Get Error (code: 42501):
This means RLS policy is blocking writes. You need to apply the RLS fix:

```sql
create policy "Allow authenticated users to manage league standings"
  on league_standings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

---

## ✅ Step 4: Verify in Supabase Table Editor

1. Go to Supabase Dashboard → **Table Editor**
2. Click **league_standings** table
3. Look for **CONNECTION_TEST** row (position 999)
4. If you see it → **Connection is working!** ✅

---

## 🚀 Step 5: Run Your App's Update Button

Once the test passes:

1. Open your app in browser
2. Click **Update** button
3. Watch console for logs
4. Go back to Table Editor
5. You should see all 9 teams appear! 🎉

---

## 🆘 Troubleshooting

### "Missing environment variables!"
→ You didn't create `.env.local` file or forgot to fill in the values

### "Error code: 42501"
→ RLS policy is blocking inserts. Apply the SQL migration in Supabase Console.

### "Error code: 23505 (unique constraint)"
→ Row already exists. Delete the test row from Table Editor and try again.

### Test passes but Table Editor is still empty
→ You might be looking at the wrong Supabase project. Double-check your project URL.

---

## 📋 Files Created

- `.env.local.example` - Template with instructions
- `test-simple.mjs` - Minimal connection test script

---

## 🔐 Security Note

**NEVER commit `.env.local` to GitHub.** It's in `.gitignore` by default, but always verify:

```bash
# Check if .env.local is being tracked
git status

# Should NOT show .env.local
```

If it's tracked, remove it:
```bash
git rm --cached .env.local
```
