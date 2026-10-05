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
 * Loads the same completion percentages used by Practice Performance and
 * exposes them by course/subject/chapter/topic id.
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

    PracticePerformanceService.getMyLevel(level, requestParams)
      .then((response) => {
        if (cancelled) return;

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
        if (!cancelled) setProgressById(new Map());
      });

    return () => {
      cancelled = true;
    };
  }, [level, parameterKey, enabled]);

  return useCallback(
    (id) => progressById.get(String(id)) ?? 0,
    [progressById],
  );
};
