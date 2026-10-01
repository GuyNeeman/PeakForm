// src/utils/date.ts

// Date → "YYYY-MM-DD" in the phone's local time.
// Not toISOString(): that uses UTC, so shortly after midnight it would still give yesterday.
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
