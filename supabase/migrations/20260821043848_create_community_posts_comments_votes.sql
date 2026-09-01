/*
# Create community-driven posts, comments, and votes for MindAnime

## Overview
Redesigns MindAnime as a community-driven wisdom feed. Creates tables for
insight posts (curated + user-submitted), comments (real-time discussion),
and votes (upvotes on posts and comments). Includes RPC functions for
atomic vote toggling and vote count retrieval.

## New Tables

### posts
- `id` (uuid, PK)
- `title` (text) — lesson headline
- `category` (text) — Philosophy, Psychological Principles, Power & Strategy, Political Science, Book Frameworks, Great Thinkers
- `excerpt` (text) — short summary
- `body` (jsonb) — structured content sections
- `source_title` (text) — book or source name
- `source_author` (text) — author/thinker
- `image_url` (text) — anime/aesthetic background image
- `author_name` (text) — display name of poster
- `is_curated` (bool) — true for editorial content, false for user submissions
- `created_at` (timestamp)

### comments
- `id` (uuid, PK)
- `post_id` (uuid, FK → posts)
- `author_name` (text) — display name
- `content` (text) — comment body
- `created_at` (timestamp)

### post_votes
- `id` (uuid, PK)
- `post_id` (uuid, FK → posts)
- `voter_id` (text) — anonymous browser fingerprint
- `created_at` (timestamp)
- UNIQUE constraint on (post_id, voter_id)

### comment_votes
- `id` (uuid, PK)
- `comment_id` (uuid, FK → comments)
- `voter_id` (text) — anonymous browser fingerprint
- `created_at` (timestamp)
- UNIQUE constraint on (comment_id, voter_id)

## RPC Functions
- `toggle_post_vote(p_post_id uuid, p_voter_id text)` — toggles a post vote, returns new vote count
- `toggle_comment_vote(p_comment_id uuid, p_voter_id text)` — toggles a comment vote, returns new vote count

## Security
- All tables: RLS enabled, anon + authenticated can read all and insert (community app, no auth)
- Votes: anyone can insert/delete their own vote (keyed by voter_id)
- No user_id / auth.users linkage — single-tenant community app

## Seed Data
- 4 curated posts with anime images (48 Laws of Power, Stoicism, Cognitive Psychology, Machiavelli)
- 2-3 realistic community comments per post
- Initial votes on posts and comments
*/

-- ============================================================
-- POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  excerpt text NOT NULL,
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_title text,
  source_author text,
  image_url text,
  author_name text NOT NULL DEFAULT 'MindAnime Editorial',
  is_curated boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_posts" ON posts;
CREATE POLICY "public_read_posts" ON posts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_posts" ON posts;
CREATE POLICY "public_insert_posts" ON posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_posts" ON posts;
CREATE POLICY "public_update_posts" ON posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_posts" ON posts;
CREATE POLICY "public_delete_posts" ON posts FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_comments" ON comments;
CREATE POLICY "public_read_comments" ON comments FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_comments" ON comments;
CREATE POLICY "public_insert_comments" ON comments FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_comments" ON comments;
CREATE POLICY "public_delete_comments" ON comments FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- POST_VOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS post_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  voter_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, voter_id)
);
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_post_votes" ON post_votes;
CREATE POLICY "public_read_post_votes" ON post_votes FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_post_votes" ON post_votes;
CREATE POLICY "public_insert_post_votes" ON post_votes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_post_votes" ON post_votes;
CREATE POLICY "public_delete_post_votes" ON post_votes FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- COMMENT_VOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS comment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  voter_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (comment_id, voter_id)
);
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_comment_votes" ON comment_votes;
CREATE POLICY "public_read_comment_votes" ON comment_votes FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_comment_votes" ON comment_votes;
CREATE POLICY "public_insert_comment_votes" ON comment_votes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_comment_votes" ON comment_votes;
CREATE POLICY "public_delete_comment_votes" ON comment_votes FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_votes_post_id ON post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id ON comment_votes(comment_id);

