import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCalendarAlt, FaPlay, FaRegFileAlt } from "react-icons/fa";

import ExamService from "../../services/ExamService";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import "./ExamCatalog.css";

// The exams list only tells us when a paper's window opens and closes, so the
// pill describes availability rather than a grade the student hasn't earned yet.
const windowState = (start, end) => {
  const now = Date.now();
  const opensAt = start ? new Date(start).getTime() : null;
  const closesAt = end ? new Date(end).getTime() : null;

  if (opensAt && !Number.isNaN(opensAt) && now < opensAt) {
    return {
      key: "soon",
      label: "Opens soon",
      lockedTitle: "This exam hasn't opened yet",
      lockedNote: "Come back once the exam window opens.",
    };
  }
  if (closesAt && !Number.isNaN(closesAt) && now > closesAt) {
    return {
      key: "closed",
      label: "Closed",
      lockedTitle: "This exam is closed",
      lockedNote: "The exam is no longer available.",
    };
  }
  return { key: "open", label: "Open Now" };
};

// Managing papers (edit / delete) is an admin job. Students only ever pick a
// paper to sit, so the controls never render for them.
const MANAGER_ROLES = ["SUPER_ADMIN", "COLLEGE_ADMIN", "BRANCH_ADMIN"];

const currentRole = () =>
  (localStorage.getItem("role") || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

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

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function ExamCatalog() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [status, setStatus] = useState("loading");

  const canManage = MANAGER_ROLES.includes(currentRole());

  const del = useDeleteConfirm({
    entity: "paper",
    deleteFn: (exam) => ExamService.delete(exam.examId),
    onDeleted: (exam) =>
      setExams((current) =>
        current.filter((item) => item.examId !== exam.examId),
      ),
  });

  const loadExams = useCallback(() => {
    let active = true;
    setStatus("loading");

    ExamService.getAll()
      .then((response) => {
        if (!active) return;
        setExams(Array.isArray(response.data) ? response.data : []);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        console.error("Failed to load exams:", error);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => loadExams(), [loadExams]);

  const openExam = (examId) => navigate(`/exams/${examId}`);
  const editExam = (examId) => navigate(`/exam-paper/${examId}`);

  return (
    <div className="exam-catalog">
      <header className="exam-catalog__head">
        <h1>Choose a paper</h1>
        <p>
          {status === "ready" && exams.length > 0
            ? `${exams.length} ${exams.length === 1 ? "paper" : "papers"} published for you.`
            : "Every paper your college has published shows up here."}
        </p>
      </header>

      {status === "loading" && (
        <ul className="exam-catalog__grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="exam-card exam-card--skeleton">
              <span className="exam-card__line exam-card__line--title" />
              <span className="exam-card__line exam-card__line--sub" />
              <span className="exam-card__rule" />
              <span className="exam-card__line exam-card__line--foot" />
            </li>
          ))}
        </ul>
      )}

      {status === "error" && (
        <div className="exam-catalog__notice" role="alert">
          <h2>We couldn&rsquo;t load your papers</h2>
          <p>Check your connection, then try again.</p>
          <button type="button" className="exam-catalog__retry-btn" onClick={loadExams}>
            Try again
          </button>
        </div>
      )}

      {status === "ready" && exams.length === 0 && (
        <div className="exam-catalog__notice">
          <h2>No papers yet</h2>
          <p>New papers appear here as soon as your college publishes them.</p>
        </div>
      )}

      {status === "ready" && exams.length > 0 && (
        <ul className="exam-catalog__grid">
          {exams.map((exam) => {
            const state = windowState(exam.startDate, exam.endDate);
            const isOpen = state.key === "open";

            return (
              <li key={exam.examId} className="exam-catalog__cell">
                <article className="exam-card" data-state={state.key}>
                  <span className="exam-card__icon" aria-hidden="true">
                    <FaRegFileAlt />
                  </span>

                  <div className="exam-card__body">
                    <span className="exam-card__course">
                      {exam.courseName || "Practice"}
                    </span>
                    <h2 className="exam-card__title">{exam.examName}</h2>
                    <p className="exam-card__desc">
                      Test your knowledge and complete the exam within the given
                      time.
                    </p>

                    <div className="exam-card__window">
                      <div className="exam-card__date">
                        <FaRegCalendarAlt
                          className="exam-card__date-icon"
                          aria-hidden="true"
                        />
                        <span className="exam-card__date-text">
                          <span className="exam-card__date-key">Opens</span>
                          <span className="exam-card__date-value">
                            {formatDate(exam.startDate)}
                          </span>
                          <span className="exam-card__date-time">
                            {formatTime(exam.startDate)}
                          </span>
                        </span>
                      </div>

                      <span
                        className="exam-card__date-sep"
                        aria-hidden="true"
                      />

                      <div className="exam-card__date">
                        <FaRegCalendarAlt
                          className="exam-card__date-icon"
                          aria-hidden="true"
                        />
                        <span className="exam-card__date-text">
                          <span className="exam-card__date-key">Closes</span>
                          <span className="exam-card__date-value">
                            {formatDate(exam.endDate)}
                          </span>
                          <span className="exam-card__date-time">
                            {formatTime(exam.endDate)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="exam-card__aside">
                    <span className="exam-card__pill">
                      {isOpen && <span className="exam-card__pill-dot" />}
                      {state.label}
                    </span>

                    <p className="exam-card__aside-note">
                      {isOpen
                        ? "You can start the exam now."
                        : state.lockedNote}
                    </p>

                    {isOpen && (
                      <button
                        type="button"
                        className="exam-card__start"
                        onClick={() => openExam(exam.examId)}
                      >
                        <FaPlay aria-hidden="true" />
                        <span>Start Paper</span>
                      </button>
                    )}

                    {canManage && (
                      <div className="exam-card__admin">
                        <button
                          type="button"
                          className="exam-card__admin-btn"
                          onClick={() => editExam(exam.examId)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="exam-card__admin-btn exam-card__admin-btn--danger"
                          onClick={() => del.request(exam)}
                          disabled={del.pending?.examId === exam.examId}
                        >
                          {del.pending?.examId === exam.examId && del.deleting
                            ? "Deleting…"
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.examName || "this paper"}"?`}
        body="Students will no longer be able to sit this paper. This can't be undone."
        confirmLabel="Delete paper"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default ExamCatalog;
