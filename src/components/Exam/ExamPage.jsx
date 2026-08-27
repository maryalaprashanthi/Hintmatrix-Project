import { useEffect, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiFlag,
  FiMaximize,
  FiMinimize,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import ExamQuestionRenderer from "./ExamQuestionRenderer";
import Timer from "./Timer";
import { examQuestionIds, loadSampleQuestions } from "./sampleData";
import styles from "./ExamPage.module.css";

const ExamPage = () => {
  const location = useLocation();
  const shellRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewed, setReviewed] = useState(new Set());
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const load = async () => {
      try {
        setQuestions(await loadSampleQuestions());
      } catch (loadError) {
        console.error("Failed to load exam questions:", loadError);
        setError(
          "Unable to load exam questions. Please refresh and try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);
  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    sync();
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  useEffect(() => {
    if (location.state?.fullscreenRequested && !document.fullscreenElement)
      void shellRef.current?.requestFullscreen().catch(() => {});
  }, [location.state]);

  const activeQuestion = questions[activeIndex];
  const toggleReview = () =>
    activeQuestion &&
    setReviewed((current) => {
      const next = new Set(current);
      next.has(activeQuestion.id)
        ? next.delete(activeQuestion.id)
        : next.add(activeQuestion.id);
      return next;
    });
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shellRef.current?.requestFullscreen();
  };

  return (
    <main className={styles["exam-page-shell"]} ref={shellRef}>
      <section className={styles["exam-page"]} aria-label="Exam workspace">
        <header className={styles["exam-status-bar"]}>
          <span className={styles["exam-status-item"]}>
            <FiAlertTriangle />
            Warnings <strong>{reviewed.size}</strong>
          </span>
          <Timer />
          <button
            className={styles["exam-fullscreen-button"]}
            onClick={toggleFullscreen}
            type="button"
          >
            {fullscreen ? <FiMinimize /> : <FiMaximize />}
            {fullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </header>
        <aside
          className={styles["exam-navigator"]}
          aria-label="Question navigator"
        >
          <div className={styles["exam-navigator-heading"]}>
            <span>Question navigator</span>
            <small>0/{examQuestionIds.length} answered</small>
          </div>
          <div className={styles["exam-question-grid"]}>
            {examQuestionIds.map((id, index) => (
              <button
                className={[
                  styles["exam-question-number"],
                  index === activeIndex && styles["is-active"],
                  reviewed.has(id) && styles["is-reviewed"],
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={id}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                {index + 1}
                {reviewed.has(id) && <FiFlag />}
              </button>
            ))}
          </div>
          <div className={styles["exam-legend"]}>
            <span>
              <i className={styles["is-current"]} />
              Current
            </span>
            <span>
              <i className={styles["is-complete"]} />
              Answered
            </span>
            <span>
              <i className={styles["is-flagged"]} />
              Review
            </span>
          </div>
        </aside>
        <section className={styles["exam-question-panel"]} aria-live="polite">
          <div className={styles["exam-question-header"]}>
            <span className={styles["exam-question-title"]}>I am question</span>
            <span>{loading ? "Loading" : "In progress"}</span>
          </div>
          <div className={styles["exam-question-content"]}>
            {error ? (
              <p role="alert">{error}</p>
            ) : loading ? (
              <p>Loading exam questions…</p>
            ) : (
              activeQuestion && (
                <ExamQuestionRenderer
                  key={activeQuestion.id}
                  questionId={activeQuestion.id}
                />
              )
            )}
          </div>
          <footer className={styles["exam-question-actions"]}>
            <button
              className={[
                styles["exam-review-button"],
                activeQuestion &&
                  reviewed.has(activeQuestion.id) &&
                  styles["is-marked"],
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={toggleReview}
              type="button"
            >
              <FiFlag />
              {activeQuestion && reviewed.has(activeQuestion.id)
                ? "Remove review mark"
                : "Mark for review"}
            </button>
            <div className={styles["exam-pagination"]}>
              <button
                disabled={activeIndex === 0}
                onClick={() =>
                  setActiveIndex((index) => Math.max(0, index - 1))
                }
                type="button"
              >
                <FiChevronLeft />
                Previous
              </button>
              <button
                disabled={activeIndex === examQuestionIds.length - 1}
                onClick={() =>
                  setActiveIndex((index) =>
                    Math.min(examQuestionIds.length - 1, index + 1),
                  )
                }
                type="button"
              >
                Next
                <FiChevronRight />
              </button>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
};

export default ExamPage;
