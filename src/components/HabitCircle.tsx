// src/components/HabitCircle.tsx
// A habit as a round button (Home → "Tägliche Gewohnheiten").
// Not done: its symbol in a grey ring. Done: green with a check.
// Tap → done (pop animation + vibration), tap again → undo.
// <HabitCircle habit={habit} done={isDone} onToggle={() => toggleHabitDone(habit.id)} />

import { AppText } from "@/components/AppText";
import { colors, radius, spacing } from "@/constants/theme";
import Habit from "@/models/habit";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

const SIZE = 56;

type Props = {
  habit: Habit;
  done: boolean;
  onToggle: () => void;
};

export function HabitCircle({ habit, done, onToggle }: Props) {
  // useState (not useRef): the React Compiler doesn't allow reading refs while rendering
  const [scale] = useState(() => new Animated.Value(1));

  function press() {
    if (!done) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, speed: 40 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.selectionAsync();
    }
    onToggle();
  }

  return (
    <Pressable
      onPress={press}
      hitSlop={4}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={habit.name}
      style={styles.item}
    >
      <Animated.View
        style={[styles.circle, done && styles.circleDone, { transform: [{ scale }] }]}
      >
        <Ionicons
          name={done ? "checkmark" : habit.icon}
          size={done ? 28 : 24}
          color={done ? colors.onPrimary : colors.text}
        />
      </Animated.View>
      <AppText variant="caption" muted numberOfLines={1} style={styles.label}>
        {habit.name}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    width: SIZE + spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  circleDone: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  label: {
    textAlign: "center",
  },
});
