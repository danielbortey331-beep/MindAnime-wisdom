import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { celebrateCompletion } from '@/utils/feedback';
import {
  DEFAULT_DAILY_GOAL_XP,
  applyLessonCompletion,
  getLessonStreak,
  getTodayXp,
  getWeekDays,
  loadGamificationState,
  saveGamificationState,
  type GamificationState,
  type WeekDay,
} from '@/lib/gamification';

export interface LessonCompletionResult {
  xpGained: number;
  streak: number;
}

interface GamificationValue {
  totalXp: number;
  streak: number;
  todayXp: number;
  dailyGoal: number;
  goalMet: boolean;
  weekDays: WeekDay[];
  isLessonCompleted: (postId: string) => boolean;
  completeLesson: (postId: string) => LessonCompletionResult;
}

const GamificationContext = createContext<GamificationValue | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GamificationState>(loadGamificationState);

  useEffect(() => {
    saveGamificationState(state);
  }, [state]);

  const now = new Date();
  const todayXp = getTodayXp(state, now);

  const value: GamificationValue = {
    totalXp: state.totalXp,
    streak: getLessonStreak(state, now),
    todayXp,
    dailyGoal: DEFAULT_DAILY_GOAL_XP,
    goalMet: todayXp >= DEFAULT_DAILY_GOAL_XP,
    weekDays: getWeekDays(state, now),
    isLessonCompleted: (postId) => state.completedPostIds.includes(postId),
    completeLesson: (postId) => {
      const next = applyLessonCompletion(state, postId, new Date());
      if (next.xpGained > 0) {
        setState(next.state);
        celebrateCompletion();
      }
      return { xpGained: next.xpGained, streak: getLessonStreak(next.state, new Date()) };
    },
  };

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

export function useGamification(): GamificationValue {
  const value = useContext(GamificationContext);
  if (!value) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return value;
}
