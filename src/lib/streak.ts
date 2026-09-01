const STREAK_KEY = 'mindanime-streak';

export interface StreakData {
  current_streak: number;
  best_streak: number;
  last_visit_date: string;
  total_days_visited: number;
  milestones_claimed: number[];
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function defaultStreak(): StreakData {
  return {
    current_streak: 0,
    best_streak: 0,
    last_visit_date: '',
    total_days_visited: 0,
    milestones_claimed: [],
  };
}

export function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return defaultStreak();
    const parsed = JSON.parse(raw) as StreakData;
    return { ...defaultStreak(), ...parsed };
  } catch {
    return defaultStreak();
  }
}

export function saveStreak(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export interface StreakUpdate {
  data: StreakData;
  streakIncreased: boolean;
  newMilestone: number | null;
}

const MILESTONES = [3, 7, 14, 30, 50, 100];

export function registerDailyVisit(): StreakUpdate {
  const streak = loadStreak();
  const today = todayStr();

  if (streak.last_visit_date === today) {
    return { data: streak, streakIncreased: false, newMilestone: null };
  }

  const yesterday = dateStr(1);
  let newCurrent: number;

  if (streak.last_visit_date === yesterday) {
    newCurrent = streak.current_streak + 1;
  } else {
    newCurrent = 1;
  }

  const newBest = Math.max(streak.best_streak, newCurrent);
  const newTotal = streak.total_days_visited + 1;

  const newMilestone = MILESTONES.find(
    (m) => newCurrent === m && !streak.milestones_claimed.includes(m),
  );

  const updated: StreakData = {
    current_streak: newCurrent,
    best_streak: newBest,
    last_visit_date: today,
    total_days_visited: newTotal,
    milestones_claimed: newMilestone
      ? [...streak.milestones_claimed, newMilestone]
      : streak.milestones_claimed,
  };

  saveStreak(updated);

  return {
    data: updated,
    streakIncreased: true,
    newMilestone,
  };
}

export function getWeeklyActivity(data: StreakData): boolean[] {
  const days: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const checkDate = dateStr(i);
    if (data.last_visit_date === checkDate) {
      days.push(true);
    } else if (i === 0 && data.last_visit_date === dateStr(0)) {
      days.push(true);
    } else {
      const streakAtThatPoint = data.current_streak - i;
      if (streakAtThatPoint > 0 && data.last_visit_date === dateStr(i)) {
        days.push(true);
      } else {
        days.push(false);
      }
    }
  }
  return days;
}

export function getStreakStatus(data: StreakData): {
  label: string;
  subtitle: string;
} {
  if (data.current_streak === 0) {
    return { label: 'Start your streak', subtitle: 'Visit daily to build it' };
  }
  if (data.current_streak === 1) {
    return { label: 'Day 1', subtitle: 'Come back tomorrow to keep it going' };
  }
  if (data.current_streak < 7) {
    return { label: `${data.current_streak} day streak`, subtitle: 'Keep the momentum going' };
  }
  if (data.current_streak < 30) {
    return { label: `${data.current_streak} day streak`, subtitle: 'You are on fire' };
  }
  return { label: `${data.current_streak} day streak`, subtitle: 'Legendary consistency' };
}

export const STREAK_MILESTONES = MILESTONES;
