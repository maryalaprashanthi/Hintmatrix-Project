// Correct answers use the matched rule. Wrong answers belong to the next
// unanswered condition on the selected side, then the next pending condition.
export const getPracticePosition = (matchedCondition, pendingConditions, type) =>
  matchedCondition?.position ??
  pendingConditions.find((entry) => entry.type === type)?.condition?.position ??
  pendingConditions[0]?.condition?.position ??
  null;
