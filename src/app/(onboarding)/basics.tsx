// src/app/(onboarding)/basics.tsx – 02 Basic info

import { AppText } from "@/components/AppText";
import { BackButton } from "@/components/ReturnButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TextField } from "@/components/TextField";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import UserBasics from "@/models/userbasic";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Basics() {
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("");
  const [goal, setGoal] = useState("");

  const isComplete = sex && age && height && weight && activity && goal;

  const { updateUser, updateGoals } = useApp();
  const router = useRouter();

  const basics: UserBasics = {
    sex: sex as UserBasics["sex"],
    age: Number(age),
    height: Number(height),
    weight: Number(weight),
    activity: activity as UserBasics["activity"],
    goal: goal as UserBasics["goal"],
  };

  function createUser() {
    updateUser(basics);
    router.push("/goal");
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
      >
        <AppText variant="title">Erzähl uns von dir</AppText>

        <SegmentedControl
          label="Geschlecht"
          options={["Weiblich", "Männlich", "Divers"]}
          value={sex}
          onChange={setSex}
        />

        <View style={styles.row}>
          <TextField label="Alter" unit="Jahre" value={age} onChange={setAge} />
          <TextField
            label="Grösse"
            unit="cm"
            value={height}
            onChange={setHeight}
          />
        </View>

        <TextField
          label="Gewicht"
          unit="kg"
          value={weight}
          onChange={setWeight}
        />

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
        onPress={createUser}
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
