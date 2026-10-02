// src/app/_layout.tsx – Root layout
// Wraps the whole app and decides: onboarding or main tabs?

import { useTheme } from "@/constants/theme";
import { AppProvider, useApp } from "@/context/AppContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// 1) OUTER component: only provides the context
// GestureHandlerRootView: needed for swipe gestures (e.g. swipe a habit to the left)
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <RootStack />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

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
          <Stack.Screen name="addmeal" options={{ presentation: "modal" }} />

          {/* Add / edit habit: slides up from the bottom */}
          <Stack.Screen name="addhabit" options={{ presentation: "modal" }} />

          {/* 15 New / edit workout (+ 16 "Übung auswählen" inside it): slides up */}
          <Stack.Screen name="editworkout" options={{ presentation: "modal" }} />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
