import test from "node:test";
import assert from "node:assert/strict";
import { defaultNotificationPreferences as defaults } from "./notificationPreferences.js";
import { readSettingsViewState, saveSettingsViewState } from "./settingsViewState.js";

test("newer server preferences override stale drafts", () => {
  const data = new Map(), storage = { getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) };
  saveSettingsViewState(1, { section: "security", baseline: defaults, draft: { ...defaults, activityReminders: false } }, storage);
  const newer = { ...defaults, productAnnouncements: true };
  const restored = readSettingsViewState(1, newer, storage);
  assert.deepEqual(restored.draft, newer);
  assert.equal(restored.section, "security");
  assert.equal(readSettingsViewState(2, newer, storage), null);
});
test("corrupt or unavailable storage never breaks settings", () => {
  assert.equal(readSettingsViewState(1, defaults, { getItem: () => "invalid json" }), null);
  assert.doesNotThrow(() => saveSettingsViewState(1, {}, { setItem: () => { throw new Error("blocked"); } }));
});
