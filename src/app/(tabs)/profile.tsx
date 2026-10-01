// src/app/(tabs)/profile.tsx – Profile (placeholder)

import { AppText } from "@/components/AppText";
import { spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppText variant="title">Profil</AppText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
});
