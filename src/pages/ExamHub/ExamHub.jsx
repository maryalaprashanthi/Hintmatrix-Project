import React from "react";
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
import "./ExamHub.css";

/* ================= STATS ================= */

const stats = [
  {
    title: "Total Exams",
    value: "48",
    sub: "All Time",
    type: "blue",
    icon: <FaFileAlt />,
  },
  {
    title: "Completed",
    value: "26",
    sub: "54.2%",
    type: "green",
    icon: <FaCheckCircle />,
  },
  {
    title: "Upcoming",
    value: "07",
    sub: "This Week",
    type: "purple",
    icon: <FaCalendarAlt />,
  },
  {
    title: "Average Score",
    value: "78.6%",
    sub: "Good Progress",
    type: "orange",
    icon: <FaBullseye />,
  },
  {
    title: "Best Score",
    value: "92.5%",
    sub: "Mock Test - 12",
    type: "pink",
    icon: <FaTrophy />,
  },
];

/* ================= EXAM TYPES ================= */
/* Keeping only:
   Practice Exam
   Mock Test
   Previous Papers
   Quick Test
*/

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

/* ================= SCHEDULE ================= */

const schedules = [
  {
    time: "10:00",
    period: "AM",
    title: "Accounting Mock Test - 15",
    marks: "100 Marks",
    duration: "60 Min",
    type: "blue",
  },
  {
    time: "02:00",
    period: "PM",
    title: "Business Law Test",
    marks: "50 Marks",
    duration: "90 Min",
    type: "green",
  },
  {
    time: "04:30",
    period: "PM",
    title: "Finance Adaptive Exam",
    marks: "60 Marks",
    duration: "75 Min",
    type: "orange",
  },
  {
    time: "07:00",
    period: "PM",
    title: "Full Syllabus Mock Test",
    marks: "120 Marks",
    duration: "180 Min",
    type: "pink",
  },
];

/* ================= ACTIVITIES ================= */

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

/* ================= QUICK ACTIONS ================= */

const quickActions = [
  {
    title: "Bookmarks",
    icon: <FaBookmark />,
    type: "blue",
  },
  {
    title: "Weak Areas",
    icon: <FaBullseye />,
    type: "pink",
  },
  {
    title: "Downloads",
    icon: <FaDownload />,
    type: "blue",
  },
  {
    title: "Study Planner",
    icon: <FaCalendarAlt />,
    type: "purple",
  },
  {
    title: "Notes",
    icon: <FaStickyNote />,
    type: "cyan",
  },
  {
    title: "Documents",
    icon: <FaFileAlt />,
    type: "pink",
  },
  {
    title: "Calculator",
    icon: <FaCalculator />,
    type: "green",
  },
];

/* ================= SUBJECTS ================= */

const subjects = [
  {
    name: "Accounting",
    score: "85%",
    width: "85%",
    type: "blue",
  },
  {
    name: "Business Law",
    score: "72%",
    width: "72%",
    type: "green",
  },
  {
    name: "Economics",
    score: "63%",
    width: "63%",
    type: "orange",
  },
  {
    name: "Financial Mgmt.",
    score: "58%",
    width: "58%",
    type: "purple",
  },
];

/* ================= COMPONENT ================= */

function ExamHub() {
  const navigate = useNavigate();
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

        <button
          type="button"
          className="create-exam-btn"
          onClick={() => navigate("/exam-paper")}
        >
          Create Exam
        </button>
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
                  onClick={() => navigate(`/exam-mine`)}
                >
                  <span>{exam.button}</span>
                  <FaArrowRight />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SCHEDULE */}

        <div className="schedule-section">
          <div className="section-title">
            <h2>Today's Schedule</h2>

            <button type="button">
              View Calendar
              <FaArrowRight />
            </button>
          </div>

          <div className="schedule-list">
            {schedules.map((item) => (
              <div className="schedule-card" key={item.title}>
                <div className={`schedule-time ${item.type}`}>
                  <strong>{item.time}</strong>
                  <span>{item.period}</span>
                </div>

                <div className="schedule-info">
                  <h3>{item.title}</h3>

                  <div>
                    <span>
                      <FaCalendarAlt />
                      {item.marks}
                    </span>

                    <span>•</span>

                    <span>
                      <FaClock />
                      {item.duration}
                    </span>
                  </div>
                </div>

                <span className={`upcoming ${item.type}`}>Upcoming</span>
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
        {/* ANALYTICS */}

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
                      style={{
                        width: subject.width,
                      }}
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
