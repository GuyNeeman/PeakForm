// src/constants/theme.ts
// One place for all colors, spacing, corner radii and text styles.
// Screens and components only use these names – never raw values like '#2F66DE' or 16.

import { useMemo } from "react";
import { useColorScheme } from "react-native";

// 1) COLORS – one palette for dark mode, one for light mode (same names!)
const dark = {
  background: "#0E0E10",
  card: "#1C1C1F",
  cardPressed: "#26262A",
  border: "#2C2C31",
  text: "#FFFFFF",
  textMuted: "#A1A1AA",
  primary: "#2F66DE",
  onPrimary: "#FFFFFF",
  danger: "#F04438",
  success: "#22C55E",
};

const light: typeof dark = {
  background: "#F5F5F7",
  card: "#FFFFFF",
  cardPressed: "#EDEDF0",
  border: "#E2E2E6",
  text: "#111113",
  textMuted: "#6B6B73",
  primary: "#2F66DE",
  onPrimary: "#FFFFFF",
  danger: "#D92D20",
  success: "#16A34A",
};

// The app's colors for StyleSheet.create (PeakForm is a dark app).
// Use like this: backgroundColor: colors.primary   ← no quotes!
export const colors = dark;
export const lightColors = light; // kept for a light mode later

// 2) SPACING (multiples of 4)
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 32 };

// 3) CORNER RADII
export const radius = { sm: 8, md: 14, lg: 20, full: 999 };

// 4) TEXT STYLES
export const typography = {
  title:    { fontSize: 28, fontWeight: "800" as const, lineHeight: 34 },
  heading:  { fontSize: 20, fontWeight: "700" as const, lineHeight: 26 },
  bigValue: { fontSize: 32, fontWeight: "800" as const, lineHeight: 38 },
  body:     { fontSize: 16, fontWeight: "400" as const, lineHeight: 22 },
  label:    { fontSize: 14, fontWeight: "600" as const, lineHeight: 18 },
  caption:  { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
};

// 5) TOUCH TARGETS
export const touch = { minSize: 44, buttonHeight: 56 };

export type ThemeColors = typeof dark;
export type Theme = ReturnType<typeof useTheme>;

// HOOK: the current theme (dark or light)
export function useTheme() {
  const isDark = useColorScheme() !== "light"; // PeakForm defaults to dark

  // useMemo: only create a new theme object when dark/light actually changes
  return useMemo(
    () => ({ colors: isDark ? dark : light, isDark, spacing, radius, typography, touch }),
    [isDark]
  );
}