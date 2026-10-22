import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";

const source = readFileSync(new URL("./RuleEngineForm.jsx", import.meta.url), "utf8");
const compiled = transformSync(source, { loader: "jsx", format: "cjs" }).code;

async function fixture(selected = null) {
  const headers = [{ headerId: 1, name: "Debit" }, { headerId: 4, name: "adjustments" }];
  const attributes = [
    { headerId: 1, name: "Rent" },
    { headerId: 4, name: "Rent" },
    { headerId: 4, name: "Rent payable" },
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
  const module = { exports: {} };
  new Function("require", "module", "exports", "React", "document", compiled)(require, module, module.exports, react, { body: {} });
  const render = () => {
    index = 0; effects = [];
    tree = module.exports.default({ show: true, selectedRuleData: selected, onClose() {}, onSave() {} });
    effects.forEach((effect) => effect());
  };
  render();
  await new Promise((resolve) => setImmediate(resolve));
  render();
  function find(node, placeholder) {
    if (!node || typeof node !== "object") return null;
    if (Array.isArray(node)) return node.map((child) => find(child, placeholder)).find(Boolean);
    if (node.props?.placeholder === placeholder) return node.props;
    return find(node.children, placeholder);
  }
  return { render, select: (placeholder) => find(tree, placeholder) };
}

test("both attribute selectors are disabled until Field Type is selected", async () => {
  const f = await fixture();
  for (const name of ["Select Table Attribute", "Select Pair Attribute"]) {
    assert.equal(f.select(name).isDisabled, true);
    assert.deepEqual(f.select(name).options, []);
  }
  f.select("Select Field Type").onChange({ value: "adjustments" }); f.render();
  for (const name of ["Select Table Attribute", "Select Pair Attribute"]) {
    assert.equal(f.select(name).isDisabled, false);
    assert.deepEqual(f.select(name).options.map((option) => option.value), ["Rent", "Rent payable"]);
  }
});

test("edit preserves valid attributes; switching or clearing Field Type resets both", async () => {
  const f = await fixture({ fieldType: "adjustments", attributeName: "Rent", pairAttributeName: "Rent payable" });
  assert.equal(f.select("Select Table Attribute").value.value, "Rent");
  assert.equal(f.select("Select Pair Attribute").value.value, "Rent payable");
  f.select("Select Field Type").onChange({ value: "Debit" }); f.render();
  assert.equal(f.select("Select Table Attribute").value, null);
  assert.equal(f.select("Select Pair Attribute").value, null);
  assert.deepEqual(f.select("Select Pair Attribute").options.map((option) => option.value), ["Rent"]);
  f.select("Select Field Type").onChange(null); f.render();
  assert.equal(f.select("Select Table Attribute").isDisabled, true);
  assert.deepEqual(f.select("Select Pair Attribute").options, []);
});
