import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaChevronRight,
  FaRedo,
  FaSearch,
} from "react-icons/fa";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import { getApiErrorMessage } from "../../utils/apiError";
import { getCurrentUserId } from "../../utils/user";
import "./ErrorList.css";

// =========================================================
// GET MISTAKES FROM API RESPONSE
// =========================================================

const getMistakes = (response) => {
  if (Array.isArray(response)) {
    return response.filter((mistake) => mistake && typeof mistake === "object");
  }

  for (const key of ["content", "data", "items", "mistakes"]) {
    if (Array.isArray(response?.[key])) {
      return response[key].filter(
        (mistake) => mistake && typeof mistake === "object",
      );
    }
  }

  throw new Error("The error list response has an unexpected format.");
};

const getDisplayText = (value, fallback = "—") => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
};

const getChapterName = (mistake) =>
  getDisplayText(mistake.chapterName, "Unknown chapter");

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

const getTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

// =========================================================
// GET CHAPTER KEY
// =========================================================

const getChapterKey = (mistake) => {
  if (mistake.chapterId !== null && mistake.chapterId !== undefined) {
    return String(mistake.chapterId);
  }

  return `name-${encodeURIComponent(getChapterName(mistake).toLowerCase())}`;
};

export default function ErrorList() {
  const { chapterKey } = useParams();

  const userId = getCurrentUserId();

  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [chapterSearch, setChapterSearch] = useState("");
  const [mistakeSearch, setMistakeSearch] = useState("");
  const [dateOrder, setDateOrder] = useState("newest");
  const [chapterSearch, setChapterSearch] = useState("");
  const [mistakeSearch, setMistakeSearch] = useState("");
  const [dateOrder, setDateOrder] = useState("newest");

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
            getApiErrorMessage(
              requestError,
              "Could not load your errors. Please check your connection and try again.",
            ),
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
  }, [userId, reloadKey]);

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
          name: getChapterName(mistake),
          count: 0,
        });
      }

      groups.get(key).count += 1;
    });

    return Array.from(groups.values());
  }, [mistakes]);

  const filteredChapters = useMemo(() => {
    const query = chapterSearch.trim().toLowerCase();
    if (!query) {
      return chapters;
    }

    return chapters.filter((chapter) =>
      chapter.name.toLowerCase().includes(query),
    );
  }, [chapters, chapterSearch]);

  const topicCount = useMemo(
    () =>
      new Set(
        mistakes.map((mistake) =>
          mistake.topicId !== null && mistake.topicId !== undefined
            ? String(mistake.topicId)
            : getDisplayText(mistake.topicName, "Unknown topic").toLowerCase(),
        ),
      ).size,
    [mistakes],
  );

  const filteredChapters = useMemo(() => {
    const query = chapterSearch.trim().toLowerCase();
    if (!query) {
      return chapters;
    }

    return chapters.filter((chapter) =>
      chapter.name.toLowerCase().includes(query),
    );
  }, [chapters, chapterSearch]);

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

  const filteredChapterMistakes = useMemo(() => {
    const query = mistakeSearch.trim().toLowerCase();
    const filtered = chapterMistakes.filter((mistake) => {
      if (!query) {
        return true;
      }

      return [
        mistake.topicName,
        mistake.attributeName,
        mistake.questionText,
        mistake.userAnswer,
      ].some((value) => getDisplayText(value, "").toLowerCase().includes(query));
    });

    return filtered.sort((first, second) =>
      dateOrder === "newest"
        ? getTimestamp(second.createdAt) - getTimestamp(first.createdAt)
        : getTimestamp(first.createdAt) - getTimestamp(second.createdAt),
    );
  }, [chapterMistakes, dateOrder, mistakeSearch]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="error-list-page" aria-busy="true">
        <header className="error-list-header">
          <div>
            <p className="error-list-eyebrow">PRACTICE REVIEW</p>

            <h1>Error List</h1>

            <p className="error-list-description">
              Review your mistakes and revisit the questions.
            </p>
          </div>
        </header>

        <div className="error-list-state" role="status">
          <span className="error-list-spinner" aria-hidden="true" />
          Loading your errors...
        </div>
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

        <div className="error-list-state error-list-state--error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-outline-primary error-list-retry"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <FaRedo aria-hidden="true" />
            Try again
          </button>
        </div>
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

        <div className="error-list-empty">
          <span className="error-list-empty-icon" aria-hidden="true">
            <FaChevronRight />
          </span>
          <h2>You&apos;re all caught up</h2>
          <p>
            No incorrect attempts found yet. Keep practicing to track your
            progress.
          </p>
        </div>
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
            <FaArrowLeft aria-hidden="true" />
            All chapters
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
            <FaArrowLeft aria-hidden="true" />
            All chapters
          </Link>

          <h2>{selectedChapter.name}</h2>

          {/* =================================================
            MISTAKE TABLE
          ================================================= */}

          <div className="error-list-table-wrap">
            <table className="error-list-table">
              <caption className="visually-hidden">
                Incorrect attempts in {selectedChapter.name}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>

                  <th scope="col">Topic</th>

                  <th scope="col">Attribute</th>

                  <th scope="col">Your Answer</th>

                  <th scope="col">Question</th>
                </tr>
              </thead>

              <tbody>
                {chapterMistakes.map((mistake, index) => {
                  const questionId = mistake.questionId;

                  const attributeName = getDisplayText(
                    mistake.attributeName,
                    "Unknown attribute",
                  );
                  const topicName = getDisplayText(mistake.topicName);
                  const questionText = getDisplayText(
                    mistake.questionText,
                    "Open question",
                  );
                  const hasQuestionId =
                    questionId !== null &&
                    questionId !== undefined &&
                    String(questionId).length > 0;

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
                        {hasQuestionId ? (
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

                      <td>{getDisplayText(mistake.userAnswer)}</td>

                      {/* QUESTION */}

                      <td>
                        {hasQuestionId ? (
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

              <span className="error-list-chapter-trailing">
                <span className="error-list-chapter-count">
                  {chapter.count} {chapter.count === 1 ? "mistake" : "mistakes"}
                </span>
                <FaChevronRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
