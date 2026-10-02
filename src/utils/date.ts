// src/utils/date.ts

// Date → "YYYY-MM-DD" in the phone's local time.
// Not toISOString(): that uses UTC, so shortly after midnight it would still give yesterday.
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// "2026-10-01" → Date (local time, midnight)
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// addDays("2026-10-01", -1) → "2026-09-30"
export function addDays(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days); // handles month/year changes by itself
  return toDateKey(date);
}

// Weekday as 0 = Monday … 6 = Sunday (JS getDay() starts with Sunday = 0)
export function weekdayIndex(key: string): number {
  return (fromDateKey(key).getDay() + 6) % 7;
}

// The 7 days (Monday → Sunday) of the week that contains this day
export function weekDates(key: string = toDateKey()): string[] {
  const monday = addDays(key, -weekdayIndex(key));
  return [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(monday, i));
}

// "Heute", "Gestern" or e.g. "Mo., 28. Sept."
export function dayLabel(key: string): string {
  const today = toDateKey();
  if (key === today) return "Heute";
  if (key === addDays(today, -1)) return "Gestern";
  if (key === addDays(today, 1)) return "Morgen";
  return fromDateKey(key).toLocaleDateString("de-CH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
