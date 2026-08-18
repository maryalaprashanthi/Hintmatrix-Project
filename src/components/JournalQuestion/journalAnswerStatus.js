const isCorrectAnswer = (answer) =>
  answer.valid === true || answer.valid === "true";

const getAnswerKey = (tableId, headerId) =>
  `${String(tableId)}:${String(headerId)}`;

export const getRequiredAnswerKeys = (tables = []) =>
  new Set(
    tables.flatMap((table) =>
      [table.debit, table.credit]
        .filter(Boolean)
        .map((condition) => getAnswerKey(table.id, condition.headerId)),
    ),
  );

export const getRequiredAnswerCount = (tables = []) =>
  getRequiredAnswerKeys(tables).size;

export const getCorrectAnswerCount = (answers = []) =>
  new Set(
    answers
      .filter(isCorrectAnswer)
      .map((answer) => getAnswerKey(answer.tableNameId, answer.headerId)),
  ).size;

export const getUnansweredRuleConditions = (tables = [], answers = []) => {
  const correctAnswerKeys = new Set(
    answers
      .filter(isCorrectAnswer)
      .map((answer) => getAnswerKey(answer.tableNameId, answer.headerId)),
  );

  return tables.flatMap((table) =>
    [
      { type: "Debit", condition: table.debit },
      { type: "Credit", condition: table.credit },
    ].filter(
      ({ condition }) =>
        condition &&
        !correctAnswerKeys.has(getAnswerKey(table.id, condition.headerId)),
    ).map(({ type, condition }) => ({ table, type, condition })),
  );
};

export const isJournalAttributeSolved = (attribute, answers = []) => {
  const requiredAnswerKeys = getRequiredAnswerKeys(attribute.tables);
  const correctAnswerKeys = new Set(
    answers
      .filter(isCorrectAnswer)
      .map((answer) => getAnswerKey(answer.tableNameId, answer.headerId)),
  );

  return (
    requiredAnswerKeys.size > 0 &&
    [...requiredAnswerKeys].every((key) => correctAnswerKeys.has(key))
  );
};
