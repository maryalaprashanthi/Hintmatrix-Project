import { useEffect, useRef } from "react";

// Shared by journal and dropdown practice solutions.
export default function useAnswerRowScroll(answeredData, answerScrollTarget) {
  const answerRows = useRef({});
  const lastScrolledTarget = useRef(null);

  useEffect(() => {
    // Only explicit new-answer requests scroll, never initial loading/reset.
    if (!answerScrollTarget || lastScrolledTarget.current === answerScrollTarget) return;
    const { questionAttributeId, particulars } = answerScrollTarget;
    const entries = answeredData?.[questionAttributeId] || [];
    const index = entries.findIndex((entry) => entry.particulars === particulars);
    if (index < 0) return;
    const frame = requestAnimationFrame(() => {
      const row = answerRows.current[`${questionAttributeId}-${index}`];
      if (!row) return;
      lastScrolledTarget.current = answerScrollTarget;
      row.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [answerScrollTarget, answeredData]);

  return answerRows;
}
