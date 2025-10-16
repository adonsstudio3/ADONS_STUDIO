# 🔍 Admin Dashboard Loading Issue - Debug Guide

## 🎯 Problem
Your admin dashboard is stuck on loading and doesn't show content. You're seeing a browser extension error (`runtime.lastError`) which is **NOT the real issue**.

---

## ✅ The Extension Error (Ignore This)

```
Unchecked runtime.lastError: The message port closed before a response was received.
```

**This is harmless!** It's caused by browser extensions (ad blockers, password managers, React DevTools, etc.) and doesn't affect your site.

### Quick Test - Is it the extension?
1. Open **Incognito/Private window**: `Ctrl+Shift+N` (Chrome) or `Ctrl+Shift+P` (Firefox)
2. Go to: `http://localhost:3000/admin/dashboard`
3. Check if the error disappears

If yes → Ignore it! It's just an extension.

---

## 🔎 Finding the REAL Problem

### Step 1: Check Network Tab (Most Important!)

1. **Open DevTools**: Press `F12`
2. **Go to Network tab**
3. **Reload the admin dashboard page**
4. **Look for RED lines** (failed requests)

#### What to Look For:

**✅ Successful API Call (200):**
```
Name: stats
Status: 200
Type: fetch
```

**❌ Failed API Call (500/401/404):**
```
Name: stats
Status: 500 (or 401, 404)
Type: fetch
```

---

### Step 2: Click on the Failed Request

If you see a red/failed request:
1. **Click on it** in the Network tab
2. **Go to "Response" tab**
3. **Copy the error message**

Common errors you might see:

#### Error 1: Missing Service Role Key
```json
{
  "error": "Supabase configuration error - admin client not available",
  "details": "Check SUPABASE_SERVICE_ROLE_KEY environment variable"
}
```

**Fix:** Your `.env.local` is missing or has wrong `SUPABASE_SERVICE_ROLE_KEY`

---

#### Error 2: RLS Policy Blocking
```json
{
  "error": "permission denied for table projects",
  "code": "42501"
}
```

**Fix:** RLS policies are blocking the service role. Run the SQL fix below.

---

#### Error 3: Table Doesn't Exist
```json
{
  "error": "relation \"projects\" does not exist"
}
```

**Fix:** Your database tables aren't created. Need to run migrations.

---

### Step 3: Check Console Tab

1. **Open DevTools** (`F12`)
2. **Go to Console tab**
3. **Filter out extension errors**: Type `-runtime` in the filter box
4. **Look for REAL JavaScript errors** (red text)

Common errors:

#### Error: "Cannot read properties of null"
```
TypeError: Cannot read properties of null (reading 'from')
```

**Cause:** `supabaseAdmin` is null (service role key missing)

**Fix:** Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`

---

#### Error: "Session expired"
```
Error: Your session has expired. Please login again.
```

**Fix:** You need to re-login to admin panel

---

## 🛠️ Common Fixes

### Fix 1: Verify Environment Variables

**Check your `.env.local` file has all 3 keys:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bpbueyqynmmeudopwemq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**After adding/changing `.env.local`:**
```bash
# MUST restart dev server!
# Press Ctrl+C to stop
npm run dev
```

---

### Fix 2: RLS Policies Blocking Admin

Your code uses `supabaseAdmin` (service role) which should bypass RLS, but if RLS is misconfigured, it can still block access.

**Run this SQL in Supabase Dashboard → SQL Editor:**

```sql
-- Fix RLS policies for admin access
-- This allows service_role to access all tables

-- Projects table
DROP POLICY IF EXISTS "Service role full access projects" ON projects;
CREATE POLICY "Service role full access projects" ON projects 
FOR ALL TO service_role USING (true);

-- Hero sections table
DROP POLICY IF EXISTS "Service role full access hero_sections" ON hero_sections;
CREATE POLICY "Service role full access hero_sections" ON hero_sections 
FOR ALL TO service_role USING (true);

-- Showreels table
DROP POLICY IF EXISTS "Service role full access showreels" ON showreels;
CREATE POLICY "Service role full access showreels" ON showreels 
FOR ALL TO service_role USING (true);

-- Media files table
DROP POLICY IF EXISTS "Service role full access media_files" ON media_files;
CREATE POLICY "Service role full access media_files" ON media_files 
FOR ALL TO service_role USING (true);

-- Contact submissions table
DROP POLICY IF EXISTS "Service role full access contact_submissions" ON contact_submissions;
CREATE POLICY "Service role full access contact_submissions" ON contact_submissions 
FOR ALL TO service_role USING (true);

-- Analytics consent table  
DROP POLICY IF EXISTS "Service role full access analytics_consent" ON analytics_consent;
CREATE POLICY "Service role full access analytics_consent" ON analytics_consent 
FOR ALL TO service_role USING (true);

