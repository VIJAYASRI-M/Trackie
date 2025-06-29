import { useState, useEffect } from "react";
import { calculateStreaks, getStreakHistory } from "../lib/streakService";
import type { StreakData, DailyTarget } from "../types/streak";

export const useStreaks = () => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [streakHistory, setStreakHistory] = useState<DailyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await calculateStreaks();

      if (fetchError) {
        setError(fetchError.message || "Failed to load streak data");
      } else {
        setStreakData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadStreakHistory = async (days: number = 30) => {
    try {
      const { data, error: fetchError } = await getStreakHistory(days);

      if (fetchError) {
        console.error("Error loading streak history:", fetchError);
      } else {
        setStreakHistory(data || []);
      }
    } catch (err) {
      console.error("Error loading streak history:", err);
    }
  };

  const refreshStreaks = async () => {
    await loadStreakData();
  };

  const getStreakStats = () => {
    if (!streakData) return null;

    return {
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      totalCompletedDays: streakData.totalCompletedDays,
      completionRate: streakData.completionRate,
      lastCompletedDate: streakData.lastCompletedDate,
      isOnStreak: streakData.currentStreak > 0,
    };
  };

  const isStreakAtRisk = () => {
    if (!streakData) return false;

    const today = new Date().toISOString().split("T")[0];
    const lastCompleted = streakData.lastCompletedDate;

    if (!lastCompleted) return false;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    return lastCompleted < today && streakData.currentStreak > 0;
  };

  return {
    streakData,
    streakHistory,
    loading,
    error,
    loadStreakHistory,
    refreshStreaks,
    getStreakStats,
    isStreakAtRisk,
  };
};
