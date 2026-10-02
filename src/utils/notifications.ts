// src/utils/notifications.ts
// Habit reminders as LOCAL notifications (no server needed, works in Expo Go).
//
// Instead of one repeating notification we schedule one-time reminders for the next days.
// That way a reminder can be skipped when the habit is already done that day.
// syncHabitReminders() is called whenever habits change and when the app is opened,
// so the reminders are always topped up again.

import Habit from "@/models/habit";
import { addDays, fromDateKey, toDateKey } from "@/utils/date";
import { isDoneOn, isDueOn } from "@/utils/habits";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CHANNEL_ID = "habits";
const PREFIX = "habit-"; // all our reminders start with this → easy to find and cancel
const DAYS_AHEAD = 7;
const MAX_REMINDERS = 60; // iOS keeps at most 64 scheduled notifications per app

// Show reminders even while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// "habit-<habitId>-2026-10-02" → one reminder for one habit on one day
export function reminderId(habitId: string, date: string): string {
  return `${PREFIX}${habitId}-${date}`;
}

// Android needs a channel, every platform needs permission. Returns false if not allowed.
// Called when the reminder switch is turned on (shows the system dialog the first time).
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Habit-Erinnerungen",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false; // user said no → don't ask every time

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function cancelAllHabitReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

async function sync(habits: Habit[]): Promise<void> {
  if (Platform.OS === "web") return;

  // Start from scratch: delete all our reminders, then plan the next days again
  await cancelAllHabitReminders();

  const withReminder = habits.filter((h) => h.reminder);
  if (withReminder.length === 0) return; // nothing to remind → don't even ask for permission

  if (!(await requestNotificationPermission())) return;

  // Fewer days per habit if there are many habits (iOS limit)
  const days = Math.max(
    1,
    Math.min(DAYS_AHEAD, Math.floor(MAX_REMINDERS / withReminder.length)),
  );
  const now = Date.now();
  const today = toDateKey();

  for (const habit of withReminder) {
    for (let i = 0; i < days; i++) {
      const date = addDays(today, i);
      if (!isDueOn(habit, date)) continue; // not one of its days (e.g. only Mo/Mi/Fr)
      if (isDoneOn(habit, date)) continue; // already done that day → no reminder

      const when = fromDateKey(date);
      when.setHours(habit.time.hour, habit.time.minute, 0, 0);
      if (when.getTime() <= now) continue; // today's time already passed

      await Notifications.scheduleNotificationAsync({
        identifier: reminderId(habit.id, date),
        content: {
          title: "PeakForm",
          body: `Zeit für: ${habit.name}`,
          data: { habitId: habit.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId: CHANNEL_ID,
        },
      });
    }
  }
}

// Calls run one after another – otherwise two quick changes could mix their cancel/schedule steps
let queue: Promise<void> = Promise.resolve();

export function syncHabitReminders(habits: Habit[]): void {
  queue = queue
    .then(() => sync(habits))
    .catch((error) => console.error("Could not schedule habit reminders", error));
}
