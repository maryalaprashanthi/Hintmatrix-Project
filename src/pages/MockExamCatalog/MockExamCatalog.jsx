import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaRegFileAlt, FaRegCheckCircle, FaBookOpen } from "react-icons/fa";

import MockExamService from "../../services/MockExamService";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { CONTENT_MANAGER_ROLES, currentRole } from "../../utils/roles";
import "./MockExamCatalog.css";

// A mock exam is scoped only to a course + chapters + pass % (MockExamResponseDTO)
// - no schedule window - so every mock exam is always open to start.

function MockExamCatalog() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [status, setStatus] = useState("loading");

  // Edit / delete is an admin job - the same roles that can author content.
  // Students and guests only ever start a mock exam.
  const canManage = CONTENT_MANAGER_ROLES.includes(currentRole());

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

  const openExam = (mockExamId) => navigate(`/mock-exams/${mockExamId}`);
  const editExam = (mockExamId) => navigate(`/mock-exam-paper/${mockExamId}`);

  return (
    <div className="mock-exam-catalog">
      <header className="mock-exam-catalog__head">
        <h1>Practice mock exams</h1>
        <p>
          {status === "ready" && exams.length > 0
            ? `${exams.length} mock ${exams.length === 1 ? "exam" : "exams"} ready for you.`
            : "Every mock exam your college has published shows up here."}
        </p>
      </header>

      {status === "loading" && (
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

      {status === "error" && (
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

      {status === "ready" && exams.length === 0 && (
        <div className="mock-exam-catalog__notice">
          <h2>No mock exams yet</h2>
          <p>New mock exams appear here as soon as your college publishes them.</p>
        </div>
      )}

      {status === "ready" && exams.length > 0 && (
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
