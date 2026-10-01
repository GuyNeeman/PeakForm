// src/app/(onboarding)/basics.tsx – 02 Basic info
// Layout + styles. All styles are in the const at the bottom.

import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, spacing, touch, typography } from "@/constants/theme";
import { AppText } from "@/components/AppText";
import { BackButton } from "../../components/ReturnButton";

const SEX = ["Weiblich", "Männlich", "Divers"];
const ACTIVITY = ["Wenig", "Mittel", "Viel"];
const GOAL = ["Abnehmen", "Halten", "Aufbauen"];

export default function Basics() {
  const [sex, setSex] = useState<number | null>(null);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<number | null>(null);
  const [goal, setGoal] = useState<number | null>(null);

  const weightNumber = Number(weight);
  const weightError = weight !== "" && (weightNumber < 30 || weightNumber > 300);
  const isComplete =
    sex !== null && age !== "" && height !== "" && weight !== "" && !weightError && activity !== null && goal !== null;

  // One row of options (Segmented Control)
  const segmented = (options: string[], selected: number | null, onSelect: (i: number) => void) => (
    <View style={styles.segmented}>
      {options.map((label, i) => (
        <Pressable
          key={label}
          onPress={() => onSelect(i)}
          style={[styles.segment, selected === i && styles.segmentActive]}
        >
          <AppText variant="label" muted={selected !== i}>{label}</AppText>
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>

        {/* Header: back button + progress */}
        <View style={styles.header}>
          <BackButton />
          <View style={styles.progress}>
            <AppText variant="caption" muted>Schritt 1 von 2</AppText>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <AppText variant="title">Erzähl uns von dir</AppText>

          <View style={styles.field}>
            <AppText variant="label" muted>Geschlecht</AppText>
            {segmented(SEX, sex, setSex)}
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.half]}>
              <AppText variant="label" muted>Alter</AppText>
              <View style={styles.input}>
                <TextInput style={styles.inputText} value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="24" placeholderTextColor={colors.textMuted} />
                <AppText muted>Jahre</AppText>
              </View>
            </View>
            <View style={[styles.field, styles.half]}>
              <AppText variant="label" muted>Grösse</AppText>
              <View style={styles.input}>
                <TextInput style={styles.inputText} value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="180" placeholderTextColor={colors.textMuted} />
                <AppText muted>cm</AppText>
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <AppText variant="label" muted>Gewicht</AppText>
            <View style={[styles.input, weightError && styles.inputError]}>
              <TextInput style={styles.inputText} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="75" placeholderTextColor={colors.textMuted} />
              <AppText muted>kg</AppText>
            </View>
            {weightError && (
              <AppText variant="caption" style={styles.errorText}>Bitte ein Gewicht zwischen 30 und 300 kg eingeben.</AppText>
            )}
          </View>

          <View style={styles.field}>
            <AppText variant="label" muted>Aktivitätslevel</AppText>
            {segmented(ACTIVITY, activity, setActivity)}
          </View>

          <View style={styles.field}>
            <AppText variant="label" muted>Dein Ziel</AppText>
            {segmented(GOAL, goal, setGoal)}
          </View>
        </ScrollView>

        {/* Button stays at the bottom, also when the keyboard is open */}
        <Pressable
          disabled={!isComplete}
          onPress={() => router.push("/goal")}
          style={({ pressed }) => [styles.button, !isComplete && styles.buttonDisabled, pressed && styles.buttonPressed]}
        >
          <AppText variant="label" color={isComplete ? colors.onPrimary : colors.textMuted}>Weiter</AppText>
        </Pressable>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- Page ---
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  flex: {
    flex: 1,
    gap: spacing.lg,
  },

  // --- Header: back button + progress bar ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  progress: {
    flex: 1,               // fills the rest of the row next to the back button
    gap: spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.card,
  },
  progressFill: {
    width: "50%",          // step 1 of 2
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },

  // --- Form ---
  form: {
    gap: spacing.lg,       // space between the fields
    paddingBottom: spacing.lg,
  },
  field: {
    gap: spacing.sm,       // space between label and input
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  half: {
    flex: 1,               // two fields side by side, same width
  },

  // --- Text input ---
  input: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  inputText: {
    flex: 1,
    color: colors.text,
    ...typography.body,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
  },

  // --- Segmented control ---
  segmented: {
    flexDirection: "row",
    padding: spacing.xs,
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  segment: {
    flex: 1,
    minHeight: touch.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },

  // --- Button ---
  button: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.card,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});