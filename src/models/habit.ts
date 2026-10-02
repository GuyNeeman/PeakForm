// Symbols the user can pick (Ionicons names): book, apple, moon, drop, stretch, check
export const HABIT_ICONS = [
  "book-outline",
  "nutrition-outline",
  "moon-outline",
  "water-outline",
  "swap-horizontal-outline",
  "checkmark-outline",
] as const;
export type HabitIcon = (typeof HABIT_ICONS)[number];

// 0 = Monday … 6 = Sunday
export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAY_LETTERS = ["M", "D", "M", "D", "F", "S", "S"];

interface Habit {
  id: string;
  name: string; // "10 Seiten lesen" (max. 30 characters)
  icon: HabitIcon;
  weekdays: number[]; // days it's due, 0 = Mo … 6 = So (all 7 = daily)
  reminder: boolean; // remind me (only on due days it isn't done yet)
  time: { hour: number; minute: number }; // { hour: 17, minute: 0 } = 17:00
  doneDates: string[]; // "YYYY-MM-DD" of every day it was done → checkmark + streak
}

// What a screen fills in – id and doneDates are handled by the context
export type HabitInput = Omit<Habit, "id" | "doneDates">;

export default Habit;
