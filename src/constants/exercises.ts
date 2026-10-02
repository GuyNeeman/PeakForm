// src/constants/exercises.ts – all exercises the user can pick from ("Übung auswählen").
// The ids must never change: saved plans and the history point to them.

import Exercise, { MuscleGroup } from "@/models/exercise";
import { WorkoutPlan } from "@/models/workout";

export const EXERCISES: Exercise[] = [
  // Brust
  { id: "bench-press", name: "Bankdrücken", muscle: "Brust", equipment: "Langhantel" },
  { id: "incline-bench-press", name: "Schrägbankdrücken", muscle: "Brust", equipment: "Kurzhantel" },
  { id: "butterfly", name: "Butterfly", muscle: "Brust", equipment: "Maschine" },
  { id: "dips", name: "Dips", muscle: "Brust", equipment: "Körpergewicht" },
  { id: "push-ups", name: "Liegestütze", muscle: "Brust", equipment: "Körpergewicht" },
  { id: "cable-crossover", name: "Kabelzug-Crossover", muscle: "Brust", equipment: "Kabelzug" },

  // Rücken
  { id: "pull-ups", name: "Klimmzüge", muscle: "Rücken", equipment: "Körpergewicht" },
  { id: "barbell-row", name: "Rudern Langhantel", muscle: "Rücken", equipment: "Langhantel" },
  { id: "lat-pulldown", name: "Latzug", muscle: "Rücken", equipment: "Kabelzug" },
  { id: "seated-row", name: "Rudern sitzend", muscle: "Rücken", equipment: "Kabelzug" },
  { id: "deadlift", name: "Kreuzheben", muscle: "Rücken", equipment: "Langhantel" },
  { id: "dumbbell-row", name: "Einarmiges Rudern", muscle: "Rücken", equipment: "Kurzhantel" },

  // Beine
  { id: "squat", name: "Kniebeugen", muscle: "Beine", equipment: "Langhantel" },
  { id: "leg-press", name: "Beinpresse", muscle: "Beine", equipment: "Maschine" },
  { id: "lunges", name: "Ausfallschritte", muscle: "Beine", equipment: "Kurzhantel" },
  { id: "romanian-deadlift", name: "Rumänisches Kreuzheben", muscle: "Beine", equipment: "Langhantel" },
  { id: "leg-curl", name: "Beinbeuger", muscle: "Beine", equipment: "Maschine" },
  { id: "leg-extension", name: "Beinstrecker", muscle: "Beine", equipment: "Maschine" },
  { id: "calf-raise", name: "Wadenheben", muscle: "Beine", equipment: "Maschine" },
  { id: "hip-thrust", name: "Hip Thrust", muscle: "Beine", equipment: "Langhantel" },

  // Schultern
  { id: "overhead-press", name: "Schulterdrücken", muscle: "Schultern", equipment: "Kurzhantel" },
  { id: "lateral-raise", name: "Seitheben", muscle: "Schultern", equipment: "Kurzhantel" },
  { id: "face-pull", name: "Face Pulls", muscle: "Schultern", equipment: "Kabelzug" },
  { id: "reverse-fly", name: "Reverse Butterfly", muscle: "Schultern", equipment: "Maschine" },

  // Arme
  { id: "bicep-curl", name: "Bizepscurls", muscle: "Arme", equipment: "Kurzhantel" },
  { id: "hammer-curl", name: "Hammercurls", muscle: "Arme", equipment: "Kurzhantel" },
  { id: "triceps-pushdown", name: "Trizepsdrücken", muscle: "Arme", equipment: "Kabelzug" },
  { id: "skull-crusher", name: "French Press", muscle: "Arme", equipment: "SZ-Stange" },

  // Bauch
  { id: "plank", name: "Plank", muscle: "Bauch", equipment: "Körpergewicht" },
  { id: "crunches", name: "Crunches", muscle: "Bauch", equipment: "Körpergewicht" },
  { id: "hanging-leg-raise", name: "Beinheben hängend", muscle: "Bauch", equipment: "Körpergewicht" },
];

// Example plans for new users (Push / Pull / Legs, each twice a week).
// Only created when no plans were ever saved – deleted examples don't come back.
export const EXAMPLE_PLANS: WorkoutPlan[] = [
  {
    id: "example-push",
    name: "Push Day",
    weekdays: [0, 3], // Mo, Do
    exercises: [
      { exerciseId: "bench-press", sets: 3, reps: 10 },
      { exerciseId: "incline-bench-press", sets: 3, reps: 10 },
      { exerciseId: "overhead-press", sets: 3, reps: 10 },
      { exerciseId: "lateral-raise", sets: 3, reps: 12 },
      { exerciseId: "triceps-pushdown", sets: 3, reps: 12 },
    ],
  },
  {
    id: "example-pull",
    name: "Pull Day",
    weekdays: [1, 4], // Di, Fr
    exercises: [
      { exerciseId: "pull-ups", sets: 3, reps: 8 },
      { exerciseId: "barbell-row", sets: 3, reps: 10 },
      { exerciseId: "lat-pulldown", sets: 3, reps: 10 },
      { exerciseId: "face-pull", sets: 3, reps: 12 },
      { exerciseId: "bicep-curl", sets: 3, reps: 12 },
      { exerciseId: "hammer-curl", sets: 3, reps: 12 },
    ],
  },
  {
    id: "example-legs",
    name: "Leg Day",
    weekdays: [2, 5], // Mi, Sa
    exercises: [
      { exerciseId: "squat", sets: 3, reps: 8 },
      { exerciseId: "romanian-deadlift", sets: 3, reps: 10 },
      { exerciseId: "leg-press", sets: 3, reps: 10 },
      { exerciseId: "leg-curl", sets: 3, reps: 12 },
      { exerciseId: "calf-raise", sets: 3, reps: 15 },
    ],
  },
];

// getExercise("bench-press") → Bankdrücken
export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((exercise) => exercise.id === id);
}

// Muscle groups of a plan, without duplicates, e.g. "Brust · Schultern · Arme"
export function muscleSummary(exerciseIds: string[]): string {
  const groups: MuscleGroup[] = [];
  for (const id of exerciseIds) {
    const muscle = getExercise(id)?.muscle;
    if (muscle && !groups.includes(muscle)) groups.push(muscle);
  }
  return groups.join(" · ");
}
