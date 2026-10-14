import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaChevronRight,
  FaRedo,
} from "react-icons/fa";
import DataGrid from "../../components/DataGrid";
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

const getSubjectName = (mistake) => {
  const subject = mistake?.subject;
  return getDisplayText(
    mistake?.subjectName ??
      mistake?.subject_name ??
      (typeof subject === "object" ? subject?.name ?? subject?.subjectName : subject),
    "Unknown subject",
  );
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

const getTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const errorListColumns = [
  {
    field: "createdAt",
    headerName: "Date",
    flex: 0.9,
    minWidth: 155,
    sort: "desc",
    comparator: (first, second) => getTimestamp(first) - getTimestamp(second),
    valueFormatter: (params) => formatDate(params.value),
  },
  {
    field: "topicName",
    headerName: "Topic",
    flex: 1,
    minWidth: 130,
    valueGetter: (params) => getDisplayText(params.data?.topicName),
    tooltipValueGetter: (params) => getDisplayText(params.data?.topicName),
  },
  {
    colId: "subjectName",
    headerName: "Subject",
    flex: 1,
    minWidth: 130,
    valueGetter: (params) => getSubjectName(params.data),
    tooltipValueGetter: (params) => getSubjectName(params.data),
  },
  {
    field: "attributeName",
    headerName: "Attribute",
    flex: 1,
    minWidth: 140,
    valueGetter: (params) =>
      getDisplayText(params.data?.attributeName, "Unknown attribute"),
    cellRenderer: (params) => {
      const questionId = params.data?.questionId;
      const text = getDisplayText(params.value, "Unknown attribute");
      return questionId !== null && questionId !== undefined && String(questionId)
        ? <Link className="error-list-question-link" to={`/questions/${questionId}`}>{text}</Link>
        : text;
    },
  },
  {
    field: "userAnswer",
    headerName: "Your Answer",
    flex: 1,
    minWidth: 140,
    valueGetter: (params) => getDisplayText(params.data?.userAnswer),
    tooltipValueGetter: (params) => getDisplayText(params.data?.userAnswer),
  },
  {
    field: "questionText",
    headerName: "Question",
    flex: 1.6,
    minWidth: 200,
    valueGetter: (params) => getDisplayText(params.data?.questionText, "Open question"),
    cellRenderer: (params) => {
      const questionId = params.data?.questionId;
      const text = getDisplayText(params.value, "Open question");
      return questionId !== null && questionId !== undefined && String(questionId)
        ? <Link className="error-list-question-link" to={`/questions/${questionId}`}>{text}</Link>
        : text;
    },
    tooltipValueGetter: (params) => getDisplayText(params.data?.questionText, "Open question"),
  },
];

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
  const [topicSearch, setTopicSearch] = useState("");


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
          topics: new Set(),
        });
      }

      const group = groups.get(key);
      group.count += 1;
      const topicName = getDisplayText(mistake.topicName, "");
      if (topicName) group.topics.add(topicName);
    });

    return Array.from(groups.values(), (chapter) => ({
      ...chapter,
      topics: Array.from(chapter.topics),
    }));
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

  const sortedChapterMistakes = useMemo(
    () =>
      [...chapterMistakes].sort(
        (first, second) =>
          getTimestamp(second.createdAt) - getTimestamp(first.createdAt),
      ),
    [chapterMistakes],
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="container-fluid py-4 error-list-page" aria-busy="true">
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
      <main className="container-fluid py-4 error-list-page">
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
      <main className="container-fluid py-4 error-list-page">
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
        <main className="container-fluid py-4 error-list-page">
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
      <main className="container-fluid py-4 error-list-page">
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
            {chapterMistakes.length} {chapterMistakes.length === 1 ? "mistake" : "mistakes"}
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

          <DataGrid
            rowData={sortedChapterMistakes}
            columnDefs={errorListColumns}
            height="520px"
            pageSize={10}
            rowHeight={52}
            title="Incorrect attempts"
            description={`Review mistakes recorded in ${selectedChapter.name}.`}
            quickFilterText={topicSearch}
            onQuickFilterTextChange={setTopicSearch}
            searchPlaceholder="Search topic, subject, answer or question..."
            countLabel="mistake"
            noRowsMessage="No mistakes match your search."
            className="error-list-grid"
          />
        </section>
      </main>
    );
  }

  // =========================================================
  // CHAPTER LIST
  // =========================================================

  return (
    <main className="container-fluid py-4 error-list-page">
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
                <span className="error-list-chapter-icon" aria-hidden="true">
                  <FaBookOpen />
                </span>
                <span className="error-list-chapter-name">{chapter.name}</span>
                <span className="error-list-chapter-context">
                  {chapter.topics.slice(0, 3).join(", ") || "Topic unavailable"}
                </span>
              </div>

              <span className="error-list-chapter-trailing">
                <span className="error-list-chapter-count">
                  {chapter.count} {chapter.count === 1 ? "mistake" : "mistakes"}
                </span>
                <span className="error-list-chapter-open">
                  Review <FaChevronRight aria-hidden="true" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
