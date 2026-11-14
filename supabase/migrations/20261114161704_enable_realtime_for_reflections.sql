/*
# Enable live realtime for reflections and votes

1. Summary
- Adds the reflection (comments) and vote tables to Supabase Realtime so that new reflections and likes reach every open screen instantly.
- Before this change the realtime publication was empty, so no live updates were delivered at all.

2. Modified tables
- `comments`: added to the `supabase_realtime` publication.
- `post_votes`: added to the `supabase_realtime` publication.
- `comment_votes`: added to the `supabase_realtime` publication, and REPLICA IDENTITY set to FULL so delete events include the comment and voter ids.

3. Security
- No policy or grant changes. Realtime delivery still respects the existing row level security policies on each table.

4. Notes
- Every statement is idempotent, so the migration is safe to re-run.
- REPLICA IDENTITY FULL only affects the size of delete events on the small `comment_votes` table.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comment_votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_votes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'post_votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_votes;
  END IF;
END $$;

ALTER TABLE public.comment_votes REPLICA IDENTITY FULL;
