// src/components/Card.tsx
// A reusable card. Styles live in one const at the bottom.

import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";
import { AppText } from "@/components/AppText";

type Props = {
  title: string;
  onPress?: () => void;            // optional: makes the card tappable
  style?: StyleProp<ViewStyle>;    // optional: extra styles from the screen (e.g. flex: 1)
  aside?: React.ReactNode;         // optional: shown on the right side (e.g. a ProgressRing)
  children?: React.ReactNode;
};

export function Card({ title, onPress, style, aside, children }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}
    >
      <View style={styles.main}>
        <AppText variant="heading">{title}</AppText>
        {children}
      </View>
      {aside}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  main: {
    flex: 1,
    gap: spacing.sm,
  },
  cardPressed: {
    backgroundColor: colors.cardPressed,
  },
});
