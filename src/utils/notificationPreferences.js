export const defaultNotificationPreferences = {
  notificationPopups: true, activityReminders: true, productAnnouncements: false,
};

export function parseNotificationPreferences(value) {
  if (!value || Object.keys(defaultNotificationPreferences).some((key) => typeof value[key] !== "boolean")) {
    throw new Error("Invalid settings response");
  }
  return Object.fromEntries(Object.keys(defaultNotificationPreferences).map((key) => [key, value[key]]));
}

export function notificationPopupAllowed(notification, preferences) {
  if (!preferences.notificationPopups) return false;
  if (["EXAM_REMINDER", "ATTENDANCE_WARNING", "ATTENDANCE_SUBMISSION_MISSING"].includes(notification.eventType)) {
    return preferences.activityReminders;
  }
  if (notification.eventType === "SYSTEM_ANNOUNCEMENT") return preferences.productAnnouncements;
  return true;
}
