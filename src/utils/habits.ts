// src/utils/habits.ts – small helpers around habits

import Habit from "@/models/habit";
import { addDays, toDateKey, weekdayIndex } from "@/utils/date";

// Is the habit due on this day? (daily → always, "Bestimmte Tage" → only those weekdays)
export function isDueOn(habit: Habit, date: string): boolean {
  return habit.weekdays.includes(weekdayIndex(date));
}

export function isDoneOn(habit: Habit, date: string): boolean {
  return habit.doneDates.includes(date);
}

// Due days in a row the habit was done. Days it isn't due don't count and don't break it.
// Not done yet today doesn't break the streak either – the day isn't over.
export function streak(habit: Habit): number {
  if (habit.weekdays.length === 0 || habit.doneDates.length === 0) return 0;

  const earliest = [...habit.doneDates].sort()[0]; // no need to look further back
  const today = toDateKey();
  let date =
    isDueOn(habit, today) && !isDoneOn(habit, today) ? addDays(today, -1) : today;
  let count = 0;

  while (date >= earliest) {
    if (isDueOn(habit, date)) {
      if (!isDoneOn(habit, date)) break;
      count++;
    }
    date = addDays(date, -1);
  }
  return count;
}

// 17, 0 → "17:00"
export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
