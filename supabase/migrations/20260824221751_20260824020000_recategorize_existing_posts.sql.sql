/*
# Re-categorize Existing Posts to New Category Framework

## Overview
Migrates the 4 existing seed posts from the old category names to the new
specialized category framework.

## Changes
1. "Power & Strategy" -> "Power Dynamics & Strategy"
2. "Philosophy" -> "Human Behavior & Psychology" (Dichotomy of Control is a
   cognitive/behavioral concept)
3. "Psychological Principles" -> "Human Behavior & Psychology"
4. "Political Science" -> "Power Dynamics & Strategy" (Lion and Fox is about
   power dynamics)
*/

UPDATE posts SET category = 'Power Dynamics & Strategy' WHERE category = 'Power & Strategy';
UPDATE posts SET category = 'Power Dynamics & Strategy' WHERE category = 'Political Science';
UPDATE posts SET category = 'Human Behavior & Psychology' WHERE category IN ('Philosophy', 'Psychological Principles');
