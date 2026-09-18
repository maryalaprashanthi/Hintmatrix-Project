import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
  FaClock,
  FaTimesCircle,
  FaTrophy,
} from "react-icons/fa";

import ExamService from "../../services/ExamService";
import MockExamService from "../../services/MockExamService";
import { questionTypeOf } from "../../components/Exam/ExamComponents/questionTypeOf";
import AttributeMistakePanel from "./AttributeMistakePanel";
import ReadOnlyDragDropAnswer from "./ReadOnlyDragDropAnswer";
import ReadOnlyLedgerAnswer from "./ReadOnlyLedgerAnswer";
import ReadOnlyMcqAnswer from "./ReadOnlyMcqAnswer";
import "./ExamReview.css";

const formatDuration = (seconds) => {
  if (!Number.isFinite(Number(seconds))) return "—";
  const total = Math.max(0, Math.round(Number(seconds)));
  return `${Math.floor(total / 60)}m ${total % 60}s`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Reads whichever exam type the URL names (/exams/... vs /mock-exams/...) so
// one component serves both review routes.
function ExamReview() {
  const { examId, resultId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isMock = pathname.startsWith("/mock-exams");
  const service = isMock ? MockExamService : ExamService;
  const catalogPath = isMock ? "/mock-exams" : "/exams";

  const [status, setStatus] = useState("loading");
  const [review, setReview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState("all");
  const [attributeDetail, setAttributeDetail] = useState(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");

    Promise.all([
      service.getResultReview(examId, resultId),
      service.getExamQuestions(examId),
    ])
      .then(([reviewResponse, questionsResponse]) => {
        if (!active) return;

        const reviewData = reviewResponse?.data ?? {};
        const rawQuestions = Array.isArray(questionsResponse?.data)
          ? questionsResponse.data
          : [];

        const reviewByQuestionId = new Map(
          (reviewData.questions ?? []).map((entry) => [
            String(entry.questionId),
            entry,
          ]),
        );

        const merged = rawQuestions.map((question, index) => {
          const entry = reviewByQuestionId.get(String(question.questionId));
          // The backend only returns an entry for a question that actually
          // has AnswerEvent rows - a question the candidate left untouched
          // has none, so entry?.questionType is null here even though the
          // paper itself always knows the real type. Falling back to that
          // keeps an unattempted Journal/Dropdown/MCQ question rendering as
          // itself (showing "Not attempted") instead of defaulting to the
          // drag-and-drop view.
          return {
            index,
            question,
            questionType: entry?.questionType ?? questionTypeOf(question),
            correct: Boolean(entry?.correct),
            answers: entry?.answers ?? [],
            correctOptionIds: entry?.correctOptionIds ?? [],
          };
        });

        setReview(reviewData);
        setQuestions(merged);
        setActiveIndex(0);
        setStatus("ready");
      })
      .catch((error) => {
        console.error("Failed to load exam review:", error);
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, resultId, isMock]);

  const incorrectCount = useMemo(
    () => questions.filter((q) => !q.correct).length,
    [questions],
  );
  const correctCount = questions.length - incorrectCount;

  const visibleQuestions = useMemo(() => {
    if (filter === "incorrect") return questions.filter((q) => !q.correct);
    if (filter === "correct") return questions.filter((q) => q.correct);
    return questions;
  }, [questions, filter]);

  const active = questions[activeIndex];

  const goToIndex = (index) => {
    setActiveIndex(index);
    setAttributeDetail(null);
  };

  const handleAttributeClick = (attributeId) => {
    if (attributeDetail?.attributeId === attributeId) {
      setAttributeDetail(null);
      return;
    }

    setAttributeDetail({ attributeId, status: "loading", hints: [], mistakes: [] });

    service
      .getAttributeReviewDetail(
        examId,
        resultId,
        active.question.questionId,
        attributeId,
      )
      .then((response) => {
        setAttributeDetail({
          attributeId,
          status: "ready",
          hints: response.data?.hints ?? [],
          mistakes: response.data?.mistakes ?? [],
        });
      })
      .catch((error) => {
        console.error("Failed to load attribute review detail:", error);
        setAttributeDetail({
          attributeId,
          status: "error",
          hints: [],
          mistakes: [],
        });
      });
  };

  if (status === "loading") {
    return <div className="exam-review-status">Loading your review…</div>;
  }

  if (status === "error" || !review || !active) {
    return (
      <div className="exam-review-status" role="alert">
        We couldn&rsquo;t load this review. Refresh to try again.
      </div>
    );
  }

  const subject =
    active.question?.subjectName ||
    active.question?.courseName ||
    review.courseName;

  return (
    <div className="exam-review">
      <header className="exam-review__topbar">
        <button
          type="button"
          className="exam-review__back"
          onClick={() => navigate(catalogPath)}
        >
          <FaArrowLeft aria-hidden="true" /> Back to Dashboard
        </button>

        <div className="exam-review__title">
          <div className="exam-review__title-icon">
            <FaClipboardList aria-hidden="true" />
          </div>
          <div>
            <h1>Exam Review</h1>
            <p>Review your answers, identify mistakes, and improve your understanding.</p>
          </div>
        </div>

        <div className="exam-review__stats">
          <div className="exam-review__stat">
            <span className="exam-review__stat-icon exam-review__stat-icon--gold">
              <FaTrophy aria-hidden="true" />
            </span>
            <div>
              <div className="exam-review__stat-label">Score</div>
              <div className="exam-review__stat-value">
                {Math.round(review.totalMarks ?? 0)} /{" "}
                {Math.round(review.maximumMarks ?? questions.length)}
                <span className="exam-review__stat-sub">
                  {Math.round(review.percentage ?? 0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="exam-review__stat">
            <span className="exam-review__stat-icon exam-review__stat-icon--blue">
              <FaClock aria-hidden="true" />
            </span>
            <div>
              <div className="exam-review__stat-label">Time Taken</div>
              <div className="exam-review__stat-value">
                {formatDuration(review.timeTakenSeconds)}
              </div>
            </div>
          </div>

          <div className="exam-review__stat">
            <span className="exam-review__stat-icon exam-review__stat-icon--blue">
              <FaCalendarAlt aria-hidden="true" />
            </span>
            <div>
              <div className="exam-review__stat-label">Completed On</div>
              <div className="exam-review__stat-value">
                {formatDate(review.completedAt)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="exam-review__body">
        <aside className="exam-review__sidebar">
          <div className="exam-review__filters">
            <button
              type="button"
              className={filter === "all" ? "is-active" : ""}
              onClick={() => setFilter("all")}
            >
              All Questions ({questions.length})
            </button>
            <button
              type="button"
              className={`exam-review__filter--incorrect ${
                filter === "incorrect" ? "is-active" : ""
              }`}
              onClick={() => setFilter("incorrect")}
            >
              <span className="exam-review__filter-dot">
                <FaTimesCircle aria-hidden="true" />
              </span>
              Incorrect ({incorrectCount})
            </button>
            <button
              type="button"
              className={`exam-review__filter--correct ${
                filter === "correct" ? "is-active" : ""
              }`}
              onClick={() => setFilter("correct")}
            >
              <span className="exam-review__filter-dot">
                <FaCheckCircle aria-hidden="true" />
              </span>
              Correct ({correctCount})
            </button>
          </div>

          <ul className="exam-review__list">
            {visibleQuestions.map((item) => (
              <li key={item.question.questionId}>
                <button
                  type="button"
                  className={`exam-review__list-item ${
                    item.index === activeIndex ? "is-active" : ""
                  } ${item.correct ? "is-correct" : "is-incorrect"}`}
                  onClick={() => goToIndex(item.index)}
                >
                  <span className="exam-review__list-number">
                    {item.index + 1}
                  </span>
                  <span className="exam-review__list-title">
                    {item.question.questionText}
                  </span>
                  <span className="exam-review__list-badge">
                    {item.correct ? "Correct" : "Incorrect"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="exam-review__main">
          <div className="exam-review__question-head">
            <div>
              <span className="exam-review__question-number">
                Question {activeIndex + 1} of {questions.length}
              </span>
              <span
                className={`exam-review__badge ${
                  active.correct ? "exam-review__badge--correct" : "exam-review__badge--incorrect"
                }`}
              >
                {active.correct ? (
                  <FaCheckCircle aria-hidden="true" />
                ) : (
                  <FaTimesCircle aria-hidden="true" />
                )}
                {active.correct ? "Correct" : "Incorrect"}
              </span>
            </div>
            {subject && (
              <span className="exam-review__subject">Subject: {subject}</span>
            )}
          </div>

          <h2 className="exam-review__question-text">
            {active.question.questionText}
          </h2>

          <div className="exam-review__answer">
            {active.questionType === "JOURNAL" ||
            active.questionType === "DROPDOWN" ? (
              <ReadOnlyLedgerAnswer
                question={active.question}
                answers={active.answers}
                onAttributeClick={handleAttributeClick}
                selectedAttributeId={attributeDetail?.attributeId}
              />
            ) : active.questionType === "SINGLE_CHOICE" ||
              active.questionType === "MULTIPLE_CHOICE" ? (
              <ReadOnlyMcqAnswer
                question={active.question}
                answers={active.answers}
                correctOptionIds={active.correctOptionIds}
              />
            ) : (
              <ReadOnlyDragDropAnswer
                question={active.question}
                answers={active.answers}
                onAttributeClick={handleAttributeClick}
                selectedAttributeId={attributeDetail?.attributeId}
              />
            )}
          </div>

          {attributeDetail && (
            <AttributeMistakePanel
              status={attributeDetail.status}
              hints={attributeDetail.hints}
              mistakes={attributeDetail.mistakes}
            />
          )}

          <div className="exam-review__nav">
            <button
              type="button"
              className="exam-review__nav-btn"
              disabled={activeIndex === 0}
              onClick={() => goToIndex(Math.max(0, activeIndex - 1))}
            >
              <FaChevronLeft aria-hidden="true" /> Previous Question
            </button>
            <button
              type="button"
              className="exam-review__nav-btn exam-review__nav-btn--primary"
              disabled={activeIndex >= questions.length - 1}
              onClick={() =>
                goToIndex(Math.min(questions.length - 1, activeIndex + 1))
              }
            >
              Next Question <FaChevronRight aria-hidden="true" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ExamReview;
