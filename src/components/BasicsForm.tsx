// src/components/BasicsForm.tsx
// The "Grundwerte" form: name, sex, age, height, weight, activity, goal.
// Used by 02 Basics (onboarding) and "Grundwerte bearbeiten" (profile).
// <BasicsForm title="Erzähl uns von dir" submitLabel="Weiter" onSubmit={(basics) => ...} />
// <BasicsForm initial={userBasics} title="Grundwerte bearbeiten" submitLabel="Speichern" ... />

import { AppText } from "@/components/AppText";
import { BackButton } from "@/components/ReturnButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TextField } from "@/components/TextField";
import { colors, radius, spacing, touch } from "@/constants/theme";
import UserBasics from "@/models/userbasic";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  initial?: UserBasics; // filled in when editing
  title: string;
  submitLabel: string;
  onSubmit: (basics: UserBasics) => void;
};

// "" or 0 or "abc" → false
const isPositive = (value: string) => Number(value) > 0;

export function BasicsForm({ initial, title, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sex, setSex] = useState<string>(initial?.sex ?? "");
  const [age, setAge] = useState(initial ? String(initial.age) : "");
  const [height, setHeight] = useState(initial ? String(initial.height) : "");
  const [weight, setWeight] = useState(initial ? String(initial.weight) : "");
  const [activity, setActivity] = useState<string>(initial?.activity ?? "");
  const [goal, setGoal] = useState<string>(initial?.goal ?? "");

  const isComplete =
    name.trim() &&
    sex &&
    isPositive(age) &&
    isPositive(height) &&
    isPositive(weight) &&
    activity &&
    goal;

  function submit() {
    onSubmit({
      name: name.trim(),
      sex: sex as UserBasics["sex"],
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      activity: activity as UserBasics["activity"],
      goal: goal as UserBasics["goal"],
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="title">{title}</AppText>

        <View style={styles.row}>
          <TextField
            label="Wie heisst du?"
            value={name}
            onChange={setName}
            keyboardType="default"
            placeholder="Vorname"
            maxLength={30}
          />
        </View>

        <SegmentedControl
          label="Geschlecht"
          options={["Weiblich", "Männlich", "Divers"]}
          value={sex}
          onChange={setSex}
        />

        <View style={styles.row}>
          <TextField label="Alter" unit="Jahre" value={age} onChange={setAge} />
          <TextField label="Grösse" unit="cm" value={height} onChange={setHeight} />
        </View>

        <View style={styles.row}>
          <TextField label="Gewicht" unit="kg" value={weight} onChange={setWeight} />
        </View>

        <SegmentedControl
          label="Aktivität"
          options={["Wenig", "Mittel", "Viel"]}
          value={activity}
          onChange={setActivity}
        />
        <SegmentedControl
          label="Ziel"
          options={["Abnehmen", "Halten", "Aufbauen"]}
          value={goal}
          onChange={setGoal}
        />
      </ScrollView>

      <Pressable
        disabled={!isComplete}
        onPress={submit}
        style={[styles.button, !isComplete && styles.buttonDisabled]}
      >
        <AppText variant="label" color={colors.onPrimary}>
          {submitLabel}
        </AppText>
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
