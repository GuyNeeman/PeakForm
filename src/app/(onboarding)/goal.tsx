// src/app/(onboarding)/goal.tsx – 03 Calorie goal
// Shows the suggested kcal, protein, carbs and water. The user can adjust the kcal and the water.

import { AppText } from "@/components/AppText";
import { ProgressRing } from "@/components/ProgressRing";
import { BackButton } from "@/components/ReturnButton";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 1850 → "1'850"
const format = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'");

export default function Goal() {
  const { calculateGoals, updateGoals } = useApp();

  // Suggestion from the basics (only used for the starting value)
  const suggestion = calculateGoals();
  const [calorie, setCalorie] = useState(suggestion?.goal ?? 2000);
  const [water, setWater] = useState(suggestion?.goalwater ?? 2000); // ml, ~2 l is the usual default

  // Protein and carbs for the CURRENT calorie value – updates with the stepper
  const goals = calculateGoals(undefined, calorie);

  function acceptGoal() {
    if (goals) updateGoals({ ...goals, goalwater: water });
    // No navigation needed: once goals are saved, onboardingDone becomes true
    // and the root layout switches to the tabs automatically.
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <AppText variant="title">Dein Tagesziel</AppText>

      {/* Calories + stepper */}
      <View style={styles.card}>
        <View style={styles.ring}>
          <ProgressRing value={calorie} size={225} text="kcal pro Tag" />
        </View>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setCalorie((c) => c - 50)}
            style={styles.stepButton}
          >
            <AppText variant="heading">−</AppText>
          </Pressable>
          <AppText variant="caption" muted>
            in 50-kcal-Schritten
          </AppText>
          <Pressable
            onPress={() => setCalorie((c) => c + 50)}
            style={styles.stepButton}
          >
            <AppText variant="heading">+</AppText>
          </Pressable>
        </View>
      </View>

      {/* Estimates */}
      <View style={styles.card}>
        <View style={styles.row}>
          <AppText muted>Protein</AppText>
          <AppText variant="label">{goals?.goalprotein ?? "–"} g</AppText>
        </View>
        <View style={styles.row}>
          <AppText muted>Kohlenhydrate</AppText>
          <AppText variant="label">{goals?.goalcarbs ?? "–"} g</AppText>
        </View>
        <View style={styles.row}>
          <AppText muted>Wasser</AppText>
          <View style={styles.smallStepper}>
            <Pressable
              onPress={() => setWater((w) => Math.max(250, w - 250))}
              style={styles.stepButton}
            >
              <AppText variant="heading">−</AppText>
            </Pressable>
            <AppText variant="label">{format(water)} ml</AppText>
            <Pressable
              onPress={() => setWater((w) => w + 250)}
              style={styles.stepButton}
            >
              <AppText variant="heading">+</AppText>
            </Pressable>
          </View>
        </View>
      </View>

      <AppText variant="caption" muted>
        Richtwerte basierend auf deinen Angaben.
      </AppText>

      <Pressable onPress={acceptGoal} style={styles.button}>
        <AppText variant="label">Ziel übernehmen</AppText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepButton: {
    width: touch.minSize,
    height: touch.minSize,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  smallStepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  button: {
    marginTop: "auto", // pushes the button to the bottom
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    alignItems: "center",
  },
});
