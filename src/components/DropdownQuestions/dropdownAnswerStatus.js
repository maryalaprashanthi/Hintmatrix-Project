const isCorrectAnswer = (answer) =>
  answer.valid === true || answer.valid === "true";

const getAnswerKey = (tableId, headerId) =>
  `${String(tableId)}:${String(headerId)}`;

/*
 * ruleConditions is already normalized by DropdownPage.
 *
 * Example:
 *
 * [
 *   {
 *     tableId: 13,
 *     headerId: 3,
 *     headerName: "Credit Particulars",
 *     ...
 *   }
 * ]
 */
const getRequiredConditions = (ruleConditions = []) => {
  if (!Array.isArray(ruleConditions)) {
    return [];
  }

  return ruleConditions.filter(
    (condition) => condition?.tableId != null && condition?.headerId != null,
  );
};

/*
 * Get all Rule Engine answer keys required
 * for one Dropdown attribute.
 */
export const getRequiredAnswerKeys = (ruleConditions = []) => {
  const conditions = getRequiredConditions(ruleConditions);

  return new Set(
    conditions.map((condition) =>
      getAnswerKey(condition.tableId, condition.headerId),
    ),
  );
};

/*
 * Count how many answers are required
 * for this attribute.
 */
export const getRequiredAnswerCount = (ruleConditions = []) =>
  getRequiredAnswerKeys(ruleConditions).size;

/*
 * Count unique correct answers.
 */
export const getCorrectAnswerCount = (answers = []) =>
  new Set(
    answers
      .filter(isCorrectAnswer)
      .filter((answer) => answer.tableNameId != null && answer.headerId != null)
      .map((answer) => getAnswerKey(answer.tableNameId, answer.headerId)),
  ).size;

/*
 * Determine whether ALL required Rule Engine
 * conditions have been answered correctly.
 */
export const isDropdownAttributeSolved = (
  ruleConditions = [],
  answers = [],
) => {
  const requiredAnswerKeys = getRequiredAnswerKeys(ruleConditions);

  if (requiredAnswerKeys.size === 0) {
    return false;
  }

  const correctAnswerKeys = new Set(
    answers
      .filter(isCorrectAnswer)
      .filter((answer) => answer.tableNameId != null && answer.headerId != null)
      .map((answer) => getAnswerKey(answer.tableNameId, answer.headerId)),
  );

  return [...requiredAnswerKeys].every((key) => correctAnswerKeys.has(key));
};

export const getUnansweredDropdownConditions = (
  ruleConditions = [],
  answers = [],
) => {
  const correctAnswerKeys = new Set(
    answers
      .filter(isCorrectAnswer)
      .filter((answer) => answer.tableNameId != null && answer.headerId != null)
      .map((answer) => getAnswerKey(answer.tableNameId, answer.headerId)),
  );

  return ruleConditions
    .filter(
      (condition) =>
        condition?.tableId != null &&
        condition?.headerId != null &&
        !correctAnswerKeys.has(
          getAnswerKey(condition.tableId, condition.headerId),
        ),
    )
    .map((condition) => ({
      condition,
      type: condition.headerName === "Debit Particulars" ? "Debit" : "Credit",
    }));
};
