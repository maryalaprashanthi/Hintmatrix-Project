import test from "node:test";
import assert from "node:assert/strict";
import { collectNewNotifications, suppressNotificationPopup } from "./notificationUpdates.js";

test("initial unread history is silent; only unseen unread arrivals are announced", () => {
  let update = collectNewNotifications([{ notificationId: 1, read: false }], null);
  assert.deepEqual(update.incoming, []);
  update = collectNewNotifications([
    { notificationId: 3, read: true }, { notificationId: 2, read: false }, { notificationId: 1, read: false },
  ], update.seen);
  assert.deepEqual(update.incoming.map((item) => item.notificationId), [2]);
  assert.deepEqual(collectNewNotifications(update.incoming, update.seen).incoming, []);
});

test("all exam and mock routes suppress popups; normal pages do not", () => {
  for (const path of ["/exam", "/mock-exam", "/exams", "/mock-exams/8", "/exams/2/review/4"]) {
    assert.equal(suppressNotificationPopup(path), true, path);
  }
  for (const path of ["/dashboard", "/questions/8", "/profile", "/subscriptions", "/exam-paper/2"]) {
    assert.equal(suppressNotificationPopup(path), false, path);
  }
});
