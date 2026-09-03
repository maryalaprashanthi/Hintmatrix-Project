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
              <li key={exam.examId}>
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ExamCatalog;
