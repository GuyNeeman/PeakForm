// src/app/(tabs)/_layout.tsx
// Bottom tab bar with 5 tabs: Home, Meals, Workout, Habits, Profile

import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTheme } from "@/constants/theme";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },   // background of every tab screen
        tabBarActiveTintColor: colors.primary,                // active tab: blue
        tabBarInactiveTintColor: colors.textMuted,            // other tabs: grey
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>⌂</Text>,
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🍽</Text>,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🏋</Text>,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>✓</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>●</Text>,
        }}
      />
    </Tabs>
  );
}