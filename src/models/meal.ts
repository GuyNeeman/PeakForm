interface Meal {
  name: string;
  time: "Frühstück" | "Mittag" | "Abend" | "Snack";
  kcal: number;
  protein: number; // g
  carbs: number; // g
}

export default Meal;
