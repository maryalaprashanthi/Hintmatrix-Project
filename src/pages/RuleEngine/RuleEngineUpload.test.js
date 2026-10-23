import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";

import { readRuleEngineUploadReport, saveRuleEngineUploadReport } from "./ruleEngineUploadReport.js";

const compiled = transformSync(readFileSync(new URL("./RuleEngine.jsx", import.meta.url), "utf8"),
  { loader: "jsx", format: "cjs" }).code;

const makeStorage = () => {
  const values = new Map([["userId", "8"]]);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key) };
};

async function fixture(report, { storage = makeStorage(), submit = true } = {}) {
  const states = [], deps = [], successes = [], errors = [];
  let index = 0, effects = [], tree, reads = 0;
  const react = {
    useState(initial) {
      const slot = index++; if (!(slot in states)) states[slot] = typeof initial === "function" ? initial() : initial;
      return [states[slot], (next) => { states[slot] = typeof next === "function" ? next(states[slot]) : next; }];
    },
    useRef: () => ({ current: null }),
    useEffect(effect, dependencies) {
      const slot = index++;
      if (!deps[slot] || dependencies.some((value, i) => value !== deps[slot][i])) effects.push(effect);
      deps[slot] = dependencies;
    },
    createElement(type, props, ...children) { return { type, props: props || {}, children }; },
  };
  const service = { getAllRules: async () => { reads++; return []; },
    uploadRulesExcel: async () => { if (report instanceof Error) throw report; return report; } };
  const require = (name) => {
    if (name === "react") return react;
    if (name.includes("ruleEngineUploadReport")) return {
      readRuleEngineUploadReport: () => readRuleEngineUploadReport(storage),
      saveRuleEngineUploadReport: (report) => saveRuleEngineUploadReport(report, storage),
    };
    if (name.includes("RuleEngineService")) return { default: service, __esModule: true };
    if (name.includes("RuleEngineUploadErrorsModal")) return { default: "UploadErrorsModal", __esModule: true };
    if (name.includes("useToast")) return { useToast: () => ({ success: (m) => successes.push(m), error: (m) => errors.push(m) }) };
    if (name.includes("useDeleteConfirm")) return { useDeleteConfirm: () => ({ pending: null }) };
    if (name.includes("managementCounts")) return { getManagementCounts: () => ({}) };
    if (name.includes("apiError")) return { getApiErrorMessage: () => "Invalid Excel file" };
    return {};
  };
  const module = { exports: {} };
  new Function("require", "module", "exports", "React", "console", compiled)(require, module, module.exports, react,
    { error() {}, log() {} });
  const render = () => { index = 0; effects = []; tree = module.exports.default(); effects.forEach((e) => e()); };
  function find(node, predicate) {
    if (!node || typeof node !== "object") return null;
    if (Array.isArray(node)) return node.map((child) => find(child, predicate)).find(Boolean);
    return predicate(node) ? node : find(node.children, predicate);
  }
  render(); await new Promise((r) => setImmediate(r)); render();
  const target = { files: [{}], value: "rules.xlsx" };
  if (submit) await find(tree, (node) => node.type === "input" && node.props.type === "file").props.onChange({ target });
  render();
  return { modal: find(tree, (node) => node.type === "UploadErrorsModal").props,
    successes, errors, target, reads };
}

test("partial upload opens row error report and refreshes saved rules", async () => {
  const report = { rulesUploaded: 2, skippedRows: 1, createdAttributes: 1, message: "2 uploaded, 1 skipped",
    errors: [{ rowNumber: 223, field: "pair_attribute", attributeName: "Sales", headerName: "Credit",
      errorMessage: "Created as DRAFT; rule skipped", attributeCreated: true }] };
  const f = await fixture(report);
  assert.equal(f.modal.show, true);
  assert.deepEqual(f.modal.report, report);
  assert.equal(f.reads, 2);
  assert.equal(f.target.value, "");
  assert.deepEqual(f.successes, []);
});

test("complete upload shows summary without an error report", async () => {
  const f = await fixture({ rulesUploaded: 3, skippedRows: 0, errors: [], message: "3 rules uploaded" });
  assert.equal(f.modal.show, false);
  assert.deepEqual(f.successes, ["3 rules uploaded"]);
});

test("file-level rejection shows an error and resets the file input", async () => {
  const f = await fixture(new Error("Invalid workbook"));
  assert.equal(f.modal.show, false);
  assert.equal(f.modal.report, null);
  assert.deepEqual(f.errors, ["Invalid Excel file"]);
  assert.equal(f.target.value, "");
});


test("error report survives leaving and reopening the page until another upload starts", async () => {
  const storage = makeStorage();
  const report = { rulesUploaded: 0, skippedRows: 1, errors: [{ rowNumber: 12 }], message: "Row 12 skipped" };
  await fixture(report, { storage });
  const reopened = await fixture(null, { storage, submit: false });
  assert.deepEqual(reopened.modal.report, report);
  assert.equal(reopened.modal.show, false);
  await fixture(new Error("Bad file"), { storage });
  const cleared = await fixture(null, { storage, submit: false });
  assert.equal(cleared.modal.report, null);
});

test("saved reports belong to the logged-in user and malformed storage is ignored", () => {
  const storage = makeStorage();
  saveRuleEngineUploadReport({ errors: [{ rowNumber: 4 }] }, storage);
  storage.setItem("userId", "9");
  assert.equal(readRuleEngineUploadReport(storage), null);
  storage.setItem("ruleEngineUploadReport:9", "not json");
  assert.equal(readRuleEngineUploadReport(storage), null);
});