-- Activity logs table
DROP POLICY IF EXISTS "Service role full access activity_logs" ON activity_logs;
CREATE POLICY "Service role full access activity_logs" ON activity_logs 
FOR ALL TO service_role USING (true);

-- Admin users table
DROP POLICY IF EXISTS "Service role full access admin_users" ON admin_users;
CREATE POLICY "Service role full access admin_users" ON admin_users 
FOR ALL TO service_role USING (true);
```

**After running SQL:**
- Hard refresh your admin dashboard: `Ctrl+Shift+R`
- The dashboard should load

---

### Fix 3: Re-Login to Admin

Sometimes your admin session expires:

1. Go to: `http://localhost:3000/admin/login`
2. Login again with: `adonsstudio3@gmail.com`
3. Check "Keep me logged in" (if available)
4. Navigate to dashboard

---

### Fix 4: Clear Browser Cache

Sometimes old cached data causes issues:

**Chrome/Edge:**
1. Press `F12` → Open DevTools
2. **Right-click the Refresh button** (while DevTools is open)
3. Select **"Empty Cache and Hard Reload"**

**Firefox:**
1. Press `Ctrl+Shift+Delete`
2. Select "Cache" only
3. Time range: "Everything"
4. Click "Clear Now"

---

## 🧪 Step-by-Step Debugging

### Test 1: Check if API Route is Working

**Open this URL in your browser:**
```
http://localhost:3000/api/admin/dashboard/stats
```

**Expected:** Should show JSON with stats:
```json
{
  "stats": {
    "projects": { "total": 5 },
    "hero_sections": { "total": 3 },
    ...
  }
}
```

**If you see an error page:** That's your problem! Copy the error and share it.

---

### Test 2: Check Supabase Connection

**Look in your terminal** (where `npm run dev` is running).

**Look for these console logs:**

✅ **Good (Working):**
```
🔍 Supabase Environment Check: { url: '✅ Set', anonKey: '✅ Set', serviceKey: '✅ Set' }
📊 Dashboard stats API called
✅ Supabase admin client available
```

❌ **Bad (Broken):**
```
⚠️ SUPABASE_SERVICE_ROLE_KEY is missing - admin operations will not work
❌ Supabase admin client not available
```

**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and restart

---

### Test 3: Check Database Tables Exist

**Go to:** Supabase Dashboard → Table Editor

**Verify these tables exist:**
- ✅ `projects`
- ✅ `hero_sections`
- ✅ `showreels`
- ✅ `media_files`
- ✅ `contact_submissions`
- ✅ `analytics_consent`
- ✅ `activity_logs`
- ✅ `admin_users`

**If any are missing:** You need to run migrations to create them.

---

## 📊 Expected Console Output (Working Dashboard)

When the dashboard loads successfully, you should see:

**In Browser Console (F12):**
```
Loading dashboard data...
Dashboard data received: { stats: {...}, recent_activity: [...] }
```

**In Terminal (npm run dev):**
```
📊 Dashboard stats API called
✅ Supabase admin client available
📊 Fetching dashboard stats...
GET /api/admin/dashboard/stats 200 in 1234ms
```

---

## 🚨 If Still Not Working

### Share These Details:

1. **Network Tab Error:**
   - Go to Network tab
   - Click on the failed `stats` request
   - Copy the Response/Preview content
   - Share it

2. **Console Errors:**
   - Copy any red JavaScript errors (ignore `runtime.lastError`)

3. **Terminal Logs:**
   - Copy the logs from your `npm run dev` terminal
   - Share what you see when you reload admin dashboard

4. **Environment Check:**
   - Run this in your terminal:
   ```bash
   cd e:\Websites\Adons\frontend
   type .env.local | findstr SUPABASE
   ```
   - Share if all 3 variables are present (don't share the actual keys!)

---

## 🎯 Most Common Solution (90% of cases)

**Problem:** Missing or wrong `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

**Fix:**

1. **Open:** `e:\Websites\Adons\frontend\.env.local`

2. **Verify this line exists:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **If missing, add it:**
   - Go to: Supabase Dashboard → Settings → API
   - Copy "service_role secret" (NOT anon key!)
   - Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
   ```

4. **Restart dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

5. **Hard refresh browser:** `Ctrl+Shift+R`

---

## ✅ Quick Checklist

Before asking for help, verify:

- [ ] `.env.local` has all 3 Supabase keys
- [ ] Dev server restarted after changing `.env.local`
- [ ] Browser cache cleared (`Ctrl+Shift+R`)
- [ ] Tested in Incognito (to rule out extensions)
- [ ] Checked Network tab for failed requests
- [ ] Checked Console for real errors (not `runtime.lastError`)
- [ ] Verified `http://localhost:3000/api/admin/dashboard/stats` in browser
- [ ] Logged into admin panel recently (session not expired)

---

**Status:** Ready to debug! 🔍  
**Next:** Follow the steps above and share what you find in Network/Console tabs.
