// src/app/addmeal.tsx – 05 Add meal / edit meal
// /addmeal          → new meal
// /addmeal?id=abc   → edit that meal (fields are filled in, plus a delete button)
// /addmeal?date=2026-09-30 → new meal for that day (from the meals screen)

import { AppText } from "@/components/AppText";
import { BackButton } from "@/components/ReturnButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TextField } from "@/components/TextField";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { MEAL_TIMES, MealInput, MealTime } from "@/models/meal";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// "250" ✓   "" ✓ (= 0)   "-5" ✗   "abc" ✗
function isValidAmount(value: string): boolean {
  if (value.trim() === "") return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
}

export default function AddMeal() {
  const { addMeal, updateMeal, deleteMeal, mealList } = useApp();
  const router = useRouter();

  // Edit mode if an id was passed and the meal exists
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const existing = mealList.find((meal) => meal.id === id);
  const isEdit = !!existing;

  // Start values: the existing meal (edit) or empty (new)
  const [mahlzeit, setMahlzeit] = useState(existing?.name ?? "");
  const [time, setTime] = useState<string>(existing?.time ?? "");
  const [kcal, setKcal] = useState(existing ? String(existing.kcal) : "");
  const [protein, setProtein] = useState(existing ? String(existing.protein) : "");
  const [carbs, setCarbs] = useState(existing ? String(existing.carbs) : "");

  // Every number must be a real number and not negative ("" counts as 0 for protein/carbs)
  const numbersValid = [kcal, protein, carbs].every(isValidAmount);
  const isComplete = kcal && time && numbersValid;

  const meal: MealInput = {
    name: mahlzeit.trim(),
    time: time as MealTime,
    kcal: Number(kcal),
    protein: Number(protein),
    carbs: Number(carbs),
  };

  function saveMeal() {
    // The context also updates the day's totals
    if (existing) updateMeal(existing.id, meal);
    else addMeal(meal, date); // no date → today
    router.back(); // close the modal
  }

  // Asks first – deleting can't be undone
  function removeMeal() {
    if (!existing) return;

    Alert.alert(
      "Mahlzeit löschen?",
      `"${existing.name || "Mahlzeit"}" wird endgültig gelöscht.`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: () => {
            deleteMeal(existing.id);
            router.back();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
      >
        <AppText variant="title">
          {isEdit ? "Mahlzeit bearbeiten" : "Mahlzeit erfassen"}
        </AppText>

        <View style={styles.row}>
          <TextField
            label="Was hast du gegessen?"
            value={mahlzeit}
            onChange={setMahlzeit}
            keyboardType="default"
          />
        </View>

        <SegmentedControl
          label="Zeit"
          options={MEAL_TIMES}
          value={time}
          onChange={setTime}
        />

        <View style={styles.row}>
          <TextField
            label="Kalorien eintragen"
            unit="kcal"
            value={kcal}
            onChange={setKcal}
          />
        </View>

        <View style={styles.row}>
          <TextField
            label="Proteine eintragen"
            unit="g"
            value={protein}
            onChange={setProtein}
          />
        </View>

        <View style={styles.row}>
          <TextField
            label="Kohlenhydrate eintragen"
            unit="g"
            value={carbs}
            onChange={setCarbs}
          />
        </View>

        {!numbersValid && (
          <AppText variant="caption" color={colors.danger}>
            Bitte nur positive Zahlen eingeben.
          </AppText>
        )}
      </ScrollView>

      {isEdit && (
        <Pressable onPress={removeMeal} style={styles.deleteButton}>
          <AppText variant="label" color={colors.danger}>
            Mahlzeit löschen
          </AppText>
        </Pressable>
      )}

      <Pressable
        disabled={!isComplete}
        onPress={saveMeal}
        style={[styles.button, !isComplete && styles.buttonDisabled]}
      >
        <AppText variant="label">{isEdit ? "Speichern" : "Weiter"}</AppText>
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
  form: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  button: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  deleteButton: {
    minHeight: touch.minSize,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
});
