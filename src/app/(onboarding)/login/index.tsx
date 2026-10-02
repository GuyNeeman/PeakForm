// src/app/(onboarding)/login/index.tsx – 12 Login (sheet over 01 Welcome)
//
// ① Grabber           → swipe down closes the sheet
// ② E-Mail            → keyboard with @, autofill (pre-filled with the account on this phone)
// ③ Passwort          → hidden, eye shows / hides it
// ④ Passwort vergessen? → second screen inside the sheet
// ⑤ Anmelden          → disabled until both fields are filled; spinner; success → app (04 Home),
//                       wrong data → red message above the button
// ⑥ Apple / Google    → not available yet ("Bald verfügbar")
// ⑦ Abbrechen         → closes the sheet

import { AppText } from "@/components/AppText";
import { AuthInput } from "@/components/AuthInput";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const { login, accountEmail } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState(accountEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function submit() {
    setError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    // Success: isLoggedIn → the root layout switches to the app by itself (sheet disappears)
    if (!result.ok) setError(result.error);
  }

  const comingSoon = (provider: string) =>
    Alert.alert("Bald verfügbar", `Die Anmeldung mit ${provider} kommt in einer späteren Version.`);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* ① */}
      <View style={styles.grabber} />

      {/* ⑦ Abbrechen + title */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.topSide}>
          <AppText variant="label" style={styles.underline}>
            Abbrechen
          </AppText>
        </Pressable>
        <AppText variant="label">Anmelden</AppText>
        <View style={styles.topSide} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        {/* ② ③ */}
        <AuthInput kind="email" label="E-Mail" value={email} onChange={setEmail} />
        <AuthInput
          kind="password"
          label="Passwort"
          value={password}
          onChange={setPassword}
          onSubmit={canSubmit ? submit : undefined}
        />

        {/* ④ */}
        <Pressable
          onPress={() => router.push("/login/forgot")}
          hitSlop={8}
          style={styles.forgot}
        >
          <AppText variant="label" style={styles.underline}>
            Passwort vergessen?
          </AppText>
        </Pressable>

        {/* ⑤ */}
        {error && (
          <AppText variant="label" color={colors.danger} style={styles.center}>
            {error}
          </AppText>
        )}
        <Pressable
          disabled={!canSubmit}
          onPress={submit}
          style={[styles.primaryButton, !canSubmit && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <AppText variant="label" color={colors.onPrimary}>
              Anmelden
            </AppText>
          )}
        </Pressable>

        {/* ⑥ */}
        <View style={styles.divider}>
          <View style={styles.line} />
          <AppText variant="caption" muted>
            ODER
          </AppText>
          <View style={styles.line} />
        </View>
        <ProviderButton icon="logo-apple" label="Mit Apple fortfahren" onPress={() => comingSoon("Apple")} />
        <ProviderButton icon="logo-google" label="Mit Google fortfahren" onPress={() => comingSoon("Google")} />
      </ScrollView>
    </SafeAreaView>
  );
}

// "Mit Apple fortfahren" – outlined button with a logo
function ProviderButton({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.providerButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
      <AppText variant="label">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 5,
    marginTop: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touch.minSize,
  },
  topSide: {
    width: 90, // same width left and right → title stays centered
  },
  underline: {
    textDecorationLine: "underline",
  },
  form: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  forgot: {
    alignSelf: "flex-end",
    marginTop: -spacing.sm,
  },
  center: {
    textAlign: "center",
  },
  primaryButton: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  providerButton: {
    height: touch.buttonHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
});
