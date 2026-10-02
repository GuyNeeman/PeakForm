// src/app/(tabs)/workout/[id].tsx – 07 Workout-Detail (push)
// /workout/<planId>: overview of the plan → "Workout starten" → running training.
//
// ① Back          → back to Workouts (06). A running training keeps running in the background.
// ② Pause timer   → starts automatically when a set is ticked, "Überspringen" ends it.
//                   Vibrates when it reaches 0.
// ③ kg / Wdh.     → tap → number keyboard. ✓ → set done, row turns grey.
// ④ + Satz        → new set with the values of the last one
// ⑤ Workout beenden → confirmation (17): save / keep training / discard (asks twice)
// "…"             → edit the plan / discard the training

import { AppText } from "@/components/AppText";
import { BackButton } from "@/components/ReturnButton";
import { getExercise } from "@/constants/exercises";
import { colors, radius, spacing, touch, typography } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { countSets, SessionExercise, SetEntry, WorkoutPlan } from "@/models/workout";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const REST_SECONDS = 90; // pause after each ticked set (01:30)

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workoutPlans, activeWorkout, startWorkout, discardWorkout } = useApp();

  const plan = workoutPlans.find((p) => p.id === id);
  const isRunningHere = activeWorkout?.planId === id;

  // Plan deleted (e.g. while this screen was open in the background)
  if (!plan && !isRunningHere) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <AppText muted style={styles.hint}>
          Dieser Plan existiert nicht mehr.
        </AppText>
      </SafeAreaView>
    );
  }

  const title = plan?.name ?? activeWorkout?.planName ?? "Workout";

  function start() {
    // Another training is still running → ask what to do
    if (activeWorkout && !isRunningHere) {
      Alert.alert(
        "Training läuft bereits",
        `„${activeWorkout.planName}“ ist noch nicht beendet.`,
        [
          { text: "Abbrechen", style: "cancel" },
          {
            text: `Zu „${activeWorkout.planName}“`,
            onPress: () => router.replace(`/workout/${activeWorkout.planId}`),
          },
          {
            text: "Verwerfen & neu starten",
            style: "destructive",
            onPress: () => startWorkout(id),
          },
        ],
      );
      return;
    }
    startWorkout(id);
  }

  // "…" menu
  function openMenu() {
    Alert.alert(title, undefined, [
      ...(plan
        ? [
            {
              text: "Plan bearbeiten",
              onPress: () => router.push({ pathname: "/editworkout", params: { id: plan.id } }),
            },
          ]
        : []),
      ...(isRunningHere
        ? [
            {
              text: "Training verwerfen",
              style: "destructive" as const,
              onPress: () =>
                Alert.alert("Training verwerfen?", "Die eingetragenen Sätze gehen verloren.", [
                  { text: "Abbrechen", style: "cancel" },
                  { text: "Verwerfen", style: "destructive", onPress: discardWorkout },
                ]),
            },
          ]
        : []),
      { text: "Abbrechen", style: "cancel" as const },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ① Back + title + "…" */}
      <View style={styles.topBar}>
        <BackButton />
        <AppText variant="heading" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
        <Pressable
          onPress={openMenu}
          accessibilityLabel="Mehr"
          style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
        </Pressable>
      </View>

      {isRunningHere ? <RunningWorkout /> : <PlanOverview plan={plan!} onStart={start} />}
    </SafeAreaView>
  );
}

