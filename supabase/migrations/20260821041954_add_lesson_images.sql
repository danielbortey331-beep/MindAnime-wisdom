/*
# Add image_url column to lessons

## Overview
Adds an image_url column to the lessons table so each lesson can display
a category-appropriate atmospheric image in cards and detail views.

## Changes
- lessons: new `image_url` (text, nullable) column
- Updated all 8 existing lessons with curated images matching their categories

## Security
- No policy changes (column is readable via existing SELECT policy)
*/

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS image_url text;

-- Business & Strategy lessons
UPDATE lessons SET image_url = 'https://images.pexels.com/photos/34963057/pexels-photo-34963057.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' WHERE category = 'Business & Strategy' AND title = 'The Compound Effect of Small Decisions';
UPDATE lessons SET image_url = 'https://images.pexels.com/photos/4607139/pexels-photo-4607139.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' WHERE category = 'Business & Strategy' AND title = 'The Power of Constraints: Why Less Is More';

-- Leadership lessons
UPDATE lessons SET image_url = 'https://images.pexels.com/photos/34924764/pexels-photo-34924764.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' WHERE category = 'Leadership' AND title = 'Leading Through Uncertainty: The Stockdale Paradox';
UPDATE lessons SET image_url = 'https://images.pexels.com/photos/36664015/pexels-photo-36664015.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' WHERE category = 'Leadership' AND title = 'Radical Candor: Caring Personally While Challenging Directly';

-- Education lesson
UPDATE lessons SET image_url = 'https://images.pexels.com/photos/37183410/pexels-photo-37183410.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' WHERE category = 'Education' AND title = 'The Feynman Technique: Learning by Teaching';

-- Life Strategy lesson
UPDATE lessons SET image_url = 'https://images.pexels.com/photos/6876633/pexels-photo-6876633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' WHERE category = 'Life Strategy' AND title = 'The Art of Strategic Quitting';

-- Mental Toughness lessons
UPDATE lessons SET image_url = 'https://images.pexels.com/photos/8991531/pexels-photo-8991531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' WHERE category = 'Mental Toughness' AND title = 'Building Mental Toughness: The 40% Rule';
UPDATE lessons SET image_url = 'https://images.pexels.com/photos/27665869/pexels-photo-27665869.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' WHERE category = 'Mental Toughness' AND title = 'Antifragility: How to Gain from Disorder';
