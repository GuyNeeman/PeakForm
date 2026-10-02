// src/app/(onboarding)/register.tsx – Konto erstellen (after 03 Goal)
// The goals chosen in 03 come in as params and are saved HERE, together with the account.
// Saving the goals makes the onboarding "done" → the root layout switches to the tabs.
//
// "Konto erstellen"    → account (only on this phone) + goals → app
// "Ohne Konto weiter"  → only the goals → app (account can be created later in the profile)

import { AppText } from "@/components/AppText";
import { AuthInput } from "@/components/AuthInput";
import { BackButton } from "@/components/ReturnButton";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import DailyGoals from "@/models/dailygoal";
import { MIN_PASSWORD_LENGTH } from "@/utils/auth";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type GoalParams = Record<keyof DailyGoals, string>;

export default function Register() {
  const { register, updateGoals } = useApp();
  const params = useLocalSearchParams<GoalParams>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  // Params are strings → numbers again
  const goals: DailyGoals = {
    goal: Number(params.goal),
    goalwater: Number(params.goalwater),
    goalprotein: Number(params.goalprotein),
    goalcarbs: Number(params.goalcarbs),
  };

  async function createAccount() {
    setError(null);
    setLoading(true);
    const result = await register(email, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error); // red text above the button
      return;
    }
    updateGoals(goals); // → onboarding done + logged in → app opens
  }

  function continueWithout() {
    Alert.alert(
      "Ohne Konto weiter?",
      "Deine Daten bleiben nur auf diesem Handy. Ein Konto kannst du später im Profil erstellen.",
      [
        { text: "Abbrechen", style: "cancel" },
        { text: "Ohne Konto weiter", onPress: () => updateGoals(goals) },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText variant="title">Konto erstellen</AppText>
          <AppText muted>
            Damit du dich nach dem Abmelden wieder anmelden kannst. Dein Konto bleibt nur auf
            diesem Handy.
          </AppText>
        </View>

        <AuthInput kind="email" label="E-Mail" value={email} onChange={setEmail} />
        <AuthInput
          kind="newPassword"
          label="Passwort"
          value={password}
          onChange={setPassword}
          hint={`Mindestens ${MIN_PASSWORD_LENGTH} Zeichen`}
          onSubmit={canSubmit ? createAccount : undefined}
        />
      </ScrollView>

      <View style={styles.actions}>
        {error && (
          <AppText variant="label" color={colors.danger} style={styles.error}>
            {error}
          </AppText>
        )}

        <Pressable
          disabled={!canSubmit}
          onPress={createAccount}
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <AppText variant="label" color={colors.onPrimary}>
              Konto erstellen
            </AppText>
          )}
        </Pressable>

        <Pressable onPress={continueWithout} style={styles.link} disabled={loading}>
          <AppText variant="label" muted style={styles.linkText}>
            Ohne Konto weiter
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.xs,
  },
  error: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  button: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  link: {
    minHeight: touch.minSize,
    alignSelf: "center",
    justifyContent: "center",
  },
  linkText: {
    textDecorationLine: "underline",
  },
});
