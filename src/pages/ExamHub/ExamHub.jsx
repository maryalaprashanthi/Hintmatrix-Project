/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  FaFileAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaBullseye,
  FaTrophy,
  FaArrowRight,
  FaClock,
  FaLaptop,
  FaBookOpen,
  FaGraduationCap,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { canAccessFeature, currentRole } from "../../utils/roles";
import { getCurrentUserName } from "../../utils/user";
import ExamService from "../../services/ExamService";
import MockExamService from "../../services/MockExamService";
import "./ExamHub.css";

/* ================= STATS  ================= */

const statMeta = [
  {
    key: "total",
    title: "Total Exams",
    sub: "All Time",
    type: "blue",
    icon: <FaFileAlt />,
  },
  {
    key: "completed",
    title: "Completed",
    sub: "0.0%",
    type: "green",
    icon: <FaCheckCircle />,
  },
  {
    key: "upcoming",
    title: "Upcoming",
    sub: "This Week",
    type: "purple",
    icon: <FaCalendarAlt />,
  },
  {
    key: "avgScore",
    title: "Average Score",
    sub: "No completed exams",
    type: "orange",
    icon: <FaBullseye />,
  },
  {
    key: "bestScore",
    title: "Best Score",
    type: "pink",
    icon: <FaTrophy />,
  },
];

/* ================= TILES  ================= */

// Both /exam and /mock-exam show the same two tiles; they differ only in which
// catalog they open. "Previous" opens the same catalog on its Past tab.
const buildTiles = (isMock) => {
  const catalog = isMock ? "/mock-exams" : "/exams";

  return [
    {
      title: "Current Exams",
      description: isMock
        ? "Mock exams you can start any time."
        : "Exams that are open now or opening soon.",
      button: "View Current Exams",
      type: "blue",
      icon: <FaFileAlt />,
      route: catalog,
    },
    {
      title: "Previous Exams",
      description: "Review the exams you have already completed.",
      button: "View Previous Exams",
      type: "purple",
      icon: <FaCheckCircle />,
      route: `${catalog}?tab=past`,
    },
  ];
};

const pad = (count) => String(count).padStart(2, "0");

/* ================= SCHEDULE  ================= */

const scheduleTypes = ["blue", "green", "orange", "pink"];
const MAX_SCHEDULE_ITEMS = 4;

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { time: "—", period: "" };

  const formatted = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const [time, period] = formatted.split(" ");
  return { time, period };
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