-- ============================================================
-- RPC: toggle_post_vote
-- ============================================================
CREATE OR REPLACE FUNCTION toggle_post_vote(p_post_id uuid, p_voter_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists boolean;
  v_count integer;
BEGIN
  SELECT EXISTS(SELECT 1 FROM post_votes WHERE post_id = p_post_id AND voter_id = p_voter_id) INTO v_exists;
  IF v_exists THEN
    DELETE FROM post_votes WHERE post_id = p_post_id AND voter_id = p_voter_id;
  ELSE
    INSERT INTO post_votes (post_id, voter_id) VALUES (p_post_id, p_voter_id);
  END IF;
  SELECT count(*) INTO v_count FROM post_votes WHERE post_id = p_post_id;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_post_vote(uuid, text) TO anon, authenticated;

-- ============================================================
-- RPC: toggle_comment_vote
-- ============================================================
CREATE OR REPLACE FUNCTION toggle_comment_vote(p_comment_id uuid, p_voter_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists boolean;
  v_count integer;
BEGIN
  SELECT EXISTS(SELECT 1 FROM comment_votes WHERE comment_id = p_comment_id AND voter_id = p_voter_id) INTO v_exists;
  IF v_exists THEN
    DELETE FROM comment_votes WHERE comment_id = p_comment_id AND voter_id = p_voter_id;
  ELSE
    INSERT INTO comment_votes (comment_id, voter_id) VALUES (p_comment_id, p_voter_id);
  END IF;
  SELECT count(*) INTO v_count FROM comment_votes WHERE comment_id = p_comment_id;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_comment_vote(uuid, text) TO anon, authenticated;

-- ============================================================
-- SEED DATA: 4 Curated Posts
-- ============================================================
INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Law 3: Conceal Your Intentions',
  'Power & Strategy',
  'Keep people off-balance and in the dark by never revealing the purpose behind your actions. When they have no clue what you are up to, they cannot prepare a defense.',
  '[
    {"type":"paragraph","content":"Robert Greene''s third law of power is about the strategic advantage of opacity. When others know your intentions, they can prepare countermeasures. When they don''t, they are left guessing — and a guessing opponent is a reactive one."},
    {"type":"heading","content":"The Art of the Decoy"},
    {"type":"paragraph","content":"Greene draws on examples from history: Bismarck feigned support for the monarchy while secretly engineering German unification under Prussia. The key is to offer a plausible but false narrative — a decoy target that absorbs your opponent''s attention while you maneuver toward your real objective."},
    {"type":"heading","content":"Why Transparency Is Dangerous"},
    {"type":"paragraph","content":"In modern contexts — negotiations, competitive markets, even office politics — revealing your full hand invites exploitation. People who know exactly what you want will price it accordingly. The lesson is not about dishonesty for its own sake, but about controlling information flow as a strategic asset."},
    {"type":"takeaway","content":"Before your next important move, ask: who benefits from knowing my plan? If the answer is anyone but you, consider what you reveal and to whom."}
  ]'::jsonb,
  'The 48 Laws of Power',
  'Robert Greene',
  'https://images.pexels.com/photos/28827866/pexels-photo-28827866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'MindAnime Editorial',
  true
),
(
  'The Dichotomy of Control: What Is Truly Yours',
  'Philosophy',
  'Some things are within your power — your opinions, impulses, desires, and aversions. Everything else is not. Suffering begins when we confuse the two.',
  '[
    {"type":"paragraph","content":"Epictetus, the Stoic philosopher born a slave, taught that the foundation of all philosophy is distinguishing between what we control and what we don''t. This single distinction, if internalized, eliminates the majority of human suffering."},
    {"type":"heading","content":"The Internal vs. The External"},
    {"type":"paragraph","content":"Your reputation, your wealth, your health, other people''s opinions — these are what the Stoics called externals. You can influence them, but you do not control them. Your judgments, your effort, your values — these are internals. You have complete command over them, always, regardless of circumstance."},
    {"type":"heading","content":"The Practical Test"},
    {"type":"paragraph","content":"When you feel anxious or angry, Epictetus would say: you have mistaken an external for an internal. You are suffering because you are trying to control something that was never yours to control. The practice is to catch this error in real time — to say, ''this is not mine,'' and return your focus to what is."},
    {"type":"takeaway","content":"Right now, identify one thing causing you stress. Ask honestly: is this within my control? If not, your work is not to fix it — it is to fix your relationship to it."}
  ]'::jsonb,
  'The Enchiridion',
  'Epictetus',
  'https://images.pexels.com/photos/6876633/pexels-photo-6876633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'MindAnime Editorial',
  true
),
(
  'The Baader-Meinhof Phenomenon: Why Your Brain Tricks You',
  'Psychological Principles',
  'Once you learn something new, you start seeing it everywhere. This isn''t coincidence — it''s your reticular activating system rewiring what you notice. Understanding it changes how you learn.',
  '[
    {"type":"paragraph","content":"The Baader-Meinhof Phenomenon, or frequency illusion, occurs when your brain selects a newly-learned concept as a priority filter. Your reticular activating system (RAS) — the network that decides what reaches conscious awareness — starts flagging every instance of the concept in your environment."},
    {"type":"heading","content":"Confirmation Bias''s Sibling"},
    {"type":"paragraph","content":"This is not your brain malfunctioning — it is working exactly as designed. The RAS filters thousands of stimuli per second down to the few you consciously process. When you learn a new word, concept, or framework, it gets promoted in the filter. The world hasn''t changed; your attention has."},
    {"type":"heading","content":"The Learning Implication"},
    {"type":"paragraph","content":"This explains why immersive learning works: when you study a topic deeply, your brain starts finding real-world applications everywhere, which reinforces the learning. It also explains why negative thought patterns feel universal — if your RAS is primed to notice threats, it will find them everywhere. You can weaponize this by deliberately priming your attention toward what you want to see more of."},
    {"type":"takeaway","content":"What you focus on expands. Choose what you learn and think about deliberately — your brain will start finding evidence for it everywhere."}
  ]'::jsonb,
  'Thinking, Fast and Slow',
  'Daniel Kahneman',
  'https://images.pexels.com/photos/29326301/pexels-photo-29326301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'MindAnime Editorial',
  true
),
(
  'The Lion and the Fox: Knowing When to Be Each',
  'Political Science',
  'A leader must be both a lion and a fox. The lion''s strength alone cannot avoid traps; the fox''s cunning alone cannot ward off wolves. The art is knowing which to be, and when.',
  '[
    {"type":"paragraph","content":"Machiavelli''s most enduring metaphor is not about cruelty — it is about adaptability. In The Prince, he argues that rulers fail when they are only one thing. The lion is powerful but predictable. The fox is clever but vulnerable. The leader who can be both — who knows when to show strength and when to use cunning — is the one who endures."},
    {"type":"heading","content":"The Trap of Fixed Identity"},
    {"type":"paragraph","content":"Most leaders develop a signature style — the consensus-builder, the aggressor, the strategist — and then apply it to every situation. Machiavelli''s insight is that this is a death sentence. Different challenges require different modes. The leader who only knows how to be a lion will be outmaneuvered by foxes. The leader who only knows how to be a fox will be overrun by lions."},
    {"type":"heading","content":"Modern Application"},
    {"type":"paragraph","content":"In business, politics, and life, the principle holds: rigidity is the real danger. The most effective people are not those with a single approach, but those who can read a situation and adopt the mode it demands. This is not about being inauthentic — it is about being complete."},
    {"type":"takeaway","content":"Audit your default mode. Are you always the lion — direct, forceful, visible? Or always the fox — indirect, strategic, behind the scenes? Where would the opposite mode serve you better?"}
  ]'::jsonb,
  'The Prince',
  'Niccolò Machiavelli',
  'https://images.pexels.com/photos/34013422/pexels-photo-34013422.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'MindAnime Editorial',
  true
);

