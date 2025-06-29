import type { LapEntry } from "../types/laps";
import { supabase } from "./supabase";

export const addLapEntry = async (
  count: number
): Promise<{ data: LapEntry[] | null; error: any }> => {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from("lap_entries")
    .insert([
      {
        date,
        timestamp: now.toISOString(),
        count,
      },
    ])
    .select();

  return { data, error };
};

export const getLapsForDate = async (
  date: string
): Promise<{ data: LapEntry[] | null; error: any }> => {
  const { data, error } = await supabase
    .from("lap_entries")
    .select("*")
    .eq("date", date)
    .order("timestamp", { ascending: true });

  return { data, error };
};

export const getTodaysLaps = async (): Promise<{
  data: LapEntry[] | null;
  error: any;
}> => {
  const today = new Date().toISOString().split("T")[0];
  return getLapsForDate(today);
};

export const getLapsForDateRange = async (
  startDate: string,
  endDate: string
): Promise<{ data: LapEntry[] | null; error: any }> => {
  const { data, error } = await supabase
    .from("lap_entries")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("timestamp", { ascending: true });

  return { data, error };
};

export const updateLapEntry = async (
  id: string,
  count: number
): Promise<{ data: LapEntry[] | null; error: any }> => {
  const { data, error } = await supabase
    .from("lap_entries")
    .update({ count })
    .eq("id", id)
    .select();

  return { data, error };
};

export const deleteLapEntry = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase.from("lap_entries").delete().eq("id", id);

  return { error };
};

export const getLapsSummary = async (
  limit: number = 30
): Promise<{ data: any[] | null; error: any }> => {
  const { data, error } = await supabase
    .from("lap_entries")
    .select("date, count")
    .order("date", { ascending: false })
    .limit(limit * 10);

  return { data, error };
};
