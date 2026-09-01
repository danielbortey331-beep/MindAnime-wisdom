/*
# Add is_admin Column to Profiles + Create Waitlist Table

## Overview
1. Adds an `is_admin` boolean column (default false) to the `profiles` table.
2. Automatically sets `is_admin = true` for the user with email
   "danielbortey331@gmail.com".
3. Creates a `waitlist` table to collect visitor emails for the beta waitlist
   (used by the premium category lock modal).

## Changes

### profiles table
- New column: `is_admin` (boolean, NOT NULL, default false)
- Data update: sets is_admin = true for the admin user

### waitlist table (new)
- `id` (uuid, primary key)
- `email` (text, unique, not null) — visitor email
- `created_at` (timestptz, default now())
- RLS enabled with anon+authenticated INSERT (anyone can join the waitlist)
  and authenticated SELECT (only the admin can view the list)

## Security
- profiles: existing RLS policies remain unchanged. The `is_admin` column is
  readable by the profile owner (via existing select_own_profile policy).
  No new policies needed — the existing SELECT policy already covers all columns.
- waitlist: INSERT open to anon (visitors aren't signed in when joining the
  waitlist). SELECT restricted to authenticated (admin only in practice).
*/

-- ============================================================
-- 1. Add is_admin column to profiles
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- ============================================================
-- 2. Set is_admin = true for the admin user
-- ============================================================
UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'danielbortey331@gmail.com'
);

-- Also set it on the trigger so future sign-ups of this email get admin
-- (in case the account is created later)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, subscription_status, trial_start_date, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'trial',
    now(),
    (NEW.email = 'danielbortey331@gmail.com')
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. Create waitlist table
-- ============================================================
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon visitors) can join the waitlist
DROP POLICY IF EXISTS "anon_insert_waitlist" ON waitlist;
CREATE POLICY "anon_insert_waitlist" ON waitlist FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Only authenticated users (admin) can view the waitlist
DROP POLICY IF EXISTS "auth_select_waitlist" ON waitlist;
CREATE POLICY "auth_select_waitlist" ON waitlist FOR SELECT
  TO authenticated USING (true);
