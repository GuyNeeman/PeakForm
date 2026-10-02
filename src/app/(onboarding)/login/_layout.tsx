// src/app/(onboarding)/login/_layout.tsx – the login sheet (12) over 01 Welcome
// /login          → 12 Anmelden
// /login/forgot   → Passwort vergessen (pushed inside the sheet)

import { useTheme } from "@/constants/theme";
import { Stack } from "expo-router";

export default function LoginLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    />
  );
}
