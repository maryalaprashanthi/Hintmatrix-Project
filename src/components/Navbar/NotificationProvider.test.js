import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";
import { setImmediate } from "node:timers";
import { collectNewNotifications, suppressNotificationPopup } from "../../utils/notificationUpdates.js";
import { parseNotificationPreferences, notificationPopupAllowed, defaultNotificationPreferences } from "../../utils/notificationPreferences.js";

const source = transformSync(readFileSync(new URL("./NotificationProvider.jsx", import.meta.url), "utf8")
  .replace(/^import .*;\r?\n/gm, "")
  .replace("export default function", "function"), { loader: "jsx" }).code;
const flush = () => new Promise((resolve) => setImmediate(resolve));

function mount(path = "/dashboard") {
  const slots = [], effects = [], requests = [], toasts = [], dismissed = [];
  let cursor = 0, pendingEffects = [], context;
  const window = new EventTarget();
  window.setInterval = (callback) => { window.tick = callback; return 1; };
  window.clearInterval = () => {};
  const document = new EventTarget(); document.visibilityState = "visible";
  const toast = { push: (value) => { toasts.push(value); return toasts.length; }, dismiss: (id) => dismissed.push(id) };
  const service = {
    getMine: () => new Promise((resolve, reject) => requests.push({ resolve, reject })),
    getUnreadCount: async () => ({ data: { unreadCount: service.count } }),
    count: 0, writes: 0,
    markRead: async () => { service.writes++; },
    markAllRead: async () => { service.writes++; },
  };
  const changed = (before, after) => !before || before.some((item, i) => item !== after[i]);
  const React = { createElement: (_type, props) => props };
  const Session = new Function("React", "useState", "useRef", "useCallback", "useContext", "useEffect",
    "NotificationService", "NotificationContext", "ToastContext", "window", "document",
    "collectNewNotifications", "suppressNotificationPopup", "SettingsService", "parseNotificationPreferences", "notificationPopupAllowed",
    source + "; return NotificationSession;")(
    React,
    (initial) => { const index = cursor++; if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }]; },
    (initial) => { const index = cursor++; return slots[index] ||= { current: initial }; },
    (callback, deps) => { const index = cursor++; if (changed(slots[index]?.deps, deps)) slots[index] = { callback, deps }; return slots[index].callback; },
    () => toast,
    (effect, deps) => { const index = cursor++; if (changed(effects[index]?.deps, deps)) {
      pendingEffects.push(() => { effects[index]?.cleanup?.(); effects[index] = { deps, cleanup: effect() }; });
    } },
    service, { Provider: "provider" }, {}, window, document, collectNewNotifications, suppressNotificationPopup,
    { getMine: async () => ({ data: defaultNotificationPreferences }) }, parseNotificationPreferences, notificationPopupAllowed,
  );
  const render = (nextPath = path) => {
    path = nextPath; cursor = 0; pendingEffects = [];
    context = Session({ children: null, enabled: true, path }).value;
    pendingEffects.forEach((effect) => effect());
    return context;
  };
  render();
  return { render, window, document, service, requests, toasts, dismissed,
    respond: async (index, items, count = 0) => {
      // Count resolves when requested, before the manually controlled item response.
      service.count = count; requests[index].resolve({ data: items }); await flush();
    },
    unmount: () => effects.forEach((effect) => effect?.cleanup?.()),
  };
}

test("one in-flight load, silent baseline, new popup once, and cleanup", async () => {
  const fixture = mount();
  fixture.window.tick();
  assert.equal(fixture.requests.length, 1);
  await fixture.respond(0, [{ notificationId: 1, read: false }]);
  assert.equal(fixture.toasts.length, 0);
  fixture.window.tick();
  await fixture.respond(1, [{ notificationId: 2, title: "Result", read: false }, { notificationId: 1, read: false }]);
  assert.equal(fixture.toasts.length, 1);
  fixture.window.tick();
  await fixture.respond(2, [{ notificationId: 2, read: false }]);
  assert.equal(fixture.toasts.length, 1);
  fixture.unmount();
  fixture.window.dispatchEvent(new Event("focus"));
  assert.equal(fixture.requests.length, 3);
});

test("errors are visible and retry recovers without false empty success", async () => {
  const fixture = mount();
  fixture.requests[0].reject(new Error("offline")); await flush();
  assert.match(fixture.render().notificationError, /retry/i);
  fixture.render().loadNotifications();
  await fixture.respond(1, []);
  assert.equal(fixture.render().notificationError, "");
  fixture.unmount();
});

test("read writes are locked and count is replaced by latest server count", async () => {
  const fixture = mount();
  await fixture.respond(0, [{ notificationId: 1, read: false }]);
  fixture.service.count = 7;
  const first = fixture.render().markNotificationsRead(1);
  assert.equal(await fixture.render().markNotificationsRead(1), false);
  await flush();
  assert.equal(fixture.service.writes, 1);
  fixture.requests[1].resolve({ data: [{ notificationId: 1, read: true }] });
  await first;
  assert.equal(fixture.render().unreadCount, 7);
  fixture.unmount();
});

test("arrivals during exams are deferred; entering exam dismisses existing popups", async () => {
  const fixture = mount("/exams/2");
  await fixture.respond(0, []);
  fixture.window.tick();
  await fixture.respond(1, [{ notificationId: 2, title: "New", read: false }]);
  assert.equal(fixture.toasts.length, 0);
  fixture.render("/dashboard");
  assert.equal(fixture.toasts.length, 1);
  fixture.render("/mock-exams/3");
  assert.deepEqual(fixture.dismissed, [1]);
  fixture.render("/profile");
  assert.equal(fixture.toasts.length, 1);
  fixture.unmount();
});

test("late responses after logout/unmount do not announce", async () => {
  const fixture = mount();
  await fixture.respond(0, []);
  fixture.window.tick(); fixture.unmount();
  await fixture.respond(1, [{ notificationId: 4, title: "Private", read: false }]);
  assert.equal(fixture.toasts.length, 0);
});

test("read failures keep the previous count and show retry feedback", async () => {
  const fixture = mount();
  await fixture.respond(0, [{ notificationId: 1, read: false }]);
  fixture.service.markRead = async () => { throw new Error("offline"); };
  assert.equal(await fixture.render().markNotificationsRead(1), false);
  assert.match(fixture.render().notificationError, /mark.*read/i);
  assert.equal(fixture.render().notifications[0].read, false);
  fixture.unmount();
});

test("background-tab arrivals wait for visibility before announcing", async () => {
  const fixture = mount();
  await fixture.respond(0, []);
  fixture.window.tick();
  fixture.document.visibilityState = "hidden";
  await fixture.respond(1, [{ notificationId: 4, title: "New", read: false }]);
  assert.equal(fixture.toasts.length, 0);
  fixture.document.visibilityState = "visible";
  fixture.document.dispatchEvent(new Event("visibilitychange"));
  await fixture.respond(2, [{ notificationId: 4, title: "New", read: false }]);
  assert.equal(fixture.toasts.length, 1);
  fixture.unmount();
});

test("saved preferences stop popups immediately while bell history still updates", async () => {
  const fixture = mount();
  await fixture.respond(0, []);
  const event = new Event("user-settings-changed");
  event.detail = { preferences: { ...defaultNotificationPreferences, notificationPopups: false } };
  fixture.window.dispatchEvent(event);
  fixture.window.tick();
  await fixture.respond(1, [{ notificationId: 5, title: "New result", read: false }]);
  assert.equal(fixture.toasts.length, 0);
  assert.equal(fixture.render().notifications[0].notificationId, 5);
  fixture.unmount();
});
