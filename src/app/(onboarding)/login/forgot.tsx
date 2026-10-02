// src/app/(onboarding)/login/forgot.tsx – Passwort vergessen (inside the login sheet)
// Without a server no e-mail can be sent. Instead: e-mail + first name (from the basics)
// prove it's you, then a new password is set directly on this phone.

import { AppText } from "@/components/AppText";
import { AuthInput } from "@/components/AuthInput";
import { BackButton } from "@/components/ReturnButton";
import { TextField } from "@/components/TextField";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { MIN_PASSWORD_LENGTH } from "@/utils/auth";
import { useRouter } from "expo-router";
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

export default function ForgotPassword() {
  const { resetPassword } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    email.trim().length > 0 &&
    firstName.trim().length > 0 &&
    newPassword.length > 0 &&
    !loading;

  async function submit() {
    setError(null);
    setLoading(true);
    const result = await resetPassword(email, firstName, newPassword);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    Alert.alert("Passwort geändert", "Du kannst dich jetzt mit dem neuen Passwort anmelden.", [
      { text: "OK", onPress: () => router.back() }, // back to "Anmelden"
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.topBar}>
        <BackButton />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText variant="title">Passwort vergessen?</AppText>
          <AppText muted>
            Dein Konto liegt nur auf diesem Handy, darum können wir dir keine Mail schicken.
            Bestätige stattdessen deine E-Mail und deinen Vornamen.
          </AppText>
        </View>

        <AuthInput kind="email" label="E-Mail" value={email} onChange={setEmail} />
        <View style={styles.row}>
          <TextField
            label="Vorname"
            value={firstName}
            onChange={setFirstName}
            keyboardType="default"
            placeholder="Wie in deinen Grundwerten"
            maxLength={30}
          />
        </View>
        <AuthInput
          kind="newPassword"
          label="Neues Passwort"
          value={newPassword}
          onChange={setNewPassword}
          hint={`Mindestens ${MIN_PASSWORD_LENGTH} Zeichen`}
          onSubmit={canSubmit ? submit : undefined}
        />

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
              Passwort speichern
            </AppText>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  topBar: {
    paddingTop: spacing.lg,
  },
  form: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
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
