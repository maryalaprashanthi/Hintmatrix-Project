export const suppressNotificationPopup = (path) =>
  /^\/(?:exams?|mock-exams?)(?:\/|$)/.test(path);

// Old unread notifications belong in the bell, not in a burst of login popups.
export function collectNewNotifications(items, seen) {
  const incoming = seen === null ? [] : items.filter((item) => !item.read && !seen.has(item.notificationId));
  return { incoming, seen: new Set([...(seen || []), ...items.map((item) => item.notificationId)]) };
}
