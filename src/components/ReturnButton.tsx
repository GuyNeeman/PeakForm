// src/components/BackButton.tsx
// Round-cornered back button (top left), as in wireframe 02.
// Usage: <BackButton />   or   <BackButton onPress={() => ...} />

import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius, touch } from "@/constants/theme";

type Props = {
  onPress?: () => void; 
};

export function BackButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      accessibilityRole="button"
      accessibilityLabel="Zurück"
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="chevron-back" size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touch.minSize,          // 44
    height: touch.minSize,         // 44
    borderRadius: radius.md,       // 14
    backgroundColor: colors.card,  // same grey as the cards
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: colors.cardPressed,
  },
});