import test from "node:test";
import assert from "node:assert/strict";
import { defaultNotificationPreferences as defaults, parseNotificationPreferences, notificationPopupAllowed as allowed } from "./notificationPreferences.js";

test("preferences validate server responses and preserve false", () => {
  assert.deepEqual(parseNotificationPreferences({ ...defaults, notificationPopups: false, userId: 3 }),
    { ...defaults, notificationPopups: false });
  for (const value of [null, {}, { ...defaults, activityReminders: "false" }]) {
    assert.throws(() => parseNotificationPreferences(value));
  }
});
test("master switch disables all popups without deleting notifications", () => {
  for (const eventType of ["RESULT_PUBLISHED", "UPLOAD_COMPLETED", "EXAM_REMINDER", "SYSTEM_ANNOUNCEMENT"]) {
    assert.equal(allowed({ eventType }, { ...defaults, notificationPopups: false }), false);
  }
});
test("category switches affect reminders and announcements, not transactional events", () => {
  assert.equal(allowed({ eventType: "EXAM_REMINDER" }, { ...defaults, activityReminders: false }), false);
  assert.equal(allowed({ eventType: "ATTENDANCE_WARNING" }, defaults), true);
  assert.equal(allowed({ eventType: "SYSTEM_ANNOUNCEMENT" }, defaults), false);
  assert.equal(allowed({ eventType: "SYSTEM_ANNOUNCEMENT" }, { ...defaults, productAnnouncements: true }), true);
  assert.equal(allowed({ eventType: "RESULT_PUBLISHED" }, { ...defaults, activityReminders: false }), true);
});
