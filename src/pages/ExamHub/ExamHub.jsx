import { useEffect, useState } from "react";
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
  FaAward,
  FaLaptop,
  FaBookOpen,
  FaGraduationCap,
  FaCheck,
  FaBookmark,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { canManageContent } from "../../utils/roles";
import ExamService from "../../services/ExamService";
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

/* ================= EXAM TYPES  ================= */

const examTypes = [
  {
    title: "Practice Exam",
    description: "Practice chapter-wise questions and improve concepts.",
    button: "Start Practice",
    type: "blue",
    icon: <FaFileAlt />,
  },
  {
    title: "Mock Test",
    description: "Real exam simulation with timer and full syllabus.",
    button: "Start Mock Test",
    type: "purple",
    icon: <FaClock />,
  },
  {
    title: "Previous Papers",
    description: "Solve previous year question papers and test yourself.",
    button: "View Papers",
    type: "cyan",
    icon: <FaFileAlt />,
  },
  {
    title: "Quick Test",
    description: "Short tests to evaluate your speed and accuracy.",
    button: "Start Quick Test",
    type: "green",
    icon: <FaTrophy />,
  },
];

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

/* ================= ACTIVITIES  ================= */

const activities = [
  {
    title: "Completed Mock Test - 14",
    sub: "Scored 86% • 2h ago",
    icon: <FaCheckCircle />,
    type: "green",
  },
  {
    title: "Practice Session - Journal Entries",
    sub: "15 Questions • 1d ago",
    icon: <FaCalendarAlt />,
    type: "purple",
  },
  {
    title: "New Badge Earned",
    sub: "Consistent Learner • 1d ago",
    icon: <FaAward />,
    type: "orange",
  },
  {
    title: "Attempted Quick Test",
    sub: "Scored 75% • 2d ago",
    icon: <FaBullseye />,
    type: "blue",
  },
];

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

function ExamHub() {
  const navigate = useNavigate();
  const canCreateExam = canManageContent();

  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState(false);

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
  }, []);

  // Merge dynamic values into the static stat shells
  const stats = statMeta.map((meta) => {
    if (meta.key === "total") {
      return { ...meta, value: statValues.total };
    }
    if (meta.key === "completed") {
      return {
        ...meta,
        value: statValues.completed,
        sub: statValues.completedPct,
      };
    }
    if (meta.key === "upcoming") {
      return { ...meta, value: statValues.upcoming };
    }
    return meta;
  });

  return (
    <div className="exam-hub-page" data-page="exam-hub">
      {/* ================= HEADER ================= */}

      <div className="examhub-top">
        <div className="welcome">
          <h1>
            Good Morning, Prashanthi! <span>👋</span>
          </h1>
          <p>Every exam you take brings you closer to your dreams.</p>
        </div>

        {canCreateExam && (
          <button
            type="button"
            className="create-exam-btn"
            onClick={() => navigate("/exam-paper")}
          >
            Create Exam
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
        {/* EXAM TYPES */}

        <div className="exam-types-section">
          <div className="section-title">
            <h2>Choose Your Exam Type</h2>
            <button type="button">
              View All
              <FaArrowRight />
            </button>
          </div>

          <div className="exam-type-grid">
            {examTypes.map((exam) => (
              <div className={`exam-type-card ${exam.type}`} key={exam.title}>
                <div className="exam-type-top">
                  <div className="exam-type-icon">{exam.icon}</div>
                  <div className="exam-type-content">
                    <h3>{exam.title}</h3>
                    <p>{exam.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="exam-action"
                  onClick={() => navigate(`/exams`)}
                >
                  <span>{exam.button}</span>
                  <FaArrowRight />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SCHEDULE — shows upcoming exams, not just today */}

        <div className="schedule-section">
          <div className="section-title">
            <h2>Upcoming Schedule</h2>
            <button type="button">
              View Calendar
              <FaArrowRight />
            </button>
          </div>

          <div className="schedule-list">
            {scheduleLoading && (
              <p className="schedule-status">Loading upcoming exams...</p>
            )}

            {!scheduleLoading && scheduleError && (
              <p className="schedule-status schedule-error">
                Couldn't load upcoming exams.
              </p>
            )}

            {!scheduleLoading && !scheduleError && schedules.length === 0 && (
              <p className="schedule-status">No upcoming exams scheduled.</p>
            )}

            {!scheduleLoading &&
              !scheduleError &&
              schedules.map((item) => (
                <div className="schedule-card" key={item.examId}>
                  <div className={`schedule-time ${item.type}`}>
                    <strong>{item.time}</strong>
                    <span>{item.period}</span>
                  </div>

                  <div className="schedule-info">
                    <h3>{item.title}</h3>
                    <div>
                      <span>
                        <FaCalendarAlt />
                        {item.date}
                      </span>
                      <span>•</span>
                      <span>
                        <FaClock />
                        {item.duration}
                      </span>
                    </div>
                  </div>

                  <span className={`upcoming ${item.type}`}>{item.status}</span>
                </div>
              ))}
          </div>

          <button type="button" className="all-schedule">
            View All Schedule
            <FaArrowRight />
          </button>
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
              {activities.map((item) => (
                <div className="activity" key={item.title}>
                  <div className={`activity-icon ${item.type}`}>
                    {item.icon}
                  </div>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.sub}</small>
                  </div>
                </div>
              ))}
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
          <button type="button">
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
