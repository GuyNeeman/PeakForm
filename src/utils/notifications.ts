// src/utils/notifications.ts
// Habit and water reminders as LOCAL notifications (no server needed, works in Expo Go).
//
// Instead of repeating notifications we schedule one-time reminders for the next days.
// That way a reminder can be skipped (habit already done / water goal already reached).
// The sync functions are called whenever something relevant changes and when the app is
// opened, so the reminders are always topped up again.
//
// iOS keeps at most 64 scheduled notifications per app → habits and water share them.

import Habit from "@/models/habit";
import { addDays, fromDateKey, toDateKey } from "@/utils/date";
import { isDoneOn, isDueOn } from "@/utils/habits";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const DAYS_AHEAD = 7;

// Habits
const HABIT_CHANNEL = "habits";
const HABIT_PREFIX = "habit-"; // all habit reminders start with this → easy to find and cancel
const MAX_HABIT_REMINDERS = 36;

// Water
const WATER_CHANNEL = "water";
const WATER_PREFIX = "water-";
const MAX_WATER_REMINDERS = 24;
export const WATER_START_HOUR = 8; // first reminder 08:00
export const WATER_END_HOUR = 20; // last reminder 20:00 at the latest

// Show reminders even while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Android needs channels, every platform needs permission. Returns false if not allowed.
// Called when a reminder switch is turned on (shows the system dialog the first time).
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(HABIT_CHANNEL, {
      name: "Habit-Erinnerungen",
      importance: Notifications.AndroidImportance.HIGH,
    });
    await Notifications.setNotificationChannelAsync(WATER_CHANNEL, {
      name: "Wasser-Erinnerungen",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false; // user said no → don't ask every time

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function cancelAllWithPrefix(prefix: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(prefix))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

// "2026-10-02" + 17:30 → that Date, or null if it's already in the past
function futureDate(date: string, hour: number, minute: number): Date | null {
  const when = fromDateKey(date);
  when.setHours(hour, minute, 0, 0);
  return when.getTime() > Date.now() ? when : null;
}

// ---------- HABITS ----------

async function syncHabits(habits: Habit[]): Promise<void> {
  if (Platform.OS === "web") return;

  // Start from scratch: delete all habit reminders, then plan the next days again
  await cancelAllWithPrefix(HABIT_PREFIX);

  const withReminder = habits.filter((h) => h.reminder);
  if (withReminder.length === 0) return; // nothing to remind → don't even ask for permission

  if (!(await requestNotificationPermission())) return;

  // Fewer days per habit if there are many habits (iOS limit)
  const days = Math.max(
    1,
    Math.min(DAYS_AHEAD, Math.floor(MAX_HABIT_REMINDERS / withReminder.length)),
  );
  const today = toDateKey();

  for (const habit of withReminder) {
    for (let i = 0; i < days; i++) {
      const date = addDays(today, i);
      if (!isDueOn(habit, date)) continue; // not one of its days (e.g. only Mo/Mi/Fr)
      if (isDoneOn(habit, date)) continue; // already done that day → no reminder

      const when = futureDate(date, habit.time.hour, habit.time.minute);
      if (!when) continue; // today's time already passed

      await Notifications.scheduleNotificationAsync({
        identifier: `${HABIT_PREFIX}${habit.id}-${date}`,
        content: {
          title: "PeakForm",
          body: `Zeit für: ${habit.name}`,
          data: { habitId: habit.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId: HABIT_CHANNEL,
        },
      });
    }
  }
}

// ---------- WATER ----------

export interface WaterReminderOptions {
  enabled: boolean;
  intervalHours: number; // 1, 2 or 3
  goalReachedToday: boolean; // → no more reminders today
}

async function syncWater({
  enabled,
  intervalHours,
  goalReachedToday,
}: WaterReminderOptions): Promise<void> {
  if (Platform.OS === "web") return;

  await cancelAllWithPrefix(WATER_PREFIX);
  if (!enabled) return;
  if (!(await requestNotificationPermission())) return;

  // 08:00, 10:00, … 20:00 (every 2 h) → 7 per day
  const hours: number[] = [];
  for (let h = WATER_START_HOUR; h <= WATER_END_HOUR; h += intervalHours) hours.push(h);

  // As many days as fit into the budget (1 h → 1 day, 2 h → 3 days, 3 h → 4 days)
  const days = Math.max(1, Math.min(DAYS_AHEAD, Math.floor(MAX_WATER_REMINDERS / hours.length)));
  const today = toDateKey();

  for (let i = 0; i < days; i++) {
    const date = addDays(today, i);
    if (i === 0 && goalReachedToday) continue; // already drank enough today

    for (const hour of hours) {
      const when = futureDate(date, hour, 0);
      if (!when) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `${WATER_PREFIX}${date}-${hour}`,
        content: {
          title: "PeakForm",
          body: "Zeit für ein Glas Wasser 💧",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId: WATER_CHANNEL,
        },
      });
    }
  }
}

// ---------- PUBLIC ----------
// Calls run one after another – otherwise two quick changes could mix their cancel/schedule steps

let queue: Promise<void> = Promise.resolve();

export function syncHabitReminders(habits: Habit[]): void {
  queue = queue
    .then(() => syncHabits(habits))
    .catch((error) => console.error("Could not schedule habit reminders", error));
}

export function syncWaterReminders(options: WaterReminderOptions): void {
  queue = queue
    .then(() => syncWater(options))
    .catch((error) => console.error("Could not schedule water reminders", error));
}
