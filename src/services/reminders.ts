import { Platform } from "react-native";
import { Settings } from "../types";
import { translate } from "../locales";
export async function scheduleReminder(settings: Settings) {
  if (Platform.OS === "web") return !settings.reminder;
  const Notifications = await import("expo-notifications");
  if (!settings.reminder) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  }
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("gentle", {
      name: "HEDHI",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: translate(settings.language, "reminderTitle"),
      body: translate(settings.language, "reminderText"),
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: settings.reminderHour,
      minute: 0,
      channelId: "gentle",
    },
  });
  return true;
}

export type ReminderStatus =
  | "reminderDisabled"
  | "reminderDenied"
  | "reminderScheduled"
  | "reminderNotScheduled"
  | "reminderUnsupported";

export async function getReminderStatus(settings: Settings): Promise<ReminderStatus> {
  if (Platform.OS === "web") return "reminderUnsupported";
  if (!settings.reminder) return "reminderDisabled";
  const Notifications = await import("expo-notifications");
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return "reminderDenied";
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length ? "reminderScheduled" : "reminderNotScheduled";
}
