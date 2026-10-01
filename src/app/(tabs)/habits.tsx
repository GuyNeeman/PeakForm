// src/app/(tabs)/habits.tsx – Habits (placeholder)

import { AppText } from "@/components/AppText";
import { spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HabitsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppText variant="title">Gewohnheiten</AppText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
});
