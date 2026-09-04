import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ExamService from "../../services/ExamService";
import "./ExamCatalog.css";

// The exams list only tells us when a paper's window opens and closes, so the
// pill describes availability rather than a grade the student hasn't earned yet.
const windowState = (start, end) => {
  const now = Date.now();
  const opensAt = start ? new Date(start).getTime() : null;
  const closesAt = end ? new Date(end).getTime() : null;

  if (opensAt && !Number.isNaN(opensAt) && now < opensAt) {
    return { key: "soon", label: "Opens soon" };
  }
  if (closesAt && !Number.isNaN(closesAt) && now > closesAt) {
    return { key: "closed", label: "Closed" };
  }
  return { key: "open", label: "Open now" };
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

function ExamCatalog() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [status, setStatus] = useState("loading");
  const [deletingId, setDeletingId] = useState(null);

  const canManage = MANAGER_ROLES.includes(currentRole());

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

  const deleteExam = async (exam) => {
    const confirmed = window.confirm(
      `Delete "${exam.examName}"? This can't be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(exam.examId);
    try {
      await ExamService.delete(exam.examId);
      setExams((current) =>
        current.filter((item) => item.examId !== exam.examId),
      );
    } catch (error) {
      console.error("Failed to delete exam:", error);
      window.alert(
        error?.response?.data?.message ||
          "We couldn't delete this paper. Try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

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

            return (
              <li key={exam.examId} className="exam-catalog__cell">
                <button
                  type="button"
                  className="exam-card"
                  data-state={state.key}
                  onClick={() => openExam(exam.examId)}
                >
                  <span className="exam-card__course">
                    {exam.courseName || "Practice"}
                  </span>
                  <span className="exam-card__title">{exam.examName}</span>

                  <span className="exam-card__rule" />

                  <span className="exam-card__window">
                    <span className="exam-card__date">
                      <span className="exam-card__date-key">Opens</span>
                      <span className="exam-card__date-value">
                        {formatDate(exam.startDate)}
                      </span>
                    </span>
                    <span className="exam-card__date">
                      <span className="exam-card__date-key">Closes</span>
                      <span className="exam-card__date-value">
                        {formatDate(exam.endDate)}
                      </span>
                    </span>
                  </span>

                  <span className="exam-card__foot">
                    <span className="exam-card__pill">{state.label}</span>
                    <span className="exam-card__cta">Start paper</span>
                  </span>
                </button>

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
                      onClick={() => deleteExam(exam)}
                      disabled={deletingId === exam.examId}
                    >
                      {deletingId === exam.examId ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ExamCatalog;
