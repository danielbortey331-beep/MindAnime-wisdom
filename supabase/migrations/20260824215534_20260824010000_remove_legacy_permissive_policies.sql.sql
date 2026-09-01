/*
# Remove Permissive Legacy RLS Policies

## Overview
The original community migration created permissive "public_*" policies that
allowed anon-role clients to INSERT, UPDATE, and DELETE on posts, comments,
post_votes, and comment_votes with no ownership or subscription checks.
These legacy policies bypass the new trial/subscription enforcement and must
be removed so only the authenticated, subscription-checked policies remain.

## Changes
1. Drop all "public_insert_*", "public_update_*", "public_delete_*" policies
   from posts, comments, post_votes, comment_votes.
2. Drop the old "public_read_*" SELECT policies that were redundant with the
   new "select_*" policies (keep the new ones, drop the old redundant ones).
3. Keep all new authenticated-scoped policies intact.

## Security Impact
After this migration:
- posts: SELECT public, INSERT/UPDATE/DELETE authenticated+owner+subscription
- comments: SELECT public, INSERT authenticated+subscription, UPDATE/DELETE owner
- post_votes: SELECT public, INSERT authenticated+subscription, DELETE owner
- comment_votes: SELECT public, INSERT authenticated+subscription, DELETE owner
*/

-- ============================================================
-- POSTS: drop legacy permissive policies
-- ============================================================
DROP POLICY IF EXISTS "public_insert_posts" ON posts;
DROP POLICY IF EXISTS "public_update_posts" ON posts;
DROP POLICY IF EXISTS "public_delete_posts" ON posts;
DROP POLICY IF EXISTS "public_read_posts" ON posts;

-- ============================================================
-- COMMENTS: drop legacy permissive policies
-- ============================================================
DROP POLICY IF EXISTS "public_insert_comments" ON comments;
DROP POLICY IF EXISTS "public_delete_comments" ON comments;
DROP POLICY IF EXISTS "public_read_comments" ON comments;

-- ============================================================
-- POST_VOTES: drop legacy permissive policies
-- ============================================================
DROP POLICY IF EXISTS "public_insert_post_votes" ON post_votes;
DROP POLICY IF EXISTS "public_delete_post_votes" ON post_votes;
DROP POLICY IF EXISTS "public_read_post_votes" ON post_votes;

-- ============================================================
-- COMMENT_VOTES: drop legacy permissive policies
-- ============================================================
DROP POLICY IF EXISTS "public_insert_comment_votes" ON comment_votes;
DROP POLICY IF EXISTS "public_delete_comment_votes" ON comment_votes;
DROP POLICY IF EXISTS "public_read_comment_votes" ON comment_votes;
