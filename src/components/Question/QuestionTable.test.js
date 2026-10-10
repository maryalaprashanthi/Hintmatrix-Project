import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build } from "esbuild";
import { calculateFinalAccounts, data } from "./SampleData.js";
import { adjustmentTableRows } from "./adjustmentPlacement.js";

// Exercise the real shared table, draggable tiles, accounting cells and cards.
// Replace only external drag sensors, network access and the store boundary.
const boundaryPlugin = { name: "shared-question-boundaries", setup(builder) {
  builder.onResolve({ filter: /^@dnd-kit\/react$/ }, () => ({ path: "dnd", namespace: "shared-question-test" }));
  builder.onResolve({ filter: /(?:^|\/)apiClient(?:\.js)?$/ }, () => ({ path: "api", namespace: "shared-question-test" }));
  builder.onResolve({ filter: /(?:^|\/)questionStore(?:\.js)?$/ }, () => ({ path: "store", namespace: "shared-question-test" }));
  builder.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: "router", namespace: "shared-question-test" }));
  builder.onLoad({ filter: /.*/, namespace: "shared-question-test" }, ({ path }) => ({ contents: {
    api: "export default {};",
    router: "export function useParams() { return { questionId: 47 }; }",
    store: `function store(selector) { globalThis.__dragStoreReads++; return selector(globalThis.__dragState); }
      store.getState = () => { globalThis.__dragStoreStaticReads++; return globalThis.__dragState; };
      export default store; export function getRuleAnswers() { return []; }`,
    dnd: `export function useDragDropMonitor() {}
      export function useDraggable(options) { globalThis.__dragSources.push(options); return { ref(){} }; }
      export function useDroppable(options) { globalThis.__dragTargets.push(options); return { ref(){}, isDropTarget: false }; }`,
  }[path] }));
} };
const bundleOptions = {
  bundle: true, write: false, platform: "node", format: "cjs", packages: "external",
  jsx: "automatic", loader: { ".css": "empty" },
};
const compiled = await build({
  stdin: {
    contents: 'export { default as Table } from "./QuestionTable.jsx"; export { default as Draggable } from "./Draggable.jsx";',
    resolveDir: fileURLToPath(new URL(".", import.meta.url)),
    sourcefile: "shared-question-test.js",
  },
  ...bundleOptions, plugins: [boundaryPlugin],
});
const module = { exports: {} };
new Function("require", "module", "exports", compiled.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
const { Table, Draggable } = module.exports;

// Inspect actual tile callback props with only local React hooks stubbed. The
// SSR assertions above still run with real React and React Bootstrap.
const tileActions = await build({
  stdin: { contents: 'export { default } from "./Draggable.jsx";', resolveDir: fileURLToPath(new URL(".", import.meta.url)), sourcefile: "tile-actions-test.js" },
  ...bundleOptions, plugins: [boundaryPlugin, { name: "tile-hook-boundary", setup(builder) {
    builder.onResolve({ filter: /^react$/ }, () => ({ path: "hooks", namespace: "tile-hook-test" }));
    builder.onLoad({ filter: /.*/, namespace: "tile-hook-test" }, () => ({ contents:
      "export const memo = (component) => component; export const useEffect = () => {}; export const useState = (initial) => [initial, () => {}];" }));
  } }],
});
const actionModule = { exports: {} };
new Function("require", "module", "exports", tileActions.outputFiles[0].text)(createRequire(import.meta.url), actionModule, actionModule.exports);
const ActionDraggable = actionModule.exports.default;

const blankTables = () => Object.fromEntries(data.flatMap((table) => table.headers.map((header) => [`${table.name}-${header}`, []])));
const question = { questionId: 47, questionText: "Prepare Final accounts", courseName: "Commerce", subjectName: "Accounts",
  chapterName: "Final Accounts with Adjustments", topicName: "Financial Statements" };
const defaultRows = () => [
  { id: 11, name: "Purchases", amount: 7425, type: "debit", status: "pending", hints: [] },
  { id: 12, name: "Sales", amount: 12000, type: "credit", status: "pending", hints: [] },
  { id: 13, name: "Outstanding Rent", amount: 500, adjustment: true, status: "pending", hints: [] },
];

function resetBoundaries(overrides = {}) {
  globalThis.__dragSources = []; globalThis.__dragTargets = [];
  globalThis.__dragStoreReads = 0; globalThis.__dragStoreStaticReads = 0;
  globalThis.__dragMutations = [];
  const forbiddenMutation = (...args) => globalThis.__dragMutations.push(args);
  globalThis.__dragState = { question, questions: [], score: 0, droppableData: blankTables(), busyOperation: null,
    resetFrontend: forbiddenMutation, setHintUsed: forbiddenMutation, moveQuestion: forbiddenMutation,
    setActualAnswers: forbiddenMutation, setTotalAnswers: forbiddenMutation, setHints: forbiddenMutation,
    setCurrentScore: forbiddenMutation, ...overrides };
}

function renderControlled({ rows = defaultRows(), busy = false, score = 42.5, rowsByTarget = blankTables(),
  counts = {}, effects = {}, feedback = "", selected, fullyPlaced = false } = {}) {
  resetBoundaries();
  const count = (row) => counts[row.id] ?? 0;
  const isSolved = (row) => effects[row.id] != null && count(row) >= effects[row.id];
  const balances = (side) => rows.filter((row) => !row.adjustment && row.type === side);
  const total = (side) => balances(side).filter((row) => !isSolved(row)).reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const model = {
    question, headerActions: createElement("span", null, createElement("button", { type: "button" }, "Reset"), createElement("button", { type: "button" }, "Check")),
    debitBalances: balances("debit"), creditBalances: balances("credit"), adjustments: rows.filter((row) => row.adjustment),
    debitTotal: total("debit"), creditTotal: total("credit"), total: rows.length,
    solved: rows.filter(isSolved).length, score, balanceCount: balances("debit").length + balances("credit").length,
    rowsByTarget, finalAccounts: calculateFinalAccounts(rowsByTarget), fullyPlaced, busy, feedback,
    onPlaceSelected() {},
    renderSource(row) {
      const choices = row.amount2 != null && Number(row.amount2) !== Number(row.amount)
        ? [{ sourceId: row.id, amount: row.amount }, { sourceId: `${row.id}:amount2`, amount: row.amount2 }]
        : [{ sourceId: row.id, amount: row.amount }];
      return choices.map(({ sourceId, amount }) => createElement(Draggable, {
        key: sourceId, row, sourceId, amount, solved: isSolved(row), busy,
        status: isSolved(row) ? "solved" : row.status, wrongAttempts: row.wrongAttempts ?? 0,
        selected: selected?.sourceId === sourceId, hints: row.hints, onSelect() {}, onHint() {}, onAutoFill() {},
      }));
    },
  };
  return renderToStaticMarkup(createElement(Table, { model }));
}

const summaryValues = (html) => Object.fromEntries([...html.matchAll(/<span class="stat-title">([^<]+)<\/span><span class="stat-amount [^"]+">([^<]*)<\/span>/g)]
  .map((match) => [match[1], match[2]]));
const tableCells = (html, tableIndex) => {
  const table = [...html.matchAll(/<table\b[\s\S]*?<\/table>/g)][tableIndex][0];
  const tbody = table.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
  return [...tbody.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map((match) => [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)]
    .map((cell) => cell[1].replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()));
};

test("ordinary drag and drop restores score, progress and placed balances through the original store adapter", () => {
  const rowsByTarget = blankTables();
  rowsByTarget["Trading Account-Debit Particulars"] = [{ id: 11, name: "Opening Stock", amount: 100, operation: "add" }];
  resetBoundaries({ score: 96.5, droppableData: rowsByTarget, questions: [
    { id: 11, name: "Opening Stock", amount: 100, type: "debit", status: "solved", hints: [] },
    { id: 12, name: "Sales", amount: 300, type: "credit", status: "pending", hints: [] },
    { id: 13, name: "Wages", amount: 50, type: "debit", status: "wrong", wrongAttempts: 1, hints: ["Trading debit"] },
  ] });
  const html = renderToStaticMarkup(createElement(Table));
  assert.deepEqual(summaryValues(html), { Debit: "₹50", Credit: "₹300", "Total Score": "96.5", Progress: "1/3" });
  assert.doesNotMatch(html, /Adjustments<\/h5>/);
  assert.deepEqual(tableCells(html, 0)[0], ["To Opening Stock", "", "100"]);
  assert.match(html, /Reset/); assert.match(html, /Check/);
  assert.match(html, /drag-item drag-item-solved/); assert.match(html, /drag-item drag-item-wrong/);
  assert.equal(globalThis.__dragSources.find((item) => item.id === 11).disabled, true);
  assert.equal(globalThis.__dragSources.find((item) => item.id === 13).disabled, false);
  assert.deepEqual(globalThis.__dragMutations, []);
});

test("controlled adjustment state uses the same summary, trial balance and six accounting sides", () => {
  const html = renderControlled({ counts: { 11: 1 }, effects: { 11: 1, 13: 2 } });
  assert.deepEqual(summaryValues(html), { Debit: "₹0", Credit: "₹12000", "Total Score": "42.5", Progress: "1/3" });
  assert.equal((html.match(/class="stat-card"/g) ?? []).length, 4);
  assert.equal((html.match(/q-droppable theme-debit/g) ?? []).length, 3);
  assert.equal((html.match(/q-droppable theme-credit/g) ?? []).length, 3);
  assert.match(html, /col-12 col-lg-3/); assert.match(html, /col-12 col-lg-9/);
  assert.ok(html.indexOf("Credit Balances") < html.indexOf("Adjustments</h5>"));
  assert.ok(html.indexOf("Adjustments</h5>") < html.indexOf("Trading Account</span>"));
  assert.match(html, /Profit &amp; Loss Account/); assert.match(html, /Liabilities Side/); assert.match(html, /Asset Side/);
  assert.deepEqual(globalThis.__dragMutations, []);
  assert.equal(globalThis.__dragStoreStaticReads, 0);
});

test("wrong adjustments reuse the red tile, icon and action anchor while remaining available for retry", () => {
  const rows = defaultRows(); rows[2].status = "wrong"; rows[2].wrongAttempts = 1;
  const html = renderControlled({ rows, effects: { 13: 2 } });
  assert.match(html, /drag-item drag-item-wrong/); assert.match(html, /class="drag-action-anchor"/);
  assert.match(html, /id="icons-styling-wrong"/); assert.match(html, /aria-label="Incorrect answer"/);
  assert.equal(globalThis.__dragSources.find((item) => item.id === 13).disabled, false);
  assert.deepEqual(globalThis.__dragMutations, []);
  resetBoundaries();
  renderToStaticMarkup(createElement(Draggable, { row: rows[2], amount: 500, status: "wrong", wrongAttempts: 1,
    hints: ["Expense and liability"], onSelect() {}, onHint() {}, onAutoFill() {} }));
  assert.equal(globalThis.__dragStoreReads, 0);
  assert.equal(globalThis.__dragStoreStaticReads, 0);
  const selected = [], hintCalls = [], autoFillCalls = [], touchEvents = [];
  const element = ActionDraggable({ row: rows[2], sourceId: "13:amount2", amount: 70, status: "wrong", wrongAttempts: 1,
    hints: ["Expense and liability"], onSelect: (...args) => selected.push(args),
    onHint: (...args) => hintCalls.push(args), onAutoFill: (...args) => autoFillCalls.push(args) });
  const tile = element.type(element.props);
  const actionsOverlay = tile.props.children[0];
  const handleElement = actionsOverlay.props.children.props.children;
  const button = handleElement.type(handleElement.props);
  button.props.onClick();
  button.props.onTouchEnd({ preventDefault: () => touchEvents.push("prevent"), stopPropagation: () => touchEvents.push("stop") });
  assert.deepEqual(selected, [[13, 70], [13, 70]]);
  assert.deepEqual(touchEvents, ["prevent", "stop"]);
  const menuElement = actionsOverlay.props.overlay.props.children;
  const menu = menuElement.type(menuElement.props);
  const hintOverlay = menu.props.children[0];
  hintOverlay.props.children.props.onClick();
  menu.props.children[1].props.onClick();
  assert.deepEqual(hintCalls, [[13]]); assert.deepEqual(autoFillCalls, [[13]]);
  assert.equal(hintOverlay.props.overlay.props.children[1].props.children[0].props.children[0], "Expense and liability");
  assert.deepEqual(globalThis.__dragMutations, []);
  assert.equal(globalThis.__dragStoreReads, 0);
});

test("an adjustment remains pending until every effect is placed and then shows the shared solved tile", () => {
  const partial = renderControlled({ counts: { 13: 1 }, effects: { 13: 2 } });
  assert.doesNotMatch(partial, /drag-item-solved/);
  assert.equal(globalThis.__dragSources.find((item) => item.id === 13).disabled, false);
  assert.equal(summaryValues(partial).Progress, "0/3");
  const complete = renderControlled({ counts: { 13: 2 }, effects: { 13: 2 } });
  assert.match(complete, /drag-item drag-item-solved/); assert.match(complete, /aria-label="Solved"/);
  assert.match(complete, /fill="#10b981"/);
  assert.equal(globalThis.__dragSources.find((item) => item.id === 13).disabled, true);
  assert.equal(summaryValues(complete).Progress, "1/3");
});

test("busy adjustment state locks the shared draggable and all add/less sensors", () => {
  renderControlled({ busy: true });
  assert.equal(globalThis.__dragSources.length, 3);
  assert.ok(globalThis.__dragSources.every((item) => item.disabled === true));
  assert.equal(globalThis.__dragTargets.length, 12);
  assert.ok(globalThis.__dragTargets.every((item) => item.disabled === true));
  assert.ok(globalThis.__dragTargets.some((item) => item.id === "Trading Account-Debit Particulars-add"));
  assert.ok(globalThis.__dragTargets.some((item) => item.id === "Balance Sheet-Asset Side-less"));
  resetBoundaries({ busyOperation: {}, questions: [{ id: 11, name: "Wages", amount: 200, type: "debit", status: "pending", hints: [] }] });
  renderToStaticMarkup(createElement(Table));
  assert.equal(globalThis.__dragSources[0].disabled, true);
});

test("both configured adjustment amounts use plain shared tiles without editors or missing-rule message boxes", () => {
  const html = renderControlled({ rows: [{ id: 13, name: "Wages", amount: 200, amount2: 70, adjustment: true, status: "pending" }],
    selected: { sourceId: "13:amount2" }, feedback: "Sales: No active rule is configured for this account in the chapter." });
  assert.deepEqual(globalThis.__dragSources.map((item) => item.id), [13, "13:amount2"]);
  assert.ok(globalThis.__dragSources.every((item) => item.disabled === false));
  assert.match(html, /₹200/); assert.match(html, /₹70/); assert.match(html, /drag-btn drag-btn-selected/);
  assert.doesNotMatch(html, /Amount for this effect|Drag each adjustment to every account it affects|alert-info|<input|NaN/);
  assert.match(html, /class="visually-hidden" role="status" aria-live="polite"/);
  assert.deepEqual(globalThis.__dragMutations, []);
});

test("shared accounting cells group outstanding additions and prepaid deductions with their base account", () => {
  const placements = [
    { id: 11, attributeId: 8, name: "Rent", amount: 1000, operation: "add" },
    { id: 14, attributeId: 11, name: "Other Expense", amount: 50, operation: "add" },
    { id: 12, attributeId: 9, name: "Outstanding Rent", amount: 200, operation: "add", pairId: 8 },
    { id: 13, attributeId: 10, name: "Prepaid Rent", amount: 100, operation: "less", pairId: 8 },
  ];
  placements.forEach((row) => { row.target = `Profit & Loss Account-Debit Particulars-${row.operation}`; });
  const rowsByTarget = adjustmentTableRows(placements);
  const html = renderControlled({ rowsByTarget });
  const cells = tableCells(html, 2);
  assert.deepEqual(cells.slice(0, 3), [["To Rent", "1,000", ""], ["Add: Outstanding Rent", "200", ""], ["Less: Prepaid Rent", "-100", "1,100"]]);
  assert.deepEqual(cells[3], ["To Other Expense", "", "50"]);
  assert.match(html, /To Net Profit/); assert.match(html, /By Net Loss/);
  const reverse = renderControlled({ rowsByTarget: adjustmentTableRows([placements[2], placements[3], placements[1], placements[0]]) });
  assert.deepEqual(tableCells(reverse, 2).slice(0, 3), cells.slice(0, 3));
  const assetRows = [
    { id: 21, attributeId: 20, name: "Machinery", amount: 5000, operation: "add", target: "Balance Sheet-Asset Side-add" },
    { id: 22, attributeId: 21, name: "Depreciation", amount: 500, operation: "less", pairId: 20, target: "Balance Sheet-Asset Side-less" },
  ];
  const balanceSheet = renderControlled({ rowsByTarget: adjustmentTableRows([...placements, ...assetRows]) });
  assert.deepEqual(tableCells(balanceSheet, 5).slice(0, 2), [["Machinery", "5,000", ""], ["Less: Depreciation", "-500", "4,500"]]);
});

test("completed adjustments use the shared balanced proforma and final result label", () => {
  const rowsByTarget = blankTables();
  rowsByTarget["Balance Sheet-Liabilities Side"] = [{ id: 21, name: "Capital", amount: 5000, operation: "add" }];
  rowsByTarget["Balance Sheet-Asset Side"] = [{ id: 22, name: "Cash", amount: 5000, operation: "add" }];
  const html = renderControlled({ rowsByTarget, fullyPlaced: true, counts: { 11: 1, 12: 1, 13: 2 }, effects: { 11: 1, 12: 1, 13: 2 } });
  assert.equal(summaryValues(html).Progress, "3/3");
  assert.match(html, /role="status">Final Accounts<span/); assert.match(html, /Balance Sheet balances\./);
  assert.doesNotMatch(html, /Final Accounts preview|Balance Sheet difference/);
  assert.doesNotMatch(html, /Submit answer/);
  assert.deepEqual(tableCells(html, 4)[0], ["Capital", "", "5,000"]);
  assert.deepEqual(tableCells(html, 5)[0], ["Cash", "", "5,000"]);
});
