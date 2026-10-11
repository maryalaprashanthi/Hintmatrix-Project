import { normalizeQuestionType } from "../../utils/questionType.js";

export function adjustmentTypeForChapter(chapterName, options) {
  if (String(chapterName ?? "").toLowerCase().replace(/[^a-z]/g, "") !== "finalaccountswithadjustments") return null;
  return options.find((option) => normalizeQuestionType(option) === "DRAG_AND_DROP_WITH_ADJ") ?? null;
}

export const modalBalanceRows = (rows) => rows.map((row) => ({ ...row,
  debitAttributeId: row.debitBalance, creditAttributeId: row.creditBalance }));

export function updateModalBalanceRows(rows, update, options) {
  return update(modalBalanceRows(rows)).map(({ debitAttributeId, creditAttributeId, ...row }) => {
    for (const [side, id] of [["debit", debitAttributeId], ["credit", creditAttributeId]]) {
      if (String(row[`${side}Balance`] ?? "") !== String(id)) {
        const option = options.find((item) => String(item.value) === String(id));
        row[`${side}AttributeName`] = option?.label ?? "";
        row[`${side}Amount`] = option?.amount ?? "";
      }
      row[`${side}Balance`] = id;
    }
    return row;
  });
}
