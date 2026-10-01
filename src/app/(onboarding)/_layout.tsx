// src/app/(onboarding)/_layout.tsx
// Stack for the onboarding: 01 Welcome → 02 Basics → 03 Goal

import { Stack } from "expo-router";
import { useTheme } from "@/constants/theme";

// Always start the onboarding on the welcome screen
export const unstable_settings = {
  initialRouteName: "welcome",
};

export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,                               // screens draw their own back button
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",                   // push animation like in the wireframes
        gestureEnabled: true,                            // swipe from the left edge = back
      }}
    >
      {/* Welcome is the start: no swipe back from here */}
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
      <Stack.Screen name="basics" />
      <Stack.Screen name="goal" />
    </Stack>
  );
}