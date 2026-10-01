export type MealTime = "Frühstück" | "Mittag" | "Abend" | "Snack";

// In this order on the screens
export const MEAL_TIMES: MealTime[] = ["Frühstück", "Mittag", "Abend", "Snack"];

interface Meal {
  id: string; // unique – names can repeat ("Apfel" twice a day)
  date: string; // "YYYY-MM-DD", the day the meal belongs to
  name: string;
  time: MealTime;
  kcal: number;
  protein: number; // g
  carbs: number; // g
}

// What a screen fills in – id and date are added by the context
export type MealInput = Omit<Meal, "id" | "date">;

export default Meal;
