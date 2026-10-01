// src/context/AppContext.tsx
// Global state: the user's basic info and daily goals.
// Everything is saved to AsyncStorage automatically and loaded on app start.

import DailyGoals from "@/models/dailygoals";
import UserBasics from "@/models/userbasic";
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_KEY = "userBasics";
const GOALS_KEY = "dailyGoals";

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [userBasics, setUserBasics] = useState<UserBasics | undefined>();
  const [dailyGoals, setDailyGoals] = useState<DailyGoals | undefined>();

  // ---------- LOAD (once, when the app starts) ----------
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll(): Promise<void> {
    try {
      const savedUser = await AsyncStorage.getItem(USER_KEY);
      const savedGoals = await AsyncStorage.getItem(GOALS_KEY);

      if (savedUser) setUserBasics(JSON.parse(savedUser) as UserBasics);
      if (savedGoals) setDailyGoals(JSON.parse(savedGoals) as DailyGoals);

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

  // ---------- RESET ----------
  async function resetAll(): Promise<void> {
    await AsyncStorage.multiRemove([USER_KEY, GOALS_KEY]);
    setUserBasics(undefined);
    setDailyGoals(undefined);
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
