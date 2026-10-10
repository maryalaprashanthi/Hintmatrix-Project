import { getQuestionAttributeSide } from "../../utils/questionAttributeSide.js";

export const emptyAdjustmentForm = () => ({
  balances: [{ debitAttributeId: "", debitAmount: "", creditAttributeId: "", creditAmount: "" }],
  adjustments: [{ attributeId: "", amount: "", amount2: "", note: "" }],
});

export const attributeHeaderId = (attribute, headers) => attribute?.headerId ??
  headers.find((header) => String(header.name).trim().toLowerCase() ===
    String(attribute?.tableHeaderName ?? attribute?.headerName).trim().toLowerCase())?.headerId;

export function buildAdjustmentAttributes(form, attributes, headers) {
  const create = (id, amount, extra = {}) => {
    const attribute = attributes.find((item) => String(item.attributeId) === String(id));
    const headerId = attributeHeaderId(attribute, headers) ?? extra.original?.attributeHeaderId ?? extra.original?.headerId;
    if (!headerId) throw new Error("A selected account has no database header. Reload the form or configure the account header.");
    return { attributeId: Number(id), headerId: Number(headerId), amount: Number(amount),
      amount2: extra.amount2 === "" || extra.amount2 == null ? null : Number(extra.amount2),
      note: extra.note || null, adjustment: Boolean(extra.adjustment) };
  };
  return [
    ...form.balances.flatMap((row) => ["debit", "credit"].filter((side) => row[`${side}AttributeId`])
      .map((side) => create(row[`${side}AttributeId`], row[`${side}Amount`], {
        original: row[`${side}Original`], amount2: row[`${side}Original`]?.amount2,
        note: row[`${side}Original`]?.note,
      }))),
    ...form.adjustments.filter((row) => row.attributeId).map((row) => create(row.attributeId, row.amount, { ...row, adjustment: true })),
  ];
}

export function validateAdjustmentForm(form, attributes, headers) {
  const errors = [];
  const validAmount = (value) => value !== "" && value != null && /^\d+(\.\d{1,2})?$/.test(String(value));
  if (!form.balances.some((row) => row.debitAttributeId || row.creditAttributeId)) errors.push("Add at least one trial balance account.");
  if (!form.adjustments.some((row) => row.attributeId)) errors.push("Add at least one adjustment.");
  for (const row of form.balances) for (const side of ["debit", "credit"]) {
    if (row[`${side}AttributeId`] && !validAmount(row[`${side}Amount`])) errors.push(`Enter a valid ${side} amount.`);
    if (!row[`${side}AttributeId`] && row[`${side}Amount`] !== "") errors.push(`Select an account for the ${side} amount.`);
    const attribute = attributes.find((item) => String(item.attributeId) === String(row[`${side}AttributeId`]));
    if (attribute && getQuestionAttributeSide({ headerName: attribute.tableHeaderName }) !== side) errors.push(`Choose an account defined on the ${side} side.`);
  }
  for (const row of form.adjustments) {
    if (!row.attributeId && (row.amount !== "" || row.amount2 !== "" || row.note)) errors.push("Select an account for each adjustment.");
    if (row.attributeId && (!validAmount(row.amount) || (row.amount2 !== "" && row.amount2 != null && !validAmount(row.amount2)))) errors.push("Enter valid adjustment amounts with at most two decimal places.");
  }
  try { buildAdjustmentAttributes(form, attributes, headers); } catch (error) { errors.push(error.message); }
  return [...new Set(errors)];
}

export function hydrateAdjustmentForm(question) {
  const attributes = (question.questionAttributes ?? []).filter((row) => row.activeRow !== false);
  const debit = attributes.filter((row) => getQuestionAttributeSide(row) === "debit");
  const credit = attributes.filter((row) => getQuestionAttributeSide(row) === "credit");
  const balances = Array.from({ length: Math.max(debit.length, credit.length, 1) }, (_, index) => ({
    debitAttributeId: debit[index]?.attributeId ?? "", debitAmount: debit[index]?.amount ?? "", debitOriginal: debit[index],
    creditAttributeId: credit[index]?.attributeId ?? "", creditAmount: credit[index]?.amount ?? "", creditOriginal: credit[index],
  }));
  const adjustments = attributes.filter((row) => getQuestionAttributeSide(row) === null)
    .map((row) => ({ attributeId: row.attributeId, amount: row.amount ?? "", amount2: row.amount2 ?? "", note: row.note ?? "", original: row }));
  return { balances, adjustments: adjustments.length ? adjustments : emptyAdjustmentForm().adjustments };
}
