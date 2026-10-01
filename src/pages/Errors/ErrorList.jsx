import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import { getCurrentUserId } from "../../utils/user";
import "./ErrorList.css";

// =========================================================
// GET MISTAKES FROM API RESPONSE
// =========================================================

const getMistakes = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.mistakes)) {
    return response.mistakes;
  }

  return [];
};

// =========================================================
// FORMAT DATE
// =========================================================

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
};

// =========================================================
// GET CHAPTER KEY
// =========================================================

const getChapterKey = (mistake) => {
  if (mistake.chapterId !== null && mistake.chapterId !== undefined) {
    return String(mistake.chapterId);
  }

  return `name-${(mistake.chapterName || "Unknown chapter")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;
};

export default function ErrorList() {
  const { chapterKey } = useParams();

  const userId = getCurrentUserId();

  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD USER MISTAKES
  // =========================================================

  useEffect(() => {
    if (!userId) {
      setError(
        "Your user account could not be identified. Please sign in again.",
      );

      setLoading(false);

      return;
    }

    let active = true;

    const loadMistakes = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await QuestionAnswerService.getMistakesByUserId(userId);

        if (active) {
          setMistakes(getMistakes(response));
        }
      } catch (requestError) {
        console.error("Failed to load error list:", requestError);

        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Could not load your errors. Please check your connection and sign in again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMistakes();

    return () => {
      active = false;
    };
  }, [userId]);

  // =========================================================
  // GROUP MISTAKES BY CHAPTER
  // =========================================================

  const chapters = useMemo(() => {
    const groups = new Map();

    mistakes.forEach((mistake) => {
      const key = getChapterKey(mistake);

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          chapterId: mistake.chapterId,
          name: mistake.chapterName || "Unknown chapter",
          count: 0,
        });
      }

      groups.get(key).count += 1;
    });

    return Array.from(groups.values());
  }, [mistakes]);

  // =========================================================
  // SELECTED CHAPTER
  // =========================================================

  const selectedChapter = useMemo(() => {
    if (!chapterKey) {
      return null;
    }

    return chapters.find((chapter) => chapter.key === chapterKey);
  }, [chapters, chapterKey]);

  // =========================================================
  // MISTAKES FOR SELECTED CHAPTER
  // =========================================================

  const chapterMistakes = useMemo(() => {
    if (!selectedChapter) {
      return [];
    }

    return mistakes.filter(
      (mistake) => getChapterKey(mistake) === selectedChapter.key,
    );
  }, [mistakes, selectedChapter]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="error-list-page">
        <header className="error-list-header">
          <div>
            <p className="error-list-eyebrow">PRACTICE REVIEW</p>

            <h1>Error List</h1>

            <p className="error-list-description">
              Review your mistakes and revisit the questions.
            </p>
          </div>
        </header>

        <p className="error-list-state">Loading your errors…</p>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="error-list-page">
        <header className="error-list-header">
          <div>
            <p className="error-list-eyebrow">PRACTICE REVIEW</p>

            <h1>Error List</h1>
          </div>
        </header>

        <p className="error-list-state error-list-state--error" role="alert">
          {error}
        </p>
      </main>
    );
  }

  // =========================================================
  // NO MISTAKES
  // =========================================================

  if (mistakes.length === 0) {
    return (
      <main className="error-list-page">
        <header className="error-list-header">
          <div>
            <p className="error-list-eyebrow">PRACTICE REVIEW</p>

            <h1>Error List</h1>

            <p className="error-list-description">
              Review your mistakes and revisit the questions.
            </p>
          </div>

          <span className="error-list-total">0 mistakes</span>
        </header>

        <p className="error-list-state">No incorrect attempts found yet.</p>
      </main>
    );
  }

  // =========================================================
  // CHAPTER DETAILS
  // =========================================================

  if (chapterKey) {
    if (!selectedChapter) {
      return (
        <main className="error-list-page">
          <header className="error-list-header">
            <div>
              <p className="error-list-eyebrow">PRACTICE REVIEW</p>

              <h1>Error List</h1>
            </div>
          </header>

          <Link className="error-list-back" to="/errors">
            ← All chapters
          </Link>

          <p className="error-list-state">
            That chapter is not in your error list.
          </p>
        </main>
      );
    }

    return (
      <main className="error-list-page">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="error-list-header">
          <div>
            <p className="error-list-eyebrow">PRACTICE REVIEW</p>

            <h1>Error List</h1>

            <p className="error-list-description">{selectedChapter.name}</p>
          </div>

          <span className="error-list-total">
            {chapterMistakes.length} mistakes
          </span>
        </header>

        {/* =================================================
            BACK TO CHAPTERS
        ================================================= */}

        <section className="error-list-section">
          <Link className="error-list-back" to="/errors">
            ← All chapters
          </Link>

          <h2>{selectedChapter.name}</h2>

          {/* =================================================
              MISTAKE TABLE
          ================================================= */}

          <div className="error-list-table-wrap">
            <table className="error-list-table">
              <thead>
                <tr>
                  <th>Date</th>

                  <th>Topic</th>

                  <th>Attribute</th>

                  <th>Your Answer</th>

                  <th>Question</th>
                </tr>
              </thead>

              <tbody>
                {chapterMistakes.map((mistake, index) => {
                  const questionId = mistake.questionId;

                  const attributeName =
                    mistake.attributeName || "Unknown attribute";

                  const topicName = mistake.topicName || "—";

                  const questionText = mistake.questionText || "Open question";

                  return (
                    <tr
                      key={
                        mistake.answerEventId ||
                        `${questionId}-${mistake.attributeId}-${index}`
                      }
                    >
                      {/* DATE */}

                      <td>{formatDate(mistake.createdAt)}</td>

                      {/* TOPIC */}

                      <td>{topicName}</td>

                      {/* ATTRIBUTE */}

                      <td>
                        {questionId ? (
                          <Link
                            className="error-list-question-link"
                            to={`/questions/${questionId}`}
                          >
                            {attributeName}
                          </Link>
                        ) : (
                          attributeName
                        )}
                      </td>

                      {/* USER ANSWER */}

                      <td>{mistake.userAnswer || "—"}</td>

                      {/* QUESTION */}

                      <td>
                        {questionId ? (
                          <Link
                            className="error-list-question-link"
                            to={`/questions/${questionId}`}
                          >
                            {questionText}
                          </Link>
                        ) : (
                          questionText
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    );
  }

  // =========================================================
  // CHAPTER LIST
  // =========================================================

  return (
    <main className="error-list-page">
      <header className="error-list-header">
        <div>
          <p className="error-list-eyebrow">PRACTICE REVIEW</p>

          <h1>Error List</h1>

          <p className="error-list-description">
            Select a chapter to review your mistakes.
          </p>
        </div>

        <span className="error-list-total">{mistakes.length} mistakes</span>
      </header>

      {/* =================================================
          CHAPTERS
      ================================================= */}

      <section
        className="error-list-section"
        aria-label="Chapters with mistakes"
      >
        <div className="error-list-chapter-heading">
          <h2>Chapters</h2>

          <span className="error-list-chapter-count">
            {chapters.length} chapters
          </span>
        </div>

        <div className="error-list-chapters">
          {chapters.map((chapter) => (
            <Link
              className="error-list-chapter"
              key={chapter.key}
              to={`/errors/${encodeURIComponent(chapter.key)}`}
            >
              <div className="error-list-chapter-info">
                <span className="error-list-chapter-name">{chapter.name}</span>
              </div>

              <span className="error-list-chapter-count">{chapter.count}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
