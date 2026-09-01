/*
# Create lessons and quotes tables for MindAnime wisdom platform

## Overview
MindAnime is a curated wisdom & insights platform. This migration creates the core
content tables: daily expert lessons (with structured reflection prompts) and a
motivational/philosophy quote engine with analytical commentary.

## New Tables

### lessons
- `id` (uuid, primary key)
- `title` (text) — lesson headline
- `category` (text) — one of: Business & Strategy, Leadership, Education, Life Strategy, Mental Toughness
- `excerpt` (text) — short summary shown in the feed
- `body` (jsonb) — structured content: array of sections {type: "paragraph"|"heading"|"takeaway", content: string}
- `source_title` (text) — book or masterclass name
- `source_author` (text) — author or thinker
- `published_date` (date) — which day this lesson appears
- `display_order` (int) — ordering within a day
- `prompts` (jsonb) — array of {question: string} reflection prompts
- `reading_time` (int) — estimated minutes
- `created_at` (timestamp)

### quotes
- `id` (uuid, primary key)
- `text` (text) — the quote
- `author` (text) — attributed source
- `commentary` (text) — short analytical commentary
- `category` (text) — topic category
- `published_date` (date) — which day this quote appears
- `created_at` (timestamp)

## Security
- Both tables are read-only curated content (no user-generated content in DB).
- RLS enabled on both tables.
- SELECT-only policy for anon + authenticated (public read, no writes).
- User reflections are stored in localStorage (personal, per-browser).
*/

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  excerpt text NOT NULL,
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_title text,
  source_author text,
  published_date date NOT NULL DEFAULT CURRENT_DATE,
  display_order int NOT NULL DEFAULT 0,
  prompts jsonb NOT NULL DEFAULT '[]'::jsonb,
  reading_time int NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_lessons" ON lessons;
CREATE POLICY "public_read_lessons" ON lessons FOR SELECT
  TO anon, authenticated USING (true);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL,
  commentary text NOT NULL,
  category text NOT NULL,
  published_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_quotes" ON quotes;
CREATE POLICY "public_read_quotes" ON quotes FOR SELECT
  TO anon, authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lessons_published_date ON lessons(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);
