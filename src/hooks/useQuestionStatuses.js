import { useEffect, useState } from "react";
import PracticePerformanceService from "../services/PracticePerformanceService";

export const useQuestionStatuses = (topicId, enabled) => {
  const [state, setState] = useState({ items: new Map(), loading: true, error: "" });
  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    let version = 0;
    setState({ items: new Map(), loading: true, error: "" });
    const refresh = async () => {
      const request = ++version;
      try {
        const { data } = await PracticePerformanceService.getMyQuestionStatuses(topicId);
        if (active && request === version) {
          setState({ items: new Map(data.map((item) => [String(item.questionId), item])), loading: false, error: "" });
        }
      } catch {
        if (active && request === version) {
          setState({ items: new Map(), loading: false, error: "Unable to load answer statuses. Please refresh to retry." });
        }
      }
    };
    const onStorage = (event) => { if (event.key === "practice-progress-changed") void refresh(); };
    void refresh();
    window.addEventListener("practice-progress-changed", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener("practice-progress-changed", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, [topicId, enabled]);
  return state;
};
