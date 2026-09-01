/*
# Seed 22 Deep Wisdom Cards

## Overview
Seeds the posts table with 22 rich, long-form curated cards across four
specialized categories. Each card includes:
- Key Insight / Concept Title (post title)
- Historical / Literary Source Context (source_title + source_author)
- Body sections: paragraph context, heading, paragraph analysis, takeaway,
  application (real-world), steps (actionable), resources (free links)

## Categories
1. Human Behavior & Psychology (8 cards)
2. Power Dynamics & Strategy (7 cards)
3. Wealth Creation & Economics (4 cards)
4. Singularity & Future Tech (3 cards)
*/

DO $$
DECLARE
  v_img_psych text := 'https://images.pexels.com/photos/3022717/pexels-photo-3022717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  v_img_power text := 'https://images.pexels.com/photos/5426418/pexels-photo-5426418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  v_img_wealth text := 'https://images.pexels.com/photos/4024211/pexels-photo-4024211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  v_img_tech text := 'https://images.pexels.com/photos/22866319/pexels-photo-22866319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  v_img_alt1 text := 'https://images.pexels.com/photos/38454106/pexels-photo-38454106.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  v_img_alt2 text := 'https://images.pexels.com/photos/5493069/pexels-photo-5493069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
BEGIN
-- ============================================================
-- HUMAN BEHAVIOR & PSYCHOLOGY (8 cards)
-- ============================================================

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'The 48 Laws of Power: Never Outshine the Master',
  'Human Behavior & Psychology',
  'Make those above you feel comfortably superior. In your desire to please and impress, do not boast too much or overshadow your patrons.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Robert Greene''s first law of power is a warning about the human ego. Those in positions of authority carry a deep need to feel superior. When you demonstrate greater competence or brilliance, you trigger insecurity and resentment — even if your intent was to help.'),
    jsonb_build_object('type','heading','content','The Psychology Behind It'),
    jsonb_build_object('type','paragraph','content','This law is rooted in what psychologists call narcissistic injury. When someone''s sense of self-worth is threatened by a subordinate''s brilliance, their reaction is rarely gratitude — it is often covert sabotage. Galileo Galilei learned this fatally when his patron, Pope Urban VIII, turned against him after feeling intellectually humiliated.'),
    jsonb_build_object('type','takeaway','content','Never let your brilliance become a threat to someone''s ego. The insecure will punish you for making them feel small, no matter how right you are.'),
    jsonb_build_object('type','application','content','In a workplace, if your manager takes credit for your idea, do not correct them publicly. Instead, find subtle ways to make them look good while privately building your own reputation with people who have no ego stake in diminishing you.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Identify the ego of anyone above you and avoid triggering it',
      'Let your superiors shine in public; save your best ideas for private moments or your own projects',
      'Give credit upward generously — make them feel the success was theirs',
      'Build independent credibility with allies who are not in your direct chain of command'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The Prince by Machiavelli (Free PDF)','url','https://www.gutenberg.org/ebooks/1232'),
      jsonb_build_object('label','48 Laws of Power — Summary Archive','url','https://www.youtube.com/results?search_query=48+laws+of+power+summary')
    ))
  ),
  'The 48 Laws of Power',
  'Robert Greene',
  v_img_power,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Machiavellian Realism: It Is Better to Be Feared Than Loved',
  'Human Behavior & Psychology',
  'Love is held by a chain of obligation which, because men are wicked, is broken whenever it serves their purpose. Fear is held by a dread of punishment that never fails.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Niccolò Machiavelli''s most famous and most misunderstood principle. He did not advocate cruelty — he advocated reliability. Love is conditional and fickle; fear is predictable and within your control. The key insight is about which emotion gives you more leverage over human behavior.'),
    jsonb_build_object('type','heading','content','The Historical Context'),
    jsonb_build_object('type','paragraph','content','Writing in 1513, Machiavelli observed the Italian city-states constantly betraying one another. He concluded that leaders who relied on affection were overthrown the moment affection became inconvenient. Cesare Borgia, who ruled through fear, maintained order until his own miscalculation — not a rebellion — undid him.'),
    jsonb_build_object('type','takeaway','content','You can control how people fear you. You cannot control how people love you. Build your influence on what you can sustain, not what others choose to give.'),
    jsonb_build_object('type','application','content','As a founder or manager, you do not need to be cruel to be feared. It means being consistent, having clear boundaries, and ensuring people know there are real consequences for violating agreements. A team that respects consequences is more reliable than a team that merely likes you.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Establish clear rules and consequences before they are needed',
      'Enforce consequences consistently — unpredictability destroys fear-based respect',
      'Avoid being hated: never take someone''s property or family, as Machiavelli warned',
      'Balance fear with competence — people must also believe you can deliver results'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The Prince by Machiavelli (Project Gutenberg)','url','https://www.gutenberg.org/ebooks/1232'),
      jsonb_build_object('label','Discourses on Livy by Machiavelli (Free)','url','https://www.gutenberg.org/ebooks/10827')
    ))
  ),
  'The Prince',
  'Niccolò Machiavelli',
  v_img_alt1,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Cognitive Biases: The Confirmation Bias Trap',
  'Human Behavior & Psychology',
  'We do not see the world as it is. We see the world as we expect it to be — and we aggressively filter out anything that contradicts our beliefs.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Confirmation bias is the tendency to search for, interpret, and remember information that confirms our pre-existing beliefs while ignoring or discounting evidence that contradicts them. It is the most pervasive cognitive bias and the root cause of most poor decisions.'),
    jsonb_build_object('type','heading','content','How It Warps Your Judgment'),
    jsonb_build_object('type','paragraph','content','When you hold a belief, your brain treats contradictory evidence like a threat. Studies by Kahneman and Tversky showed that people given mixed evidence on a topic became more polarized, not less — they used the disconfirming evidence to reinforce their original position through motivated reasoning.'),
    jsonb_build_object('type','takeaway','content','Your brain is not a truth-seeking machine. It is a belief-protecting machine. To find truth, you must actively hunt for evidence that proves you wrong.'),
    jsonb_build_object('type','application','content','Before making any important decision — hiring, investing, strategy — write down three reasons your current conclusion might be wrong. Then find someone who disagrees with you and listen to them without arguing back. You will discover blind spots you did not know existed.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Write down your belief and the evidence you think supports it',
      'Actively search for evidence AGAINST your position for 10 minutes',
      'Find one person who disagrees and ask them to make their strongest case',
      'Assign a devil''s advocate on your team for major decisions',
      'Track your past predictions and review where you were wrong'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Thinking Fast and Slow — Kahneman Lecture','url','https://www.youtube.com/results?search_query=kahneman+thinking+fast+slow+lecture'),
      jsonb_build_object('label','Kahneman & Tversky Original Papers Archive','url','https://www.behaviouraldesign.com/series/kahneman-tversky')
    ))
  ),
  'Thinking, Fast and Slow',
  'Daniel Kahneman',
  v_img_psych,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'The Dark Triad: Understanding Manipulative Personalities',
  'Human Behavior & Psychology',
  'Three personality traits — narcissism, Machiavellianism, and psychopathy — cluster together in people who manipulate others with chilling effectiveness.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','The Dark Triad is a psychological framework identifying three overlapping traits: narcissism (grandiosity and entitlement), Machiavellianism (strategic manipulation), and psychopathy (lack of empathy and remorse). Understanding these traits is essential for recognizing manipulative behavior in personal and professional life.'),
    jsonb_build_object('type','heading','content','Why It Matters'),
    jsonb_build_object('type','paragraph','content','Research by Delroy Paulhus and Kevin Williams (2002) showed that Dark Triad individuals are overrepresented in leadership positions. They are charismatic, confident, and strategic — but they leave destruction in their wake. Learning to identify these traits protects you from being manipulated.'),
    jsonb_build_object('type','takeaway','content','Not everyone who is charming is trustworthy. The most dangerous manipulators combine warmth with a complete absence of genuine empathy. Watch what they do, not what they say.'),
    jsonb_build_object('type','application','content','If someone consistently flatters you, isolates you from other relationships, and creates situations where you owe them — you may be dealing with a Dark Triad personality. The defense is to maintain multiple independent relationships, document interactions, and never let anyone become your sole source of validation or information.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Watch for the gap between words and actions — manipulators say what you want to hear',
      'Maintain multiple independent relationships so no one can isolate you',
      'Document commitments and agreements in writing',
      'Trust your discomfort — if something feels off, it probably is',
      'Set firm boundaries early and observe how they respond to the word no'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Paulhus & Williams Dark Triad Study (Open Access)','url','https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3323800/'),
      jsonb_build_object('label','The Art of Seduction by Robert Greene (Summary)','url','https://www.youtube.com/results?search_query=art+of+seduction+robert+greene+summary')
    ))
  ),
  'The 48 Laws of Power',
  'Robert Greene',
  v_img_alt2,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Stoic Emotional Regulation: The Dichotomy of Control',
  'Human Behavior & Psychology',
  'Some things are within your control. Some things are not. Suffering comes from failing to distinguish between the two.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Epictetus taught that all suffering stems from trying to control what is beyond your control — other people''s opinions, external events, outcomes — while neglecting what is fully within your control: your own thoughts, judgments, and reactions.'),
    jsonb_build_object('type','heading','content','The Core Framework'),
    jsonb_build_object('type','paragraph','content','Marcus Aurelius, the Roman Emperor, practiced this daily in his Meditations. He wrote reminders to himself that even as emperor, he could not control whether people respected him — only whether he conducted himself with integrity. This internal locus of control is the foundation of psychological resilience.'),
    jsonb_build_object('type','takeaway','content','You cannot control what happens to you. You can only control how you respond. Freedom is not the absence of constraints — it is mastery of your own reactions.'),
    jsonb_build_object('type','application','content','When you feel anxious or frustrated, ask: Is this within my control? If yes, take action. If no, practice acceptance. This simple question, asked consistently, reduces chronic stress by redirecting energy from futile worry to productive response.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'When stressed, write down what is bothering you',
      'Split the list into in my control and not in my control',
      'Cross out the things you cannot control — literally, with a pen',
      'Take one concrete action on something you can control',
      'Practice this daily until it becomes automatic'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Meditations by Marcus Aurelius (Free PDF)','url','https://www.gutenberg.org/ebooks/2680'),
      jsonb_build_object('label','Enchiridion by Epictetus (Free PDF)','url','https://www.gutenberg.org/ebooks/45116')
    ))
  ),
  'Meditations',
  'Marcus Aurelius',
  v_img_psych,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Mental Models: The Charlie Munger Approach to Thinking',
  'Human Behavior & Psychology',
  'You must know the big ideas in all the major disciplines and use them routinely — not just one or two from your own field.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Charlie Munger, Warren Buffett''s long-time partner, advocated building a latticework of mental models — core concepts from psychology, biology, physics, economics, and history — to make better decisions. The key insight: most problems are best solved by combining frameworks from multiple disciplines, not by deep expertise in one.'),
    jsonb_build_object('type','heading','content','Why Single-Discipline Thinking Fails'),
    jsonb_build_object('type','paragraph','content','Munger observed that experts in one field tend to hammer every problem with their single tool. To the man with a hammer, everything looks like a nail. The solution is to learn the fundamental models from each major discipline and apply them in combination.'),
    jsonb_build_object('type','takeaway','content','Expertise in one field is a liability if it makes you blind to solutions from other fields. Build a toolkit of mental models across disciplines and use them in combination.'),
    jsonb_build_object('type','application','content','When facing a business problem, ask: What would a biologist, a psychologist, and an economist each say about this? Each discipline brings a different lens. The combination of perspectives reveals solutions that no single field would produce alone.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Learn the 100 most important mental models across major disciplines',
      'For each problem, identify which 2-3 models apply most directly',
      'Avoid the hammer tendency — force yourself to consider models outside your expertise',
      'Review your past decisions and identify which models you missed',
      'Build a personal checklist of models for recurring decision types'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Poor Charlie''s Almanack (Free Summary)','url','https://www.youtube.com/results?search_query=poor+charlie+almanack+summary'),
      jsonb_build_object('label','Farnam Street Mental Models Blog','url','https://fs.blog/mental-models/')
    ))
  ),
  'Poor Charlie''s Almanack',
  'Charlie Munger',
  v_img_alt1,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'The Sunk Cost Fallacy: Knowing When to Walk Away',
  'Human Behavior & Psychology',
  'The more you invest in something, the harder it becomes to abandon — even when abandoning is clearly the right decision.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','The sunk cost fallacy is the tendency to continue investing in a losing course of action because of previously invested resources — time, money, or effort. It is one of the most expensive cognitive biases in business and in life.'),
    jsonb_build_object('type','heading','content','The Psychology'),
    jsonb_build_object('type','paragraph','content','Research shows that admitting a sunk cost feels like admitting failure. The ego protects itself by doubling down. This is why people stay in bad relationships, failing businesses, and declining careers far longer than rational analysis would suggest.'),
    jsonb_build_object('type','takeaway','content','Past investments are gone. The only question that matters is: given where I am now, is this the best use of my next dollar, hour, or day?'),
    jsonb_build_object('type','application','content','Before continuing any project, ask: If I were starting fresh today with no prior investment, would I choose this? If the answer is no, the prior investment is irrelevant — it is a sunk cost. Walking away frees resources for better opportunities.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'List all resources already invested (time, money, emotional energy)',
      'Ask: If I were starting today, would I choose this path?',
      'If no, calculate the cost of continuing vs. the cost of leaving',
      'Set a pre-commitment exit point for future projects before you invest',
      'Practice on small decisions first — cancel a subscription you do not use'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Sunk Cost Fallacy — Behavioral Economics Overview','url','https://www.behavioraleconomics.com/resources/mini-encyclopedia-of-be/sunk-cost-fallacy/'),
      jsonb_build_object('label','Kahneman on Loss Aversion (Nobel Lecture)','url','https://www.nobelprize.org/prizes/economic-sciences/2002/kahneman/lecture/')
    ))
  ),
  'Thinking, Fast and Slow',
  'Daniel Kahneman',
  v_img_psych,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'The Halo Effect: Why Attractive People Get Away With More',
  'Human Behavior & Psychology',
  'One positive trait — physical attractiveness, charisma, or a single impressive achievement — colors our judgment of everything else about a person.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','The Halo Effect is a cognitive bias where a single positive impression of a person influences our assessment of their unrelated qualities. We assume attractive people are smarter, kinder, and more competent — even when we have zero evidence for those conclusions.'),
    jsonb_build_object('type','heading','content','The Research'),
    jsonb_build_object('type','paragraph','content','Psychologist Edward Thorndike documented this in 1920 after observing that military officers rated certain soldiers as superior in every trait — physical, intellectual, and character — based on a single positive impression. The effect has been replicated hundreds of times since.'),
    jsonb_build_object('type','takeaway','content','Never evaluate a person, a product, or a company based on one impressive quality. Judge each dimension independently, or you will be systematically deceived.'),
    jsonb_build_object('type','application','content','In hiring, separate your evaluation of a candidate''s personality from their technical skill. A charismatic candidate is not necessarily a skilled one. Use structured interviews with independent scoring for each competency to counteract the halo effect.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'When evaluating someone, list each quality separately',
      'Score each quality independently before looking at your overall impression',
      'Ask: What evidence do I have for each specific trait?',
      'Beware the reverse halo: one negative trait making you assume everything else is bad too',
      'Use blind evaluation where possible — remove names from resumes'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Thorndike Original 1920 Paper (Archive)','url','https://psycnet.apa.org/record/1926-00703-001'),
      jsonb_build_object('label','The Halo Effect — Phil Rosenzweig','url','https://www.youtube.com/results?search_query=halo+effect+rosenzweig+summary')
    ))
  ),
  'The Halo Effect',
  'Phil Rosenzweig',
  v_img_alt2,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================
