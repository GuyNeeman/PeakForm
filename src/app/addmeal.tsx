// src/app/addmeal.tsx – 05 Add meal

import { AppText } from "@/components/AppText";
import { BackButton } from "@/components/ReturnButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TextField } from "@/components/TextField";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import Meal from "@/models/meal";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddMeal() {
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [time, setTime] = useState("");
  const [mahlzeit, setMahlzeit] = useState("");

  const isComplete = kcal && time;

  const { addMeal } = useApp();
  const router = useRouter();

  const meal: Meal = {
    name: mahlzeit,
    time: time as Meal["time"],
    kcal: Number(kcal),
    protein: Number(protein),
    carbs: Number(carbs),
  };

  function createMeal() {
    addMeal(meal);
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
      >
        <AppText variant="title">Mahlzeit erfassen</AppText>

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
          options={["Frühstück", "Mittag", "Abend", "Snack"]}
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
      </ScrollView>

      <Pressable
        disabled={!isComplete}
        onPress={createMeal}
        style={[styles.button, !isComplete && styles.buttonDisabled]}
      >
        <AppText variant="label">Weiter</AppText>
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
});
