import test from "node:test";
import assert from "node:assert/strict";
import { createPageLoadCache } from "./pageLoadCache.js";

test("concurrent mounts and later navigation share one request", async () => {
  const cache = createPageLoadCache(() => "user-a");
  let calls = 0;
  const load = () => { calls++; return { data: [] }; };
  const [first, second] = await Promise.all([cache.load("page", load), cache.load("page", load)]);
  assert.equal(first, second);
  assert.equal(await cache.load("page", load), first);
  assert.equal(calls, 1);
});

test("login identity changes and explicit logout/login reset cached data", async () => {
  let identity = "user-a";
  const cache = createPageLoadCache(() => identity);
  assert.equal(await cache.load("page", () => "a"), "a");
  identity = "user-b";
  assert.equal(await cache.load("page", () => "b"), "b");
  cache.clear();
  assert.equal(await cache.load("page", () => "new login"), "new login");
});

test("failed loads can be retried instead of caching an error forever", async () => {
  const cache = createPageLoadCache(() => "a");
  await assert.rejects(cache.load("page", () => { throw Error("offline"); }));
  assert.equal(await cache.load("page", () => "recovered"), "recovered");
});

test("notification read updates persist without another GET", async () => {
  const cache = createPageLoadCache(() => "a");
  await cache.load("notifications", () => ({ unread: 2 }));
  await cache.update("notifications", (value) => { value.unread = 0; });
  assert.equal((await cache.load("notifications", () => { throw Error("extra request"); })).unread, 0);
});

test("an old pending request cannot overwrite the next login cache", async () => {
  let identity = "a";
  let finish;
  const cache = createPageLoadCache(() => identity);
  const old = cache.load("page", () => new Promise((resolve) => { finish = resolve; }));
  await Promise.resolve();
  const update = cache.update("page", (value) => { value.value = "wrong"; });
  identity = "b";
  const current = await cache.load("page", () => ({ value: "b" }));
  finish({ value: "a" });
  await old;
  await update;
  assert.equal(current.value, "b");
});