-- POWER DYNAMICS & STRATEGY (7 cards)
-- ============================================================

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Sun Tzu: Win Without Fighting — The Supreme Art of War',
  'Power Dynamics & Strategy',
  'To fight and conquer in all your battles is not supreme excellence. Supreme excellence consists in breaking the enemy''s resistance without fighting.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Sun Tzu''s Art of War, written 2,500 years ago, remains the most influential text on strategy ever composed. His central thesis: the greatest victories are won through positioning, deception, and psychological advantage — not through direct confrontation.'),
    jsonb_build_object('type','heading','content','The Five Factors of Strategy'),
    jsonb_build_object('type','paragraph','content','Sun Tzu identified five constant factors: the Moral Law (alignment of people with their leader), Heaven (timing and conditions), Earth (terrain and positioning), the Commander (character and judgment), and Method and Discipline (organization and logistics). Victory comes from mastering all five.'),
    jsonb_build_object('type','takeaway','content','The best battle is the one you never have to fight. Position yourself so that victory is inevitable before the conflict begins.'),
    jsonb_build_object('type','application','content','In business, this means entering markets where you have structural advantages — proprietary technology, distribution, or brand — rather than fighting head-on against entrenched competitors. Apple did not beat Nokia by making a better phone; they redefined the category entirely.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Assess your position relative to competitors on all five factors before engaging',
      'Choose battles where you have terrain advantage — do not fight on the enemy''s terms',
      'Use deception: let competitors underestimate you while you build strength',
      'Attack strategy first, then alliances, then the army itself — in that order',
      'Know yourself and know your enemy: 100 battles, 100 victories'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The Art of War by Sun Tzu (Free PDF)','url','https://www.gutenberg.org/ebooks/132'),
      jsonb_build_object('label','Sun Tzu — Animated Book Summary','url','https://www.youtube.com/results?search_query=sun+tzu+art+of+war+summary')
    ))
  ),
  'The Art of War',
  'Sun Tzu',
  v_img_power,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Law 15: Crush Your Enemy Totally',
  'Power Dynamics & Strategy',
  'If you crush an enemy only partially, they will recover and seek revenge. The only safe enemy is one who has no capacity to harm you.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Robert Greene''s 15th law is the most ruthless in his catalog. It states that half-measures in conflict are worse than no measures at all. A wounded enemy becomes more dangerous than an unfought one because they now have both motive and the element of surprise.'),
    jsonb_build_object('type','heading','content','Historical Evidence'),
    jsonb_build_object('type','paragraph','content','The Han Dynasty of China fell because the emperor showed mercy to Wang Mang, allowing him to regroup and eventually seize the throne. In contrast, when Octavian defeated Mark Antony, he eliminated every potential rival completely — and the Roman Peace lasted 200 years.'),
    jsonb_build_object('type','takeaway','content','In any conflict, if you decide to fight, fight to conclusion. A wounded opponent is more dangerous than a defeated one. Mercy without total victory is just delayed defeat.'),
    jsonb_build_object('type','application','content','In competitive business, this does not mean destroying people — it means eliminating their capacity to retaliate. If you are leaving a company to start a competitor, ensure your non-compete, IP, and client relationships are cleanly resolved. A partial break creates a future adversary.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Before engaging in conflict, decide if it is worth fighting at all',
      'If yes, commit fully — do not leave the enemy with resources to retaliate',
      'Remove their capacity for revenge, not just their current attack',
      'In professional settings, make clean breaks: resolve all obligations completely',
      'Never humiliate an opponent publicly if they retain any power to strike back'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The 48 Laws of Power (Book Summary)','url','https://www.youtube.com/results?search_query=48+laws+of+power+summary'),
      jsonb_build_object('label','The Prince by Machiavelli (Free PDF)','url','https://www.gutenberg.org/ebooks/1232')
    ))
  ),
  'The 48 Laws of Power',
  'Robert Greene',
  v_img_power,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'The 33 Strategies of War: Divide and Conquer',
  'Power Dynamics & Strategy',
  'A divided enemy is a weak enemy. Create internal dissension and your opponents will defeat themselves.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Divide and conquer is one of the oldest strategies in human history. By fragmenting your opposition, you reduce a large threat into small, manageable pieces that can be dealt with individually. The strategy works in warfare, politics, and business.'),
    jsonb_build_object('type','heading','content','The Mechanism'),
    jsonb_build_object('type','paragraph','content','Julius Caesar used this strategy against the Gauls by pitting tribes against each other before conquering them individually. In modern business, companies use it to prevent competitors from forming alliances — by offering better terms to one, you prevent a unified front against you.'),
    jsonb_build_object('type','takeaway','content','Never fight a unified front. If your opponents are organized, your first move is to fragment them — not to attack them directly.'),
    jsonb_build_object('type','application','content','In negotiations, if you face a committee with different interests, identify the member whose priorities differ from the group''s and address them separately. A unified negotiating team is powerful; a divided one will negotiate against itself.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Map the interests and motivations of each member of the opposing side',
      'Identify whose interests diverge from the group''s consensus',
      'Address that person''s specific concerns privately',
      'Never let the opposition realize you are dividing them — subtlety is key',
      'Offer each fragment a deal that is better than what they would get collectively'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The 33 Strategies of War (Summary)','url','https://www.youtube.com/results?search_query=33+strategies+of+war+summary'),
      jsonb_build_object('label','The Gallic Wars by Julius Caesar (Free)','url','https://www.gutenberg.org/ebooks/9654')
    ))
  ),
  'The 33 Strategies of War',
  'Robert Greene',
  v_img_alt1,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'The Law of Reciprocity: The Hidden Currency of Influence',
  'Power Dynamics & Strategy',
  'When someone does you a favor, you feel an almost irresistible urge to return it. This instinct is the foundation of all influence.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','The law of reciprocity, documented extensively by Robert Cialdini in Influence, is the social principle that humans are psychologically compelled to return favors. It is so deeply wired that even uninvited gifts create a sense of obligation.'),
    jsonb_build_object('type','heading','content','How Power Players Use It'),
    jsonb_build_object('type','paragraph','content','Political lobbyists, charity fundraisers, and negotiators all use reciprocity. The Hare Krishna movement gave flowers at airports — a small unsolicited gift — and donations skyrocketed because people felt obligated to reciprocate.'),
    jsonb_build_object('type','takeaway','content','The first to give holds the power. By initiating a favor, you create an obligation that the recipient will feel compelled to repay — often at a multiple of what you gave.'),
    jsonb_build_object('type','application','content','In professional relationships, be the first to offer value — an introduction, a useful resource, a piece of advice. The recipient will remember and look for opportunities to repay you. This is how networks of mutual obligation are built.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Identify someone whose help you will need in the future',
      'Find a way to provide value to them first — without asking for anything',
      'Make the favor specific and memorable, not generic',
      'Allow time for the obligation to build — do not immediately ask for a return',
      'When you do ask, frame it as a natural continuation of the relationship'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Influence by Cialdini (Book Summary)','url','https://www.youtube.com/results?search_query=cialdini+influence+summary'),
      jsonb_build_object('label','Cialdini Reciprocity Research','url','https://www.influenceatwork.com/principles-of-persuasion/')
    ))
  ),
  'Influence: The Psychology of Persuasion',
  'Robert Cialdini',
  v_img_alt2,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Machiavelli on Fortune: Is Destiny Fixed or Can You Shape It?',
  'Power Dynamics & Strategy',
  'I compare fortune to a raging river. When it is angry, it destroys everything — but men can build dikes and dams to prepare for it.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Machiavelli''s view of fortune (destiny) is neither fatalistic nor naively optimistic. He argues that about half of life is controlled by fortune and half by human agency. The key is to prepare during calm periods so you can act decisively when the storm comes.'),
    jsonb_build_object('type','heading','content','The River Metaphor'),
    jsonb_build_object('type','paragraph','content','Fortune is like a river: when calm, you can build dams and dikes. When it floods, it destroys everything in its path — but only for those who did not prepare. The same flood that devastates the unprepared leaves the prepared unharmed.'),
    jsonb_build_object('type','takeaway','content','You cannot control when opportunity or disaster arrives. You can control whether you are prepared for it. Build your infrastructure during good times so you can seize opportunity or withstand catastrophe when it comes.'),
    jsonb_build_object('type','application','content','In business, this means building cash reserves, diversifying revenue, and developing skills during profitable periods — not when crisis hits. Companies that survive recessions are not lucky; they built their dikes during the boom.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'During stable periods, build reserves — financial, social, and skill-based',
      'Identify the top 3 risks to your plans and prepare mitigations now',
      'Develop relationships before you need them — a network built during crisis is too late',
      'Stay flexible: Machiavelli warned that rigid plans break against changing fortune',
      'When opportunity strikes, act with audacity — fortune favors the bold'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The Prince by Machiavelli (Free PDF)','url','https://www.gutenberg.org/ebooks/1232'),
      jsonb_build_object('label','Discourses on Livy (Free PDF)','url','https://www.gutenberg.org/ebooks/10827')
    ))
  ),
  'The Prince',
  'Niccolò Machiavelli',
  v_img_power,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'The Mastery of Timing: Law 29 — Plan All the Way to the End',
  'Power Dynamics & Strategy',
  'The ending is everything. Plan all the way to the end: take into account all possible obstacles, twists of fortune, and consequences.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Robert Greene''s 29th law addresses the human tendency to plan only the beginning of an endeavor and assume the rest will work out. The result: surprises, reversals, and failure. Planning to the end means anticipating every obstacle and having contingencies for each.'),
    jsonb_build_object('type','heading','content','The Consequence of Short Planning'),
    jsonb_build_object('type','paragraph','content','Napoleon planned his march into Russia brilliantly — the beginning was flawless. But he had no plan for the Russian winter, the scorched earth strategy, or the retreat. His army was destroyed not by the march but by the absence of a plan for what came after victory.'),
    jsonb_build_object('type','takeaway','content','Most people plan the opening move and hope for the best. The strategic thinker plans the endgame first, then works backward to the beginning. If you cannot see the ending, you are not ready to begin.'),
    jsonb_build_object('type','application','content','Before launching a product, plan the entire lifecycle: what happens after launch, how you handle competitors'' responses, what you do if adoption is slow, how you scale, and how you exit. A plan that only covers the launch is not a plan — it is a wish.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Write down the end goal in specific, measurable terms',
      'Work backward: what must be true at each step to reach the end?',
      'Identify the top 5 obstacles and write a contingency for each',
      'Set decision points: If X happens by date Y, I will do Z',
      'Review and update the plan monthly — fortune changes, plans must adapt'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The 48 Laws of Power (Summary)','url','https://www.youtube.com/results?search_query=48+laws+of+power+law+29'),
      jsonb_build_object('label','Napoleon''s Russian Campaign Analysis','url','https://www.youtube.com/results?search_query=napoleon+russian+campaign+analysis')
    ))
  ),
  'The 48 Laws of Power',
  'Robert Greene',
  v_img_alt1,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Obedience to Authority: The Milgram Experiment',
  'Power Dynamics & Strategy',
  'Ordinary people will inflict lethal harm on others if instructed to do so by an authority figure. Power flows from perceived legitimacy, not force.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Stanley Milgram''s 1961 experiment at Yale University showed that 65% of ordinary people would administer what they believed were lethal electric shocks to a stranger — simply because an authority figure in a lab coat told them to. The implications for understanding power structures are profound.'),
    jsonb_build_object('type','heading','content','What It Reveals About Power'),
    jsonb_build_object('type','paragraph','content','Power does not primarily flow from force or coercion. It flows from perceived legitimacy. When people believe an authority is legitimate, they comply voluntarily — even against their own conscience. This is why uniforms, titles, and institutional settings are so powerful: they signal legitimacy.'),
    jsonb_build_object('type','takeaway','content','The most effective form of power is not force but perceived legitimacy. If people believe you have the right to lead, they will follow — even when they disagree. Build legitimacy before you exercise power.'),
    jsonb_build_object('type','application','content','In organizational leadership, your authority comes not from your title but from whether people perceive you as legitimate. Build legitimacy through competence, fairness, and consistency. A leader who is feared but not respected holds fragile power that collapses under pressure.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Build perceived legitimacy through demonstrated competence, not titles',
      'Use symbols of authority carefully — they amplify both legitimate and illegitimate power',
      'Question authority yourself: Would I do this if no one told me to?',
      'Create systems where authority is earned, not just assigned',
      'Beware the tendency to obey without questioning — Milgram showed it is universal'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Milgram Experiment — Original Paper (Open Access)','url','https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3323800/'),
      jsonb_build_object('label','Obedience to Authority by Milgram (Summary)','url','https://www.youtube.com/results?search_query=milgram+obedience+experiment+summary')
    ))
  ),
  'Obedience to Authority',
  'Stanley Milgram',
  v_img_alt2,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================
