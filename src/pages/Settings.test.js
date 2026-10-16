import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transformSync } from "esbuild";
import { setImmediate } from "node:timers";
import { parseNotificationPreferences, defaultNotificationPreferences } from "../utils/notificationPreferences.js";
import { readSettingsViewState, saveSettingsViewState } from "../utils/settingsViewState.js";

const source = transformSync(readFileSync(new URL("./Settings.jsx", import.meta.url), "utf8")
  .replace(/^import .*;\r?\n/gm, "").replace("export default function Settings", "function Settings"),
  { loader: "jsx" }).code;
const flush = () => new Promise((resolve) => setImmediate(resolve));
const profile = { userId: 42, name: "Saved Student", email: "saved@example.test", role: "STUDENT", loginType: "GOOGLE" };

function mount({ failLoad = false, failSave = false, account = profile, storageData = new Map(), failAnnouncement = false } = {}) {
  const states = [], refs = [], effects = [];
  let index = 0, refIndex = 0, effectIndex = 0, pendingEffects = [];
  const events = [], writes = [], announcements = [];
  const storage = { getItem: (key) => storageData.get(key), setItem: (key, value) => storageData.set(key, value) };
  const api = {
    getMine: async () => { if (failLoad) throw new Error("offline"); return { data: { ...defaultNotificationPreferences } }; },
    saveMine: async (value) => { writes.push(value); if (failSave) throw new Error("offline"); return { data: value }; },
  };
  const icon = () => null;
  // eslint-disable-next-line react/prop-types
  const Link = ({ to, children }) => React.createElement("a", { href: to }, children);
  const Component = new Function("React", "useState", "useRef", "useEffect", "Link", "FiBell", "FiLock", "FiSave", "FiSettings",
    "SettingsService", "UserService", "parseNotificationPreferences", "window", "localStorage", "CustomEvent",
    "NotificationService", "readSettingsViewState", "saveSettingsViewState",
    source + "; return Settings;")(React,
    (initial) => { const current = index++; if (!(current in states)) states[current] = initial;
      return [states[current], (value) => { states[current] = typeof value === "function" ? value(states[current]) : value; }]; },
    (initial) => { const current = refIndex++; return refs[current] ||= { current: initial }; },
    (callback, deps) => {
      const current = effectIndex++, previous = effects[current];
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) pendingEffects.push(() => {
        previous?.cleanup?.(); effects[current] = { deps, cleanup: callback() };
      });
    },
    Link, icon, icon, icon, icon, api, { getMyProfile: async () => ({ data: account }) }, parseNotificationPreferences,
    { dispatchEvent: (event) => events.push(event) }, { getItem: () => "identity", setItem: () => {} },
    class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    { announce: async (value) => {
      announcements.push(value);
      if (failAnnouncement) throw new Error("offline");
      return { data: { recipientCount: 3 } };
    } },
    (id, server) => readSettingsViewState(id, server, storage),
    (id, value) => saveSettingsViewState(id, value, storage),
  );
  const render = () => {
    index = 0; refIndex = 0; effectIndex = 0; pendingEffects = [];
    const tree = Component(); pendingEffects.forEach((effect) => effect()); return tree;
  };
  render();
  return { render, html: () => renderToStaticMarkup(render()), states, events, writes, announcements,
    unmount: () => effects.forEach((effect) => effect?.cleanup?.()) };
}
function find(node, predicate) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) { for (const child of node) { const result = find(child, predicate); if (result) return result; } return null; }
  if (predicate(node)) return node;
  return find(node.props?.children, predicate);
}
const clickSection = (fixture, label) => find(fixture.render(), (node) => node.type === "button" && node.props.children?.includes(label)).props.onClick();

test("account loads from server and settings navigation changes the visible section", async () => {
  const fixture = mount(); await flush();
  assert.match(fixture.html(), /Saved Student/);
  assert.match(fixture.html(), /saved@example.test/);
  assert.doesNotMatch(fixture.html(), /Compact layout|Appearance|Theme/);
  clickSection(fixture, "Security");
  assert.match(fixture.html(), /GOOGLE/);
  assert.match(fixture.html(), /Two-factor authentication is not available/);
  fixture.unmount();
});

test("changes save to server, update popups immediately, and disable clean saves", async () => {
  const fixture = mount(); await flush();
  const saveButton = () => find(fixture.render(), (node) => node.type === "button" && node.props.className === "account-primary-button");
  assert.equal(saveButton().props.disabled, true);
  clickSection(fixture, "Notifications");
  find(fixture.render(), (node) => node.props?.id === "notification-popups").props.onChange();
  assert.equal(saveButton().props.disabled, false);
  await saveButton().props.onClick();
  assert.equal(fixture.writes[0].notificationPopups, false);
  assert.equal(fixture.events[0].type, "user-settings-changed");
  assert.equal(fixture.events[0].detail.preferences.notificationPopups, false);
  assert.match(fixture.html(), /settings have been saved/);
  assert.equal(saveButton().props.disabled, true);
  fixture.unmount();
});

