import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UpcomingTests.css";
import {
  FaCalendarAlt,
  FaClock,
  FaBookOpen,
  FaCalendarCheck,
  FaPuzzlePiece,
  FaTrophy,
} from "react-icons/fa";
import ExamService from "../../services/ExamService";

const testStyles = [
  { color: "#7c3aed", icon: <FaCalendarCheck />, iconBg: "#F3E8FF", iconColor: "#7C3AED" },
  { color: "#16A34A", icon: <FaPuzzlePiece />, iconBg: "#DCFCE7", iconColor: "#16A34A" },
  { color: "#F97316", icon: <FaTrophy />, iconBg: "#FFEDD5", iconColor: "#F97316" },
];

const MAX_VISIBLE = 4;

const formatDate = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const formatDuration = (startIso, endIso) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "—";
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  if (mins <= 0) return "—";
  if (mins < 60) return `${mins} Min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
};

function UpcomingTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUpcomingTests() {
      try {
        setLoading(true);
        setError(false);

        const response = await ExamService.getAll();
        const exams = Array.isArray(response.data) ? response.data : [];
        const now = new Date();

        const upcoming = exams
          .filter((exam) => exam.activeRow !== false)
          .filter((exam) => new Date(exam.startDate) > now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, MAX_VISIBLE);

        // questionCount isn't on ExamResponseDTO yet, so fetch per visible exam
        const withCounts = await Promise.all(
          upcoming.map(async (exam, index) => {
            let questionCount = null;
            try {
              const qRes = await ExamService.getExamQuestions(exam.examId);
              questionCount = Array.isArray(qRes.data) ? qRes.data.length : null;
            } catch {
              questionCount = null;
            }
            return {
              examId: exam.examId,
              title: exam.examName || "Untitled Test",
              questions:
                questionCount !== null ? `${questionCount} Questions` : exam.courseName || "Practice Test",
              duration: formatDuration(exam.startDate, exam.endDate),
              date: formatDate(exam.startDate),
              time: formatTime(exam.startDate),
              ...testStyles[index % testStyles.length],
            };
          }),
        );

        if (active) setTests(withCounts);
      } catch (err) {
        console.error("Failed to load upcoming tests:", err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUpcomingTests();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="upcoming-card">
      <div className="upcoming-header">
        <h2>Upcoming Tests</h2>
        <Link to="/exams">View All</Link>
      </div>

      {loading && <p className="upcoming-status">Loading upcoming tests...</p>}
      {!loading && error && <p className="upcoming-status upcoming-error">Couldn't load upcoming tests.</p>}
      {!loading && !error && tests.length === 0 && (
        <p className="upcoming-status">No upcoming tests right now.</p>
      )}

      {!loading && !error && tests.length > 0 && (
        <div className="test-grid">
          {tests.map((test, index) => (
            <div className="test-box" key={test.examId ?? index}>
              <div className="test-icon" style={{ background: test.iconBg, color: test.iconColor }}>
                {test.icon}
              </div>
              <h3>{test.title}</h3>
              <div className="test-info">
                <span><FaBookOpen />{test.questions}</span>
                <span><FaClock />{test.duration}</span>
              </div>
              <div className="test-date">
                <span><FaCalendarAlt />{test.date}</span>
                <span>{test.time}</span>
              </div>
              <button
                type="button"
                style={{ background: test.color }}
                onClick={() => navigate(`/exams/${test.examId}`)}
              >
                Start Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UpcomingTests;