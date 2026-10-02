// src/app/createaccount.tsx – "Konto erstellen" from the profile
// For people who chose "Ohne Konto weiter" in the onboarding. Afterwards they can log out and in.

import { AppText } from "@/components/AppText";
import { AuthInput } from "@/components/AuthInput";
import { BackButton } from "@/components/ReturnButton";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { MIN_PASSWORD_LENGTH } from "@/utils/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateAccount() {
  const { register } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function submit() {
    setError(null);
    setLoading(true);
    const result = await register(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.back(); // back to the profile, which now shows the e-mail
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
            Damit du dich abmelden und wieder anmelden kannst. Deine bisherigen Daten bleiben
            erhalten. Das Konto liegt nur auf diesem Handy.
          </AppText>
        </View>

        <AuthInput kind="email" label="E-Mail" value={email} onChange={setEmail} />
        <AuthInput
          kind="newPassword"
          label="Passwort"
          value={password}
          onChange={setPassword}
          hint={`Mindestens ${MIN_PASSWORD_LENGTH} Zeichen`}
          onSubmit={canSubmit ? submit : undefined}
        />
      </ScrollView>

      {error && (
        <AppText variant="label" color={colors.danger} style={styles.center}>
          {error}
        </AppText>
      )}
      <Pressable
        disabled={!canSubmit}
        onPress={submit}
        style={[styles.button, !canSubmit && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <AppText variant="label" color={colors.onPrimary}>
            Konto erstellen
          </AppText>
        )}
      </Pressable>
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
  center: {
    textAlign: "center",
  },
  button: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
});
