import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../hooks/useAnswerRowScroll.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const effectSource = source.slice(source.indexOf("  useEffect(() => {"), source.indexOf("\n\n  return answerRows"));

const setup = (target, reducedMotion = false) => {
  const calls = [];
  const frames = new Map();
  const lastScrolledTarget = { current: null };
  let cleanup;
  const context = {
    useEffect: (effect) => { cleanup = effect(); },
    answerScrollTarget: target,
    answeredData: { 7: [{ particulars: "First" }, { particulars: "Latest" }, { particulars: "(Being narration)" }] },
    answerRows: { current: { "7-1": { scrollIntoView: (options) => calls.push(options) } } },
    lastScrolledTarget,
    requestAnimationFrame: (callback) => { frames.set(1, callback); return 1; },
    cancelAnimationFrame: (id) => frames.delete(id),
    window: { matchMedia: () => ({ matches: reducedMotion }) },
  };
  const run = () => new Function(...Object.keys(context), effectSource)(...Object.values(context));
  run();
  return { calls, frames, run, cleanup: () => cleanup?.(), flush: () => { const callback = frames.get(1); frames.delete(1); callback?.(); } };
};

test("loading saved answers without a new-answer request does not scroll", () => {
  const state = setup(null);
  assert.equal(state.frames.size, 0);
});

test("scrolls to the requested answer, not its narration, after rendering", () => {
  const state = setup({ questionAttributeId: 7, particulars: "Latest" });
  assert.equal(state.calls.length, 0);
  state.flush();
  assert.deepEqual(state.calls, [{ behavior: "smooth", block: "nearest", inline: "nearest" }]);
  state.run();
  assert.equal(state.frames.size, 0, "unrelated updates must not repeat the scroll");
});

test("respects reduced motion", () => {
  const state = setup({ questionAttributeId: 7, particulars: "Latest" }, true);
  state.flush();
  assert.equal(state.calls[0].behavior, "auto");
});

test("cancels queued scrolling on cleanup", () => {
  const state = setup({ questionAttributeId: 7, particulars: "Latest" });
  state.cleanup();
  state.flush();
  assert.equal(state.calls.length, 0);
});

test("does not scroll if the requested answer was cleared", () => {
  const state = setup({ questionAttributeId: 7, particulars: "Missing" });
  assert.equal(state.frames.size, 0);
});
