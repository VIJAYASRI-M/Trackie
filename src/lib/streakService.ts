import { supabase } from "./supabase";
import type { DailyTarget, StreakData } from "../types/streak";

export const getTodaysTarget = async (
  defaultTarget: number = 40
): Promise<{ data: DailyTarget | null; error: any }> => {
  const today = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }).split(",")[0];

  const { data: existing, error: fetchError } = await supabase
    .from("daily_targets")
    .select("*")
    .eq("date", today)
    .single();

  if (existing) {
    return { data: existing, error: null };
  }

  if (fetchError?.code === "PGRST116") {
    const { data, error } = await supabase
      .from("daily_targets")
      .insert([
        {
          date: today,
          target: defaultTarget,
          completed: false,
          total_laps: 0,
        },
      ])
      .select()
      .single();

    return { data, error };
  }

  return { data: null, error: fetchError };
};

export const updateTodaysProgress = async (
  totalLaps: number,
  target: number
): Promise<{ data: DailyTarget | null; error: any }> => {
  const today = new Date().toISOString().split("T")[0];
  const completed = totalLaps >= target;

  const { data, error } = await supabase
    .from("daily_targets")
    .upsert(
      {
        date: today,
        target,
        total_laps: totalLaps,
        completed,
      },
      {
        onConflict: "date",
      }
    )
    .select()
    .single();

  return { data, error };
};

export const calculateStreaks = async (): Promise<{
  data: StreakData | null;
  error: any;
}> => {
  try {
    const { data: completedDays, error } = await supabase
      .from("daily_targets")
      .select("date, completed")
      .eq("completed", true)
      .order("date", { ascending: false });

    if (error) return { data: null, error };

    if (!completedDays || completedDays.length === 0) {
      return {
        data: {
          currentStreak: 0,
          longestStreak: 0,
          totalCompletedDays: 0,
          completionRate: 0,
        },
        error: null,
      };
    }

    let currentStreak = 0;
    const today = new Date();
    const checkDate = new Date(today);

    const todayStr = today.toISOString().split("T")[0];
    const todayCompleted = completedDays.some((day) => day.date === todayStr);

    if (todayCompleted) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const completedDates = completedDays.map((day) => day.date);

    while (true) {
      const checkDateStr = checkDate.toISOString().split("T")[0];
      if (completedDates.includes(checkDateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;

    const { data: allDays } = await supabase
      .from("daily_targets")
      .select("date, completed")
      .order("date", { ascending: true });

    if (allDays) {
      for (let i = 0; i < allDays.length; i++) {
        if (allDays[i].completed) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
    }

    // Calculate completion rate
    const { data: totalDays } = await supabase
      .from("daily_targets")
      .select("completed");

    const completionRate =
      totalDays && totalDays.length > 0
        ? Math.round((completedDays.length / totalDays.length) * 100)
        : 0;

    const lastCompletedDate =
      completedDays.length > 0 ? completedDays[0].date : undefined;

    return {
      data: {
        currentStreak,
        longestStreak,
        totalCompletedDays: completedDays.length,
        completionRate,
        lastCompletedDate,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
};

export const getStreakHistory = async (
  days: number = 30
): Promise<{ data: DailyTarget[] | null; error: any }> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);

  const { data, error } = await supabase
    .from("daily_targets")
    .select("*")
    .gte("date", startDate.toISOString().split("T")[0])
    .lte("date", endDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  return { data, error };
};