-- WEALTH CREATION & ECONOMICS (4 cards)
-- ============================================================

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Compound Interest: The Eighth Wonder of the World',
  'Wealth Creation & Economics',
  'Compound interest is the most powerful force in finance. The earlier you start, the less you need to invest — because time does the heavy lifting.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Albert Einstein allegedly called compound interest the eighth wonder of the world. Whether or not he said it, the math is undeniable: $10,000 invested at 8% annual return becomes $217,000 in 40 years without adding another dollar. The key is not the rate of return — it is the time.'),
    jsonb_build_object('type','heading','content','The Math of Patience'),
    jsonb_build_object('type','paragraph','content','The rule of 72: divide 72 by your annual return rate to get the years it takes to double your money. At 8%, money doubles every 9 years. Someone who starts at 25 experiences 5 doublings by age 70. Someone who starts at 40 experiences only 3. That 15-year head start results in a 4x difference in final wealth.'),
    jsonb_build_object('type','takeaway','content','Time is more important than amount. $200/month invested at 8% from age 25 produces more wealth than $1,000/month from age 45. Start now, even if the amount is small.'),
    jsonb_build_object('type','application','content','If you are young, prioritize starting over optimizing. A mediocre investment started at 25 beats a perfect investment started at 40. If you are older, focus on increasing your rate of return and your savings rate — you have less time to benefit from compounding.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Open an investment account today — even if you can only invest $50',
      'Set up automatic monthly contributions — consistency beats timing',
      'Choose low-cost index funds: the S&P 500 has averaged ~10% annually over decades',
      'Reinvest all dividends — never withdraw the interest',
      'Do not touch the principal for 20+ years — compounding needs time, not talent'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The Intelligent Investor by Benjamin Graham (Summary)','url','https://www.youtube.com/results?search_query=intelligent+investor+graham+summary'),
      jsonb_build_object('label','Compound Interest Calculator (Free)','url','https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator')
    ))
  ),
  'The Intelligent Investor',
  'Benjamin Graham',
  v_img_wealth,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Naval Ravikant on Leverage: Wealth Without Permission',
  'Wealth Creation & Economics',
  'Fortune requires leverage. Business leverage comes from capital, people, and products with no marginal cost of replication — code and media.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Naval Ravikant, founder of AngelList, articulated a framework for wealth creation in the modern era. His central insight: wealth is not money. Wealth is assets that earn while you sleep. And the key to building those assets is leverage — the ability to multiply the output of your effort.'),
    jsonb_build_object('type','heading','content','The Three Types of Leverage'),
    jsonb_build_object('type','paragraph','content','1. Capital leverage: using money to make money. Requires permission — someone must trust you with their capital. 2. People leverage: hiring others to work for you. Also requires permission — people must choose to work for you. 3. Product leverage: code and media (software, content, algorithms). Requires NO permission — you can write code or create content and deploy it to the world without anyone''s approval.'),
    jsonb_build_object('type','takeaway','content','The highest form of leverage is the kind that requires no permission. Code and media work for you 24/7 with zero marginal cost. Build things once, sell them infinitely.'),
    jsonb_build_object('type','application','content','If you want to build wealth without already having capital or a team, start with permissionless leverage: write software, create content, build a digital product. These assets scale without additional input and require no one''s permission to create or distribute.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Identify which type of leverage you currently have access to',
      'If you have no capital or team, start with code or media — both are permissionless',
      'Build something once that can be used or consumed infinitely (software, content, course)',
      'Own equity in the thing you build — labor alone does not create wealth',
      'Continuously increase your leverage: each asset you build compounds on the last'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Naval Ravikant — The Almanack (Free PDF)','url','https://www.navalmanack.com/free-pdf'),
      jsonb_build_object('label','Naval on Wealth Creation (Full Interview)','url','https://www.youtube.com/results?search_query=naval+ravikant+wealth+creation')
    ))
  ),
  'The Almanack of Naval Ravikant',
  'Eric Jorgenson',
  v_img_wealth,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'Asymmetric Risk: The Taleb Barbell Strategy',
  'Wealth Creation & Economics',
  'Put 90% of your resources in safe, boring investments and 10% in extremely risky ones. Avoid the middle — it gives you neither safety nor upside.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Nassim Nicholas Taleb''s barbell strategy is a risk management framework: avoid moderate risk investments entirely. Instead, combine extreme safety (90% of your portfolio) with extreme risk (10% in high-upside, low-cost bets). The middle ground — medium risk — gives you the worst of both worlds.'),
    jsonb_build_object('type','heading','content','Why the Middle Is Dangerous'),
    jsonb_build_object('type','paragraph','content','Medium-risk investments often look safe but carry hidden tail risks. The 2008 financial crisis destroyed moderate investors who held mortgage-backed securities rated as safe. The barbell strategy protects against black swans: your 90% is truly safe, and your 10% has unlimited upside with capped downside.'),
    jsonb_build_object('type','takeaway','content','Do not seek moderate returns with moderate risk. Seek either near-certain safety or extreme upside with limited downside. The combination is more robust than any single middle-ground position.'),
    jsonb_build_object('type','application','content','In career strategy, this means keeping a stable income (90%) while making small bets on high-upside opportunities (10%): a side project, an angel investment, learning a new skill. If the bet fails, you lose only the small investment. If it succeeds, the return can be 100x.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Put 90% of your financial resources in extremely safe assets (treasuries, cash)',
      'Put 10% in highly speculative, high-upside bets (startups, crypto, options)',
      'Avoid anything marketed as moderate risk, moderate return — it is usually tail risk in disguise',
      'Apply the same principle to your career: stable job + high-risk side bets',
      'Make many small asymmetric bets — you only need one to hit to change everything'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The Black Swan by Taleb (Summary)','url','https://www.youtube.com/results?search_query=black+swan+taleb+summary'),
      jsonb_build_object('label','Antifragile by Taleb (Summary)','url','https://www.youtube.com/results?search_query=antifragile+taleb+summary')
    ))
  ),
  'The Black Swan',
  'Nassim Nicholas Taleb',
  v_img_alt1,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'The Richest Man in Babylon: Pay Yourself First',
  'Wealth Creation & Economics',
  'A part of all you earn is yours to keep. If you spend everything you earn, you are working for everyone except yourself.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','George Clason''s 1926 classic, set in ancient Babylon, teaches financial wisdom through parables. The foundational principle is simple: pay yourself first. Before paying rent, before buying food, before any other expense, set aside a portion of your income — and never touch it.'),
    jsonb_build_object('type','heading','content','The Seven Rules of Wealth'),
    jsonb_build_object('type','paragraph','content','1. Start thy purse to fattening (save 10%). 2. Control thy expenditures. 3. Make thy gold multiply (invest). 4. Guard thy treasures from loss (avoid risky schemes). 5. Make of thy dwelling a profitable investment. 6. Insure a future income (retirement). 7. Increase thy ability to earn (develop skills).'),
    jsonb_build_object('type','takeaway','content','Wealth is not about how much you earn. It is about how much you keep. Most high earners are broke because they spend everything. Most modest earners build wealth because they save consistently.'),
    jsonb_build_object('type','application','content','Set up an automatic transfer on payday that moves 10% of your income to a separate savings or investment account before you see it. If you never see the money in your checking account, you will not miss it. This one habit, sustained over decades, builds more wealth than any investment strategy.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Set up an automatic transfer of 10% of every paycheck to savings on payday',
      'Never touch this money — it is not for emergencies, it is for wealth',
      'Live on the remaining 90% — adjust your lifestyle to fit',
      'Once you have 6 months of expenses saved, redirect the 10% to investments',
      'Gradually increase the percentage as your income grows — aim for 20%+'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The Richest Man in Babylon (Free PDF)','url','https://www.gutenberg.org/ebooks/3027345'),
      jsonb_build_object('label','Personal Finance 101 — Free Course','url','https://www.khanacademy.org/college-careers-more/personal-finance')
    ))
  ),
  'The Richest Man in Babylon',
  'George S. Clason',
  v_img_wealth,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================
