// Database IDs are environment-specific; use the API's type name for routing.
export const normalizeQuestionType = (value) => {
  const name = typeof value === "object" && value !== null
    ? value.name ?? value.questionType ?? value.label
    : value;
  const type = String(name ?? "").trim().toUpperCase()
    .replace(/[\s-]+/g, "_").replace(/^MCQ_/, "")
    .replace(/_QUESTION$/, "");
  return ({ DRAGANDDROP: "DRAG_AND_DROP", SINGLECHOICE: "SINGLE_CHOICE",
    MULTIPLECHOICE: "MULTIPLE_CHOICE" })[type] ?? type;
};

export const isMatchingQuestionType = (value) => {
  const type = normalizeQuestionType(value);
  return type === "MATCHING" || type === "MATCH_THE_FOLLOWING";
};

export const isFillBlankQuestionType = (value) => {
  const type = normalizeQuestionType(value);
  return type.includes("FILL") && type.includes("BLANK");
};

export const isTransactionQuestionType = (value) =>
  ["JOURNAL", "DROPDOWN"].includes(normalizeQuestionType(value));
