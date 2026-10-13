import RuleEngineService from "../../../services/RuleEngineService";

// Rule data for the exam, loaded only when the student interacts with a
// question: a drag starts, or a journal or dropdown transaction opens. The
// paper itself never loads rules.
//
// Each attribute is fetched once per exam. Every caller shares the same
// request, so a drag that starts while the first request is still running
// waits for it instead of sending a second one. A failed request is not kept,
// so the next interaction tries again.
const requests = new Map();

export const fetchAttributeRules = (attributeId) => {
  const key = String(attributeId);
  if (!requests.has(key)) {
    const request = RuleEngineService.getRuleEngineByAttributeId(attributeId)
      .then((rules) => (Array.isArray(rules) ? rules : []))
      .catch((error) => {
        requests.delete(key);
        throw error;
      });
    requests.set(key, request);
  }
  return requests.get(key);
};

// ExamPage calls this when a paper opens, so an admin's rule edit between two
// exams is not hidden by the last exam's answers.
export const clearAttributeRules = () => requests.clear();

// The active rule for the question's chapter, or else the first active rule.
export const pickRule = (rules, chapterId) => {
  const active = (rules || []).filter((rule) => rule.activeRow !== false);
  return (
    active.find(
      (rule) => chapterId != null && String(rule.chapterId) === String(chapterId),
    ) ??
    active[0] ??
    null
  );
};

const conditions = (rule) =>
  [1, 2, 3, 4].map((index) => rule?.[`condition${index}`]).filter(Boolean);

// How many accounts the attribute belongs in: one per condition with an
// arithmetic. null means no limit (no rule, or no arithmetic set).
export const ruleDropCount = (rule) => {
  const count = conditions(rule).filter((condition) => condition.arithmetic != null).length;
  return count > 0 ? count : null;
};

// The accounts a student can pick, one per table, in condition order.
export const ruleAccountTables = (rule) =>
  conditions(rule)
    .filter((condition) => condition.tableId != null && condition.tableName)
    .map((condition) => ({ id: condition.tableId, name: condition.tableName }))
    .filter(
      (table, index, tables) =>
        index === tables.findIndex((item) => String(item.id) === String(table.id)),
    );
