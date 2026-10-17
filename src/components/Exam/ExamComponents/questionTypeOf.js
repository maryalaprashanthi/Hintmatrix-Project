// The `question_type` table stores display-cased labels - "Journal",
// "DropDown", "Drag And Drop" - but the exam renderer switches on canonical
// tokens ("JOURNAL" / "DROPDOWN" / "DRAG_AND_DROP"). Without normalising,
// "Journal" !== "JOURNAL" and every question fell through to the drag-and-drop
// branch. Accepts either a question object or a bare type string.
import {
  isFillBlankQuestionType,
  isMatchingQuestionType,
  normalizeQuestionType,
} from "../../../utils/questionType.js";
export const questionTypeOf = (input) => {
  const raw =
    typeof input === "string"
      ? input
      : (input?.questionType?.name ??
        input?.questionType ??
        input?.questionTypeName ??
        input?.type?.name ??
        input?.type ??
        "");
  const token = String(raw)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (!token) return null;
  if (normalizeQuestionType(raw) === "DRAG_AND_DROP_WITH_ADJ")
    return "DRAG_AND_DROP_WITH_ADJ";
  // The table stores "MATCH_THE_FOLLOWING" and "FILL_IN_THE_BLANKS".
  if (isMatchingQuestionType(raw)) return "MATCHING";
  if (isFillBlankQuestionType(raw)) return "FILL_IN_THE_BLANK";
  // Match loosely - the label may be "Dropdown", "Drop Down",
  // "Drop-Down Question", "DropDownQuestion", etc.
  if (token.includes("JOURNAL")) return "JOURNAL";
  if (token.includes("DRAG") && token.includes("DROP")) return "DRAG_AND_DROP";
  if (token.includes("DROP") && token.includes("DOWN")) return "DROPDOWN";
  if (token.includes("MULTIPLE") && token.includes("CHOICE"))
    return "MULTIPLE_CHOICE";
  if (token.includes("SINGLE") && token.includes("CHOICE"))
    return "SINGLE_CHOICE";

  return token;
};

export default questionTypeOf;
