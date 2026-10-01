// src/context/AppContext.tsx
// Global state: the user's basic info and daily goals.
// Everything is saved to AsyncStorage automatically and loaded on app start.

import DailyGoals from "@/models/dailygoal";
import Day from "@/models/day";
import Meal from "@/models/meal";
import UserBasics from "@/models/userbasic";
import { toDateKey } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

interface AppContextType {
  isLoaded: boolean; // false while loading from storage
  onboardingDone: boolean; // true when basics AND goals exist
  userBasics: UserBasics | undefined;
  dailyGoals: DailyGoals | undefined;
  updateUser: (fields: Partial<UserBasics>) => void; // change one or more fields
  updateGoals: (fields: Partial<DailyGoals>) => void; // change one or more fields
  resetAll: () => Promise<void>; // delete everything (log out / testing)
  calculateGoals: (
    basics?: UserBasics,
    kcal?: number,
  ) => DailyGoals | undefined; // suggested goals
  mealList: Meal[];
  addMeal: (meal: Meal) => void;
  dayList: Day[];
  getDay: (date?: string) => Day; // a day's totals (default: today); empty day if nothing saved yet
  updateDay: (fields: Partial<Omit<Day, "date">>, date?: string) => void; // creates the day first if it's new
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_KEY = "userBasics";
const GOALS_KEY = "dailyGoals";
const MEALS_KEY = "meals";
const DAYS_KEY = "days";

// A fresh day with everything at 0
function emptyDay(date: string): Day {
  return { date, kcal: 0, water: 0, protein: 0, carbs: 0 };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [userBasics, setUserBasics] = useState<UserBasics | undefined>();
  const [dailyGoals, setDailyGoals] = useState<DailyGoals | undefined>();
  const [mealList, setMealList] = useState<Meal[]>([]);
  const [dayList, setDayList] = useState<Day[]>([]);

  // ---------- LOAD (once, when the app starts) ----------
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll(): Promise<void> {
    try {
      const savedUser = await AsyncStorage.getItem(USER_KEY);
      const savedGoals = await AsyncStorage.getItem(GOALS_KEY);
      const savedMeals = await AsyncStorage.getItem(MEALS_KEY);
      const savedDays = await AsyncStorage.getItem(DAYS_KEY);

      if (savedUser) setUserBasics(JSON.parse(savedUser) as UserBasics);
      if (savedGoals) setDailyGoals(JSON.parse(savedGoals) as DailyGoals);
      if (savedMeals) setMealList(JSON.parse(savedMeals) as Meal[]);
      if (savedDays) setDayList(JSON.parse(savedDays) as Day[]);

      console.log("Data successfully loaded");
    } catch {
      console.error("An error happened while loading the data");
    } finally {
      setIsLoaded(true);
    }
  }

  // ---------- SAVE (automatically, whenever something changes) ----------
  useEffect(() => {
    if (isLoaded && userBasics) save(USER_KEY, userBasics);
  }, [userBasics, isLoaded]);

  useEffect(() => {
    if (isLoaded && dailyGoals) save(GOALS_KEY, dailyGoals);
  }, [dailyGoals, isLoaded]);

  useEffect(() => {
    if (isLoaded && mealList) save(MEALS_KEY, mealList);
  }, [mealList, isLoaded]);

  useEffect(() => {
    if (isLoaded) save(DAYS_KEY, dayList);
  }, [dayList, isLoaded]);

  async function save(key: string, data: object): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log(`${key} successfully saved`);
    } catch {
      console.error(`An error happened while saving ${key}`);
    }
  }

  // ---------- UPDATE specific fields ----------
  // updateUser({ weight: 78 })  → only weight changes, the rest stays
  function updateUser(fields: Partial<UserBasics>): void {
    setUserBasics((prev) => ({ ...prev, ...fields }) as UserBasics);
  }

  // updateGoals({ goalwater: 3000 })  → only the water goal changes
  function updateGoals(fields: Partial<DailyGoals>): void {
    setDailyGoals((prev) => ({ ...prev, ...fields }) as DailyGoals);
  }

  function addMeal(meal: Meal) {
    setMealList((currentList) => [...currentList, meal]);
  }

  // ---------- DAYS ----------
  // getDay()              → today
  // getDay("2026-09-30")  → that day
  // If the day has no entry yet (e.g. a new day just started), you get an empty day with 0s.
  function getDay(date: string = toDateKey()): Day {
    return dayList.find((day) => day.date === date) ?? emptyDay(date);
  }

  // updateDay({ water: 1500 })  → sets today's water, the rest stays
  // Checks first if the day already exists – if not (new day), it is created with 0s.
  function updateDay(
    fields: Partial<Omit<Day, "date">>,
    date: string = toDateKey(),
  ): void {
    setDayList((currentList) => {
      const exists = currentList.some((day) => day.date === date);
      const list = exists ? currentList : [...currentList, emptyDay(date)];

      return list.map((day) => (day.date === date ? { ...day, ...fields } : day));
    });
  }

  // ---------- CALCULATE daily goals from the basic info ----------
  // Returns the suggestion only – save it with updateGoals(...) when the user confirms.
  // Without basics it uses the saved userBasics.
  // Pass kcal to get protein/carbs for a calorie value the user picked (e.g. with the stepper).
  function calculateGoals(
    basics: UserBasics | undefined = userBasics,
    kcalOverride?: number,
  ): DailyGoals | undefined {
    if (!basics) return undefined;
    const { sex, age, height, weight, activity, goal } = basics;

    // 1) Basal metabolic rate (Mifflin-St Jeor): energy the body needs at rest
    const sexAdjustment =
      sex === "Männlich" ? 5 : sex === "Weiblich" ? -161 : -78; // Divers = middle
    const bmr = 10 * weight + 6.25 * height - 5 * age + sexAdjustment;

    // 2) Multiply by how active the user is
    const activityFactor = { Wenig: 1.2, Mittel: 1.55, Viel: 1.725 }[activity];
    const maintenance = bmr * activityFactor;

    // 3) Adjust for the goal
    const goalAdjustment = { Abnehmen: -500, Halten: 0, Aufbauen: 300 }[goal];
    const suggestedKcal = Math.round((maintenance + goalAdjustment) / 50) * 50; // rounded to 50 (fits the ± stepper)
    const kcal = kcalOverride ?? suggestedKcal;

    // 4) Macros: protein per kg body weight, 25 % of kcal from fat, the rest carbs
    const protein = Math.round(weight * (goal === "Halten" ? 1.6 : 2.0)); // g
    const fatKcal = kcal * 0.25;
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fatKcal) / 4)); // g (1 g carbs = 4 kcal)

    // 5) Water: about 35 ml per kg body weight, rounded to 250 ml (one glass)
    const water = Math.round((weight * 35) / 250) * 250; // ml

    return {
      goal: kcal,
      goalwater: water,
      goalprotein: protein,
      goalcarbs: carbs,
    };
  }

  // ---------- RESET ----------
  async function resetAll(): Promise<void> {
    await AsyncStorage.multiRemove([USER_KEY, GOALS_KEY, MEALS_KEY, DAYS_KEY]);
    setUserBasics(undefined);
    setDailyGoals(undefined);
    setMealList([]);
    setDayList([]);
  }

  return (
    <AppContext.Provider
      value={{
        isLoaded,
        onboardingDone: !!userBasics && !!dailyGoals,
        userBasics,
        dailyGoals,
        updateUser,
        updateGoals,
        resetAll,
        calculateGoals,
        mealList,
        addMeal,
        dayList,
        getDay,
        updateDay,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Use in any screen: const { userBasics, updateUser } = useApp();
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