CREATE INDEX IF NOT EXISTS idx_quotes_published_date ON quotes(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_category ON quotes(category);

-- ============================================================
-- SEED DATA: Lessons (8 lessons across 5 categories)
-- ============================================================

INSERT INTO lessons (title, category, excerpt, body, source_title, source_author, published_date, display_order, prompts, reading_time) VALUES
(
  'The Compound Effect of Small Decisions',
  'Business & Strategy',
  'Great outcomes are rarely the result of a single bold move. They are the accumulated weight of hundreds of small, almost invisible choices made consistently over time.',
  '[
    {"type":"paragraph","content":"The most successful strategies are not spectacular — they are systematic. Darren Hardy''s central insight in The Compound Effect is that small, seemingly insignificant choices, repeated daily, create exponential results over time. A 1% improvement each day compounds into a 37x gain over a year."},
    {"type":"heading","content":"The Three Levers"},
    {"type":"paragraph","content":"Hardy identifies three levers that drive compounding outcomes: choices, habits, and momentum. Choices are the raw material — every decision either moves you toward or away from your goal. Habits are choices on autopilot, and momentum is what happens when habits stack. The gap between people who succeed and those who stall is rarely talent; it is the willingness to make the unglamorous choice repeatedly."},
    {"type":"heading","content":"Why This Matters for Strategy"},
    {"type":"paragraph","content":"In business, leaders often chase the big pivot — the rebrand, the acquisition, the product launch. But the compound effect suggests that the daily operating choices — how you respond to a customer complaint, whether you ship on time, how you run a meeting — are what actually determine trajectory. A company that improves its onboarding by 1% each week will outperform one waiting for the perfect strategy doc."},
    {"type":"takeaway","content":"Stop looking for the single transformative move. Audit your daily decisions instead. Ask: what is one small choice I can make today that, repeated for a year, would materially change my outcomes?"}
  ]'::jsonb,
  'The Compound Effect',
  'Darren Hardy',
  CURRENT_DATE,
  1,
  '[{"question":"What is one small, unglamorous decision you avoid making daily that, if repeated for a year, would significantly change your results?"},{"question":"Where in your work or life are you waiting for a big breakthrough instead of compounding small wins?"}]'::jsonb,
  5
),
(
  'Leading Through Uncertainty: The Stockdale Paradox',
  'Leadership',
  'The leaders who navigate chaos best are not the optimists. They are the ones who hold two contradictory truths at once: brutal honesty about the present and unwavering faith in the outcome.',
  '[
    {"type":"paragraph","content":"Admiral James Stockdale spent eight years as a prisoner of war in Vietnam. When author Jim Collins asked him who didn''t survive the camps, Stockdale gave a surprising answer: the optimists. The ones who said ''we''ll be out by Christmas'' and then weren''t died of a broken heart. The ones who survived faced the brutal facts head-on while never losing faith that they would prevail."},
    {"type":"heading","content":"The Paradox in Practice"},
    {"type":"paragraph","content":"Collins distilled this into the Stockdale Paradox: you must retain faith that you will prevail in the end, while confronting the most brutal facts of your current reality. In leadership, this means refusing to sugarcoat bad news while refusing to surrender to it. A leader who only sees the positive loses credibility when reality bites. A leader who only sees the negative kills morale. The skill is holding both."},
    {"type":"heading","content":"Application"},
    {"type":"paragraph","content":"When your team faces a crisis — a missed quarter, a key departure, a market shift — the temptation is to either reassure everyone everything is fine or to spiral into worst-case planning. Neither serves your people. The Stockdale approach is to name the reality clearly (''we missed our target by 30%'') while holding the vision (''and we have the team and plan to recover''). People follow leaders who are honest about the climb and certain about the summit."},
    {"type":"takeaway","content":"Next time you face a setback, resist the urge to either minimize it or catastrophize it. Name it precisely. Then reaffirm, with specific reasons, why you will get through it."}
  ]'::jsonb,
  'Good to Great',
  'Jim Collins',
  CURRENT_DATE,
  2,
  '[{"question":"What is a difficult reality in your life or work that you have been softening or avoiding? What would it look like to confront it honestly today?"},{"question":"On a scale of naive optimism to paralyzing pessimism, where do you land when things go wrong? What would the Stockdale middle ground look like for you?"}]'::jsonb,
  6
),
(
  'The Feynman Technique: Learning by Teaching',
  'Education',
  'If you can''t explain it simply, you don''t understand it well enough. The fastest path to mastery is trying to teach what you''re learning to someone who knows nothing about it.',
  '[
    {"type":"paragraph","content":"Richard Feynman, Nobel Prize-winning physicist, believed that the true test of understanding is the ability to explain something in plain language. His technique has four steps: pick a concept, explain it as if teaching a child, identify the gaps in your explanation, and simplify further."},
    {"type":"heading","content":"Why It Works"},
    {"type":"paragraph","content":"Most learning is recognition, not understanding. You read something, it feels familiar, and you mistake that familiarity for mastery. The Feynman Technique breaks this illusion. When you try to explain a concept without jargon, you immediately hit the exact points where your understanding is shallow. Those gaps are where real learning happens."},
    {"type":"heading","content":"Beyond Memorization"},
    {"type":"paragraph","content":"In education and self-study alike, the trap is passive consumption — highlighting, re-reading, watching lectures. These feel productive but produce fragile knowledge. Active recall and explanation build durable mental models. If you are studying a new skill, a market, or a management framework, try writing a one-page explanation for someone outside your field. The parts you struggle with are your study guide."},
    {"type":"takeaway","content":"Pick something you are currently learning. Write a simple explanation of it as if for a 12-year-old. Wherever you reach for jargon or get stuck, that is what you need to study next."}
  ]'::jsonb,
  'Surely You''re Joking, Mr. Feynman!',
  'Richard Feynman',
  CURRENT_DATE,
  3,
  '[{"question":"What is something you believe you understand well? Try explaining it in plain language right now — where do you get stuck?"},{"question":"How much of your current learning is passive (reading, watching) versus active (explaining, building, teaching)? What would shift that balance?"}]'::jsonb,
  5
),
(
  'The Art of Strategic Quitting',
  'Life Strategy',
  'Knowing when to walk away is not failure — it is the most underrated skill in life. The cost of sticking with the wrong path is measured in years, not moments.',
  '[
    {"type":"paragraph","content":"Annie Duke, former professional poker player and decision scientist, argues that we have a quitting problem — but not the one we think. The cultural narrative celebrates persistence and stigmatizes quitting, yet both are simply decisions under uncertainty. The real skill is knowing which to choose."},
    {"type":"heading","content":"Sunk Cost vs. Opportunity Cost"},
    {"type":"paragraph","content":"The sunk cost fallacy keeps people in bad situations because they''ve already invested time, money, or identity. But those resources are gone regardless of what you do next. The only question that matters is: given where I am now, is continuing this path the best use of my future time and energy? Duke found that the most successful people are not the ones who never quit — they are the ones who quit quickly and decisively when the evidence says they should."},
    {"type":"heading","content":"The Identity Trap"},
    {"type":"paragraph","content":"Quitting is hardest when it threatens identity. ''I''m a lawyer,'' ''I''m a founder,'' ''I''m someone who finishes what I start.'' These labels make quitting feel like self-betrayal. But identity built on a single role is fragile. The most resilient people hold their identity loosely enough to walk away from a path that no longer serves them — and to see that as growth, not failure."},
    {"type":"takeaway","content":"Identify one commitment in your life — a project, role, or goal — that you are continuing mainly because of what you''ve already invested. Ask: if I were starting fresh today, would I choose this? If not, what is the cost of staying?"}
  ]'::jsonb,
  'Quit: The Power of Knowing When to Walk Away',
  'Annie Duke',
  CURRENT_DATE,
  4,
  '[{"question":"What is something you are continuing right now primarily because of past investment? If you started fresh today, would you still choose it?"},{"question":"What identity or label is making it hard for you to walk away from something that isn''t working?"}]'::jsonb,
  6
),
(
  'Building Mental Toughness: The 40% Rule',
  'Mental Toughness',
  'When your mind says you are done, you are actually only 40% done. The wall you hit is not a physical limit — it is a mental one your brain erects to keep you in your comfort zone.',
  '[
    {"type":"paragraph","content":"David Goggins, former Navy SEAL and ultramarathon runner, discovered that the first signal to stop — the moment your brain says ''I can''t'' — typically arrives when you have used only about 40% of your actual capacity. Your brain is wired to conserve energy, and it sends the quit signal early to protect you from perceived exhaustion."},
    {"type":"heading","content":"The Governor in Your Mind"},
    {"type":"paragraph","content":"This is not about pushing through injury or ignoring real pain. It is about recognizing that most limits are negotiated, not real. The feeling of being tapped out is often your brain''s governor — a safety mechanism that kicks in well before true physical failure. The difference between people who break through and those who break down is the ability to sit with that discomfort and push the boundary one step further."},
    {"type":"heading","content":"Callousing the Mind"},
    {"type":"paragraph","content":"Goggins describes mental toughness as a callous — built through repeated, voluntary exposure to discomfort. You don''t develop it by reading about it. You develop it by choosing the hard thing when the easy thing is available: the cold shower, the extra set, the difficult conversation, the early alarm. Each small victory over your own resistance thickens the callous. Over time, what once felt unbearable becomes merely uncomfortable, and what felt impossible becomes routine."},
    {"type":"takeaway","content":"The next time your mind tells you to stop, recognize it as the 40% signal. Push 10% further than you think you can — not to prove a point, but to recalibrate your sense of what is possible."}
  ]'::jsonb,
  'Can''t Hurt Me',
  'David Goggins',
  CURRENT_DATE,
  5,
  '[{"question":"Where in your life do you stop at the first signal of discomfort? What would pushing 10% further look like in that area?"},{"question":"What is one voluntary hardship you could choose this week to build your mental callous?"}]'::jsonb,
  5
),
(
  'The Power of Constraints: Why Less Is More',
  'Business & Strategy',
  'The best strategies are not about doing more. They are about choosing what not to do — and letting the constraint force the creativity that abundance never could.',
  '[
    {"type":"paragraph","content":"When Twitter launched with a 140-character limit, critics called it absurd. But that constraint became the product. When Ingvar Kamprad founded IKEA, he turned the expense of shipping into flat-pack furniture — a constraint that became a global empire. Constraints are not the enemy of creativity; they are its catalyst."},
    {"type":"heading","content":"The Abundance Trap"},
    {"type":"paragraph","content":"Unlimited resources breed mediocrity. When you can do anything, you rarely do the one thing that matters. Marissa Mayer, early Google leader, observed that creativity loves constraints — they focus the mind and force trade-offs. A team with infinite budget and time will explore every option. A team with three weeks and a clear deadline will find the essential path."},
    {"type":"heading","content":"Strategic Constraint as a Tool"},
    {"type":"paragraph","content":"The most effective leaders impose constraints deliberately. They cut features to ship faster. They limit scope to increase quality. They set impossible deadlines to force prioritization. If your strategy includes everything, it includes nothing. The question is not ''what can we do?'' but ''what are we willing to give up?'' Strategy, as Michael Porter said, is about choosing to be different — which requires the courage to say no to good opportunities."},
    {"type":"takeaway","content":"Look at your current priorities. If you could only do one thing next quarter, what would it be? Now ask: what are you currently doing that does not serve that one thing?"}
  ]'::jsonb,
  'Good Strategy Bad Strategy',
  'Richard Rumelt',
  CURRENT_DATE - 1,
  1,
  '[{"question":"If you could only pursue one priority next quarter, what would it be? What are you currently spending time on that does not serve it?"},{"question":"Where has abundance — too many options, too much budget, too much time — actually made you less effective?"}]'::jsonb,
  5
),
(
  'Radical Candor: Caring Personally While Challenging Directly',
  'Leadership',
  'The best bosses care about you personally and tell you the truth directly. The worst combine the opposite — they either destroy you with honesty or smother you with fake kindness.',
  '[
    {"type":"paragraph","content":"Kim Scott, former Google and Apple executive, developed a framework she calls Radical Candor: the intersection of caring personally and challenging directly. It is the sweet spot where feedback is both honest and humane — where you tell someone the hard truth because you respect them enough to do so."},
    {"type":"heading","content":"The Four Quadrants"},
    {"type":"paragraph","content":"Scott maps feedback onto two axes: caring personally (vertical) and challenging directly (horizontal). When both are high, you get Radical Candor. When you challenge without caring, you get Obnoxious Aggression — brutal honesty that damages trust. When you care without challenging, you get Ruinous Empathy — being nice while letting people fail. When you do neither, you get Manipulative Insincerity — smiling to your face while talking behind your back."},
    {"type":"heading","content":"The Ruinous Empathy Trap"},
    {"type":"paragraph","content":"Most managers default to Ruinous Empathy because it feels kind. You avoid the hard conversation to spare feelings, but the person never gets the feedback they need to grow. The kindest thing you can do is tell someone the truth early, while there is still time to act on it. The goal is not to be harsh — it is to be clear. Clarity is an act of respect. Vagueness, dressed up as politeness, is a form of abandonment."},
    {"type":"takeaway","content":"Think of someone you are holding back feedback from. What is the cost to them of your silence? Have the conversation this week — lead with care, but do not dilute the message."}
  ]'::jsonb,
  'Radical Candor',
  'Kim Scott',
  CURRENT_DATE - 1,
  2,
  '[{"question":"Who in your life are you sparing from a hard truth right now? What is the cost to them of your silence?"},{"question":"Do you tend toward brutal honesty or ruinous empathy? What would the Radical Candor middle ground look like in your next difficult conversation?"}]'::jsonb,
  6
),
(
  'Antifragility: How to Gain from Disorder',
  'Mental Toughness',
  'Some things benefit from shocks, volatility, and stress. The opposite of fragile is not robust — it is antifragile. The question is not how to survive chaos, but how to grow from it.',
  '[
    {"type":"paragraph","content":"Nassim Nicholas Taleb introduces a third state beyond fragile and robust. A fragile thing breaks under stress. A robust thing resists stress. An antifragile thing gets stronger from stress. Your bones, your immune system, and your muscles are antifragile — they require stress to maintain and grow. Without it, they atrophy."},
    {"type":"heading","content":"The Barbell Strategy"},
    {"type":"paragraph","content":"Taleb recommends the barbell strategy for building antifragility: combine extreme safety on one side with small, high-upside risks on the other. Keep 90% of your resources in ultra-safe assets. Put 10% in high-risk, high-reward bets. You are protected from catastrophic loss while maintaining exposure to asymmetric upside. The middle ground — moderate risk — gives you neither safety nor upside."},
    {"type":"heading","content":"Skin in the Game"},
    {"type":"paragraph","content":"Antifragility requires what Taleb calls skin in the game — exposure to both upside and downside. A system where decision-makers are insulated from consequences becomes fragile over time. In your own life, this means choosing situations where you bear the cost of being wrong and capture the benefit of being right. Advice from someone with nothing to lose is worth what they paid for it. Build your life so that stress makes you stronger, not weaker — and so that you are exposed enough to reality to keep learning from it."},
    {"type":"takeaway","content":"Identify one area of your life that is currently over-protected from stress. What small, controlled dose of volatility could you introduce to make it stronger over time?"}
  ]'::jsonb,
  'Antifragile',
  'Nassim Nicholas Taleb',
  CURRENT_DATE - 1,
  3,
  '[{"question":"What is one area of your life that is over-protected from stress or difficulty? How might a small, controlled dose of volatility make it stronger?"},{"question":"Where in your life do you have no skin in the game — benefiting from upside without bearing any downside? Is that sustainable?"}]'::jsonb,
  6
);

