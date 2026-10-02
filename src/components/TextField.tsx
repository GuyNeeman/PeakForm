// src/components/TextField.tsx
// Label + input + unit. Number keyboard by default.
// <TextField label="Gewicht" unit="kg" value={weight} onChange={setWeight} />
// <TextField label="Name" value={name} onChange={setName} keyboardType="default" />

import { AppText } from "@/components/AppText";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { KeyboardTypeOptions, StyleSheet, TextInput, View } from "react-native";

type Props = {
  label: string;
  unit?: string;                       // optional: e.g. "kg", leave out for text
  value: string;
  onChange: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;  // optional: "default" for normal text
  placeholder?: string;                // optional: grey hint while empty
  maxLength?: number;                  // optional: max. number of characters
};

export function TextField({
  label,
  unit,
  value,
  onChange,
  keyboardType = "number-pad",
  placeholder,
  maxLength,
}: Props) {
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
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          maxLength={maxLength}
        />
        {unit ? <AppText muted>{unit}</AppText> : null}
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
