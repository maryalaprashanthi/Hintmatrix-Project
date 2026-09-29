import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaPlay,
  FaRegFileAlt,
  FaRegCheckCircle,
  FaBookOpen,
  FaClipboardList,
} from "react-icons/fa";

import MockExamService from "../../services/MockExamService";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { canAccessFeature, currentRole } from "../../utils/roles";
import "./MockExamCatalog.css";

// A mock exam is scoped only to a course + chapters + pass % (MockExamResponseDTO)
// - no schedule window - so every mock exam is always open to start.

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function MockExamCatalog() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [status, setStatus] = useState("loading");

  // "Present" is the existing catalog below; "Past" is the student's own
  // completed attempts, each opening straight into that attempt's review
  // screen instead of the paper itself.
  // The tab lives in the URL (?tab=past) so the "Previous Exams" tile on
  // /exam and /mock-exam can deep-link straight to it.
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "past" ? "past" : "present";
  const [pastAttempts, setPastAttempts] = useState([]);
  const [pastStatus, setPastStatus] = useState("loading");

  // Edit / delete is an admin job - the same roles that can author content.
  // Students and guests only ever start a mock exam.
  const canManage = canAccessFeature("manageMockExams", currentRole());

  const del = useDeleteConfirm({
    entity: "mock exam",
    deleteFn: (exam) => MockExamService.delete(exam.mockExamId),
    onDeleted: (exam) =>
      setExams((current) =>
        current.filter((item) => item.mockExamId !== exam.mockExamId),
      ),
  });

  const loadExams = useCallback(() => {
    let active = true;
    setStatus("loading");

    MockExamService.getAll()
      .then((response) => {
        if (!active) return;
        setExams(Array.isArray(response.data) ? response.data : []);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        console.error("Failed to load mock exams:", error);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => loadExams(), [loadExams]);

  const loadPastAttempts = useCallback(() => {
    let active = true;
    setPastStatus("loading");

    MockExamService.getMyAttempts()
      .then((response) => {
        if (!active) return;
        setPastAttempts(Array.isArray(response.data) ? response.data : []);
        setPastStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        console.error("Failed to load past mock exams:", error);
        setPastStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => loadPastAttempts(), [loadPastAttempts]);

  const openExam = (mockExamId) => navigate(`/mock-exams/${mockExamId}`);
  const editExam = (mockExamId) => navigate(`/mock-exam-paper/${mockExamId}`);
  const openReview = (mockExamId, resultId) =>
    navigate(`/mock-exams/${mockExamId}/review/${resultId}`);

  return (
    <div className="mock-exam-catalog">
      <header className="mock-exam-catalog__head">
        <h1>Mock exams</h1>
        <p>
          {tab === "present"
            ? status === "ready" && exams.length > 0
              ? `${exams.length} mock ${exams.length === 1 ? "exam" : "exams"} ready for you.`
              : "Every mock exam your college has published shows up here."
            : "Every mock exam you've already completed shows up here."}
        </p>
      </header>


      {tab === "present" && status === "loading" && (
        <ul className="mock-exam-catalog__grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="mock-exam-card mock-exam-card--skeleton">
              <span className="mock-exam-card__line mock-exam-card__line--title" />
              <span className="mock-exam-card__line mock-exam-card__line--sub" />
              <span className="mock-exam-card__rule" />
              <span className="mock-exam-card__line mock-exam-card__line--foot" />
            </li>
          ))}
        </ul>
      )}

      {tab === "present" && status === "error" && (
        <div className="mock-exam-catalog__notice" role="alert">
          <h2>We couldn&rsquo;t load your mock exams</h2>
          <p>Check your connection, then try again.</p>
          <button
            type="button"
            className="mock-exam-catalog__retry-btn"
            onClick={loadExams}
          >
            Try again
          </button>
        </div>
      )}

      {tab === "present" && status === "ready" && exams.length === 0 && (
        <div className="mock-exam-catalog__notice">
          <h2>No mock exams yet</h2>
          <p>
            New mock exams appear here as soon as your college publishes them.
          </p>
        </div>
      )}

      {tab === "present" && status === "ready" && exams.length > 0 && (
        <ul className="mock-exam-catalog__grid">
          {exams.map((exam) => (
            <li key={exam.mockExamId} className="mock-exam-catalog__cell">
              <article className="mock-exam-card" data-state="open">
                <span className="mock-exam-card__icon" aria-hidden="true">
                  <FaRegFileAlt />
                </span>

                <div className="mock-exam-card__body">
                  <span className="mock-exam-card__course">
                    {exam.courseName || "Practice"}
                  </span>
                  <h2 className="mock-exam-card__title">{exam.mockExamName}</h2>

                  <div className="mock-exam-card__section">
                    <span className="mock-exam-card__section-label">
                      <FaBookOpen aria-hidden="true" />
                      Chapters to prepare
                    </span>
                    <div className="mock-exam-card__chapters">
                      {(exam.chapterNames?.length
                        ? exam.chapterNames
                        : ["All chapters"]
                      ).map((name, index) => (
                        <span
                          className="mock-exam-card__chapter"
                          key={exam.chapterIds?.[index] ?? name}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mock-exam-card__meta">
                    <span className="mock-exam-card__meta-item">
                      <FaRegCheckCircle aria-hidden="true" />
                      {exam.passPercentage}% to pass
                    </span>
                  </div>
                </div>

                <div className="mock-exam-card__aside">
                  <span className="mock-exam-card__pill">
                    <span className="mock-exam-card__pill-dot" />
                    Open Now
                  </span>

                  <p className="mock-exam-card__aside-note">
                    You can start this mock exam any time.
                  </p>

                  <button
                    type="button"
                    className="mock-exam-card__start"
                    onClick={() => openExam(exam.mockExamId)}
                  >
                    <FaPlay aria-hidden="true" />
                    <span>Start Mock Exam</span>
                  </button>

                  {canManage && (
                    <div className="mock-exam-card__admin">
                      <button
                        type="button"
                        className="mock-exam-card__admin-btn"
                        onClick={() => editExam(exam.mockExamId)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="mock-exam-card__admin-btn mock-exam-card__admin-btn--danger"
                        onClick={() => del.request(exam)}
                        disabled={del.pending?.mockExamId === exam.mockExamId}
                      >
                        {del.pending?.mockExamId === exam.mockExamId &&
                        del.deleting
                          ? "Deleting…"
                          : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {tab === "past" && pastStatus === "loading" && (
        <ul className="mock-exam-catalog__grid" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="mock-exam-card mock-exam-card--skeleton">
              <span className="mock-exam-card__line mock-exam-card__line--title" />
              <span className="mock-exam-card__line mock-exam-card__line--sub" />
              <span className="mock-exam-card__rule" />
              <span className="mock-exam-card__line mock-exam-card__line--foot" />
            </li>
          ))}
        </ul>
      )}

      {tab === "past" && pastStatus === "error" && (
        <div className="mock-exam-catalog__notice" role="alert">
          <h2>We couldn&rsquo;t load your past mock exams</h2>
          <p>Check your connection, then try again.</p>
          <button
            type="button"
            className="mock-exam-catalog__retry-btn"
            onClick={loadPastAttempts}
          >
            Try again
          </button>
        </div>
      )}

      {tab === "past" &&
        pastStatus === "ready" &&
        pastAttempts.length === 0 && (
          <div className="mock-exam-catalog__notice">
            <h2>No completed mock exams yet</h2>
            <p>
              Mock exams you&rsquo;ve finished will show up here for review.
            </p>
          </div>
        )}

      {tab === "past" && pastStatus === "ready" && pastAttempts.length > 0 && (
        <ul className="mock-exam-catalog__grid">
          {pastAttempts.map((attempt) => (
            <li key={attempt.resultId} className="mock-exam-catalog__cell">
              <article className="mock-exam-card" data-state="closed">
                <span className="mock-exam-card__icon" aria-hidden="true">
                  <FaClipboardList />
                </span>

                <div className="mock-exam-card__body">
                  <span className="mock-exam-card__course">Completed</span>
                  <h2 className="mock-exam-card__title">{attempt.examName}</h2>

                  <div className="mock-exam-card__meta">
                    <span className="mock-exam-card__meta-item">
                      <FaRegCheckCircle aria-hidden="true" />
                      Scored {Math.round(attempt.percentage ?? 0)}%
                    </span>
                    <span className="mock-exam-card__meta-item">
                      Completed {formatDate(attempt.completedAt)}
                    </span>
                  </div>
                </div>

                <div className="mock-exam-card__aside">
                  <span className="mock-exam-card__pill">Completed</span>

                  <p className="mock-exam-card__aside-note">
                    Review what you submitted and where you went wrong.
                  </p>

                  <button
                    type="button"
                    className="mock-exam-card__start mock-exam-card__start--review"
                    onClick={() => openReview(attempt.examId, attempt.resultId)}
                  >
                    <FaClipboardList aria-hidden="true" />
                    <span>Review</span>
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.mockExamName || "this mock exam"}"?`}
        body="Students will no longer be able to sit this mock exam. This can't be undone."
        confirmLabel="Delete mock exam"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default MockExamCatalog;
