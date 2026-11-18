import { DEFAULT_DAILY_GOAL_XP, XP_PER_LESSON } from '@/lib/gamification';
import type { SenseiMood } from '@/components/SenseiMascot';

export interface SenseiContext {
  visitStreak: number;
  lessonStreak: number;
  todayXp: number;
  goalMet: boolean;
  celebrating: boolean;
  hour: number;
  isFree: boolean;
}

export interface SenseiReply {
  id: string;
  question: string;
  answer: string;
}

const EVENING_HOUR = 18;
const ZEN_STREAK_DAYS = 7;

function activeStreakDays(ctx: SenseiContext): number {
  return Math.max(ctx.lessonStreak, ctx.visitStreak);
}

export function isStreakAtRisk(ctx: SenseiContext): boolean {
  return activeStreakDays(ctx) > 0 && ctx.todayXp === 0 && ctx.hour >= EVENING_HOUR;
}

export function getSenseiMood(ctx: SenseiContext): SenseiMood {
  if (ctx.celebrating) return 'celebrating';
  if (isStreakAtRisk(ctx)) return 'urgent';
  if (ctx.goalMet || ctx.visitStreak >= ZEN_STREAK_DAYS) return 'zen';
  return 'welcoming';
}

export function getSenseiMessage(mood: SenseiMood, ctx: SenseiContext): string {
  switch (mood) {
    case 'celebrating':
      return 'Impeccable flow. Your mind grows sharper.';
    case 'urgent':
      return `Your ${activeStreakDays(ctx)}-day streak is fading. Let's finish one lesson before midnight.`;
    case 'zen':
      return ctx.goalMet
        ? 'Daily goal reached. Your mind grows sharper every day.'
        : `${ctx.visitStreak} days unbroken. Your focus is now a fortress.`;
    case 'welcoming':
      if (ctx.isFree) return 'Unlock MindAnime Pro to read every insight and join every discussion.';
      return ctx.visitStreak > 0
        ? `Day ${ctx.visitStreak}. Let's conquer today's wisdom.`
        : "Your mind is your sharpest blade. Ready for today's lesson?";
  }
}

export function getSenseiReplies(ctx: SenseiContext): SenseiReply[] {
  const lessonsForGoal = Math.ceil(DEFAULT_DAILY_GOAL_XP / XP_PER_LESSON);

  let keepAnswer: string;
  if (isStreakAtRisk(ctx)) {
    keepAnswer = 'Complete one lesson before midnight. Any finished lesson earns XP and keeps the streak alive.';
  } else if (ctx.todayXp > 0) {
    keepAnswer = 'You are covered for today. Come back tomorrow and finish a lesson to keep the chain going.';
  } else {
    keepAnswer = 'Finish one lesson each day. Completing a lesson earns XP and counts toward today.';
  }

  return [
    { id: 'keep-streak', question: 'How do I keep my streak?', answer: keepAnswer },
    {
      id: 'daily-goal',
      question: 'What is my daily goal?',
      answer: `Your daily goal is ${DEFAULT_DAILY_GOAL_XP} XP. Each lesson gives ${XP_PER_LESSON} XP, so ${lessonsForGoal} lessons reach it.`,
    },
    {
      id: 'unlock',
      question: 'How do I unlock everything?',
      answer: ctx.isFree
        ? 'MindAnime Pro ($5/month) unlocks every insight and the full discussions.'
        : 'You already have full access. Keep reading and sharing your perspective.',
    },
  ];
}
