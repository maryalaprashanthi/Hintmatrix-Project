// The `question_type` table stores display-cased labels - "Journal",
// "DropDown", "Drag And Drop" - but the exam renderer switches on canonical
// tokens ("JOURNAL" / "DROPDOWN" / "DRAG_AND_DROP"). Without normalising,
// "Journal" !== "JOURNAL" and every question fell through to the drag-and-drop
// branch. Accepts either a question object or a bare type string.
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

  const token = String(raw).trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (!token) return null;
  // Match loosely - the label may be "Dropdown", "Drop Down",
  // "Drop-Down Question", "DropDownQuestion", etc.
  if (token.includes("JOURNAL")) return "JOURNAL";
  if (token.includes("DRAG") && token.includes("DROP")) return "DRAG_AND_DROP";
  if (token.includes("DROP") && token.includes("DOWN")) return "DROPDOWN";

  return token;
};

export default questionTypeOf;
