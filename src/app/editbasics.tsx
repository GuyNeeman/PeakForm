// src/app/editbasics.tsx – "Grundwerte bearbeiten" (from the profile, 08 ①)
// Same form as 02 Basics, filled in. Saving re-calculates kcal, protein and carbs.
// The water goal stays as the user set it.

import { BasicsForm } from "@/components/BasicsForm";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";

export default function EditBasics() {
  const { userBasics, updateUser, updateGoals, calculateGoals } = useApp();
  const router = useRouter();

  return (
    <BasicsForm
      initial={userBasics}
      title="Grundwerte bearbeiten"
      submitLabel="Speichern"
      onSubmit={(basics) => {
        updateUser(basics);
        const goals = calculateGoals(basics); // new kcal goal from the new values
        if (goals) {
          updateGoals({
            goal: goals.goal,
            goalprotein: goals.goalprotein,
            goalcarbs: goals.goalcarbs,
          });
        }
        router.back();
      }}
    />
  );
}
