// src/app/(tabs)/workout/index.tsx – 06 Workouts
// Training plans and history.
//
// ① Pläne / Verlauf → switches the list
// ② Plan card       → workout detail (07)
//                     swipe left → "Bearbeiten" (modal 15) / "Löschen" (asks first)
// ③ History entry   → swipe left → "Löschen" (asks first)
// ④ "+"             → new workout (modal 15)

import { AppText } from "@/components/AppText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SwipeableRow } from "@/components/SwipeableRow";
import { muscleSummary } from "@/constants/exercises";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { countSets, WorkoutPlan, WorkoutSession } from "@/models/workout";
import { dayLabel } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PLANS = "Pläne";
const HISTORY = "Verlauf";
const RECENT_COUNT = 3; // "Zuletzt" under the plans

export default function WorkoutsScreen() {
  const { workoutPlans, workoutHistory, deleteSession, deletePlan, activeWorkout } =
    useApp();
  const [tab, setTab] = useState(PLANS);

  function confirmDeletePlan(plan: WorkoutPlan, close: () => void) {
    Alert.alert(
      "Plan löschen?",
      `„${plan.name}“ wird gelöscht. Bisherige Trainings bleiben im Verlauf.`,
      [
        { text: "Abbrechen", style: "cancel", onPress: close },
        { text: "Löschen", style: "destructive", onPress: () => deletePlan(plan.id) },
      ],
    );
  }

  function confirmDelete(session: WorkoutSession, close: () => void) {
    Alert.alert(
      "Eintrag löschen?",
      `„${session.planName}“ vom ${dayLabel(session.date)} wird aus dem Verlauf gelöscht.`,
      [
        { text: "Abbrechen", style: "cancel", onPress: close },
        {
          text: "Löschen",
          style: "destructive",
          onPress: () => deleteSession(session.id),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title + ④ "+" */}
        <View style={styles.header}>
          <AppText variant="title">Workouts</AppText>
          <Pressable
            onPress={() => router.push("/editworkout")}
            accessibilityLabel="Neues Workout"
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={26} color={colors.onPrimary} />
          </Pressable>
        </View>

        {/* Running training → back into it */}
        {activeWorkout && (
          <Pressable
            onPress={() => router.push(`/workout/${activeWorkout.planId}`)}
            style={({ pressed }) => [styles.activeBanner, pressed && styles.pressed]}
          >
            <Ionicons name="barbell-outline" size={22} color={colors.onPrimary} />
            <View style={styles.cardText}>
              <AppText variant="label" color={colors.onPrimary}>
                Training läuft · {activeWorkout.planName}
              </AppText>
              <AppText variant="caption" color={colors.onPrimary}>
                {countSets(activeWorkout).done} von {countSets(activeWorkout).total} Sätzen
                erledigt
              </AppText>
            </View>
            <AppText variant="label" color={colors.onPrimary}>
              Fortsetzen
            </AppText>
          </Pressable>
        )}

        {/* ① Pläne / Verlauf */}
        <SegmentedControl options={[PLANS, HISTORY]} value={tab} onChange={setTab} />

        {tab === PLANS ? (
          <>
            {/* ② Plan cards */}
            {workoutPlans.length === 0 ? (
              <AppText muted style={styles.hint}>
                Noch keine Pläne – tippe auf „+“, um deinen ersten zu erstellen.
              </AppText>
            ) : (
              workoutPlans.map((plan) => (
                <SwipeableRow
                  key={plan.id}
                  actions={[
                    {
                      label: "Bearbeiten",
                      color: colors.cardPressed,
                      onPress: (close) => {
                        close();
                        router.push({ pathname: "/editworkout", params: { id: plan.id } });
                      },
                    },
                    {
                      label: "Löschen",
                      color: colors.danger,
                      onPress: (close) => confirmDeletePlan(plan, close),
                    },
                  ]}
                >
                  <PlanCard
                    plan={plan}
                    onPress={() => router.push(`/workout/${plan.id}`)}
                  />
                </SwipeableRow>
              ))
            )}

            {/* ③ Zuletzt */}
            {workoutHistory.length > 0 && (
              <>
                <AppText variant="caption" muted style={styles.sectionTitle}>
                  ZULETZT
                </AppText>
                {workoutHistory.slice(0, RECENT_COUNT).map((session) => (
                  <HistoryRow
                    key={session.id}
                    session={session}
                    onDelete={(close) => confirmDelete(session, close)}
                  />
                ))}
              </>
            )}
          </>
        ) : workoutHistory.length === 0 ? (
          <AppText muted style={styles.hint}>
            Noch keine Trainings – beende ein Workout, dann erscheint es hier.
          </AppText>
        ) : (
          // ③ Full history
          workoutHistory.map((session) => (
            <HistoryRow
              key={session.id}
              session={session}
              onDelete={(close) => confirmDelete(session, close)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ② "Push Day / Brust · Schultern · Arme  >"
function PlanCard({ plan, onPress }: { plan: WorkoutPlan; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardText}>
        <AppText variant="heading">{plan.name}</AppText>
        <AppText variant="caption" muted>
          {muscleSummary(plan.exercises.map((e) => e.exerciseId)) || "Keine Übungen"}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

// ③ "Gestern · Pull Day / 6 Übungen · 16 von 18 Sätzen · 52 min"
function HistoryRow({
  session,
  onDelete,
}: {
  session: WorkoutSession;
  onDelete: (close: () => void) => void;
}) {
  const sets = countSets(session);
  const minutes = session.endedAt
    ? Math.round((session.endedAt - session.startedAt) / 60000)
    : null;
  const count = session.exercises.length;

  return (
    <SwipeableRow
      actions={[{ label: "Löschen", color: colors.danger, onPress: onDelete }]}
    >
      <View style={styles.card}>
        <View style={styles.cardText}>
          <AppText variant="label">
            {dayLabel(session.date)} · {session.planName}
          </AppText>
          <AppText variant="caption" muted>
            {count} {count === 1 ? "Übung" : "Übungen"} · {sets.done} von {sets.total} Sätzen
            {minutes !== null ? ` · ${minutes} min` : ""}
          </AppText>
        </View>
      </View>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addButton: {
    width: touch.minSize,
    height: touch.minSize,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  hint: {
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    marginTop: spacing.md,
    letterSpacing: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  cardPressed: {
    backgroundColor: colors.cardPressed,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
});
