// src/components/SegmentedControl.tsx
// A row of options – the selected one is blue.
// <SegmentedControl label="Ziel" options={["Abnehmen", "Halten"]} value={goal} onChange={setGoal} />

import { AppText } from "@/components/AppText";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  label: string;
  options: string[];
  value: string;
  onChange: (option: string) => void;
};

export function SegmentedControl({ label, options, value, onChange }: Props) {
  return (
    <View style={styles.field}>
      <AppText variant="label" muted>
        {label}
      </AppText>
      <View style={styles.bar}>
        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.option, value === option && styles.optionActive]}
          >
            <AppText variant="label">{option}</AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  bar: {
    flexDirection: "row",
    padding: spacing.xs,
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  option: {
    flex: 1,
    minHeight: touch.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
});