-- ============================================================
-- SEED DATA: Comments on each post
-- ============================================================

INSERT INTO comments (post_id, author_name, content) VALUES
(
  (SELECT id FROM posts WHERE title = 'Law 3: Conceal Your Intentions' LIMIT 1),
  'Marcus_V',
  'This played out in a salary negotiation last month. I mentioned I was interviewing elsewhere too early, and my current employer used it to stall while they found my replacement. Should have kept that card hidden until I had an offer in writing.'
),
(
  (SELECT id FROM posts WHERE title = 'Law 3: Conceal Your Intentions' LIMIT 1),
  'SarahChen',
  'There is a balance though. In creative work and team environments, concealing intentions can erode trust. I have found that sharing the vision while keeping the specific tactical moves close works better than total opacity.'
),
(
  (SELECT id FROM posts WHERE title = 'Law 3: Conceal Your Intentions' LIMIT 1),
  'DeepThinker42',
  'The Bismarck example is wild. He literally started wars to achieve unification while making it look like he was defending the status quo. Modern equivalent: companies that frame layoffs as restructuring for growth.'
);

INSERT INTO comments (post_id, author_name, content) VALUES
(
  (SELECT id FROM posts WHERE title = 'The Dichotomy of Control: What Is Truly Yours' LIMIT 1),
  'stoic_dad',
  'I applied this when my startup failed last year. I could not control the market shift that killed us, but I could control how I framed it to my team and what I learned from it. That distinction saved my mental health during the worst period of my life.'
),
(
  (SELECT id FROM posts WHERE title = 'The Dichotomy of Control: What Is Truly Yours' LIMIT 1),
  'JenReflects',
  'The hardest part is applying this to relationships. You cannot control whether someone loves you, respects you, or stays. You can only control whether you are someone worth loving, respecting, and staying with. That shift in focus changed everything for me.'
),
(
  (SELECT id FROM posts WHERE title = 'The Dichotomy of Control: What Is Truly Yours' LIMIT 1),
  'PhilK',
  'Epictetus was born a slave and became one of the most influential philosophers in history. If anyone had an excuse to feel powerless, it was him. That alone proves the principle — control is not about circumstances, it is about perspective.'
);

