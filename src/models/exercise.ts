// One exercise from the catalog (src/constants/exercises.ts)

export type MuscleGroup =
  | "Brust"
  | "Rücken"
  | "Beine"
  | "Schultern"
  | "Arme"
  | "Bauch";

// In this order as filter chips in "Übung auswählen" (after "Alle")
export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Brust",
  "Rücken",
  "Beine",
  "Schultern",
  "Arme",
  "Bauch",
];

interface Exercise {
  id: string; // fixed, e.g. "bench-press" – plans and history point to this
  name: string; // "Bankdrücken"
  muscle: MuscleGroup; // "Brust"
  equipment: string; // "Langhantel"
}

export default Exercise;
