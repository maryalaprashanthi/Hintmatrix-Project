import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build } from "esbuild";
import { emptyAdjustmentForm, buildAdjustmentAttributes, hydrateAdjustmentForm } from "./adjustmentQuestionForm.js";

const compiled = await build({
  entryPoints: [fileURLToPath(new URL("./DragAndDropAttributeEditor.jsx", import.meta.url))],
  bundle: true, write: false, platform: "node", format: "cjs", packages: "external", jsx: "automatic",
});
const module = { exports: {} };
new Function("require", "module", "exports", compiled.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
const Editor = module.exports.default;
const headers = [{ headerId: 31, name: "Debit Particulars" }, { headerId: 74, name: "Credit Particulars" }];
const attributes = [{ attributeId: 4, name: "Rent", tableHeaderName: "Debit Particulars" },
  { attributeId: 8, name: "Sales", tableHeaderName: "Credit Particulars" },
  { attributeId: 12, name: "Outstanding Rent", tableHeaderName: "Credit Particulars" }];

function fixture(withAdjustments = false, disabled = false) {
  const state = emptyAdjustmentForm();
  const selections = new Map();
  const props = () => ({
    balances: state.balances,
    onBalancesChange: (update) => { state.balances = update(state.balances); },
    adjustments: withAdjustments ? state.adjustments : undefined,
    onAdjustmentsChange: (update) => { state.adjustments = update(state.adjustments); },
    disabled,
    renderAttributeSelect(value, onChange, side, disabled, label) {
      selections.set(label, { onChange, side });
      return createElement("select", { "aria-label": label, value, disabled, onChange: (event) => onChange(event.target.value) },
        createElement("option", { value }, value));
    },
  });
  const tree = () => Editor(props());
  const html = () => renderToStaticMarkup(createElement(Editor, props()));
  return { state, selections, tree, html };
}
const nodes = (element) => !element || typeof element !== "object" ? []
  : [element, ...[].concat(element.props?.children ?? []).flat(Infinity).flatMap(nodes)];
const control = (f, label) => nodes(f.tree()).find((node) => node.props?.["aria-label"] === label);
const action = (f, text) => nodes(f.tree()).find((node) => node.type === "button" &&
  [].concat(node.props.children).includes(text));

test("both types render the identical debit/credit editor, with adjustments directly below it", () => {
  const ordinary = fixture().html(), adjusted = fixture(true).html();
  const firstSection = (html) => html.slice(0, html.indexOf("</section>") + "</section>".length);
  assert.equal(firstSection(ordinary), firstSection(adjusted));
  assert.doesNotMatch(ordinary, /aq-adjustments-card/);
  assert.match(adjusted, /aq-card aq-ledger-card/); assert.match(adjusted, /aq-card aq-adjustments-card/);
  assert.ok(adjusted.indexOf("Debit and credit attributes") < adjusted.indexOf('aria-label="Adjustments"'));
  assert.match(adjusted, /<th>Debit<\/th><th>Debit amount<\/th><th>Credit<\/th><th>Credit amount<\/th>/);
  assert.doesNotMatch(adjusted, /Adjustment information|second amount|<details|<textarea/);
});

test("shared balance add/remove and edits preserve the independent adjustment rows", () => {
  const f = fixture(true); f.tree();
  f.selections.get("Debit account 1").onChange("4");
  control(f, "Debit amount 1").props.onChange({ target: { value: "100" } });
  f.selections.get("Credit account 1").onChange("8");
  control(f, "Credit amount 1").props.onChange({ target: { value: "250" } });
  action(f, "Add row").props.onClick();
  assert.equal(f.state.balances.length, 2);
  control(f, "Remove balance row 2").props.onClick();
  assert.deepEqual(f.state.balances[0], { debitAttributeId: "4", debitAmount: "100", creditAttributeId: "8", creditAmount: "250" });
  assert.deepEqual(f.state.adjustments, emptyAdjustmentForm().adjustments);
  assert.equal(control(f, "Remove balance row 1").props.disabled, true);
});

test("adjustment name and amount retain the database role through create/edit round trips", () => {
  const f = fixture(true); f.tree();
  f.selections.get("Debit account 1").onChange("4");
  control(f, "Debit amount 1").props.onChange({ target: { value: "100" } });
  f.selections.get("Adjustment account 1").onChange("12");
  assert.equal(f.selections.get("Adjustment account 1").side, null);
  control(f, "Adjustment amount 1").props.onChange({ target: { value: "20" } });
  action(f, "Add adjustment row").props.onClick();
  assert.equal(f.state.adjustments.length, 2);
  control(f, "Remove adjustment row 2").props.onClick();
  const payload = buildAdjustmentAttributes(f.state, attributes, headers);
  assert.deepEqual(payload[1], { attributeId: 12, headerId: 74, amount: 20, amount2: null, note: null, adjustment: true });
  const restored = hydrateAdjustmentForm({ questionAttributes: payload.map((row) => ({ ...row,
    headerName: headers.find((header) => header.headerId === row.headerId).name })) });
  assert.deepEqual(buildAdjustmentAttributes(restored, attributes, headers), payload);
});

test("saving disables both shared authoring tables and all their controls", () => {
  const f = fixture(true, true);
  const controls = nodes(f.tree()).filter((node) => ["button", "input", "textarea", "select"].includes(node.type));
  assert.ok(controls.length > 0); assert.ok(controls.every((node) => node.props.disabled === true));
});
