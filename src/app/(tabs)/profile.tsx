// src/app/(tabs)/profile.tsx – 08 Profil & Settings
//
// Header         → avatar (first letter), name, "Ziel: Aufbauen · 2'200 kcal", e-mail
// ① Grundwerte bearbeiten → same form as 02, saving re-calculates the kcal goal
// ⑥ PeakForm Premium      → not built yet ("Bald verfügbar")
//    Konto erstellen      → only if the user chose "Ohne Konto weiter"
// ② Wasser-Erinnerung     → switch; first time: system asks for permission.
//                            On → "Intervall" row (every 1 / 2 / 3 h, 08:00–20:00).
//                            No more reminders once today's water goal is reached.
// ⑦ Abmelden              → asks first, then back to 01 Welcome (data stays on the phone)

import { AppText } from "@/components/AppText";
import { Avatar } from "@/components/Avatar";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { WATER_INTERVALS } from "@/models/settings";
import {
  requestNotificationPermission,
  WATER_END_HOUR,
  WATER_START_HOUR,
} from "@/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 2200 → "2'200"
const format = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'");

export default function ProfileScreen() {
  const { userBasics, dailyGoals, accountEmail, logout, settings, updateSettings } = useApp();

  // ② Turning it on asks for permission (system dialog only the first time)
  async function changeWaterReminder(on: boolean) {
    if (!on) {
      updateSettings({ waterReminder: false });
      return;
    }
    updateSettings({ waterReminder: true });
    const allowed = await requestNotificationPermission();
    if (!allowed) {
      updateSettings({ waterReminder: false });
      Alert.alert(
        "Mitteilungen sind aus",
        "Erlaube Mitteilungen für PeakForm in den Einstellungen, um Erinnerungen zu bekommen.",
      );
    }
  }

  const name = userBasics?.name || "Du";
  const goalLine = [
    userBasics?.goal ? `Ziel: ${userBasics.goal}` : null,
    dailyGoals ? `${format(dailyGoals.goal)} kcal` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function confirmLogout() {
    Alert.alert(
      "Abmelden?",
      "Deine Daten bleiben auf diesem Handy. Melde dich wieder an, um weiterzumachen.",
      [
        { text: "Abbrechen", style: "cancel" },
        { text: "Abmelden", style: "destructive", onPress: logout }, // → 01 Welcome
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title">Profil</AppText>

        {/* Header */}
        <View style={styles.header}>
          <Avatar name={userBasics?.name} size={72} />
          <View style={styles.headerText}>
            <AppText variant="heading">{name}</AppText>
            {goalLine ? (
              <AppText variant="caption" muted>
                {goalLine}
              </AppText>
            ) : null}
            <AppText variant="caption" muted>
              {accountEmail ?? "Kein Konto – Daten nur auf diesem Handy"}
            </AppText>
          </View>
        </View>

        {/* KONTO */}
        <AppText variant="caption" muted style={styles.sectionTitle}>
          KONTO
        </AppText>
        <View style={styles.group}>
          <Row label="Grundwerte bearbeiten" onPress={() => router.push("/editbasics")} />
          <Row
            label="PeakForm Premium"
            onPress={() =>
              Alert.alert("Bald verfügbar", "PeakForm Premium kommt in einer späteren Version.")
            }
          />
          {!accountEmail && (
            <Row label="Konto erstellen" onPress={() => router.push("/createaccount")} />
          )}
        </View>

        {/* EINSTELLUNGEN */}
        <AppText variant="caption" muted style={styles.sectionTitle}>
          EINSTELLUNGEN
        </AppText>
        <View style={styles.group}>
          {/* ② Wasser-Erinnerung */}
          <View style={styles.row}>
            <AppText variant="label" style={styles.rowLabel}>
              Wasser-Erinnerung
            </AppText>
            <Switch
              value={settings.waterReminder}
              onValueChange={changeWaterReminder}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.onPrimary}
            />
          </View>

          {/* Intervall – only while it's on */}
          {settings.waterReminder && (
            <View style={styles.row}>
              <AppText variant="label" style={styles.rowLabel}>
                Intervall
              </AppText>
              <View style={styles.intervals}>
                {WATER_INTERVALS.map((hours) => {
                  const isActive = settings.waterInterval === hours;
                  return (
                    <Pressable
                      key={hours}
                      onPress={() => updateSettings({ waterInterval: hours })}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      accessibilityLabel={`Alle ${hours} Stunden`}
                      style={[styles.interval, isActive && styles.intervalActive]}
                    >
                      <AppText
                        variant="label"
                        color={isActive ? colors.onPrimary : undefined}
                      >
                        {hours} h
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>
        {settings.waterReminder && (
          <AppText variant="caption" muted style={styles.note}>
            Alle {settings.waterInterval} h zwischen {WATER_START_HOUR}:00 und {WATER_END_HOUR}:00 –
            keine mehr, sobald dein Wasserziel für heute erreicht ist.
          </AppText>
        )}

        {/* ⑦ Abmelden – only with an account (without one there's nothing to log back into) */}
        {accountEmail && (
          <Pressable
            onPress={confirmLogout}
            style={({ pressed }) => [styles.group, styles.logout, pressed && styles.pressed]}
          >
            <AppText variant="label" color={colors.danger}>
              Abmelden
            </AppText>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// One line in a group: "Grundwerte bearbeiten  >"
function Row({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <AppText variant="label" style={styles.rowLabel}>
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginVertical: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    marginTop: spacing.md,
    letterSpacing: 1,
  },
  group: {
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: touch.buttonHeight,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.cardPressed,
  },
  rowLabel: {
    flex: 1,
  },
  intervals: {
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  interval: {
    minWidth: 48,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  intervalActive: {
    backgroundColor: colors.primary,
  },
  note: {
    paddingHorizontal: spacing.sm,
  },
  logout: {
    marginTop: spacing.lg,
    minHeight: touch.buttonHeight,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
