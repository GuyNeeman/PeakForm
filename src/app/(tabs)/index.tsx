// src/app/(tabs)/index.tsx – 04 Home

import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { AppText } from "../../components/AppText";
import { Card } from "@/components/Card";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title">Hey Alex, bereit fürs nächste Level?</AppText>

        <Card title="Kalorien" onPress={() => router.push("/meals")}>
          <AppText variant="bigValue">1'850</AppText>
          <AppText variant="caption" muted>von 2'200 kcal</AppText>
        </Card>

        <View style={styles.row}>
          <Card title="Wasser" style={styles.half}>
            <Pressable onPress={() => { /* addWater(250) – comes with the context */ }} style={styles.waterButton}>
              <AppText variant="label" color={colors.onPrimary}>+250 ml</AppText>
            </Pressable>
          </Card>

          <Card title="Workout" style={styles.half} onPress={() => router.push("/workout/pull-day")}>
            <AppText muted>Pull Day</AppText>
          </Card>
        </View>

        <Card title="Schlaf">
          <AppText variant="bigValue">7h 45m</AppText>
          <AppText variant="caption" muted>Letzte Nacht</AppText>
        </Card>
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
});