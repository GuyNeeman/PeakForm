// src/app/(tabs)/habits.tsx – 18 Habits
// Tick off daily habits and see streaks.
//
// ① "+"          → new habit (modal 19)
// ② Week bar     → pick a day: past days can be ticked off afterwards, future days are view-only.
//                  Dot under a day: filled = everything done, grey = partly done.
// ③ Progress     → "3 von 5 erledigt" + bar (turns green when everything is done)
// ④ Circle       → done (animation + vibration), tap again → undo
// ⑤ Row          → edit (modal 19)
// ⑥ Swipe left   → "Bearbeiten" / "Löschen" (asks first)

import { AppText } from "@/components/AppText";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import Habit, { WEEKDAY_LETTERS } from "@/models/habit";
import { dayLabel, fromDateKey, toDateKey, weekDates } from "@/utils/date";
import { isDoneOn, isDueOn, streak } from "@/utils/habits";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HabitsScreen() {
  const { habitList, toggleHabitDone, deleteHabit } = useApp();

  const today = toDateKey();
  const [selected, setSelected] = useState(today); // day shown, "YYYY-MM-DD"
  const isFuture = selected > today; // can look, but not tick off

  const dueHabits = habitList.filter((h) => isDueOn(h, selected));
  const doneCount = dueHabits.filter((h) => isDoneOn(h, selected)).length;

  function toggle(habit: Habit) {
    const wasDone = isDoneOn(habit, selected);
    toggleHabitDone(habit.id, selected);

    if (wasDone) {
      Haptics.selectionAsync();
    } else if (doneCount + 1 === dueHabits.length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // last one → all done
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  function confirmDelete(habit: Habit, close: () => void) {
    Alert.alert(
      "Habit löschen?",
      `"${habit.name}" und die Serie werden endgültig gelöscht.`,
      [
        { text: "Abbrechen", style: "cancel", onPress: close },
        { text: "Löschen", style: "destructive", onPress: () => deleteHabit(habit.id) },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ① Title + "+" */}
        <View style={styles.header}>
          <AppText variant="title">Gewohnheiten</AppText>
          <Pressable
            onPress={() => router.push("/addhabit")}
            accessibilityLabel="Habit hinzufügen"
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={26} color={colors.onPrimary} />
          </Pressable>
        </View>

        {/* ② Week bar */}
        <WeekBar
          habits={habitList}
          selected={selected}
          today={today}
          onSelect={setSelected}
        />

        {/* ③ Progress */}
        <ProgressCard label={dayLabel(selected)} done={doneCount} total={dueHabits.length} />

        {isFuture && dueHabits.length > 0 && (
          <AppText variant="caption" muted style={styles.hint}>
            Zukünftige Tage kannst du noch nicht abhaken.
          </AppText>
        )}

        {/* ④–⑥ Habits due on the selected day */}
        {habitList.length === 0 ? (
          <AppText muted style={styles.hint}>
            Noch keine Gewohnheiten – tippe auf „+“, um deine erste hinzuzufügen.
          </AppText>
        ) : dueHabits.length === 0 ? (
          <AppText muted style={styles.hint}>
            An diesem Tag ist nichts geplant.
          </AppText>
        ) : (
          dueHabits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              done={isDoneOn(habit, selected)}
              locked={isFuture}
              onToggle={() => toggle(habit)}
              onEdit={() =>
                router.push({ pathname: "/addhabit", params: { id: habit.id } })
              }
              onDelete={(close) => confirmDelete(habit, close)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ② Mo–So of the current week. Selected day = filled circle.
function WeekBar({
  habits,
  selected,
  today,
  onSelect,
}: {
  habits: Habit[];
  selected: string;
  today: string;
  onSelect: (date: string) => void;
}) {
  return (
    <View style={styles.weekBar}>
      {weekDates(today).map((date, i) => {
        const isSelected = date === selected;
        const isFuture = date > today;

        // Dot: only for today / past days with something due
        const due = habits.filter((h) => isDueOn(h, date));
        const done = due.filter((h) => isDoneOn(h, date)).length;
        const dot =
          isFuture || due.length === 0 || done === 0
            ? null
            : done === due.length
              ? colors.text // everything done
              : colors.textMuted; // partly done

        return (
          <Pressable
            key={date}
            onPress={() => onSelect(date)}
            accessibilityLabel={dayLabel(date)}
            accessibilityState={{ selected: isSelected }}
            style={styles.weekDay}
          >
            <AppText variant="caption" muted>
              {WEEKDAY_LETTERS[i]}
            </AppText>
            <View
              style={[
                styles.dayCircle,
                isSelected && styles.dayCircleSelected,
                isFuture && !isSelected && styles.dayFuture,
              ]}
            >
              <AppText
                variant="label"
                color={isSelected ? colors.onPrimary : undefined}
              >
                {fromDateKey(date).getDate()}
              </AppText>
            </View>
            <View style={[styles.dot, dot ? { backgroundColor: dot } : null]} />
          </Pressable>
        );
      })}
    </View>
  );
}

// ③ "Heute   3 von 5 erledigt" + animated bar
function ProgressCard({ label, done, total }: { label: string; done: number; total: number }) {
  const progress = total > 0 ? done / total : 0;
  const allDone = total > 0 && done === total;

  // useState (not useRef): the React Compiler doesn't allow reading refs while rendering
  const [width] = useState(() => new Animated.Value(progress));
  useEffect(() => {
    Animated.timing(width, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false, // width can't use the native driver
    }).start();
  }, [progress, width]);

  return (
    <View style={styles.card}>
      <View style={styles.progressText}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="label" color={allDone ? colors.success : undefined}>
          {total === 0 ? "nichts geplant" : `${done} von ${total} erledigt`}
        </AppText>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            allDone && styles.progressFillDone,
            {
              width: width.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

// ④ ⑤ ⑥ One habit: symbol, name, streak, circle. Swipe left for edit / delete.
function HabitRow({
  habit,
  done,
  locked,
  onToggle,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  done: boolean;
  locked: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: (close: () => void) => void;
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const days = streak(habit);

  function pressCircle() {
    if (locked) return;
    // Small "pop" when ticking off
    if (!done) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, speed: 40 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    }
    onToggle();
  }

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={(_progress, _translation, swipeable) => (
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              swipeable.close();
              onEdit();
            }}
            style={[styles.action, styles.actionEdit]}
          >
            <AppText variant="label">Bearbeiten</AppText>
          </Pressable>
          <Pressable
            onPress={() => onDelete(swipeable.close)}
            style={[styles.action, styles.actionDelete]}
          >
            <AppText variant="label" color={colors.onPrimary}>
              Löschen
            </AppText>
          </Pressable>
        </View>
      )}
    >
      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [styles.habitRow, pressed && styles.pressed]}
      >
        <View style={styles.iconBox}>
          <Ionicons name={habit.icon} size={20} color={colors.text} />
        </View>

        <View style={styles.habitText}>
          <AppText variant="label">{habit.name}</AppText>
          <AppText variant="caption" muted>
            Serie: {days} {days === 1 ? "Tag" : "Tage"}
          </AppText>
        </View>

        <Pressable
          onPress={pressCircle}
          disabled={locked}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done, disabled: locked }}
          accessibilityLabel={habit.name}
        >
          <Animated.View
            style={[
              styles.circle,
              done && styles.circleDone,
              locked && styles.circleLocked,
              { transform: [{ scale }] },
            ]}
          >
            {done && <Ionicons name="checkmark" size={20} color={colors.onPrimary} />}
          </Animated.View>
        </Pressable>
      </Pressable>
    </ReanimatedSwipeable>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addButton: {
    width: touch.minSize,
    height: touch.minSize,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  hint: {
    textAlign: "center",
    paddingVertical: spacing.sm,
  },

  // ② Week bar
  weekBar: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekDay: {
    alignItems: "center",
    gap: spacing.xs,
    minWidth: touch.minSize - 4,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleSelected: {
    backgroundColor: colors.primary,
  },
  dayFuture: {
    opacity: 0.4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },

  // ③ Progress
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  progressText: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  progressFillDone: {
    backgroundColor: colors.success,
  },

  // ④ ⑤ Habit row
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  habitText: {
    flex: 1,
    gap: spacing.xs,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  circleDone: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  circleLocked: {
    opacity: 0.3,
  },

  // ⑥ Swipe actions
  actions: {
    flexDirection: "row",
    marginLeft: spacing.sm,
  },
  action: {
    width: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  actionEdit: {
    backgroundColor: colors.cardPressed,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  actionDelete: {
    backgroundColor: colors.danger,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
});
