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
  const { dailyGoals } = useApp();

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
              value={dailyGoals?.goal ?? 0}
              goal={dailyGoals?.goal ?? 0}
            />
          }
        >
          <AppText variant="caption" muted>
            {(dailyGoals?.goal ?? 0) - 120} kcal übrig
          </AppText>
        </Card>

        <View style={styles.row}>
          <Card title="Wasser" style={styles.half}>
            <View style={styles.waterRow}>
              <Pressable
                onPress={() => {
                  /* +250 ml */
                }}
                style={styles.waterButton}
              >
                <AppText variant="label" color={colors.onPrimary}>
                  +250 ml
                </AppText>
              </Pressable>
              <WaterBottle value={1250} goal={2750} />
            </View>
          </Card>

          <Card
            title="Workout"
            style={styles.half}
            onPress={() => router.push("/workout/pull-day")}
          >
            <AppText muted>Pull Day</AppText>
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
    alignSelf: "center",
    minHeight: touch.minSize,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  smallButton: {
    alignSelf: "flex-start",
    minHeight: touch.minSize,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  waterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
});