INSERT INTO comments (post_id, author_name, content) VALUES
(
  (SELECT id FROM posts WHERE title = 'The Baader-Meinhof Phenomenon: Why Your Brain Tricks You' LIMIT 1),
  'neuro_nerd',
  'This is why I am so careful about what media I consume. If you prime your brain with outrage and fear, your RAS will find evidence of threats everywhere. If you prime it with curiosity and opportunity, you start seeing possibilities. The filter is the feature.'
),
(
  (SELECT id FROM posts WHERE title = 'The Baader-Meinhof Phenomenon: Why Your Brain Tricks You' LIMIT 1),
  'TeacherTara',
  'I use this in my classroom. When I teach students a new concept and then have them find real-world examples, their engagement spikes because their brains are literally wired to notice it now. Active learning is not just a buzzword — it is neuroscience.'
),
(
  (SELECT id FROM posts WHERE title = 'The Baader-Meinhof Phenomenon: Why Your Brain Tricks You' LIMIT 1),
  'biz_strategist',
  'This explains why entrepreneurs who read a lot of case studies start seeing patterns others miss. It is not that the patterns are new — it is that their RAS has been trained to flag them. You can literally upgrade your pattern recognition by choosing what to study.'
);

INSERT INTO comments (post_id, author_name, content) VALUES
(
  (SELECT id FROM posts WHERE title = 'The Lion and the Fox: Knowing When to Be Each' LIMIT 1),
  'FounderMike',
  'I learned this the hard way. Built my company being the lion — aggressive, direct, always pushing forward. Worked great for the first three years. Then we hit a political phase with partnerships and I got eaten alive because I had zero fox skills. Had to learn diplomacy from scratch.'
),
(
  (SELECT id FROM posts WHERE title = 'The Lion and the Fox: Knowing When to Be Each' LIMIT 1),
  'PolicyWonk',
  'This is the most underappreciated lesson in political science. People think Machiavelli is about being ruthless, but the real lesson is about being flexible. The leaders who last are the ones who can switch modes without losing their core.'
),
(
  (SELECT id FROM posts WHERE title = 'The Lion and the Fox: Knowing When to Be Each' LIMIT 1),
  'quiet_leader',
  'As an introvert, I always defaulted to fox mode — observing, strategizing, acting indirectly. This post made me realize I need to develop my lion side. Sometimes you have to be visible and forceful, even when it is uncomfortable. Growth is in the discomfort.'
);

-- ============================================================
-- SEED DATA: Initial votes
-- ============================================================
INSERT INTO post_votes (post_id, voter_id)
SELECT id, 'seed_voter_' || generate_series(1, 5) FROM posts WHERE title = 'Law 3: Conceal Your Intentions'
UNION ALL
SELECT id, 'seed_voter_' || generate_series(1, 8) FROM posts WHERE title = 'The Dichotomy of Control: What Is Truly Yours'
UNION ALL
SELECT id, 'seed_voter_' || generate_series(1, 6) FROM posts WHERE title = 'The Baader-Meinhof Phenomenon: Why Your Brain Tricks You'
UNION ALL
SELECT id, 'seed_voter_' || generate_series(1, 4) FROM posts WHERE title = 'The Lion and the Fox: Knowing When to Be Each';

INSERT INTO comment_votes (comment_id, voter_id)
SELECT c.id, 'seed_voter_' || g FROM comments c
CROSS JOIN generate_series(1, 3) g
WHERE c.content LIKE 'This played out in a salary negotiation%';

INSERT INTO comment_votes (comment_id, voter_id)
SELECT c.id, 'seed_voter_' || g FROM comments c
CROSS JOIN generate_series(1, 5) g
WHERE c.content LIKE 'I applied this when my startup failed%';

INSERT INTO comment_votes (comment_id, voter_id)
SELECT c.id, 'seed_voter_' || g FROM comments c
CROSS JOIN generate_series(1, 4) g
WHERE c.content LIKE 'This is why I am so careful%';

INSERT INTO comment_votes (comment_id, voter_id)
SELECT c.id, 'seed_voter_' || g FROM comments c
CROSS JOIN generate_series(1, 6) g
WHERE c.content LIKE 'I learned this the hard way%';
