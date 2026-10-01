// src/components/AppText.tsx
// Text that automatically uses the theme's text styles and colors.
// <AppText variant="title">Hello</AppText>
// <AppText muted>Smaller grey text</AppText>

import { Text, TextProps } from "react-native";
import { typography, useTheme } from "@/constants/theme";

type Props = TextProps & {
  variant?: keyof typeof typography; // title | heading | bigValue | body | label | caption
  muted?: boolean;                   // grey instead of normal text color
  color?: string;                    // optional: any theme color, e.g. colors.onPrimary
};

export function AppText({ variant = "body", muted = false, color, style, ...props }: Props) {
  const { colors } = useTheme();
  const textColor = color ?? (muted ? colors.textMuted : colors.text);

  return <Text style={[typography[variant], { color: textColor }, style]} {...props} />;
}