import { data, normalizeFinalAccountTarget } from "./SampleData.js";

export const displayAdjustmentAmount = (amount) => amount == null || amount === "" || !Number.isFinite(Number(amount))
  ? "Amount unavailable" : `₹${Number(amount).toLocaleString("en-IN")}`;

export const placementKey = (rowId, conditionId) => `${rowId}:${conditionId}`;
export const matchAdjustmentEffect = (effects, placements, rowId, target, amount) =>
  effects.find((effect) => normalizeFinalAccountTarget(effect.answer) === target &&
    Number(effect.amount) === Number(amount) &&
    !placements.some((entry) => entry.key === placementKey(rowId, effect.conditionId)));

export const adjustmentRows = (question) => (question.questionAttributes ?? [])
  .filter((row) => row.activeRow !== false)
  .map((row) => ({ ...row, id: row.questionAttributeId, name: row.attributeName }));

// Pairing is supplied by the Rule Engine, scoped to the student's statement
// and side. A repeated base account is ambiguous, so do not invent a row link.
export function adjustmentTableRows(placements) {
  return Object.fromEntries(data.flatMap((table) => table.headers.map((header) => {
    const target = `${table.name}-${header}`;
    const entries = placements.filter((entry) =>
      normalizeFinalAccountTarget(entry.target).replace(/-(add|less)$/, "") === target);
    const groups = new Map();
    for (const entry of entries) {
      // Existing rules often pair an unlinked base account to itself.
      if (entry.pairId == null || String(entry.pairId) === String(entry.attributeId)) continue;
      const bases = entries.filter((base) => base !== entry && base.operation === "add" &&
        (base.pairId == null || String(base.pairId) === String(base.attributeId)) &&
        String(base.attributeId) === String(entry.pairId));
      if (bases.length !== 1) continue;
      const base = bases[0];
      const groupId = base.key ?? base.placementId ?? placementKey(base.id, base.conditionId ?? 1);
      groups.set(base, { groupId, isGroupBase: true });
      groups.set(entry, { groupId, isGroupBase: false });
    }
    return [target, entries.map((entry) => ({ ...entry, ...groups.get(entry) }))];
  })));
}

// Paper submission already reads this slice shape. Keep each effect's identity
// separate, including two effects that use the same statement and operation.
export function addAdjustmentExamPlacement(slice, row, target, amount, maxEffects, pairId) {
  const split = target.lastIndexOf("-");
  const table = target.slice(0, split), operation = target.slice(split + 1);
  if (!slice?.droppableData[table] || !["add", "less"].includes(operation)) return slice;
  const placed = Object.values(slice.droppableData).flat().filter((entry) => String(entry.id) === String(row.id));
  if (placed.length >= maxEffects) return slice;
  let slot = 1;
  while (placed.some((entry) => entry.placementId === placementKey(row.id, slot))) slot++;
  const entry = { id: row.id, questionAttributeId: row.id, attributeId: row.attributeId, name: row.name,
    amount: Number(amount), operation, targetId: target, placementId: placementKey(row.id, slot), pairId };
  return { ...slice, droppableData: { ...slice.droppableData, [table]: [...slice.droppableData[table], entry] },
    questions: slice.questions.map((item) => String(item.id) === String(row.id) ? { ...item, status: "placed" } : item) };
}
