/*
# Add Authentication, Profiles, and Subscription System

## Overview
This migration transforms MindAnime from an anonymous community app into a fully
authenticated platform with user profiles, subscription-based monetization, and a
3-day free trial system.

## New Tables

### profiles
- `id` (uuid, primary key, references auth.users) — one-to-one with Supabase auth users
- `username` (text) — display name shown on posts and comments
- `avatar_url` (text, nullable) — profile picture URL
- `subscription_status` (text, default 'trial') — one of: 'trial', 'pro', 'expired'
- `trial_start_date` (timestamptz, default now()) — when the trial began
- `created_at` (timestamptz, default now())

## Modified Tables

### posts
- Added `author_id` (uuid, nullable, references profiles.id ON DELETE SET NULL)
  — links each post to the authenticated user who created it

### comments
- Added `user_id` (uuid, nullable, references profiles.id ON DELETE SET NULL)
  — links each comment to the authenticated user who created it

### post_votes
- Added `user_id` (uuid, nullable, references profiles.id ON DELETE SET NULL)
  — links each vote to the authenticated user
- Added unique constraint on (post_id, user_id) for one-vote-per-user enforcement

## Security Changes (RLS)

### profiles
- Users can read their own profile (SELECT)
- Users can update their own profile (UPDATE)
- Users can insert their own profile (INSERT)

### posts
- SELECT: public (anon + authenticated can read all posts)
- INSERT: authenticated users with active subscription (trial or pro)
- UPDATE: only the post author
- DELETE: only the post author

### comments
- SELECT: public (anon + authenticated can read all comments)
- INSERT: authenticated users with active subscription (trial or pro)
- UPDATE: only the comment author
- DELETE: only the comment author

### post_votes
- SELECT: public
- INSERT: authenticated users with active subscription, one vote per user per post
- DELETE: authenticated users can remove their own vote

## Database Functions

### handle_new_user()
- Trigger function that fires on INSERT to auth.users
- Creates a matching profile row with subscription_status='trial' and trial_start_date=now()

### has_active_subscription(p_user_id uuid)
- Returns boolean: true if user has 'pro' status, OR 'trial' status within 3 days of trial_start_date
- Used by RLS policies to gate write operations

## Important Notes
1. The 3-day trial is enforced at the database level via the has_active_subscription() function
2. Google OAuth is enabled in Supabase Auth settings (not a migration concern)
3. Email confirmation remains OFF per project conventions
4. Existing anonymous data (posts, comments, votes) is preserved — new columns are nullable
5. The unique constraint on post_votes(post_id, user_id) is only enforced for non-null user_ids
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT 'Anonymous',
  avatar_url text,
  subscription_status text NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'pro', 'expired')),
  trial_start_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- ADD author_id TO posts
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'author_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN author_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- ADD user_id TO comments
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- ADD user_id TO post_votes + unique constraint
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_votes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE post_votes ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Unique constraint: one vote per user per post (only for authenticated users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'post_votes_post_id_user_id_key'
  ) THEN
    ALTER TABLE post_votes ADD CONSTRAINT post_votes_post_id_user_id_key UNIQUE (post_id, user_id);
  END IF;
END $$;

-- ============================================================
-- ADD user_id TO comment_votes + unique constraint
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comment_votes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE comment_votes ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comment_votes_comment_id_user_id_key'
  ) THEN
    ALTER TABLE comment_votes ADD CONSTRAINT comment_votes_comment_id_user_id_key UNIQUE (comment_id, user_id);
  END IF;
END $$;

-- ============================================================
-- HAS_ACTIVE_SUBSCRIPTION FUNCTION
-- Returns true if user is 'pro' OR 'trial' within 3 days of trial_start_date
-- ============================================================
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id
    AND (
      subscription_status = 'pro'
      OR (
        subscription_status = 'trial'
        AND trial_start_date >= now() - interval '3 days'
      )
    )
  );
$$;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, username, subscription_status, trial_start_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'trial',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- UPDATE POSTS RLS POLICIES
-- ============================================================
-- Drop old policies
DROP POLICY IF EXISTS "select_posts" ON posts;
DROP POLICY IF EXISTS "insert_posts" ON posts;
DROP POLICY IF EXISTS "update_posts" ON posts;
DROP POLICY IF EXISTS "delete_posts" ON posts;

-- SELECT: public (anyone can read posts)
CREATE POLICY "select_posts" ON posts FOR SELECT
  TO anon, authenticated USING (true);

-- INSERT: authenticated with active subscription
CREATE POLICY "insert_posts" ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id AND has_active_subscription(auth.uid()));

-- UPDATE: only author
CREATE POLICY "update_posts" ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- DELETE: only author
CREATE POLICY "delete_posts" ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ============================================================
-- UPDATE COMMENTS RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "select_comments" ON comments;
DROP POLICY IF EXISTS "insert_comments" ON comments;
DROP POLICY IF EXISTS "update_comments" ON comments;
DROP POLICY IF EXISTS "delete_comments" ON comments;

-- SELECT: public
CREATE POLICY "select_comments" ON comments FOR SELECT
  TO anon, authenticated USING (true);

-- INSERT: authenticated with active subscription
CREATE POLICY "insert_comments" ON comments FOR INSERT
  TO authenticated
  WITH CHECK (has_active_subscription(auth.uid()));

-- UPDATE: only author
CREATE POLICY "update_comments" ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: only author
CREATE POLICY "delete_comments" ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- UPDATE POST_VOTES RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "select_post_votes" ON post_votes;
DROP POLICY IF EXISTS "insert_post_votes" ON post_votes;
DROP POLICY IF EXISTS "delete_post_votes" ON post_votes;

-- SELECT: public
CREATE POLICY "select_post_votes" ON post_votes FOR SELECT
  TO anon, authenticated USING (true);

-- INSERT: authenticated with active subscription
CREATE POLICY "insert_post_votes" ON post_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND has_active_subscription(auth.uid()));

-- DELETE: remove own vote
CREATE POLICY "delete_post_votes" ON post_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- UPDATE COMMENT_VOTES RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "select_comment_votes" ON comment_votes;
DROP POLICY IF EXISTS "insert_comment_votes" ON comment_votes;
DROP POLICY IF EXISTS "delete_comment_votes" ON comment_votes;

-- SELECT: public
CREATE POLICY "select_comment_votes" ON comment_votes FOR SELECT
  TO anon, authenticated USING (true);

-- INSERT: authenticated with active subscription
CREATE POLICY "insert_comment_votes" ON comment_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND has_active_subscription(auth.uid()));

-- DELETE: remove own vote
CREATE POLICY "delete_comment_votes" ON comment_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_user_id ON post_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_user_id ON comment_votes(user_id);