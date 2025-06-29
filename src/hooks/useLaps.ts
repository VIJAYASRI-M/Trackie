import { useState, useEffect } from "react";
import {
  getTodaysLaps,
  addLapEntry,
  updateLapEntry,
  deleteLapEntry,
} from "../lib/lapService";
import { getTodaysTarget, updateTodaysProgress } from "../lib/streakService";
import type { LapEntry } from "../types/laps";
import type { DailyTarget } from "../types/streak";

export const useLaps = () => {
  const [laps, setLaps] = useState<LapEntry[]>([]);
  const [dailyTarget, setDailyTarget] = useState<DailyTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      await loadTodaysLaps();
      await loadTodaysTarget();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysLaps = async () => {
    const { data, error: fetchError } = await getTodaysLaps();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setLaps(data || []);
      if (data && dailyTarget) {
        await updateProgress(data.length, dailyTarget.target);
      }
    }
  };

  const loadTodaysTarget = async () => {
    const { data, error: fetchError } = await getTodaysTarget(40); // Default 10 laps

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setDailyTarget(data);
    }
  };

  const updateProgress = async (totalLaps: number, target: number) => {
    const { data, error: updateError } = await updateTodaysProgress(
      totalLaps,
      target
    );

    if (!updateError && data) {
      setDailyTarget(data);
    }

    return { success: !updateError, data };
  };

  const addLap = async (count: number = 1) => {
    const { data, error: addError } = await addLapEntry(count);

    if (addError) {
      setError(addError.message);
      return { success: false, error: addError };
    } else {
      await loadTodaysLaps();

      if (dailyTarget) {
        const progressResult = await updateProgress(count, dailyTarget.target);
        return { success: true, data, progressUpdated: progressResult.success };
      }

      return { success: true, data };
    }
  };

  const setTarget = async (newTarget: number) => {
    if (dailyTarget) {
      const result = await updateProgress(laps.length, newTarget);
      return { success: result.success };
    } else {
      // Create new target for today
      const { data, error } = await getTodaysTarget(newTarget);
      if (data && !error) {
        setDailyTarget(data);
        return { success: true };
      }
      return { success: false, error };
    }
  };

  const updateLap = async (id: string, count: number) => {
    const { error: updateError } = await updateLapEntry(id, count);

    if (updateError) {
      setError(updateError.message);
      return { success: false, error: updateError };
    } else {
      await loadTodaysLaps();

      if (dailyTarget) {
        await updateProgress(laps.length, dailyTarget.target);
      }

      return { success: true };
    }
  };

  const deleteLap = async (id: string) => {
    const { error: deleteError } = await deleteLapEntry(id);

    if (deleteError) {
      setError(deleteError.message);
      return { success: false, error: deleteError };
    } else {
      await loadTodaysLaps();

      if (dailyTarget) {
        await updateProgress(laps.length, dailyTarget.target);
      }

      return { success: true };
    }
  };

  const totalLaps = laps.reduce((sum, lap) => sum + lap.count, 0);
  const target = dailyTarget?.target || 0;
  const remaining = Math.max(0, target - totalLaps);
  const isTargetReached = totalLaps >= target;
  const progress =
    target > 0 ? Math.min(100, Math.round((totalLaps / target) * 100)) : 0;

  return {
    laps,
    dailyTarget,
    target,
    totalLaps,
    remaining,
    progress,
    isTargetReached,
    loading,
    error,
    addLap,
    updateLap,
    deleteLap,
    setTarget,
    refreshData: loadAllData,
  };
};
