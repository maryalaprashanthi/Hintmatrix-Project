import { getQuestionAttributeSide } from "../../utils/questionAttributeSide.js";

// Both controllers use the same source ordering: pending rows first, then
// completed rows in the shared Answered section. Preserve original row IDs.
export function questionSourceSections(rows, isSolved, getSide = getQuestionAttributeSide) {
  const sections = { debitBalances: [], creditBalances: [], adjustments: [],
    answeredDebits: [], answeredCredits: [], answeredAdjustments: [] };
  for (const row of rows) {
    const side = getSide(row);
    const key = side === "debit"
      ? (isSolved(row) ? "answeredDebits" : "debitBalances")
      : side === "credit"
        ? (isSolved(row) ? "answeredCredits" : "creditBalances")
        : (isSolved(row) ? "answeredAdjustments" : "adjustments");
    sections[key].push(row);
  }
  return sections;
}
