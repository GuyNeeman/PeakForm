// src/app/(tabs)/meals.tsx – Meals
// Totals of the selected day at the top, then that day's meals grouped by time.
// Arrows switch the day (not into the future). Tap a meal to edit it, "+ Mahlzeit" to add one.

import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { ProgressRing } from "@/components/ProgressRing";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { MEAL_TIMES } from "@/models/meal";
import { addDays, dayLabel, toDateKey } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MealsScreen() {
  const { getDay, getMeals, dailyGoals } = useApp();

  const [date, setDate] = useState(toDateKey()); // selected day, "YYYY-MM-DD"
  const isToday = date === toDateKey();

  const day = getDay(date);
  const meals = getMeals(date);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title">Mahlzeiten</AppText>

        {/* Day switcher: ‹ Gestern › */}
        <View style={styles.dayRow}>
          <Pressable
            onPress={() => setDate((d) => addDays(d, -1))}
            accessibilityLabel="Vorheriger Tag"
            style={styles.arrowButton}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>

          <AppText variant="heading">{dayLabel(date)}</AppText>

          <Pressable
            onPress={() => setDate((d) => addDays(d, 1))}
            disabled={isToday}
            accessibilityLabel="Nächster Tag"
            style={[styles.arrowButton, isToday && styles.arrowDisabled]}
          >
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Totals of the selected day */}
        <Card
          title="Total"
          aside={
            <ProgressRing
              value={day.kcal}
              goal={dailyGoals?.goal ?? 0}
              size={110}
            />
          }
        >
          <View style={styles.macroRow}>
            <AppText muted>Protein</AppText>
            <AppText variant="label">
              {day.protein} / {dailyGoals?.goalprotein ?? "–"} g
            </AppText>
          </View>
          <View style={styles.macroRow}>
            <AppText muted>Kohlenhydrate</AppText>
            <AppText variant="label">
              {day.carbs} / {dailyGoals?.goalcarbs ?? "–"} g
            </AppText>
          </View>
        </Card>

        {/* One card per time of day */}
        {MEAL_TIMES.map((time) => {
          const mealsAtTime = meals.filter((meal) => meal.time === time);

          return (
            <Card key={time} title={time}>
              {mealsAtTime.length === 0 && (
                <AppText variant="caption" muted>
                  Noch nichts eingetragen
                </AppText>
              )}

              {mealsAtTime.map((meal) => (
                <Pressable
                  key={meal.id}
                  onPress={() =>
                    router.push({ pathname: "/addmeal", params: { id: meal.id } })
                  }
                  style={({ pressed }) => [
                    styles.mealRow,
                    pressed && styles.mealRowPressed,
                  ]}
                >
                  <View style={styles.mealText}>
                    <AppText variant="label">{meal.name || "Mahlzeit"}</AppText>
                    <AppText variant="caption" muted>
                      {meal.protein} g Protein · {meal.carbs} g Kohlenhydrate
                    </AppText>
                  </View>
                  <AppText variant="label">{meal.kcal} kcal</AppText>
                </Pressable>
              ))}
            </Card>
          );
        })}

        <Pressable
          onPress={() =>
            // Adds the meal to the day that is shown
            router.push({ pathname: "/addmeal", params: { date } })
          }
          style={styles.addButton}
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
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  arrowButton: {
    width: touch.minSize,
    height: touch.minSize,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: touch.minSize,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  mealRowPressed: {
    backgroundColor: colors.cardPressed,
  },
  mealText: {
    flex: 1,
    gap: spacing.xs,
  },
  addButton: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
