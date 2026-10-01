// src/components/Card.tsx
// A reusable card. Styles live in one const at the bottom.

import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";
import { AppText } from "@/components/AppText";

type Props = {
  title: string;
  onPress?: () => void;            // optional: makes the card tappable
  style?: StyleProp<ViewStyle>;    // optional: extra styles from the screen (e.g. flex: 1)
  children?: React.ReactNode;
};

export function Card({ title, onPress, style, children }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}
    >
      <AppText variant="heading">{title}</AppText>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardPressed: {
    backgroundColor: colors.cardPressed,
  },
});