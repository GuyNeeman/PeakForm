// src/app/_layout.tsx – Root layout
// Wraps the whole app and decides: onboarding or main tabs?

import { useTheme } from "@/constants/theme";
import { AppProvider, useApp } from "@/context/AppContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

// 1) OUTER component: only provides the context
export default function RootLayout() {
  return (
    <AppProvider>
      <RootStack />
    </AppProvider>
  );
}

// 2) INNER component: lives INSIDE the provider, so useApp() works here
function RootStack() {
  const { colors, isDark } = useTheme();
  const { isLoaded, onboardingDone } = useApp();

  // Wait until the saved data is loaded – otherwise the onboarding flashes up for a moment
  if (!isLoaded) return null;

  return (
    <SafeAreaProvider>
      {/* Clock, battery etc.: light icons in dark mode, dark icons in light mode */}
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          // Every screen gets the themed background automatically
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Only reachable while onboarding is NOT done (01–03) */}
        <Stack.Protected guard={!onboardingDone}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        {/* Only reachable once onboarding IS done (04–08) */}
        <Stack.Protected guard={onboardingDone}>
          <Stack.Screen name="(tabs)" />

          {/* 05 Add meal: slides up from the bottom */}
          <Stack.Screen name="add-meal" options={{ presentation: "modal" }} />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