-- ============================================================
-- SEED DATA: Quotes (10 quotes with commentary)
-- ============================================================

INSERT INTO quotes (text, author, commentary, category, published_date) VALUES
(
  'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
  'Aristotle',
  'Aristotle understood 2,300 years before behavioral psychology confirmed it: identity is not declared, it is accumulated. You do not become excellent by performing excellently once. You become excellent by making excellence the default — the thing you do when no one is watching, when it is hard, when there is no audience to applaud.',
  'Life Strategy',
  CURRENT_DATE
),
(
  'The impediment to action advances action. What stands in the way becomes the way.',
  'Marcus Aurelius',
  'This is the heart of Stoic philosophy: the obstacle is not a detour from your path — it is the path. The difficulty you are avoiding is the curriculum you need. Marcus Aurelius, emperor of Rome, wrote this as a personal reminder during war and plague. He was not theorizing. He was surviving.',
  'Mental Toughness',
  CURRENT_DATE
),
(
  'Strategy is about making choices, trade-offs. It''s about deliberately choosing to be different.',
  'Michael Porter',
  'Porter cuts through the fog of corporate strategy: if your plan does not involve saying no to something, it is not a strategy — it is a wish list. Real strategy is painful because it means closing doors. The discomfort of choosing is what makes the choice valuable.',
  'Business & Strategy',
  CURRENT_DATE
),
(
  'The function of education is to teach one to think intensively and to think critically. Intelligence plus character — that is the goal of true education.',
  'Martin Luther King Jr.',
  'King separates schooling from education. Schooling fills the mind. Education shapes the person. In an age of infinite information, the ability to think critically is the only skill that does not depreciate — because it is the skill that evaluates all other skills.',
  'Education',
  CURRENT_DATE
),
(
  'The most common way people give up their power is by thinking they don''t have any.',
  'Alice Walker',
  'Walker identifies the deepest form of disempowerment: not the loss of power, but the forgetting that you had it. Before any external force can limit you, you must first agree that you are limited. The moment you reclaim agency — even in a small decision — the chain weakens.',
  'Life Strategy',
  CURRENT_DATE
),
(
  'A leader is best when people barely know he exists. When his work is done, his aim fulfilled, they will say: we did it ourselves.',
  'Lao Tzu',
  'Written 2,500 years ago, this remains the most counterintuitive truth about leadership: the best leaders are invisible. They build systems and people that function without them. The leader who must be present for things to work has not led — they have created dependency.',
  'Leadership',
  CURRENT_DATE
),
(
  'He who has a why to live can bear almost any how.',
  'Friedrich Nietzsche',
  'Nietzsche, often misread as a nihilist, was actually writing about purpose as the ultimate endurance mechanism. Viktor Frankl confirmed this in Auschwitz: the prisoners who survived were not the physically strongest but those who held a reason to. Meaning is not a luxury — it is a survival tool.',
  'Mental Toughness',
  CURRENT_DATE
),
(
  'The best time to plant a tree was 20 years ago. The second best time is now.',
  'Chinese Proverb',
  'A simple refutation of regret and procrastination in one line. The past is unrecoverable, and lamenting it is the only truly wasted time. The question is never ''should I have started sooner?'' — it is always ''will I start now?''',
  'Life Strategy',
  CURRENT_DATE
),
(
  'In the middle of difficulty lies opportunity.',
  'Albert Einstein',
  'Einstein was not just describing optimism — he was describing physics. Every system under stress creates gradients, and gradients create potential. The crisis you are in is not blocking your opportunity; it is the pressure that is forming it. The work is to see it before the pressure releases.',
  'Business & Strategy',
  CURRENT_DATE
),
(
  'Tell me and I forget. Teach me and I remember. Involve me and I learn.',
  'Benjamin Franklin',
  'Franklin, self-taught polymath, identified the hierarchy of learning 200 years before educational research caught up. Passive reception fades. Active engagement endures. The lesson: if you want to learn something deeply, do not just study it — build it, teach it, or live it.',
  'Education',
  CURRENT_DATE - 1
);