-- SINGULARITY & FUTURE TECH (3 cards)
-- ============================================================

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'The Singularity: When Machine Intelligence Exceeds Human',
  'Singularity & Future Tech',
  'The singularity is the point at which technological growth becomes uncontrollable and irreversible, resulting in unfathomable changes to human civilization.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Vernor Vinge and Ray Kurzweil popularized the concept of the technological singularity: a future moment when artificial intelligence surpasses human intelligence, enabling rapid, unpredictable technological progress. The core idea is that smarter-than-human AI could design even smarter AI, creating an intelligence explosion.'),
    jsonb_build_object('type','heading','content','The Exponential Curve'),
    jsonb_build_object('type','paragraph','content','Kurzweil''s Law of Accelerating Returns argues that technological progress is exponential, not linear. The pace of change is itself accelerating. This means the next 100 years of progress will not equal the last 100 — it will equal the last 20,000. The singularity is simply the point where the curve goes vertical.'),
    jsonb_build_object('type','takeaway','content','Do not plan for a future that looks like the present, only more so. Plan for a future where the rate of change itself is unrecognizably faster than today.'),
    jsonb_build_object('type','application','content','In career planning, this means prioritizing skills that are difficult to automate: creative problem-solving, complex human relationships, and the ability to learn rapidly. Technical skills that can be performed by AI will be — within years, not decades. Adaptability is the only durable skill.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Learn to use AI tools now — the gap between AI users and non-users is widening fast',
      'Develop skills that involve complex human judgment, not routine analysis',
      'Invest in companies positioned to benefit from AI acceleration',
      'Build flexibility into your career plan — expect to pivot multiple times',
      'Follow AI research directly — do not rely on mainstream media summaries'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','The Singularity Is Near by Kurzweil (Summary)','url','https://www.youtube.com/results?search_query=singularity+is+near+kurzweil+summary'),
      jsonb_build_object('label','Ray Kurzweil TED Talk on the Singularity','url','https://www.ted.com/talks/ray_kurzweil_the_singularity')
    ))
  ),
  'The Singularity Is Near',
  'Ray Kurzweil',
  v_img_tech,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'The Law of Accelerating Returns',
  'Singularity & Future Tech',
  'Technology builds on itself. Each generation of tools enables the next, faster. The result is not linear progress but exponential acceleration.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','Ray Kurzweil''s Law of Accelerating Returns states that the rate of technological progress is itself accelerating. Each new technology is built with the tools of the previous generation, making the next generation faster to develop. This creates a compounding effect — like interest, but for innovation.'),
    jsonb_build_object('type','heading','content','Evidence in the Data'),
    jsonb_build_object('type','paragraph','content','The time between major paradigm shifts is shrinking. The agricultural revolution took thousands of years. The industrial revolution took hundreds. The information revolution took decades. The AI revolution is happening in years. Each shift is faster because the tools available to create the next shift are more powerful.'),
    jsonb_build_object('type','takeaway','content','Human intuition is calibrated for linear change. The world is changing exponentially. If your plans assume tomorrow will be like today plus a little more, you will be blindsided.'),
    jsonb_build_object('type','application','content','When building a business or career, assume that the tools available in 2 years will be dramatically more powerful than today. Do not optimize for the current landscape — build systems that can adapt to tools you cannot yet imagine. Flexibility beats optimization in an exponential world.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Map the exponential trends in your industry — are they linear or accelerating?',
      'Identify which of your skills will be automated in 5 years vs 20 years',
      'Build a future-proof skill stack: adaptability, human relationships, meta-learning',
      'Invest in technologies at the knee of the exponential curve — before they go vertical',
      'Revisit your plans quarterly, not annually — the pace of change demands it'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Kurzweil Essay on Accelerating Returns','url','https://www.kurzweilai.net/the-law-of-accelerating-returns'),
      jsonb_build_object('label','Our Final Invention by James Barrat (Summary)','url','https://www.youtube.com/results?search_query=our+final+invention+barrat+summary')
    ))
  ),
  'The Singularity Is Near',
  'Ray Kurzweil',
  v_img_tech,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO posts (title, category, excerpt, body, source_title, source_author, image_url, author_name, is_curated) VALUES
