// src/context/AppContext.tsx
// Global state: the user's basic info and daily goals.
// Everything is saved to AsyncStorage automatically and loaded on app start.

import { EXAMPLE_PLANS } from "@/constants/exercises";
import DailyGoals from "@/models/dailygoal";
import Day from "@/models/day";
import Habit, { ALL_WEEKDAYS, HabitInput } from "@/models/habit";
import Meal, { MealInput } from "@/models/meal";
import UserBasics from "@/models/userbasic";
import {
  SetEntry,
  WorkoutPlan,
  WorkoutPlanInput,
  WorkoutSession,
} from "@/models/workout";
import { toDateKey, weekdayIndex } from "@/utils/date";
import { syncHabitReminders } from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
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
  getMeals: (date?: string) => Meal[]; // meals of one day (default: today)
  addMeal: (meal: MealInput, date?: string) => void; // adds it to a day (default: today) + that day's totals
  updateMeal: (id: string, fields: Partial<MealInput>) => void; // edits it + corrects that day's totals
  deleteMeal: (id: string) => void; // removes it + subtracts it from that day's totals
  dayList: Day[];
  getDay: (date?: string) => Day; // a day's totals (default: today); empty day if nothing saved yet
  updateDay: (fields: Partial<Omit<Day, "date">>, date?: string) => void; // creates the day first if it's new
  habitList: Habit[];
  addHabit: (habit: HabitInput) => void;
  updateHabit: (id: string, fields: Partial<HabitInput>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDone: (id: string, date?: string) => void; // done ↔ not done (default: today)

  // Workout plans (templates)
  workoutPlans: WorkoutPlan[];
  addPlan: (plan: WorkoutPlanInput) => void;
  updatePlan: (id: string, fields: Partial<WorkoutPlanInput>) => void;
  deletePlan: (id: string) => void;
  getPlansForDay: (date?: string) => WorkoutPlan[]; // plans for that weekday (default: today)

  // History (finished trainings)
  workoutHistory: WorkoutSession[]; // newest first
  deleteSession: (id: string) => void;

  // The training that is running right now
  activeWorkout: WorkoutSession | undefined;
  startWorkout: (planId: string) => void; // weights are pre-filled from the last training
  updateSet: (exerciseIndex: number, setIndex: number, fields: Partial<SetEntry>) => void;
  addSet: (exerciseIndex: number) => void; // copies the values of the last set
  startRest: (seconds: number) => void; // pause timer, keeps running in the background
  skipRest: () => void;
  finishWorkout: () => void; // → saved to the history
  discardWorkout: () => void; // → thrown away, nothing saved
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_KEY = "userBasics";
const GOALS_KEY = "dailyGoals";
const MEALS_KEY = "meals";
const DAYS_KEY = "days";
const HABITS_KEY = "habits";
const PLANS_KEY = "workoutPlans";
const HISTORY_KEY = "workoutHistory";
const ACTIVE_WORKOUT_KEY = "activeWorkout";

// A fresh day with everything at 0
function emptyDay(date: string): Day {
  return { date, kcal: 0, water: 0, protein: 0, carbs: 0 };
}

// Short unique id, e.g. "lq3x8k2a9f1"
function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

type Totals = { kcal: number; protein: number; carbs: number };

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [userBasics, setUserBasics] = useState<UserBasics | undefined>();
  const [dailyGoals, setDailyGoals] = useState<DailyGoals | undefined>();
  const [mealList, setMealList] = useState<Meal[]>([]);
  const [dayList, setDayList] = useState<Day[]>([]);
  const [habitList, setHabitList] = useState<Habit[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | undefined>();

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
      const savedHabits = await AsyncStorage.getItem(HABITS_KEY);
      const savedPlans = await AsyncStorage.getItem(PLANS_KEY);
      const savedHistory = await AsyncStorage.getItem(HISTORY_KEY);
      const savedActive = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);

      if (savedUser) setUserBasics(JSON.parse(savedUser) as UserBasics);
      if (savedGoals) setDailyGoals(JSON.parse(savedGoals) as DailyGoals);
      if (savedMeals) {
        // Meals saved before id/date existed get one now (date: today)
        const meals = (JSON.parse(savedMeals) as Partial<Meal>[]).map(
          (meal) =>
            ({ ...meal, id: meal.id ?? makeId(), date: meal.date ?? toDateKey() }) as Meal,
        );
        setMealList(meals);
      }
      if (savedDays) setDayList(JSON.parse(savedDays) as Day[]);
      if (savedHabits) {
        // Habits saved before symbol/weekdays existed: ✓ symbol, every day
        const habits = (JSON.parse(savedHabits) as Partial<Habit>[]).map(
          (habit) =>
            ({
              ...habit,
              icon: habit.icon ?? "checkmark-outline",
              weekdays: habit.weekdays ?? ALL_WEEKDAYS,
            }) as Habit,
        );
        setHabitList(habits);
      }
      // Never saved any plans (first start / after reset) → Push / Pull / Legs as examples
      setWorkoutPlans(
        savedPlans ? (JSON.parse(savedPlans) as WorkoutPlan[]) : EXAMPLE_PLANS,
      );
      if (savedHistory) setWorkoutHistory(JSON.parse(savedHistory) as WorkoutSession[]);
      if (savedActive) setActiveWorkout(JSON.parse(savedActive) as WorkoutSession);

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

  // Habits: save + plan the reminders again (also runs once after loading = on app start)
  useEffect(() => {
    if (!isLoaded) return;
    save(HABITS_KEY, habitList);
    syncHabitReminders(habitList);
  }, [habitList, isLoaded]);

  useEffect(() => {
    if (isLoaded) save(PLANS_KEY, workoutPlans);
  }, [workoutPlans, isLoaded]);

  useEffect(() => {
    if (isLoaded) save(HISTORY_KEY, workoutHistory);
  }, [workoutHistory, isLoaded]);

  // Running training: saved while it runs (survives closing the app), removed when it ends
  useEffect(() => {
    if (!isLoaded) return;
    if (activeWorkout) save(ACTIVE_WORKOUT_KEY, activeWorkout);
    else AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
  }, [activeWorkout, isLoaded]);

  // App comes back to the foreground (e.g. the next morning) → top up the reminders
  useEffect(() => {
    if (!isLoaded) return;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") syncHabitReminders(habitList);
    });
    return () => subscription.remove();
  }, [habitList, isLoaded]);

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

  // ---------- MEALS ----------
  // The day totals (kcal, protein, carbs) are kept in sync here,
  // so screens never have to add or subtract themselves.

  // getMeals()              → today's meals
  // getMeals("2026-09-30")  → that day's meals
  function getMeals(date: string = toDateKey()): Meal[] {
    return mealList.filter((meal) => meal.date === date);
  }

  // addMeal({ name: "Müesli", time: "Frühstück", kcal: 450, protein: 15, carbs: 60 })
  // addMeal({ ... }, "2026-09-30")  → adds it to that day instead (e.g. forgot to log it yesterday)
  function addMeal(input: MealInput, date: string = toDateKey()): void {
    const meal: Meal = { ...input, id: makeId(), date };
    setMealList((currentList) => [...currentList, meal]);
    changeDayTotals(meal.date, meal);
  }

  // updateMeal(id, { kcal: 500 })  → only kcal changes, the day total is corrected by +50 / −50 …
  function updateMeal(id: string, fields: Partial<MealInput>): void {
    const oldMeal = mealList.find((meal) => meal.id === id);
    if (!oldMeal) return;
    const newMeal: Meal = { ...oldMeal, ...fields };

    setMealList((currentList) =>
      currentList.map((meal) => (meal.id === id ? newMeal : meal)),
    );
    changeDayTotals(oldMeal.date, {
      kcal: newMeal.kcal - oldMeal.kcal,
      protein: newMeal.protein - oldMeal.protein,
      carbs: newMeal.carbs - oldMeal.carbs,
    });
  }

  function deleteMeal(id: string): void {
    const meal = mealList.find((m) => m.id === id);
    if (!meal) return;

    setMealList((currentList) => currentList.filter((m) => m.id !== id));
    changeDayTotals(meal.date, {
      kcal: -meal.kcal,
      protein: -meal.protein,
      carbs: -meal.carbs,
    });
  }

  // Adds (or with negative numbers subtracts) to a day's totals. Never goes below 0.
  function changeDayTotals(date: string, change: Totals): void {
    setDayList((currentList) => {
      const exists = currentList.some((day) => day.date === date);
      const list = exists ? currentList : [...currentList, emptyDay(date)];

      return list.map((day) =>
        day.date === date
          ? {
              ...day,
              kcal: Math.max(0, day.kcal + change.kcal),
              protein: Math.max(0, day.protein + change.protein),
              carbs: Math.max(0, day.carbs + change.carbs),
            }
          : day,
      );
    });
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

  // ---------- HABITS ----------
  // Reminders are NOT handled here: every change to habitList re-plans them (see the effect above).

  // addHabit({ name: "Dehnen", icon: "swap-horizontal-outline", weekdays: ALL_WEEKDAYS,
  //            reminder: true, time: { hour: 17, minute: 0 } })
  function addHabit(input: HabitInput): void {
    const habit: Habit = { ...input, id: makeId(), doneDates: [] };
    setHabitList((currentList) => [...currentList, habit]);
  }

  // updateHabit(id, { time: { hour: 18, minute: 30 } })  → only the time changes
  function updateHabit(id: string, fields: Partial<HabitInput>): void {
    setHabitList((currentList) =>
      currentList.map((habit) => (habit.id === id ? { ...habit, ...fields } : habit)),
    );
  }

  function deleteHabit(id: string): void {
    setHabitList((currentList) => currentList.filter((habit) => habit.id !== id));
  }

  // Ticks the habit off for a day – or un-ticks it if it was already done.
  // Done today → today's reminder is skipped automatically.
  function toggleHabitDone(id: string, date: string = toDateKey()): void {
    setHabitList((currentList) =>
      currentList.map((habit) => {
        if (habit.id !== id) return habit;
        const isDone = habit.doneDates.includes(date);
        return {
          ...habit,
          doneDates: isDone
            ? habit.doneDates.filter((d) => d !== date)
            : [...habit.doneDates, date],
        };
      }),
    );
  }

  // ---------- WORKOUT PLANS ----------
  // addPlan({ name: "Push Day", weekdays: [0, 3],
  //           exercises: [{ exerciseId: "bench-press", sets: 3, reps: 10 }] })
  function addPlan(input: WorkoutPlanInput): void {
    setWorkoutPlans((currentList) => [...currentList, { ...input, id: makeId() }]);
  }

  function updatePlan(id: string, fields: Partial<WorkoutPlanInput>): void {
    setWorkoutPlans((currentList) =>
      currentList.map((plan) => (plan.id === id ? { ...plan, ...fields } : plan)),
    );
  }

  // The history keeps its entries (they have their own copy of the name)
  function deletePlan(id: string): void {
    setWorkoutPlans((currentList) => currentList.filter((plan) => plan.id !== id));
  }

  // getPlansForDay() → today's workouts, e.g. for "heutiges Workout" on Home
  function getPlansForDay(date: string = toDateKey()): WorkoutPlan[] {
    const weekday = weekdayIndex(date);
    return workoutPlans.filter((plan) => plan.weekdays.includes(weekday));
  }

  // ---------- HISTORY ----------
  function deleteSession(id: string): void {
    setWorkoutHistory((currentList) => currentList.filter((s) => s.id !== id));
  }

  // ---------- RUNNING TRAINING ----------
  // Creates the sets from the plan. Reps = plan, kg = what you lifted last time (if any).
  function startWorkout(planId: string): void {
    const plan = workoutPlans.find((p) => p.id === planId);
    if (!plan) return;

    const exercises = plan.exercises.map(({ exerciseId, sets, reps }) => {
      // Most recent training with this exercise (history is newest first)
      const lastTime = workoutHistory
        .flatMap((session) => session.exercises)
        .find((exercise) => exercise.exerciseId === exerciseId);

      return {
        exerciseId,
        sets: Array.from({ length: sets }, (_, i): SetEntry => ({
          kg: lastTime?.sets[Math.min(i, lastTime.sets.length - 1)]?.kg ?? null,
          reps,
          done: false,
        })),
      };
    });

    setActiveWorkout({
      id: makeId(),
      planId: plan.id,
      planName: plan.name,
      date: toDateKey(),
      startedAt: Date.now(),
      exercises,
    });
  }

  // updateSet(0, 1, { kg: 60 })  → 1st exercise, 2nd set: 60 kg
  // updateSet(0, 1, { done: true }) → ticked
  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    fields: Partial<SetEntry>,
  ): void {
    setActiveWorkout((session) =>
      session && {
        ...session,
        exercises: session.exercises.map((exercise, e) =>
          e !== exerciseIndex
            ? exercise
            : {
                ...exercise,
                sets: exercise.sets.map((set, s) =>
                  s === setIndex ? { ...set, ...fields } : set,
                ),
              },
        ),
      },
    );
  }

  // New set with the values of the last one (not ticked yet)
  function addSet(exerciseIndex: number): void {
    setActiveWorkout((session) =>
      session && {
        ...session,
        exercises: session.exercises.map((exercise, e) => {
          if (e !== exerciseIndex) return exercise;
          const last = exercise.sets[exercise.sets.length - 1];
          const newSet: SetEntry = {
            kg: last?.kg ?? null,
            reps: last?.reps ?? null,
            done: false,
          };
          return { ...exercise, sets: [...exercise.sets, newSet] };
        }),
      },
    );
  }

  // Pause timer: stores WHEN it ends, so it keeps counting even if you leave the screen
  function startRest(seconds: number): void {
    setActiveWorkout(
      (session) => session && { ...session, restEndsAt: Date.now() + seconds * 1000 },
    );
  }

  function skipRest(): void {
    setActiveWorkout((session) => session && { ...session, restEndsAt: undefined });
  }

  function finishWorkout(): void {
    if (!activeWorkout) return;
    const finished: WorkoutSession = {
      ...activeWorkout,
      endedAt: Date.now(),
      restEndsAt: undefined,
    };
    setWorkoutHistory((currentList) => [finished, ...currentList]); // newest first
    setActiveWorkout(undefined);
  }

  function discardWorkout(): void {
    setActiveWorkout(undefined);
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
    await AsyncStorage.multiRemove([
      USER_KEY,
      GOALS_KEY,
      MEALS_KEY,
      DAYS_KEY,
      HABITS_KEY,
      PLANS_KEY,
      HISTORY_KEY,
      ACTIVE_WORKOUT_KEY,
    ]);
    setUserBasics(undefined);
    setDailyGoals(undefined);
    setMealList([]);
    setDayList([]);
    setHabitList([]); // → the habit effect also cancels all reminders
    setWorkoutPlans(EXAMPLE_PLANS); // fresh start → examples again
    setWorkoutHistory([]);
    setActiveWorkout(undefined);
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
        getMeals,
        addMeal,
        updateMeal,
        deleteMeal,
        dayList,
        getDay,
        updateDay,
        habitList,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDone,
        workoutPlans,
        addPlan,
        updatePlan,
        deletePlan,
        getPlansForDay,
        workoutHistory,
        deleteSession,
        activeWorkout,
        startWorkout,
        updateSet,
        addSet,
        startRest,
        skipRest,
        finishWorkout,
        discardWorkout,
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
