# CalibrateIQ — Setup Guide

## Prerequisites

- Node.js 18+ installed
- A free Supabase account at [supabase.com](https://supabase.com)

---

## Step 1: Create a Supabase Project

1. Log in to [supabase.com](https://supabase.com) and click **New project**
2. Choose a name (e.g. `calibrateiq`), set a strong database password, and select your region
3. Wait for the project to provision (~1 min)

---

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL editor**
2. Click **New query**
3. Paste the entire contents of `supabase/schema.sql`
4. Click **Run**

> **Note:** As of May 30, 2026, Supabase no longer auto-exposes `public` tables
> to the Data API, so new projects require explicit `GRANT`s before `supabase-js`
> can reach a table. `schema.sql` includes the required grants at the bottom — as
> long as you run the whole file, the app will work. If you add new tables later,
> the `ALTER DEFAULT PRIVILEGES` statements at the end of `schema.sql` keep them
> exposed automatically.

---

## Step 3: Create the Logo Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click **New bucket**, name it `logos`, and turn on **Public bucket**
3. Go to **Policies** for the logos bucket and add these policies:
   - **INSERT**: `auth.uid()::text = (storage.foldername(name))[1]`
   - **UPDATE**: `auth.uid()::text = (storage.foldername(name))[1]`
   - **DELETE**: `auth.uid()::text = (storage.foldername(name))[1]`
   - **SELECT**: `true` (public read)

---

## Step 4: Configure Auth

1. In Supabase → **Authentication → Settings**
2. For local dev, you can **disable email confirmation** (turn off "Enable email confirmations")
3. Set the **Site URL** to `http://localhost:3000`
4. Add `http://localhost:3000/auth/callback` to **Redirect URLs**

---

## Step 5: Set Up Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. In Supabase → **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Your `.env.local` should look like:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

## Step 6: Install Dependencies and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## App Structure

```
/                          Public landing page
/auth/signup               Create advisor account
/auth/login                Advisor login
/dashboard                 Advisor dashboard
/dashboard/clients         Client list + add clients
/dashboard/clients/[id]    Client detail (profile, IPS)
/dashboard/settings        Firm name + logo upload
/q/[token]                 Client-facing questionnaire (public)
```

---

## Scoring System

- **Q1 (Age)** + **Q2 (Time Horizon)** → Risk Capacity Score (20–100)
- **Q3–Q6, Q8** → Risk Tolerance Score (50–250, placeholder 50/40/30/20/10 per question)
- Q7 (ESG/Crypto) is informational only — not scored
- Final risk category uses the **more conservative** of normalized Capacity vs. Tolerance

To update custom scoring, edit the `options[].score` values in `src/lib/scoring.ts`.

---

## Exporting the IPS as PDF

On the client detail IPS tab, click **Export PDF**. This triggers `window.print()` using a
dedicated print-only CSS layout. In the print dialog, select **Save as PDF**.

For production, consider replacing with a server-rendered PDF library like `@react-pdf/renderer`.

---

## Deployment

Deploy to [Vercel](https://vercel.com) in one click:

1. Push the project to a GitHub repo
2. Import in Vercel → add your three environment variables
3. Update `NEXT_PUBLIC_APP_URL` to your production URL
4. In Supabase Auth settings, add your production URL to Redirect URLs
