// Workouts: a PLAN is the template ("Push Day: Bankdrücken 3×10, …"),
// a SESSION is one real training with the weights and reps you actually did.
// Finished sessions = the history ("Verlauf").

// ---------- PLAN ----------
export interface PlanExercise {
  exerciseId: string; // → Exercise.id
  sets: number; // 3   ← "3 × 10"
  reps: number; // 10
}

export interface WorkoutPlan {
  id: string;
  name: string; // "Push Day"
  weekdays: number[]; // 0 = Mo … 6 = So – shown on Home as "heutiges Workout"
  exercises: PlanExercise[]; // in this order
}

// What the "Neues Workout" screen fills in – the id is added by the context
export type WorkoutPlanInput = Omit<WorkoutPlan, "id">;

// ---------- SESSION ----------
export interface SetEntry {
  kg: number | null; // null = not entered yet
  reps: number | null;
  done: boolean; // ✓ ticked
}

export interface SessionExercise {
  exerciseId: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  planId: string;
  planName: string; // copied: the history still shows the name if the plan gets deleted
  date: string; // "YYYY-MM-DD"
  startedAt: number; // ms timestamp
  endedAt?: number; // set when finished
  exercises: SessionExercise[];
  restEndsAt?: number; // rest timer: ms timestamp when the pause is over (keeps running in the background)
}

// Ticked sets / all sets – for "6 von 8 Sätzen erledigt"
export function countSets(session: WorkoutSession): { done: number; total: number } {
  const all = session.exercises.flatMap((exercise) => exercise.sets);
  return { done: all.filter((set) => set.done).length, total: all.length };
}
