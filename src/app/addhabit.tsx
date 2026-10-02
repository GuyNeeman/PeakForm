// src/app/addhabit.tsx – 19 Habit hinzufügen (modal)
// /addhabit          → new habit
// /addhabit?id=abc   → edit that habit (fields are filled in)
//
// ① Grabber      → swipe down closes (blocked once you've changed something → use "Abbrechen")
// ② Name         → required, max. 30 characters
// ③ Symbol       → tap to select
// ④ Häufigkeit   → "Täglich" or "Bestimmte Tage" (shows the weekday circles)
// ⑤ Erinnerung   → first time on: asks for notification permission. Off: time row disappears.
// ⑥ Uhrzeit      → opens the time picker
// ⑦ Speichern    → disabled without a name
// ⑧ Abbrechen    → closes without saving (asks first if something was changed)

import { AppText } from "@/components/AppText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TextField } from "@/components/TextField";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import {
  ALL_WEEKDAYS,
  HABIT_ICONS,
  HabitIcon,
  WEEKDAY_LETTERS,
} from "@/models/habit";
import { formatTime } from "@/utils/habits";
import { requestNotificationPermission } from "@/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAILY = "Täglich";
const SOME_DAYS = "Bestimmte Tage";

export default function AddHabit() {
  const { addHabit, updateHabit, habitList } = useApp();
  const router = useRouter();

  // Edit mode if an id was passed and the habit exists
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = habitList.find((habit) => habit.id === id);

  // Start values: the existing habit (edit) or defaults (new)
  const initial = {
    name: existing?.name ?? "",
    icon: existing?.icon ?? HABIT_ICONS[0],
    weekdays: existing?.weekdays ?? ALL_WEEKDAYS,
    reminder: existing?.reminder ?? false,
    hour: existing?.time.hour ?? 17,
    minute: existing?.time.minute ?? 0,
  };

  const [name, setName] = useState(initial.name);
  const [icon, setIcon] = useState<HabitIcon>(initial.icon);
  const [frequency, setFrequency] = useState(
    initial.weekdays.length === 7 ? DAILY : SOME_DAYS,
  );
  const [weekdays, setWeekdays] = useState<number[]>(initial.weekdays);
  const [reminder, setReminder] = useState(initial.reminder);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [showPicker, setShowPicker] = useState(false);

  const chosenDays = frequency === DAILY ? ALL_WEEKDAYS : weekdays;
  const isComplete = name.trim().length > 0 && chosenDays.length > 0;

  // Something changed? → swipe-down is blocked and "Abbrechen" asks first
  const isDirty =
    name !== initial.name ||
    icon !== initial.icon ||
    chosenDays.join() !== initial.weekdays.join() ||
    reminder !== initial.reminder ||
    hour !== initial.hour ||
    minute !== initial.minute;

  function toggleWeekday(day: number) {
    setWeekdays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort(),
    );
  }

  // ⑤ Turning the reminder on asks for permission (system dialog only the first time)
  async function changeReminder(on: boolean) {
    if (!on) {
      setReminder(false);
      setShowPicker(false);
      return;
    }
    setReminder(true);
    const allowed = await requestNotificationPermission();
    if (!allowed) {
      setReminder(false);
      Alert.alert(
        "Mitteilungen sind aus",
        "Erlaube Mitteilungen für PeakForm in den Einstellungen, um Erinnerungen zu bekommen.",
      );
    }
  }

  // ⑥ Time picker. Android: a dialog that closes itself. iOS: a wheel inside the card.
  function changeTime(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "set" && date) {
      setHour(date.getHours());
      setMinute(date.getMinutes());
    }
  }

  function save() {
    const habit = {
      name: name.trim(),
      icon,
      weekdays: chosenDays,
      reminder,
      time: { hour, minute },
    };
    // The context re-plans the reminders by itself
    if (existing) updateHabit(existing.id, habit);
    else addHabit(habit);
    router.back();
  }

  function cancel() {
    if (!isDirty) {
      router.back();
      return;
    }
    Alert.alert("Änderungen verwerfen?", "Deine Eingaben gehen verloren.", [
      { text: "Weiter bearbeiten", style: "cancel" },
      { text: "Verwerfen", style: "destructive", onPress: () => router.back() },
    ]);
  }

  const pickerValue = new Date();
  pickerValue.setHours(hour, minute, 0, 0);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* ① Swipe down only while nothing was changed */}
      <Stack.Screen options={{ gestureEnabled: !isDirty }} />
      <View style={styles.grabber} />

      {/* ⑧ Abbrechen + title */}
      <View style={styles.topBar}>
        <Pressable onPress={cancel} hitSlop={8} style={styles.topSide}>
          <AppText variant="label" style={styles.cancelText}>
            Abbrechen
          </AppText>
        </Pressable>
        <AppText variant="label">{existing ? "Habit bearbeiten" : "Neues Habit"}</AppText>
        <View style={styles.topSide} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        {/* ② Name */}
        <View style={styles.row}>
          <TextField
            label="Name"
            value={name}
            onChange={setName}
            keyboardType="default"
            placeholder="z. B. 10 Seiten lesen"
            maxLength={30}
          />
        </View>

        {/* ③ Symbol */}
        <View style={styles.section}>
          <AppText variant="label" muted>
            Symbol
          </AppText>
          <View style={styles.iconRow}>
            {HABIT_ICONS.map((option) => {
              const isSelected = option === icon;
              return (
                <Pressable
                  key={option}
                  onPress={() => setIcon(option)}
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.iconOption, isSelected && styles.iconOptionSelected]}
                >
                  <Ionicons
                    name={option}
                    size={22}
                    color={isSelected ? colors.onPrimary : colors.text}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ④ Häufigkeit */}
        <View style={styles.section}>
          <SegmentedControl
            label="Häufigkeit"
            options={[DAILY, SOME_DAYS]}
            value={frequency}
            onChange={setFrequency}
          />
          {frequency === SOME_DAYS && (
            <View style={styles.weekdayRow}>
              {WEEKDAY_LETTERS.map((letter, day) => {
                const isOn = weekdays.includes(day);
                return (
                  <Pressable
                    key={day}
                    onPress={() => toggleWeekday(day)}
                    accessibilityState={{ selected: isOn }}
                    style={[styles.weekday, isOn && styles.weekdayOn]}
                  >
                    <AppText
                      variant="label"
                      color={isOn ? colors.onPrimary : undefined}
                    >
                      {letter}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
          {frequency === SOME_DAYS && weekdays.length === 0 && (
            <AppText variant="caption" color={colors.danger}>
              Wähle mindestens einen Tag.
            </AppText>
          )}
        </View>

        {/* ⑤ Erinnerung + ⑥ Uhrzeit */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <AppText variant="label">Erinnerung</AppText>
            <Switch
              value={reminder}
              onValueChange={changeReminder}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.onPrimary}
            />
          </View>

          {reminder && (
            <Pressable
              onPress={() => setShowPicker((open) => !open)}
              style={[styles.cardRow, styles.timeRow]}
            >
              <AppText variant="label">Uhrzeit</AppText>
              <View style={styles.timeValue}>
                <AppText variant="label" muted>
                  {formatTime(hour, minute)}
                </AppText>
                <Ionicons
                  name={showPicker && Platform.OS === "ios" ? "chevron-down" : "chevron-forward"}
                  size={18}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>
          )}

          {reminder && showPicker && (
            <DateTimePicker
              value={pickerValue}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              themeVariant="dark"
              minuteInterval={5}
              onChange={changeTime}
            />
          )}

          {reminder && (
            <AppText variant="caption" muted>
              Nur an Tagen, an denen das Habit fällig und noch nicht erledigt ist.
            </AppText>
          )}
        </View>
      </ScrollView>

      {/* ⑦ Save */}
      <Pressable
        disabled={!isComplete}
        onPress={save}
        style={[styles.saveButton, !isComplete && styles.saveButtonDisabled]}
      >
        <AppText variant="label" color={colors.onPrimary}>
          Habit speichern
        </AppText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
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
  cancelText: {
    textDecorationLine: "underline",
  },
  form: {
    gap: spacing.xl,
  },
  row: {
    flexDirection: "row",
  },
  section: {
    gap: spacing.sm,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconOption: {
    width: touch.minSize + 4,
    height: touch.minSize + 4,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  iconOptionSelected: {
    backgroundColor: colors.primary,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  weekday: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touch.minSize,
  },
  timeRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  timeValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  saveButton: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
});
