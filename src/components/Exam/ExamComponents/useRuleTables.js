import { useCallback, useEffect, useState } from "react";
import { fetchAttributeRules, pickRule, ruleAccountTables } from "./examRules";

// Loads the ledger accounts for the given attributes from the rule engine.
// The component that calls it mounts only when the student opens a
// transaction, so the first open sends the requests and later opens reuse
// them (see examRules). With several attributes, the result is every account
// that any of them can use, once each.
//
// status is "loading", "ready" or "error". retry sends the failed requests
// again.
export const useRuleTables = (attributeIds, chapterId, onReady) => {
  const key = attributeIds.map(String).join(",");
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: "loading", tables: [] });

  useEffect(() => {
    let active = true;
    setState({ status: "loading", tables: [] });
    const ids = key ? key.split(",") : [];

    Promise.all(ids.map((attributeId) => fetchAttributeRules(attributeId)))
      .then((ruleLists) => {
        if (!active) return;
        const tables = ruleLists
          .flatMap((rules) => ruleAccountTables(pickRule(rules, chapterId)))
          .filter(
            (table, index, all) =>
              index === all.findIndex((item) => String(item.id) === String(table.id)),
          );
        setState({ status: "ready", tables });
        onReady?.(tables);
      })
      .catch((error) => {
        if (!active) return;
        console.error("Failed to load the accounts for this transaction:", error);
        setState({ status: "error", tables: [] });
      });

    return () => {
      active = false;
    };
    // onReady is a callback from the parent; a new identity must not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, chapterId, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  return { ...state, retry };
};
