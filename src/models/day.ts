interface Day {
  date: string; // "YYYY-MM-DD" in local time (a Date would turn into a string when saved)
  kcal: number;
  water: number; // ml
  protein: number; // g
  carbs: number; // g
}

export default Day;
