export interface DailyTarget {
  id?: string;
  date: string;
  target: number;
  completed: boolean;
  total_laps: number;
  created_at?: string;
  updated_at?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompletedDays: number;
  completionRate: number; // percentage
  lastCompletedDate?: string;
}
