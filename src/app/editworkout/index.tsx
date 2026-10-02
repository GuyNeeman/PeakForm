// src/app/editworkout/index.tsx – 15 Neues Workout (modal)
// Create your own training plan, or edit one.
//
// ① Name             → required, max. 30 characters
// ② Wochentage       → optional; these days show the plan on Home as "heutiges Workout"
// ③ Übungszeile      → − / + changes the number of sets, swipe left → "Entfernen"
// ④ Übung hinzufügen → "Übung auswählen" (16) inside this modal   ← step 4
// ⑤ Speichern        → disabled until there's a name and at least one exercise
// ⑥ Abbrechen        → closes without saving (asks first if something was changed)

import { AppText } from "@/components/AppText";
import { SwipeableRow } from "@/components/SwipeableRow";
import { TextField } from "@/components/TextField";
import { getExercise } from "@/constants/exercises";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useWorkoutDraft } from "@/context/WorkoutDraftContext";
import { WEEKDAY_LETTERS } from "@/models/habit";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_SETS = 1;
const MAX_SETS = 10;

export default function EditWorkout() {
  const { addPlan, updatePlan } = useApp();
  const { planId, draft, setDraft, isDirty } = useWorkoutDraft();
  const router = useRouter();

  const isComplete = draft.name.trim().length > 0 && draft.exercises.length > 0;

  function toggleWeekday(day: number) {
    setDraft((d) => ({
      ...d,
      weekdays: d.weekdays.includes(day)
        ? d.weekdays.filter((x) => x !== day)
        : [...d.weekdays, day].sort(),
    }));
  }

  // ③ − / + : number of sets, between 1 and 10
  function changeSets(index: number, step: number) {
    setDraft((d) => ({
      ...d,
      exercises: d.exercises.map((exercise, i) =>
        i === index
          ? {
              ...exercise,
              sets: Math.min(MAX_SETS, Math.max(MIN_SETS, exercise.sets + step)),
            }
          : exercise,
      ),
    }));
  }

  function removeExercise(index: number) {
    setDraft((d) => ({ ...d, exercises: d.exercises.filter((_, i) => i !== index) }));
  }

  function save() {
    const plan = { ...draft, name: draft.name.trim() };
    if (planId) updatePlan(planId, plan);
    else addPlan(plan);
    router.back(); // closes the modal, the plan appears in Workouts (06)
  }

  function cancel() {
    if (!isDirty) {
      router.back();
      return;
    }
    Alert.alert("Änderungen verwerfen?", "Deine Eingaben gehen verloren.", [
      { text: "Weiter bearbeiten", style: "cancel" },
      { text: "Verwerfen", style: "destructive", onPress: () => router.back() },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.grabber} />

      {/* ⑥ Abbrechen + title */}
      <View style={styles.topBar}>
        <Pressable onPress={cancel} hitSlop={8} style={styles.topSide}>
          <AppText variant="label" style={styles.cancelText}>
            Abbrechen
          </AppText>
        </Pressable>
        <AppText variant="label">
          {planId ? "Workout bearbeiten" : "Neues Workout"}
        </AppText>
        <View style={styles.topSide} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        {/* ① Name */}
        <View style={styles.row}>
          <TextField
            label="Name"
            value={draft.name}
            onChange={(name) => setDraft((d) => ({ ...d, name }))}
            keyboardType="default"
            placeholder="z. B. Push Day"
            maxLength={30}
          />
        </View>

        {/* ② An welchen Tagen? */}
        <View style={styles.section}>
          <AppText variant="label" muted>
            An welchen Tagen?
          </AppText>
          <View style={styles.weekdayRow}>
            {WEEKDAY_LETTERS.map((letter, day) => {
              const isOn = draft.weekdays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleWeekday(day)}
                  accessibilityState={{ selected: isOn }}
                  style={[styles.weekday, isOn && styles.weekdayOn]}
                >
                  <AppText variant="label" color={isOn ? colors.onPrimary : undefined}>
                    {letter}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ③ Übungen */}
        <View style={styles.section}>
          <AppText variant="caption" muted style={styles.sectionTitle}>
            ÜBUNGEN
          </AppText>

          {draft.exercises.map((planExercise, index) => (
            <SwipeableRow
              key={planExercise.exerciseId}
              actions={[
                {
                  label: "Entfernen",
                  color: colors.danger,
                  onPress: () => removeExercise(index),
                },
              ]}
            >
              <View style={styles.exerciseRow}>
                <AppText variant="label" style={styles.exerciseName} numberOfLines={1}>
                  {getExercise(planExercise.exerciseId)?.name ?? "Unbekannte Übung"}
                </AppText>
                <Pressable
                  onPress={() => changeSets(index, -1)}
                  disabled={planExercise.sets <= MIN_SETS}
                  accessibilityLabel="Ein Satz weniger"
                  style={[
                    styles.stepButton,
                    planExercise.sets <= MIN_SETS && styles.stepDisabled,
                  ]}
                >
                  <Ionicons name="remove" size={18} color={colors.text} />
                </Pressable>
                <AppText variant="label" style={styles.setsText}>
                  {planExercise.sets} × {planExercise.reps}
                </AppText>
                <Pressable
                  onPress={() => changeSets(index, 1)}
                  disabled={planExercise.sets >= MAX_SETS}
                  accessibilityLabel="Ein Satz mehr"
                  style={[
                    styles.stepButton,
                    planExercise.sets >= MAX_SETS && styles.stepDisabled,
                  ]}
                >
                  <Ionicons name="add" size={18} color={colors.text} />
                </Pressable>
              </View>
            </SwipeableRow>
          ))}

          {/* ④ Übung hinzufügen */}
          <Pressable
            onPress={() =>
              // TEMPORARY until "Übung auswählen" (16) exists – step 4
              Alert.alert("Kommt bald", "„Übung auswählen“ wird im nächsten Schritt gebaut.")
            }
            style={({ pressed }) => [styles.addExercise, pressed && styles.pressed]}
          >
            <AppText variant="label">+ Übung hinzufügen</AppText>
          </Pressable>
        </View>
      </ScrollView>

      {/* ⑤ Save */}
      <Pressable
        disabled={!isComplete}
        onPress={save}
        style={[styles.saveButton, !isComplete && styles.saveButtonDisabled]}
      >
        <AppText variant="label" color={colors.onPrimary}>
          Workout speichern
        </AppText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 5,
    marginTop: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touch.minSize,
  },
  topSide: {
    width: 90, // same width left and right → title stays centered
  },
  cancelText: {
    textDecorationLine: "underline",
  },
  form: {
    gap: spacing.xl,
  },
  row: {
    flexDirection: "row",
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    letterSpacing: 1,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekday: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    paddingLeft: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  exerciseName: {
    flex: 1,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDisabled: {
    opacity: 0.3,
  },
  setsText: {
    minWidth: 52,
    textAlign: "center",
  },
  addExercise: {
    minHeight: touch.buttonHeight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  saveButton: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
});
