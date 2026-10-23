import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";

const source = readFileSync(new URL("./RuleEngineForm.jsx", import.meta.url), "utf8");
const compiled = transformSync(source, { loader: "jsx", format: "cjs" }).code;

async function fixture(selected = null) {
  const headers = [{ headerId: 1, name: "Debit" }, { headerId: 4, name: "adjustments" }];
  const attributes = [
    { attributeId: 10, headerId: 1, name: "Rent", tableHeaderName: "Debit" },
    { attributeId: 20, headerId: 4, name: "Rent", tableHeaderName: "adjustments" },
    { attributeId: 30, headerId: 4, name: "Rent payable", tableHeaderName: "adjustments" },
  ];
  const states = [], deps = [];
  let index = 0, effects = [], tree;
  const react = {
    useState(initial) {
      const slot = index++;
      if (!(slot in states)) states[slot] = initial;
      return [states[slot], (next) => { states[slot] = typeof next === "function" ? next(states[slot]) : next; }];
    },
    useEffect(callback, dependencies) {
      const slot = index++;
      if (!deps[slot] || dependencies.some((value, i) => value !== deps[slot][i])) effects.push(callback);
      deps[slot] = dependencies;
    },
    createElement(type, props, ...children) { return { type, props: props || {}, children }; },
  };
  const service = {
    getChapters: async () => [], getTableNames: async () => [], getTableAttributes: async () => attributes,
  };
  const require = (name) => {
    if (name === "react") return react;
    if (name === "react-dom") return { createPortal: (content) => content };
    if (name === "react-select") return { default: "Select", __esModule: true };
    if (name.includes("RuleEngineService")) return { default: service, __esModule: true };
    if (name.includes("TableHeaderService")) return { default: { getAll: async () => ({ data: headers }) }, __esModule: true };
    return {};
  };
  const saves = [], alerts = [];
  const module = { exports: {} };
  new Function("require", "module", "exports", "React", "document", "alert", compiled)(require, module, module.exports, react, { body: {} }, (message) => alerts.push(message));
  const render = () => {
    index = 0; effects = [];
    tree = module.exports.default({ show: true, selectedRuleData: selected, onClose() {}, onSave(payload) { saves.push(payload); } });
    effects.forEach((effect) => effect());
  };
  render();
  await new Promise((resolve) => setImmediate(resolve));
  render();
  function find(node, placeholder) {
    if (!node || typeof node !== "object") return null;
    if (Array.isArray(node)) return node.map((child) => find(child, placeholder)).find(Boolean);
    if (node.props?.placeholder === placeholder || (node.type === "button" && node.children?.some((child) => typeof child === "string" && child.trim() === placeholder))) return node.props;
    return find(node.children, placeholder);
  }
  return { render, saves, alerts, select: (placeholder) => find(tree, placeholder) };
}

test("both selectors show all attributes without a Field Type and distinguish duplicate names", async () => {
  const f = await fixture();
  for (const name of ["Select Table Attribute", "Select Pair Attribute"]) {
    assert.notEqual(f.select(name).isDisabled, true);
    assert.deepEqual(f.select(name).options.map((option) => option.value), ["10", "20", "30"]);
    assert.match(f.select(name).options[0].label, /Debit/);
    assert.match(f.select(name).options[1].label, /adjustments/);
  }
});

test("legacy edit values remain visible and save by ID with no Field Type", async () => {
  const f = await fixture({ chapterName: "Chapter", relationshipName: "1to1", pairOrder: 1,
    fieldType: null, attributeId: 10, attributeName: "Rent", pairAttributeId: 30, pairAttributeName: "Rent payable" });
  assert.equal(f.select("Select Table Attribute").value.value, "10");
  assert.equal(f.select("Select Pair Attribute").value.value, "30");
  await f.select("Save").onClick();
  assert.deepEqual(f.alerts, []);
  assert.equal(f.saves[0].attributeId, 10);
  assert.equal(f.saves[0].pairAttributeId, 30);
  assert.equal(f.saves[0].fieldType, "Debit");
  assert.equal(f.saves[0].pairedFieldType, "adjustments");
});

test("changing Field Type preserves selections and permits a different header attribute", async () => {
  const f = await fixture({ chapterName: "Chapter", relationshipName: "1to1", pairOrder: 1,
    fieldType: "adjustments", attributeId: 20, attributeName: "Rent", pairAttributeId: 30, pairAttributeName: "Rent payable" });
  f.select("Select Field Type").onChange({ value: "Debit" }); f.render();
  assert.equal(f.select("Select Table Attribute").value.value, "20");
  assert.equal(f.select("Select Pair Attribute").value.value, "30");
  f.select("Select Table Attribute").onChange(f.select("Select Table Attribute").options[0]); f.render();
  f.select("Select Field Type").onChange(null); f.render();
  await f.select("Save").onClick();
  assert.deepEqual(f.alerts, []);
  assert.equal(f.saves[0].attributeId, 10);
  assert.equal(f.saves[0].pairAttributeId, 30);
});


test("each attribute populates only its own Field Type and preserves the other selection", async () => {
  const f = await fixture({ chapterName: "Chapter", relationshipName: "1to1", pairOrder: 1,
    attributeId: 10, attributeName: "Rent", pairAttributeId: 30, pairAttributeName: "Rent payable" });
  assert.equal(f.select("Select Field Type").value.value, "Debit");
  assert.equal(f.select("Select Paired Field Type").value.value, "adjustments");
  f.select("Select Pair Attribute").onChange(f.select("Select Pair Attribute").options[0]); f.render();
  assert.equal(f.select("Select Field Type").value.value, "Debit");
  assert.equal(f.select("Select Paired Field Type").value.value, "Debit");
  assert.equal(f.select("Select Table Attribute").value.value, "10");
  await f.select("Save").onClick();
  assert.equal(f.saves[0].pairedFieldType, "Debit");
});
