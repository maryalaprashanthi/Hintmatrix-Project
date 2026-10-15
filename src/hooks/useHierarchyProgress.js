import { useCallback, useEffect, useMemo, useState } from "react";
import PracticePerformanceService from "../services/PracticePerformanceService";

const asItems = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data?.items)) return value.data.items;
  return [];
};

const clampPercentage = (value) =>
  Math.min(100, Math.max(0, Number(value) || 0));

/**
 * Current fully completed questions / active questions, not historical attempts.
 */
export const useHierarchyProgress = (level, params = {}, enabled = true) => {
  const parameterKey = useMemo(() => JSON.stringify(params), [params]);
  const [progressById, setProgressById] = useState(() => new Map());

  useEffect(() => {
    if (!enabled) {
      setProgressById(new Map());
      return undefined;
    }

    let cancelled = false;
    const requestParams = JSON.parse(parameterKey);

    let requestVersion = 0;
    const refresh = () => {
      const version = ++requestVersion;
      return PracticePerformanceService.getMyQuestionCompletion(level, requestParams)
        .then((response) => {
          if (cancelled || version !== requestVersion) return;

          setProgressById(
            new Map(
              asItems(response.data).map((item) => [
                String(item.id),
                clampPercentage(item.completionPercentage),
              ]),
            ),
          );
        })
        .catch(() => {
          if (!cancelled && version === requestVersion) setProgressById(new Map());
        });
    };
    const onStorage = (event) => {
      if (event.key === "practice-progress-changed") void refresh();
    };
    void refresh();
    window.addEventListener("practice-progress-changed", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener("practice-progress-changed", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, [level, parameterKey, enabled]);

  return useCallback(
    (id) => progressById.get(String(id)) ?? 0,
    [progressById],
  );
};