test("load and save failures show errors without claiming success", async () => {
  const failedLoad = mount({ failLoad: true }); await flush();
  assert.match(failedLoad.html(), /Unable to load your settings/);
  assert.match(failedLoad.html(), /Retry/);
  failedLoad.unmount();
  const failedSave = mount({ failSave: true }); await flush();
  clickSection(failedSave, "Notifications");
  find(failedSave.render(), (node) => node.props?.id === "notification-popups").props.onChange();
  await find(failedSave.render(), (node) => node.props?.className === "account-primary-button").props.onClick();
  assert.match(failedSave.html(), /changes have not been saved/);
  assert.equal(failedSave.events.length, 0);
  failedSave.unmount();
});

test("section and unsaved settings restore after remount without crossing accounts", async () => {
  const storageData = new Map();
  const first = mount({ storageData }); await flush();
  clickSection(first, "Notifications");
  find(first.render(), (node) => node.props?.id === "notification-popups").props.onChange();
  first.render(); first.unmount();
  const restored = mount({ storageData }); await flush();
  assert.equal(find(restored.render(), (node) => node.props?.id === "notification-popups").props.checked, false);
  assert.match(restored.html(), /Discard changes/);
  restored.unmount();
  const differentUser = mount({ storageData, account: { ...profile, userId: 43 } }); await flush();
  assert.match(differentUser.html(), /Your current account details/);
  assert.doesNotMatch(differentUser.html(), /Discard changes/);
  differentUser.unmount();
});

test("only Super Admins see the announcement composer and can send", async () => {
  const student = mount(); await flush();
  assert.doesNotMatch(student.html(), /Send to all users/);
  assert.equal(find(student.render(), (node) => node.type === "button" && node.props.children?.includes("Product announcements")), null);
  student.unmount();
  const admin = mount({ account: { ...profile, role: "SUPER_ADMIN" } }); await flush();
  clickSection(admin, "Product announcements");
  const sendButton = find(admin.render(), (node) => node.type === "button" && node.props.type === "submit");
  assert.equal(sendButton.props.disabled, true);
  assert.match(admin.html(), /settings-announcement-actions/);
  find(admin.render(), (node) => node.props?.id === "announcement-title").props.onChange({ target: { value: " New update " } });
  find(admin.render(), (node) => node.props?.id === "announcement-message").props.onChange({ target: { value: " Try the new feature. " } });
  assert.equal(find(admin.render(), (node) => node.type === "button" && node.props.type === "submit").props.disabled, false);
  const submit = () => find(admin.render(), (node) => node.type === "form").props.onSubmit({ preventDefault() {} });
  const sending = submit(); await submit(); await sending;
  assert.deepEqual(admin.announcements, [{ title: "New update", message: "Try the new feature." }]);
  assert.match(admin.html(), /Announcement sent to 3 users/);
  assert.equal(find(admin.render(), (node) => node.props?.id === "announcement-message").props.value, "");
  admin.unmount();
});

test("account action button styling outranks the global background reset", () => {
  const css = readFileSync(new URL("./Account/AccountPages.css", import.meta.url), "utf8");
  assert.match(css, /\.account-page \.account-primary-button\s*\{[^}]*background:\s*#1769ff;[^}]*color:\s*#fff;/);
  assert.match(css, /\.settings-announcement-actions\s*\{[^}]*display:\s*flex;/);
});

test("announcement drafts restore, and a failed send does not erase the text", async () => {
  const storageData = new Map(), account = { ...profile, role: "SUPER_ADMIN" };
  const first = mount({ storageData, account }); await flush();
  clickSection(first, "Product announcements");
  find(first.render(), (node) => node.props?.id === "announcement-title").props.onChange({ target: { value: "Update" } });
  find(first.render(), (node) => node.props?.id === "announcement-message").props.onChange({ target: { value: "Draft text" } });
  first.render(); first.unmount();
  const restored = mount({ storageData, account, failAnnouncement: true }); await flush();
  assert.equal(find(restored.render(), (node) => node.props?.id === "announcement-message").props.value, "Draft text");
  await find(restored.render(), (node) => node.type === "form").props.onSubmit({ preventDefault() {} });
  assert.match(restored.html(), /draft has been kept/);
  assert.equal(find(restored.render(), (node) => node.props?.id === "announcement-message").props.value, "Draft text");
  restored.unmount();
});