(
  'AI and the Future of Human Nature',
  'Singularity & Future Tech',
  'As AI takes over cognitive labor, what remains of human nature? The answer may redefine what it means to be human.',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','content','As AI systems increasingly match or exceed human performance in analysis, pattern recognition, and even creative tasks, the question shifts from what can AI do? to what is uniquely human? The answer will shape the next century of human civilization.'),
    jsonb_build_object('type','heading','content','What AI Cannot Do (Yet)'),
    jsonb_build_object('type','paragraph','content','Current AI excels at tasks with clear patterns and measurable outcomes. It struggles with: genuine empathy, moral reasoning, novel paradigm creation, physical embodiment in unpredictable environments, and the kind of intuitive leaps that create entirely new fields. These remain — for now — distinctly human.'),
    jsonb_build_object('type','takeaway','content','The future belongs to those who can combine AI''s analytical power with distinctly human qualities: empathy, moral judgment, creativity, and the ability to forge meaning. Pure technical skill is being commoditized. Human wisdom is becoming more valuable, not less.'),
    jsonb_build_object('type','application','content','Do not compete with AI on analysis. Compete on judgment, relationships, and meaning. Use AI as a tool to amplify your analytical capacity while investing deeply in the human skills that AI cannot replicate. The most successful people of the next era will be those who are maximally human and maximally augmented by AI.'),
    jsonb_build_object('type','steps','content', jsonb_build_array(
      'Audit your current work: which parts are analytical (AI-vulnerable) vs human (AI-resistant)?',
      'Automate the analytical parts using AI tools — do not resist this',
      'Double down on human skills: deep relationships, moral reasoning, creative vision',
      'Study philosophy and ethics — these will be the most valuable skills in an AI world',
      'Build a personal brand around your unique human perspective, not your technical output'
    )),
    jsonb_build_object('type','resources','content', jsonb_build_array(
      jsonb_build_object('label','Superintelligence by Nick Bostrom (Summary)','url','https://www.youtube.com/results?search_query=superintelligence+bostrom+summary'),
      jsonb_build_object('label','Bostrom TED Talk on AI and Human Nature','url','https://www.ted.com/talks/nick_bostrom_what_happens_when_our_computers_get_smarter_than_we_are')
    ))
  ),
  'Superintelligence',
  'Nick Bostrom',
  v_img_tech,
  'MindAnime Editorial',
  true
) ON CONFLICT DO NOTHING;

END $$;
