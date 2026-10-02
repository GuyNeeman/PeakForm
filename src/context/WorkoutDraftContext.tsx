// src/context/WorkoutDraftContext.tsx
// The workout that is being created/edited in the modal, BEFORE it's saved.
// Shared by "Neues Workout" (15) and "Übung auswählen" (16), which sit in the same modal.
// Provided by src/app/editworkout/_layout.tsx.

import { PlanExercise } from "@/models/workout";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

export interface WorkoutDraft {
  name: string;
  weekdays: number[]; // 0 = Mo … 6 = So
  exercises: PlanExercise[];
}

interface WorkoutDraftContextType {
  planId: string | undefined; // set when editing an existing plan
  draft: WorkoutDraft;
  setDraft: Dispatch<SetStateAction<WorkoutDraft>>;
  isDirty: boolean; // something changed compared to the start
}

export const WorkoutDraftContext = createContext<WorkoutDraftContextType | undefined>(
  undefined,
);

export function useWorkoutDraft(): WorkoutDraftContextType {
  const context = useContext(WorkoutDraftContext);
  if (!context) {
    throw new Error("useWorkoutDraft must be used inside src/app/editworkout");
  }
  return context;
}
