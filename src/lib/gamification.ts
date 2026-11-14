export const XP_PER_LESSON = 25;
export const DEFAULT_DAILY_GOAL_XP = 50;

const STORAGE_KEY = 'mindanime-gamification';
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface GamificationState {
  totalXp: number;
  completedPostIds: string[];
  xpByDay: Record<string, number>;
}

export interface WeekDay {
  key: string;
  label: string;
  active: boolean;
  isToday: boolean;
}

export interface LessonCompletion {
  state: GamificationState;
  xpGained: number;
}

const EMPTY_STATE: GamificationState = { totalXp: 0, completedPostIds: [], xpByDay: {} };

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function loadGamificationState(): GamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<GamificationState>;
    return {
      totalXp: typeof parsed.totalXp === 'number' ? parsed.totalXp : 0,
      completedPostIds: Array.isArray(parsed.completedPostIds) ? parsed.completedPostIds : [],
      xpByDay: parsed.xpByDay && typeof parsed.xpByDay === 'object' ? parsed.xpByDay : {},
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveGamificationState(state: GamificationState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function applyLessonCompletion(
  state: GamificationState,
  postId: string,
  now: Date,
): LessonCompletion {
  if (state.completedPostIds.includes(postId)) {
    return { state, xpGained: 0 };
  }
  const key = dayKey(now);
  return {
    state: {
      totalXp: state.totalXp + XP_PER_LESSON,
      completedPostIds: [...state.completedPostIds, postId],
      xpByDay: { ...state.xpByDay, [key]: (state.xpByDay[key] ?? 0) + XP_PER_LESSON },
    },
    xpGained: XP_PER_LESSON,
  };
}

export function getTodayXp(state: GamificationState, now: Date): number {
  return state.xpByDay[dayKey(now)] ?? 0;
}

export function getLessonStreak(state: GamificationState, now: Date): number {
  const cursor = new Date(now);
  if ((state.xpByDay[dayKey(cursor)] ?? 0) === 0) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let count = 0;
  while ((state.xpByDay[dayKey(cursor)] ?? 0) > 0) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function getWeekDays(state: GamificationState, now: Date): WeekDay[] {
  const mondayOffset = (now.getDay() + 6) % 7;
  const todayKey = dayKey(now);
  return WEEK_LABELS.map((label, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - mondayOffset + i);
    const key = dayKey(date);
    return {
      key,
      label,
      active: (state.xpByDay[key] ?? 0) > 0,
      isToday: key === todayKey,
    };
  });
}
