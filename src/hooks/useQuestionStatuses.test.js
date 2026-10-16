import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers";

const source = readFileSync(new URL("./useQuestionStatuses.js", import.meta.url), "utf8")
  .replace(/^import .*;\r?\n/gm, "")
  .replace("export const useQuestionStatuses", "const useQuestionStatuses");
function mount(enabled = true) {
  const window = new EventTarget(), states = [], requests = [];
  let cleanup;
  const service = { getMyQuestionStatuses: (topicId) => new Promise((resolve, reject) => requests.push({ topicId, resolve, reject })) };
  const hook = new Function("useEffect", "useState", "PracticePerformanceService", "window",
    `${source}; return useQuestionStatuses;`)(
    (effect) => { cleanup = effect(); }, (initial) => [initial, (next) => states.push(next)], service, window,
  );
  hook(5, enabled);
  return { window, states, requests, unmount: () => cleanup?.() };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));
const respond = (request, status) => request.resolve({ data: [{ questionId: 1, status }] });

test("student list loads a batch of own statuses and resets refresh to unanswered", async () => {
  const fixture = mount();
  assert.equal(fixture.requests.length, 1);
  assert.equal(fixture.requests[0].topicId, 5);
  fixture.requests[0].resolve({ data: [
    { questionId: 1, status: "UNANSWERED" }, { questionId: 2, status: "PARTIAL" }, { questionId: 3, status: "ANSWERED" },
  ] });
  await flush();
  assert.deepEqual([...fixture.states.at(-1).items.values()].map((row) => row.status), ["UNANSWERED", "PARTIAL", "ANSWERED"]);
  fixture.window.dispatchEvent(new Event("practice-progress-changed"));
  respond(fixture.requests[1], "UNANSWERED"); await flush();
  assert.equal(fixture.states.at(-1).items.get("1").status, "UNANSWERED");
  fixture.unmount();
});

test("old answered response cannot overwrite a newer reset response", async () => {
  const fixture = mount();
  fixture.window.dispatchEvent(new Event("focus"));
  respond(fixture.requests[1], "UNANSWERED"); await flush();
  respond(fixture.requests[0], "ANSWERED"); await flush();
  assert.equal(fixture.states.at(-1).items.get("1").status, "UNANSWERED");
  fixture.unmount();
});

test("disabled admin lists do not request completion statuses", () => {
  const fixture = mount(false);
  assert.equal(fixture.requests.length, 0);
});

test("errors are visible, and other-tab changes refresh until unmounted", async () => {
  const fixture = mount();
  fixture.requests[0].reject(new Error("Network unavailable")); await flush();
  assert.ok(fixture.states.at(-1).error);
  const storage = new Event("storage"); storage.key = "practice-progress-changed";
  fixture.window.dispatchEvent(storage);
  assert.equal(fixture.requests.length, 2);
  fixture.unmount();
  respond(fixture.requests[1], "ANSWERED"); await flush();
  assert.ok(fixture.states.at(-1).error);
  fixture.window.dispatchEvent(storage);
  assert.equal(fixture.requests.length, 2);
});