// How long a student actually gets once they press Start - not the
// scheduling window (startDate to endDate), which can be open for days
// while each attempt still only runs for durationMinutes.
const formatDuration = (durationMinutes) => {
  const minutes = Number(durationMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  return `${minutes} Min`;
};

// Distinct, non-null exam ids from a list of attempts, as strings.
const distinctExamIds = (attempts) =>
  new Set(
    attempts
      .map((attempt) => attempt.examId)
      .filter((examId) => examId !== null && examId !== undefined)
      .map(String),
  );

/* ================= SUBJECTS  ================= */

const subjects = [
  { name: "Accounting", score: "85%", width: "85%", type: "blue" },
  { name: "Business Law", score: "72%", width: "72%", type: "green" },
  { name: "Economics", score: "63%", width: "63%", type: "orange" },
  { name: "Financial Mgmt.", score: "58%", width: "58%", type: "purple" },
];

/* ================= COMPONENT ================= */

// One dashboard, two routes: /exam (kind="exam") and /mock-exam (kind="mock").
// Mock exams have no schedule window, so the mock version swaps the "Upcoming"
// stat and schedule list for "Yet to Attempt" and the published mock exams.
//
// IMPORTANT (backend behaviour): for a STUDENT, ExamService.getAll() and
// MockExamService.getAll() return only exams the student has NOT attempted
// yet. So:
//   Total = pending (getAll) + completed (distinct exams in getMyAttempts)
function ExamHub({ kind = "exam" }) {
  const isMock = kind === "mock";
  const userName = getCurrentUserName();
  const navigate = useNavigate();
  const canCreateExam = canAccessFeature(
    isMock ? "manageMockExams" : "manageExams",
    currentRole(),
  );

  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState(false);

  const [mockCatalog, setMockCatalog] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [attemptsError, setAttemptsError] = useState(false);
  const recentAttempts = attempts.slice(0, 4);

  // pending = exams still to attempt (what getAll() returns for a student)
  const [statValues, setStatValues] = useState({
    pending: 0,
    upcoming: 0,
  });

  /* ---------- Load exams / mock catalog ---------- */

  useEffect(() => {
    let active = true;

    async function loadExamData() {
      // Clear the previous page's data so /exam <-> /mock-exam never
      // shows stale numbers while the new request is in flight.
      setSchedules([]);
      setMockCatalog([]);
      setStatValues({ pending: 0, upcoming: 0 });

      try {
        setScheduleLoading(true);
        setScheduleError(false);

        if (isMock) {
          const mockResponse = await MockExamService.getAll();
          const mocks = Array.isArray(mockResponse.data)
            ? mockResponse.data
            : [];
          if (active) {
            setMockCatalog(mocks.filter((mock) => mock.activeRow !== false));
          }
          return;
        }

        const response = await ExamService.getAll();
        const exams = Array.isArray(response.data) ? response.data : [];
        const activeExams = exams.filter((exam) => exam.activeRow !== false);
        const now = new Date();
        const oneWeekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        /* ---- Pending count + Upcoming (open now or starting within 7 days) ---- */

        const pendingCount = activeExams.length;

        const upcomingThisWeekCount = activeExams.filter((exam) => {
          const start = new Date(exam.startDate);
          const end = new Date(exam.endDate);
          return end > now && start <= oneWeekOut;
        }).length;

        if (active) {
          setStatValues({
            pending: pendingCount,
            upcoming: upcomingThisWeekCount,
          });
        }

        /* ---- Upcoming schedule list ---- */

        const upcomingExams = activeExams
          .filter((exam) => new Date(exam.endDate) > now) // not yet finished (ongoing + future)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, MAX_SCHEDULE_ITEMS)
          .map((exam, index) => {
            const { time, period } = formatTime(exam.startDate);
            const start = new Date(exam.startDate);
            const end = new Date(exam.endDate);
            const isOngoing = start <= now && now <= end;

            return {
              examId: exam.examId,
              title: exam.examName || "Untitled Test",
              marks: `Pass: ${exam.passPercentage}%`,
              duration: formatDuration(exam.durationMinutes),
              date: formatDate(exam.startDate),
              time,
              period,
              status: isOngoing ? "Ongoing" : "Upcoming",
              type: scheduleTypes[index % scheduleTypes.length],
            };
          });

        if (active) setSchedules(upcomingExams);
      } catch (err) {
        console.error("Failed to load exam data:", err);
        if (active) setScheduleError(true);
      } finally {
        if (active) setScheduleLoading(false);
      }
    }

    loadExamData();
    return () => {
      active = false;
    };
  }, [isMock]);

  /* ---------- Load the student's own attempts ---------- */

  // Recent Activity: the student's own completed attempts for this page's kind
  // (exams on /exam, mock exams on /mock-exam), newest first. Each entry is
  // clickable and opens that attempt's review screen instead of "starting" it
  // again.
  useEffect(() => {
    let active = true;

    const service = isMock ? MockExamService : ExamService;
    setAttempts([]);
    setAttemptsLoading(true);
    setAttemptsError(false);

    service
      .getMyAttempts()
      .then((response) => {
        if (!active) return;

        const list = Array.isArray(response?.data) ? response.data : [];
        setAttempts(
          [...list].sort(
            (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
          ),
        );
      })
      .catch((err) => {
        console.error("Failed to load attempts:", err);
        if (active) setAttemptsError(true);
      })
      .finally(() => {
        if (active) setAttemptsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isMock]);

  /* ---------- Derived stats ---------- */

  // Distinct exams the student has attempted at least once.
  const completedExamIds = useMemo(() => distinctExamIds(attempts), [attempts]);

  // Mock stats. Works whether getAll() returns the full catalog (admins) or
  // hides attempted mocks (students): total is every mock we know about
  // (catalog + attempted), pending is the catalog entries not attempted yet.
  const mockStats = useMemo(() => {
    const ready = !attemptsLoading && !attemptsError;

    const catalogIds = new Set(
      mockCatalog
        .map((mock) => mock.mockExamId)
        .filter((id) => id !== null && id !== undefined)
        .map(String),
    );
    const allIds = new Set([...catalogIds, ...completedExamIds]);
    const total = allIds.size;
    const completed = completedExamIds.size;
    const pending = [...catalogIds].filter(
      (id) => !completedExamIds.has(id),
    ).length;

    return {
      total: pad(total),
      completed: ready ? pad(completed) : "—",
      completedPct: ready
        ? `${total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0"}%`
        : "—",
      upcoming: pad(pending),
    };
  }, [attemptsError, attemptsLoading, completedExamIds, mockCatalog]);

  // Exam stats. For students getAll() only returns UNATTEMPTED exams, so
  // Total = pending + completed. Admins get every exam from getAll() and their
  // own attempts are a separate list, so we must not add them together.
  const examStats = useMemo(() => {
    const ready = !attemptsLoading && !attemptsError;
    const pending = statValues.pending;
    const completed = completedExamIds.size;
    const total = canCreateExam ? pending : pending + completed;

    return {
      total: ready || canCreateExam ? pad(total) : "—",
      completed: ready ? pad(completed) : "—",
      completedPct: ready
        ? `${total > 0 ? Math.min((completed / total) * 100, 100).toFixed(1) : "0.0"}%`
        : "—",
      upcoming: pad(statValues.upcoming),
    };
  }, [
    attemptsError,
    attemptsLoading,
    canCreateExam,
    completedExamIds,
    statValues,
  ]);

  const scoreStats = useMemo(() => {
    const scoredAttempts = attempts
      .map((attempt) => ({ ...attempt, score: Number(attempt.percentage) }))
      .filter(
        (attempt) =>
          attempt.percentage !== null &&
          attempt.percentage !== undefined &&
          attempt.percentage !== "" &&
          Number.isFinite(attempt.score),
      );

    if (scoredAttempts.length === 0) {
      return {
        avgScore: attemptsLoading ? "—" : "0.00%",
        avgScoreSub: attemptsLoading
          ? "Loading results..."
          : "No completed exams",
        bestScore: attemptsLoading ? "—" : "0.00%",
        bestScoreSub: attemptsLoading
          ? "Loading results..."
          : "No completed exams",
      };
    }

    const average =
      scoredAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
      scoredAttempts.length;
    const bestAttempt = scoredAttempts.reduce((best, attempt) =>
      attempt.score > best.score ? attempt : best,
    );

    return {
      avgScore: `${average.toFixed(2)}%`,
      avgScoreSub: `${scoredAttempts.length} ${scoredAttempts.length === 1 ? "attempt" : "attempts"}`,
      bestScore: `${bestAttempt.score.toFixed(2)}%`,
      bestScoreSub: bestAttempt.examName || "Best completed exam",
    };
  }, [attempts, attemptsLoading]);

  const mockList = useMemo(
    () =>
      mockCatalog.slice(0, MAX_SCHEDULE_ITEMS).map((mock, index) => ({
        examId: mock.mockExamId,
        title: mock.mockExamName || "Untitled Mock Exam",
        time: `${mock.passPercentage ?? "—"}%`,
        period: "Pass",
        date: mock.courseName || "Mock exam",
        duration: mock.chapterNames?.length
          ? `${mock.chapterNames.length} ${mock.chapterNames.length === 1 ? "Chapter" : "Chapters"}`
          : "All chapters",
        status: "Open",
        type: scheduleTypes[index % scheduleTypes.length],
      })),
    [mockCatalog],
  );

  const shownStats = isMock ? mockStats : examStats;
  const scheduleItems = isMock ? mockList : schedules;
  const tiles = buildTiles(isMock);

  // Merge dynamic values into the static stat shells
  const stats = statMeta.map((meta) => {
    if (meta.key === "total") {
      return { ...meta, value: shownStats.total };
    }
    if (meta.key === "completed") {
      return {
        ...meta,
        value: shownStats.completed,
        sub: attemptsError
          ? "Unable to load results"
          : attemptsLoading
            ? "Loading results..."
            : shownStats.completedPct,
      };
    }
    if (meta.key === "upcoming") {
      return isMock
        ? {
            ...meta,
            title: "Yet to Attempt",
            sub: "Ready to start",
            value: shownStats.upcoming,
          }
        : { ...meta, value: shownStats.upcoming };
    }
    if (meta.key === "avgScore") {
      return {
        ...meta,
        value: attemptsError || attemptsLoading ? "—" : scoreStats.avgScore,
        sub: attemptsError ? "Unable to load results" : scoreStats.avgScoreSub,
      };
    }
    if (meta.key === "bestScore") {
      return {
        ...meta,
        value: attemptsError || attemptsLoading ? "—" : scoreStats.bestScore,
        sub: attemptsError ? "Unable to load results" : scoreStats.bestScoreSub,
      };
    }
    return meta;
  });

  return (
    <div className="exam-hub-page" data-page="exam-hub">
      {/* ================= HEADER ================= */}

      <div className="examhub-top">
        <div className="welcome">
          <h1>
            Good Morning, {userName}! <span>👋</span>
          </h1>
          <p>Every exam you take brings you closer to your dreams.</p>
        </div>

        {canCreateExam && (
          <button
            type="button"
            className="create-exam-btn"
            onClick={() =>
              navigate(isMock ? "/mock-exam-paper" : "/exam-paper")
            }
          >
            {isMock ? "Create Mock Exam" : "Create Exam"}
          </button>
        )}
      </div>

      {/* ================= STATS ================= */}

      <div className="stats-row">
        {stats.map((item) => (
          <div className={`stat-card ${item.type}`} key={item.title}>
            <div className="stat-icon">{item.icon}</div>
            <div className="stat-content">
              <span>{item.title}</span>
              <strong>{item.value}</strong>
              <small>{item.sub}</small>
            </div>
            <div className="stat-wave">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        ))}
      </div>
      {attemptsError && (
        <p className="schedule-status schedule-error" role="alert">
          Couldn&apos;t load your {isMock ? "mock exam" : "exam"} results.
        </p>
      )}

      {/* ================= PRIMARY ================= */}

      <div className="main-two-column">
        {/* CURRENT / PREVIOUS */}

        <div className="exam-types-section">
          <div className="section-title">
            <h2>{isMock ? "Mock Exams" : "Exams"}</h2>
          </div>

          <div className="exam-type-grid">
            {tiles.map((tile) => (
              <div className={`exam-type-card ${tile.type}`} key={tile.title}>
                <div className="exam-type-top">
                  <div className="exam-type-icon">{tile.icon}</div>
                  <div className="exam-type-content">
                    <h3>{tile.title}</h3>
                    <p>{tile.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="exam-action"
                  onClick={() => navigate(tile.route)}
                >
                  <span>{tile.button}</span>
                  <FaArrowRight />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SCHEDULE (exam) / AVAILABLE MOCK EXAMS (mock) */}

        <div className="schedule-section">
          <div className="section-title">
            <h2>{isMock ? "Available Mock Exams" : "Upcoming Schedule"}</h2>
            {isMock ? (
              <button type="button" onClick={() => navigate("/mock-exams")}>
                View All
                <FaArrowRight />
              </button>
            ) : (
              <button type="button">
                View Calendar
                <FaArrowRight />
              </button>
            )}
          </div>

          <div className="schedule-list">
            {scheduleLoading && (
              <p className="schedule-status">
                {isMock
                  ? "Loading mock exams..."
                  : "Loading upcoming exams..."}
              </p>
            )}

            {!scheduleLoading && scheduleError && (
              <p className="schedule-status schedule-error">
                {isMock
                  ? "Couldn't load mock exams."
                  : "Couldn't load upcoming exams."}
              </p>
            )}

            {!scheduleLoading && !scheduleError && scheduleItems.length === 0 && (
                <p className="schedule-status">
                  {isMock
                    ? "No mock exams published yet."
                    : "No upcoming exams scheduled."}
                </p>
              )}

            {!scheduleLoading &&
              !scheduleError &&
              scheduleItems.map((item) => (
                <div className="schedule-card" key={item.examId}>
                  <div className={`schedule-time ${item.type}`}>
                    <strong>{item.time}</strong>
                    <span>{item.period}</span>
                  </div>

                  <div className="schedule-info">
                    <h3>{item.title}</h3>
                    <div>
                      <span>
                        {isMock ? <FaBookOpen /> : <FaCalendarAlt />}
                        {item.date}
                      </span>
                      <span>•</span>
                      <span>
                        {isMock ? <FaFileAlt /> : <FaClock />}
                        {item.duration}
                      </span>
                    </div>
                  </div>

                  <span className={`upcoming ${item.type}`}>{item.status}</span>
                </div>
              ))}
          </div>

          {isMock ? (
            <button
              type="button"
              className="all-schedule"
              onClick={() => navigate("/mock-exams")}
            >
              View All Mock Exams
              <FaArrowRight />
            </button>
          ) : (
            <button type="button" className="all-schedule">
              View All Schedule
              <FaArrowRight />
            </button>
          )}
        </div>
      </div>

      {/* ================= ANALYTICS ================= */}

      <div className="exam-hub-lower-grid">
        <div className="analytics-row">
          {/* PERFORMANCE */}

          <div className="analytics-card performance">
            <div className="section-title">
              <h2>Your Performance Overview</h2>
            </div>

            <div className="performance-content">
              <div className="donut">
                <div>
                  <strong>78%</strong>
                  <span>Overall Performance</span>
                </div>
              </div>

              <div className="performance-legend">
                <div>
                  <span className="dot strong" />
                  <span>Strong</span>
                  <strong>45%</strong>
                </div>
                <div>
                  <span className="dot good" />
                  <span>Good</span>
                  <strong>28%</strong>
                </div>
                <div>
                  <span className="dot average" />
                  <span>Average</span>
                  <strong>17%</strong>
                </div>
                <div>
                  <span className="dot weak" />
                  <span>Weak</span>
                  <strong>10%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SUBJECT */}

          <div className="analytics-card">
            <div className="section-title">
              <h2>Subject Strength</h2>
              <button type="button">
                View Detailed Analytics
                <FaArrowRight />
              </button>
            </div>

            <div className="subjects">
              {subjects.map((subject) => (
                <div className="subject" key={subject.name}>
                  <div className="subject-top">
                    <span>{subject.name}</span>
                    <strong>{subject.score}</strong>
                  </div>
                  <div className="subject-bar">
                    <span
                      className={subject.type}
                      style={{ width: subject.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ACTIVITY */}

          <div className="analytics-card activity-card">
            <div className="section-title">
              <h2>Recent Activity</h2>
              <button type="button">
                View All
                <FaArrowRight />
              </button>
            </div>

            <div className="activity-list">
              {recentAttempts.length === 0 ? (
                <p className="activity-empty">
                  {isMock
                    ? "Completed mock exams show up here."
                    : "Completed exams show up here."}
                </p>
              ) : (
                recentAttempts.map((item) => {
                  const reviewPath = isMock
                    ? `/mock-exams/${item.examId}/review/${item.resultId}`
                    : `/exams/${item.examId}/review/${item.resultId}`;

                  return (
                    <button
                      type="button"
                      className="activity activity--clickable"
                      key={`${item.examType}-${item.resultId}`}
                      onClick={() => navigate(reviewPath)}
                    >
                      <div className={`activity-icon ${isMock ? "purple" : "green"}`}>
                        <FaCheckCircle />
                      </div>
                      <div>
                        <strong>Completed {item.examName}</strong>
                        <small>
                          Scored {Math.round(item.percentage)}% •{" "}
                          {formatDate(item.completedAt)}
                        </small>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ================= MOTIVATION ================= */}

      <div className="motivation-section">
        <div className="motivation-person">
          <div className="person">
            <FaLaptop />
          </div>
        </div>

        <div className="motivation-content">
          <h2>
            Aim Higher. Achieve More.
            <span> 💪</span>
          </h2>
          <p>Take a mock test today and see how far you've come!</p>
          <button type="button" onClick={() => navigate("/mock-exams")}>
            Take a Mock Test
            <FaArrowRight />
          </button>
        </div>

        <div className="motivation-graphics">
          <div className="bars">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <FaGraduationCap />
          <div className="mini-donut">
            <span>✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamHub;
