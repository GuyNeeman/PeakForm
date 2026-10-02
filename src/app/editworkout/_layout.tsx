// src/app/editworkout/_layout.tsx – the "Neues Workout" modal
// /editworkout          → 15 new workout
// /editworkout?id=abc   → 15 edit that plan
// /editworkout/exercises → 16 pick exercises (pushed inside the modal)  ← step 4
//
// Holds the draft (name, days, exercises) so both screens work on the same data.

import { useTheme } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { WorkoutDraft, WorkoutDraftContext } from "@/context/WorkoutDraftContext";
import { Stack, useGlobalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";

export default function EditWorkoutLayout() {
  const { colors } = useTheme();
  const { workoutPlans } = useApp();
  const navigation = useNavigation(); // = this modal inside the root stack

  // Read once when the modal opens: editing an existing plan or a new one?
  const { id } = useGlobalSearchParams<{ id?: string }>();
  const [initial] = useState(() => {
    const plan = workoutPlans.find((p) => p.id === id);
    const start: WorkoutDraft = {
      name: plan?.name ?? "",
      weekdays: plan?.weekdays ?? [],
      exercises: plan?.exercises ?? [],
    };
    return { planId: plan?.id, start };
  });

  const [draft, setDraft] = useState<WorkoutDraft>(initial.start);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(initial.start);

  // Swipe down only closes while nothing was changed – otherwise use "Abbrechen" (asks first)
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !isDirty });
  }, [navigation, isDirty]);

  return (
    <WorkoutDraftContext.Provider
      value={{ planId: initial.planId, draft, setDraft, isDirty }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </WorkoutDraftContext.Provider>
  );
}
