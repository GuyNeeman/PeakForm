// src/components/AuthInput.tsx
// Input for e-mail or password (register + login).
// <AuthInput kind="email" label="E-Mail" value={email} onChange={setEmail} />
// <AuthInput kind="password" label="Passwort" value={pw} onChange={setPw} />      ← login
// <AuthInput kind="newPassword" label="Passwort" value={pw} onChange={setPw} />   ← register
//
// email:    keyboard with @, no auto-capital, autofill suggests saved addresses
// password: hidden, eye button shows / hides it

import { AppText } from "@/components/AppText";
import { colors, radius, spacing, touch, typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

type Props = {
  kind: "email" | "password" | "newPassword";
  label: string;
  value: string;
  onChange: (text: string) => void;
  hint?: string; // small grey text below, e.g. "Mindestens 8 Zeichen"
  onSubmit?: () => void; // "Enter" on the keyboard
};

export function AuthInput({ kind, label, value, onChange, hint, onSubmit }: Props) {
  const [visible, setVisible] = useState(false);
  const isPassword = kind !== "email";

  return (
    <View style={styles.field}>
      <AppText variant="label" muted>
        {label}
      </AppText>
      <View style={styles.input}>
        <TextInput
          style={styles.text}
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          {...(isPassword
            ? {
                secureTextEntry: !visible,
                // iOS / Android password managers: "new" offers a strong password
                textContentType: kind === "newPassword" ? "newPassword" : "password",
                autoComplete: kind === "newPassword" ? "new-password" : "current-password",
              }
            : {
                keyboardType: "email-address",
                textContentType: "emailAddress",
                autoComplete: "email",
                placeholder: "name@beispiel.ch",
              })}
        />
        {isPassword && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Passwort verbergen" : "Passwort anzeigen"}
          >
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {hint ? (
        <AppText variant="caption" muted>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  input: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    minHeight: touch.minSize,
  },
  text: {
    flex: 1,
    color: colors.text,
    ...typography.body,
  },
});
