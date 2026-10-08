import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./FillInBlankQuestionView.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("  useEffect(() => {", source.indexOf("const answerOptionsKey ="));
const effect = source.slice(start, source.indexOf("\n\n  const updateAnswer", start));

test("shuffles once per opened question, not on answer/reset updates or effect replay", () => {
  const orders = [];
  let shuffles = 0;
  const context = {
    useEffect: (callback) => callback(),
    questionRecord: { questionId: 14 },
    answerOptionsKey: JSON.stringify(["Sales", "Purchases", "Capital"]),
    shuffledOptionsKey: { current: null },
    shuffleArray: (options) => { shuffles++; return [...options].reverse(); },
    setDisplayOptions: (options) => orders.push(options),
  };
  const run = () => new Function(...Object.keys(context), effect)(...Object.values(context));
  run();
  run();
  run();
  assert.equal(shuffles, 1);
  assert.deepEqual(orders, [["Capital", "Purchases", "Sales"]]);
  context.questionRecord = { questionId: 15 };
  run();
  assert.equal(shuffles, 2);
});

test("no interval-based shuffling remains", () => {
  assert.doesNotMatch(source, /setInterval|shuffleDuration|tickMs/);
});
