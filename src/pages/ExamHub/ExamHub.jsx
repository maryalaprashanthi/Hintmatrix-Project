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
  FaDownload,
  FaCalculator,
  FaStickyNote,
  FaLaptop,
  FaBookOpen,
  FaGraduationCap,
  FaCheck,
  FaBookmark,
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
    value: "78.6%",
    sub: "Good Progress",
    type: "orange",
    icon: <FaBullseye />,
  },
  {
    key: "bestScore",
    title: "Best Score",
    value: "92.5%",
    sub: "Mock Test - 12",
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

const formatDuration = (start, end) => {
  const minutes = Math.round((new Date(end) - new Date(start)) / 60000);
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  return `${minutes} Min`;
};

/* ================= QUICK ACTIONS  ================= */

const quickActions = [
  { title: "Bookmarks", icon: <FaBookmark />, type: "blue" },
  { title: "Weak Areas", icon: <FaBullseye />, type: "pink" },
  { title: "Downloads", icon: <FaDownload />, type: "blue" },
  { title: "Study Planner", icon: <FaCalendarAlt />, type: "purple" },
  { title: "Notes", icon: <FaStickyNote />, type: "cyan" },
  { title: "Documents", icon: <FaFileAlt />, type: "pink" },
  { title: "Calculator", icon: <FaCalculator />, type: "green" },
];

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
  const recentAttempts = attempts.slice(0, 4);

  const [statValues, setStatValues] = useState({
    total: "00",
    completed: "00",
    completedPct: "0.0%",
    upcoming: "00",
  });

  useEffect(() => {
    let active = true;

    async function loadExamData() {
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

        /* ---- Stats: Total / Completed / Upcoming ---- */

        const totalCount = activeExams.length;

        const completedCount = activeExams.filter(
          (exam) => new Date(exam.endDate) < now,
        ).length;

        const upcomingThisWeekCount = activeExams.filter((exam) => {
          const start = new Date(exam.startDate);
          return start > now && start <= oneWeekOut;
        }).length;

        const completedPct =
          totalCount > 0
            ? ((completedCount / totalCount) * 100).toFixed(1)
            : "0.0";

        if (active) {
          setStatValues({
            total: String(totalCount).padStart(2, "0"),
            completed: String(completedCount).padStart(2, "0"),
            completedPct: `${completedPct}%`,
            upcoming: String(upcomingThisWeekCount).padStart(2, "0"),
          });
        }

        /* ---- Upcoming schedule list  ---- */

        const upcomingExams = activeExams
          .filter((exam) => new Date(exam.endDate) > now) // not yet finished (covers ongoing + future)
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
              duration: formatDuration(exam.startDate, exam.endDate),
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

  // Recent Activity: the student's own completed attempts for this page's kind
  // (exams on /exam, mock exams on /mock-exam), newest first. Each entry is
  // clickable and opens that attempt's review screen instead of "starting" it
  // again.
  useEffect(() => {
    let active = true;

    const service = isMock ? MockExamService : ExamService;

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
      });

    return () => {
      active = false;
    };
  }, [isMock]);

  // Mock stats come from the catalog + the student's own attempts: a mock exam
  // counts as completed once they have at least one attempt on it.
  const mockStats = useMemo(() => {
    const total = mockCatalog.length;
    const attemptedIds = new Set(attempts.map((attempt) => attempt.examId));
    const completed = mockCatalog.filter((mock) =>
      attemptedIds.has(mock.mockExamId),
    ).length;

    return {
      total: pad(total),
      completed: pad(completed),
      completedPct: `${total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0"}%`,
      upcoming: pad(total - completed),
    };
  }, [mockCatalog, attempts]);

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

  const shownStats = isMock ? mockStats : statValues;
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
        sub: shownStats.completedPct,
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

      {/* ================= ANALYTICS + QUICK ACTIONS ================= */}

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

        {/* RIGHT SIDE */}

        <div className="exam-hub-right-column">
          {/* QUICK ACTIONS */}

          <div className="quick-section">
            <div className="section-title">
              <h2>Quick Actions</h2>
            </div>

            <div className="quick-grid">
              {quickActions.map((item) => (
                <button type="button" className="quick-card" key={item.title}>
                  <span className={`quick-icon ${item.type}`}>{item.icon}</span>
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STREAK */}

          <div className="streak-section">
            <div className="streak-top">
              <div>
                <h2>Stay Consistent. Keep Improving!</h2>
                <p>You are on a 07 day study streak. 🔥</p>
              </div>
              <FaTrophy className="big-trophy" />
            </div>

            <div className="streak-days">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, index) => (
                  <div className="streak-day" key={day}>
                    <div className={`streak-circle ${index < 6 ? "done" : ""}`}>
                      {index < 6 && <FaCheck />}
                    </div>
                    <span>{day}</span>
                  </div>
                ),
              )}
            </div>

            <div className="streak-books">
              <FaBookOpen />
              <FaGraduationCap />
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