// Before starting: what's in the plan
function PlanOverview({ plan, onStart }: { plan: WorkoutPlan; onStart: () => void }) {
  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        {plan.exercises.map((planExercise) => {
          const exercise = getExercise(planExercise.exerciseId);
          return (
            <View key={planExercise.exerciseId} style={styles.overviewRow}>
              <View style={styles.flex}>
                <AppText variant="label">{exercise?.name ?? "Unbekannte Übung"}</AppText>
                <AppText variant="caption" muted>
                  {exercise ? `${exercise.muscle} · ${exercise.equipment}` : ""}
                </AppText>
              </View>
              <AppText variant="label" muted>
                {planExercise.sets} × {planExercise.reps}
              </AppText>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={onStart} style={styles.primaryButton}>
          <AppText variant="label" color={colors.onPrimary}>
            Workout starten
          </AppText>
        </Pressable>
      </View>
    </>
  );
}

// The running training: rest timer, one card per exercise, "Workout beenden"
function RunningWorkout() {
  const { activeWorkout, updateSet, addSet, startRest, finishWorkout, discardWorkout } =
    useApp();
  if (!activeWorkout) return null;

  // ⑤ → 17 "Workout beenden?"
  function confirmFinish() {
    if (!activeWorkout) return;
    const { done, total } = countSets(activeWorkout);
    const name = activeWorkout.planName;

    const keepTraining = { text: "Weiter trainieren", style: "cancel" as const };
    const discard = {
      text: "Verwerfen",
      style: "destructive" as const,
      // Can't be undone → ask a second time
      onPress: () =>
        Alert.alert("Wirklich verwerfen?", "Das Training wird nicht gespeichert.", [
          { text: "Abbrechen", style: "cancel" },
          {
            text: "Verwerfen",
            style: "destructive",
            onPress: () => {
              discardWorkout();
              router.navigate("/workout");
            },
          },
        ]),
    };

    // Nothing ticked yet → nothing worth saving
    if (done === 0) {
      Alert.alert(
        "Workout beenden?",
        "Du hast noch keinen Satz abgehakt. Es gibt nichts zu speichern.",
        [keepTraining, discard],
      );
      return;
    }

    Alert.alert(
      "Workout beenden?",
      `${done} von ${total} Sätzen erledigt. Das Training wird im Verlauf gespeichert.`,
      [
        {
          text: "Beenden & speichern",
          onPress: () => {
            finishWorkout();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Back to Workouts (06), which shows "Pull Day gespeichert"
            router.navigate({ pathname: "/workout", params: { saved: name } });
          },
        },
        keepTraining,
        discard,
      ],
    );
  }

  function toggleDone(exerciseIndex: number, setIndex: number, set: SetEntry) {
    const done = !set.done;
    updateSet(exerciseIndex, setIndex, { done });
    if (done) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startRest(REST_SECONDS); // ② pause starts automatically
    }
  }

  return (
    <>
      {/* ② Pause timer */}
      <RestTimer />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {activeWorkout.exercises.map((exercise, exerciseIndex) => (
          <ExerciseCard
            key={exercise.exerciseId}
            exercise={exercise}
            onChange={(setIndex, fields) => updateSet(exerciseIndex, setIndex, fields)}
            onToggle={(setIndex, set) => toggleDone(exerciseIndex, setIndex, set)}
            onAddSet={() => addSet(exerciseIndex)}
          />
        ))}
      </ScrollView>

      {/* ⑤ Workout beenden */}
      <View style={styles.footer}>
        <Pressable onPress={confirmFinish} style={styles.primaryButton}>
          <AppText variant="label" color={colors.onPrimary}>
            Workout beenden
          </AppText>
        </Pressable>
      </View>
    </>
  );
}

// ② "Pause 01:30   Überspringen" – only visible while a pause runs
function RestTimer() {
  const { activeWorkout, skipRest } = useApp();
  const endsAt = activeWorkout?.restEndsAt;
  const [now, setNow] = useState(() => Date.now());

  // Tick every second while a pause runs; at 0: vibrate and hide
  useEffect(() => {
    if (!endsAt) return;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) {
        clearInterval(timer);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        skipRest();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt, skipRest]);

  if (!endsAt || endsAt <= now) return null;

  const seconds = Math.ceil((endsAt - now) / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <View style={styles.restPill}>
      <Ionicons name="timer-outline" size={18} color={colors.onPrimary} />
      <AppText variant="label" color={colors.onPrimary}>
        Pause {mm}:{ss}
      </AppText>
      <Pressable onPress={skipRest} hitSlop={8} style={styles.skipButton}>
        <AppText variant="caption" color={colors.onPrimary}>
          Überspringen
        </AppText>
      </Pressable>
    </View>
  );
}

// ③ ④ One exercise: SATZ | KG | WDH | OK, then "+ Satz hinzufügen"
function ExerciseCard({
  exercise,
  onChange,
  onToggle,
  onAddSet,
}: {
  exercise: SessionExercise;
  onChange: (setIndex: number, fields: Partial<SetEntry>) => void;
  onToggle: (setIndex: number, set: SetEntry) => void;
  onAddSet: () => void;
}) {
  return (
    <View style={styles.card}>
      <AppText variant="heading">
        {getExercise(exercise.exerciseId)?.name ?? "Unbekannte Übung"}
      </AppText>

      <View style={styles.tableRow}>
        <AppText variant="caption" muted style={styles.colSet}>SATZ</AppText>
        <AppText variant="caption" muted style={styles.colInput}>KG</AppText>
        <AppText variant="caption" muted style={styles.colInput}>WDH</AppText>
        <AppText variant="caption" muted style={styles.colDone}>OK</AppText>
      </View>

      {exercise.sets.map((set, setIndex) => (
        <View key={setIndex} style={[styles.tableRow, set.done && styles.rowDone]}>
          <AppText variant="label" style={styles.colSet}>
            {setIndex + 1}
          </AppText>
          <NumberCell
            value={set.kg}
            decimal
            label={`Satz ${setIndex + 1} Kilogramm`}
            onCommit={(kg) => onChange(setIndex, { kg })}
          />
          <NumberCell
            value={set.reps}
            label={`Satz ${setIndex + 1} Wiederholungen`}
            onCommit={(reps) => onChange(setIndex, { reps })}
          />
          <View style={styles.colDone}>
            <Pressable
              onPress={() => onToggle(setIndex, set)}
              hitSlop={6}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: set.done }}
              accessibilityLabel={`Satz ${setIndex + 1} erledigt`}
              style={[styles.checkbox, set.done && styles.checkboxOn]}
            >
              {set.done && <Ionicons name="checkmark" size={18} color={colors.onPrimary} />}
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable
        onPress={onAddSet}
        style={({ pressed }) => [styles.addSet, pressed && styles.pressed]}
      >
        <AppText variant="label">+ Satz hinzufügen</AppText>
      </Pressable>
    </View>
  );
}

// "62,5" → 62.5   "" / "abc" / negative → null (= not entered)
function parseAmount(text: string): number | null {
  const n = Number(text.replace(",", ".").trim());
  if (text.trim() === "" || !Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

// 62.5 → "62,5"
const formatAmount = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));

// A number field that saves when you leave it (so "62," can be typed without being rejected)
function NumberCell({
  value,
  decimal = false,
  label,
  onCommit,
}: {
  value: number | null;
  decimal?: boolean;
  label: string;
  onCommit: (value: number | null) => void;
}) {
  const [text, setText] = useState(formatAmount(value));

  function commit() {
    const parsed = parseAmount(text);
    setText(formatAmount(parsed)); // e.g. "abc" → back to empty
    if (parsed !== value) onCommit(parsed);
  }

  return (
    <View style={styles.colInput}>
      <TextInput
        value={text}
        onChangeText={setText}
        onEndEditing={commit}
        keyboardType={decimal ? "decimal-pad" : "number-pad"}
        placeholder="–"
        placeholderTextColor={colors.textMuted}
        selectTextOnFocus
        maxLength={6}
        accessibilityLabel={label}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  menuButton: {
    width: touch.minSize,
    height: touch.minSize,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  hint: {
    textAlign: "center",
    padding: spacing.xl,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  primaryButton: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Overview
  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },

  // ② Pause timer
  restPill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  // ③ Exercise card + table
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 32,
  },
  rowDone: {
    opacity: 0.5,
  },
  colSet: {
    width: 40,
    textAlign: "center",
  },
  colInput: {
    flex: 1,
    textAlign: "center",
  },
  colDone: {
    width: 44,
    alignItems: "center",
    textAlign: "center",
  },
  input: {
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    color: colors.text,
    textAlign: "center",
    ...typography.label,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  addSet: {
    minHeight: touch.minSize,
    marginTop: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
