import { AppText } from "@/components/AppText";
import { ProgressRing } from "@/components/ProgressRing";
import { BackButton } from "@/components/ReturnButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Goal() {
  const isComplete = true;
  const [calorie, setCalorie] = useState(2200);

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
      >
        <AppText variant="title">Dein Tagesziel</AppText>
      </ScrollView>

      <View style={styles.ring}>
        <ProgressRing value={calorie} size={225} text="kcal pro Tag" />
      </View>

      <SegmentedControl
        label="Calorie"
        options={["-50", "+50"]}
        value=""
        onChange={(option) =>
          setCalorie((c) => (option === "+50" ? c + 50 : c - 50))
        }
      />

      <Pressable
        disabled={!isComplete}
        onPress={() => router.push("/goal")}
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
  ring: {
    alignItems: "center",
  },
});
