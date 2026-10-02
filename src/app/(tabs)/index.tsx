// src/app/(tabs)/index.tsx – 04 Home

import { Card } from "@/components/Card";
import { ProgressRing } from "@/components/ProgressRing";
import { WaterBottle } from "@/components/WaterBottle";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../components/AppText";

export default function HomeScreen() {
  const { getDay, updateDay, dailyGoals, resetAll, getPlansForDay, activeWorkout } =
    useApp();
  const today = getDay();

  // Workout card: running training > today's plan (by weekday) > rest day
  const todaysPlan = getPlansForDay()[0];
  const workoutCard = activeWorkout
    ? {
        text: activeWorkout.planName,
        caption: "Training läuft",
        href: `/workout/${activeWorkout.planId}` as const,
      }
    : todaysPlan
      ? { text: todaysPlan.name, caption: "Heute", href: `/workout/${todaysPlan.id}` as const }
      : { text: "Ruhetag", caption: "Kein Workout geplant", href: "/workout" as const };

  const eatenTooMuch = (today.kcal ?? 0) > (dailyGoals?.goal ?? 0);
  const waterLeft = (dailyGoals?.goalwater ?? 0) - today.water; // ≤ 0 → drank enough

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title">
          Hey Sebastian, bereit fürs nächste Level?
        </AppText>

        <Card
          title="Kalorien"
          onPress={() => router.push("/addmeal")}
          aside={
            <ProgressRing
              value={today.kcal ?? 0}
              goal={dailyGoals?.goal ?? 0}
            />
          }
        >
          {!eatenTooMuch && (
            <AppText variant="caption" muted>
              {(dailyGoals?.goal ?? 0) - today.kcal} kcal übrig
            </AppText>
          )}
          {eatenTooMuch && (
            <AppText variant="caption" muted>
              {today.kcal - (dailyGoals?.goal ?? 0)} kcal zu viel
            </AppText>
          )}
        </Card>

        <View style={styles.row}>
          <Card
            title="Wasser"
            style={styles.half}
            aside={
              <WaterBottle
                value={today.water}
                goal={dailyGoals?.goalwater ?? 0}
              />
            }
          >
            <AppText variant="caption" muted>
              {waterLeft > 0 ? `${waterLeft} ml übrig` : "Genug getrunken!"}
            </AppText>
            <Pressable
              onPress={() => {
                updateDay({ water: today.water + 250 });
              }}
              style={styles.waterButton}
            >
              <AppText variant="label" color={colors.onPrimary}>
                +250 ml
              </AppText>
            </Pressable>
          </Card>

          <Card
            title="Workout"
            style={styles.half}
            onPress={() => router.push(workoutCard.href)}
          >
            <AppText variant="label">{workoutCard.text}</AppText>
            <AppText variant="caption" muted>
              {workoutCard.caption}
            </AppText>
          </Card>
        </View>

        <Card title="Schlaf">
          <AppText variant="bigValue">7h 45m</AppText>
          <AppText variant="caption" muted>
            Letzte Nacht
          </AppText>
        </Card>

        <Pressable
          onPress={() => router.push("/addmeal")}
          style={styles.smallButton}
        >
          <AppText variant="label" color={colors.onPrimary}>
            + Mahlzeit
          </AppText>
        </Pressable>

        {/* TESTING ONLY: deletes all user data → app jumps back to the onboarding.
            __DEV__ = only visible in development builds, never in the real app. */}
        {__DEV__ && (
          <Pressable onPress={resetAll} style={styles.clearButton}>
            <AppText variant="label" color={colors.onPrimary}>
              Alles löschen (Test)
            </AppText>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
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
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  waterButton: {
    alignSelf: "flex-start",
    minHeight: touch.minSize,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  clearButton: {
    alignSelf: "flex-start",
    minHeight: touch.minSize,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.danger,
  },
  smallButton: {
    alignSelf: "flex-start",
    minHeight: touch.minSize,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
});
