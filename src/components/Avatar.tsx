// src/components/Avatar.tsx
// Round avatar with the first letter of the name (Home top right, Profile header).
// <Avatar name="Alex" size={48} />

import { AppText } from "@/components/AppText";
import { colors, radius } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

type Props = {
  name: string | undefined; // no name → "?"
  size?: number;
};

export function Avatar({ name, size = 48 }: Props) {
  const letter = name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <View style={[styles.circle, { width: size, height: size }]}>
      <AppText
        variant={size >= 64 ? "title" : "heading"}
        color={colors.onPrimary}
      >
        {letter}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
