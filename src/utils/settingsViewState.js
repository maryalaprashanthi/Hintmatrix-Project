import { parseNotificationPreferences } from "./notificationPreferences.js";

const key = (userId) => "hintmatrix-settings-view:" + userId;
export function readSettingsViewState(userId, server, storage = globalThis.sessionStorage) {
  try {
    const value = JSON.parse(storage?.getItem(key(userId)) || "null");
    if (!value) return null;
    const sameBaseline = JSON.stringify(parseNotificationPreferences(value.baseline)) === JSON.stringify(server);
    return {
      section: ["general", "notifications", "security", "announcements"].includes(value.section) ? value.section : "general",
      draft: sameBaseline ? parseNotificationPreferences(value.draft) : server,
      announcement: {
        title: typeof value.announcement?.title === "string" ? value.announcement.title.slice(0, 160) : "",
        message: typeof value.announcement?.message === "string" ? value.announcement.message.slice(0, 500) : "",
      },
    };
  } catch { return null; }
}

export function saveSettingsViewState(userId, value, storage = globalThis.sessionStorage) {
  try { if (userId != null) storage?.setItem(key(userId), JSON.stringify(value)); }
  catch { /* Server settings still work when session storage is unavailable. */ }
}
