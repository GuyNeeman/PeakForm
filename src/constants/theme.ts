// constants/theme.ts
// One place for all colors, spacing, corner radii and text styles.
// Screens and components only use these names – never raw values like '#2F66DE' or 16.

import { useColorScheme } from 'react-native';

// 1) COLORS – one palette for dark mode, one for light mode.
//    Both have exactly the same names, only the values differ.
const dark = {
  background: '#0E0E10',   // screen background
  card: '#1C1C1F',         // cards (calories, water, …)
  cardPressed: '#26262A',  // card while being pressed
  border: '#2C2C31',       // dividers, input borders
  text: '#FFFFFF',         // main text
  textMuted: '#A1A1AA',    // secondary text ("of 2'200", "Last night")
  primary: '#2F66DE',      // accent: ring, buttons, active tab
  onPrimary: '#FFFFFF',    // text on top of the accent color
  danger: '#F04438',       // errors, delete, log out
  success: '#22C55E',      // completed habits
};

const light: typeof dark = {
  background: '#F5F5F7',
  card: '#FFFFFF',
  cardPressed: '#EDEDF0',
  border: '#E2E2E6',
  text: '#111113',
  textMuted: '#6B6B73',
  primary: '#2F66DE',
  onPrimary: '#FFFFFF',
  danger: '#D92D20',
  success: '#16A34A',
};

// 2) SPACING – fixed steps (multiples of 4) instead of random numbers.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,   // padding inside cards
  xl: 20,   // distance from the screen edge
  xxl: 32,
};

// 3) CORNER RADII
export const radius = {
  sm: 8,      // small chips like "+250 ml"
  md: 14,     // buttons, inputs
  lg: 20,     // cards
  full: 999,  // fully round (avatar, habit circles)
};

// 4) TEXT STYLES – ready to use, just add a color.
export const typography = {
  title:    { fontSize: 28, fontWeight: '800' as const, lineHeight: 34 }, // "Hey Alex, …"
  heading:  { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 }, // card titles
  bigValue: { fontSize: 32, fontWeight: '800' as const, lineHeight: 38 }, // "7h 45m", "1'850"
  body:     { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  label:    { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 }, // buttons, chips
  caption:  { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

// 5) TOUCH TARGETS – from the ergonomics analysis
export const touch = {
  minSize: 44,       // every tappable element at least 44 × 44
  buttonHeight: 56,  // primary buttons
};

export type ThemeColors = typeof dark;

// THE HOOK – use this in every screen and component:
//   const { colors, spacing, typography } = useTheme();
export function useTheme() {
  const scheme = useColorScheme();      // 'dark' | 'light' | null
  const isDark = scheme !== 'light';    // PeakForm defaults to dark

  return {
    colors: isDark ? dark : light,
    isDark,
    spacing,
    radius,
    typography,
    touch,
  };
}