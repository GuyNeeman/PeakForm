// src/components/TextField.tsx
// Label + number input + unit.
// <TextField label="Gewicht" unit="kg" value={weight} onChange={setWeight} />

import { AppText } from "@/components/AppText";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  label: string;
  unit: string;
  value: string;
  onChange: (text: string) => void;
};

export function TextField({ label, unit, value, onChange }: Props) {
  return (
    <View style={styles.field}>
      <AppText variant="label" muted>
        {label}
      </AppText>
      <View style={styles.input}>
        <TextInput
          style={styles.text}
          value={value}
          onChangeText={onChange}
          keyboardType="number-pad"
        />
        <AppText muted>{unit}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    gap: spacing.sm,
  },
  input: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  text: {
    flex: 1,
    color: colors.text,
    ...typography.body,
  },
});
