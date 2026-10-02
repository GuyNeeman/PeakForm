import { useTheme } from "@/constants/theme";
import { Stack } from "expo-router";

export default function WorkoutLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Without this the Stack uses React Navigation's default (light grey) background
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
