import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers";

const source = readFileSync(new URL("./useHierarchyProgress.js", import.meta.url), "utf8")
  .replace(/^import .*;\r?\n/gm, "")
  .replace("export const useHierarchyProgress", "const useHierarchyProgress");

function mount(enabled = true) {
  const window = new EventTarget();
  const requests = [], states = [];
  let cleanup;
  const service = { getMyQuestionCompletion: (level, params) => new Promise((resolve, reject) => {
    requests.push({ level, params, resolve, reject });
  }) };
  const hook = new Function("useCallback", "useEffect", "useMemo", "useState", "PracticePerformanceService", "window",
    `${source}; return useHierarchyProgress;`)(
    (fn) => fn, (effect) => { cleanup = effect(); }, (fn) => fn(),
    (initial) => [initial(), (value) => states.push(value)], service, window,
  );
  hook("topic", { chapterId: 5 }, enabled);
  return { window, requests, states, unmount: () => cleanup?.() };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));
const response = (percent) => ({ data: [{ id: 1, completionPercentage: percent }] });

test("loads question completion rather than attempted performance, then reflects a reset", async () => {
  const fixture = mount();
  assert.equal(fixture.requests[0].level, "topic");
  assert.deepEqual(fixture.requests[0].params, { chapterId: 5 });
  fixture.requests[0].resolve(response(50)); await flush();
  assert.equal(fixture.states.at(-1).get("1"), 50);
  fixture.window.dispatchEvent(new Event("practice-progress-changed"));
  fixture.requests[1].resolve(response(0)); await flush();
  assert.equal(fixture.states.at(-1).get("1"), 0);
  fixture.unmount();
});

test("newer reset response cannot be overwritten by an older completion response", async () => {
  const fixture = mount();
  fixture.window.dispatchEvent(new Event("practice-progress-changed"));
  fixture.requests[1].resolve(response(0)); await flush();
  fixture.requests[0].resolve(response(100)); await flush();
  assert.equal(fixture.states.at(-1).get("1"), 0);
  fixture.unmount();
});

test("focus and other-tab changes refresh and listeners are removed on unmount", async () => {
  const fixture = mount();
  fixture.window.dispatchEvent(new Event("focus"));
  const storage = new Event("storage"); storage.key = "practice-progress-changed";
  fixture.window.dispatchEvent(storage);
  assert.equal(fixture.requests.length, 3);
  fixture.unmount();
  fixture.window.dispatchEvent(new Event("focus"));
  fixture.window.dispatchEvent(storage);
  fixture.requests[2].resolve(response(100)); await flush();
  assert.equal(fixture.requests.length, 3);
  assert.equal(fixture.states.length, 0);
});

test("disabled hierarchy makes no request", () => {
  const fixture = mount(false);
  assert.equal(fixture.requests.length, 0);
  assert.equal(fixture.states[0].size, 0);
});
