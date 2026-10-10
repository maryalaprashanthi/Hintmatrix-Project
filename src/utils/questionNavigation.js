// Mapping responses have no guaranteed order. Navigation must be stable across
// requests, include the opened question, and never silently truncate a topic.
export function getQuestionNavigationIds(orderedIds, currentId) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0 ||
      !orderedIds.every((id) => /^\d+$/.test(String(id)) && Number(id) > 0) ||
      !orderedIds.some((id) => String(id) === String(currentId))) return [];
  return [...new Set(orderedIds.map(String))];
}

export function buildQuestionSequence(rows, current, orderedIds) {
  // The list owns ordering and filtering. Keep only IDs in router history,
  // and use the freshly loaded DTO for the question being displayed.
  const navigationIds = getQuestionNavigationIds(orderedIds, current?.questionId);
  if (navigationIds.length > 0) {
    return navigationIds.map((id) =>
      id === String(current.questionId) ? current : { questionId: id },
    );
  }
  const byId = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    if (row?.questionId != null && row.activeRow !== false && row.activeRow !== "false") {
      byId.set(String(row.questionId), row);
    }
  }
  if (current?.questionId != null) {
    const key = String(current.questionId);
    byId.set(key, { ...byId.get(key), ...current });
  }
  return [...byId.values()].sort((a, b) =>
    String(b.questionId).localeCompare(String(a.questionId), "en", { numeric: true }),
  );
}

export function questionIndex(rows, id) {
  return rows.findIndex((row) => String(row.questionId) === String(id));
}

// Display numbering may include inactive rows even though navigation skips them.
export function questionDisplayNumber(rows, id, listNumbers) {
  const listNumber = listNumbers?.[id];
  return Number.isInteger(listNumber) && listNumber > 0
    ? listNumber : questionIndex(rows, id) + 1;
}
