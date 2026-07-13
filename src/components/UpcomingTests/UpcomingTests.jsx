import "./UpcomingTests.css";
import {
  FaCalendarAlt,
  FaClock,
  FaBookOpen,
  FaCalendarCheck,
  FaPuzzlePiece,
  FaTrophy,
} from "react-icons/fa";

function UpcomingTests() {
  const tests = [
    {
      title: "Financial Accounting Mock Test",
      questions: "20 Questions",
      duration: "30 Min",
      date: "10 May 2025",
      time: "10:00 AM",
      color: "#7c3aed",
      icon: <FaCalendarCheck />,
      iconBg: "#F3E8FF",
      iconColor: "#7C3AED",
    },
    {
      title: "GST Practice Test",
      questions: "25 Questions",
      duration: "35 Min",
      date: "12 May 2025",
      time: "02:00 PM",
      color: "#16A34A",
      icon: <FaPuzzlePiece />,
      iconBg: "#DCFCE7",
      iconColor: "#16A34A",
    },
    {
      title: "Tally Basics Test",
      questions: "15 Questions",
      duration: "20 Min",
      date: "14 May 2025",
      time: "11:00 AM",
      color: "#F97316",
      icon: <FaTrophy />,
      iconBg: "#FFEDD5",
      iconColor: "#F97316",
    },
  ];

  return (
    <div className="upcoming-card">
      <div className="upcoming-header">
        <h2>Upcoming Tests</h2>
        <a href="/">View All</a>
      </div>

      <div className="test-grid">
        {tests.map((test, index) => (
          <div className="test-box" key={index}>

            <div
              className="test-icon"
              style={{
                background: test.iconBg,
                color: test.iconColor,
              }}
            >
              {test.icon}
            </div>

            <h3>{test.title}</h3>

            <div className="test-info">
              <span>
                <FaBookOpen />
                {test.questions}
              </span>

              <span>
                <FaClock />
                {test.duration}
              </span>
            </div>

            <div className="test-date">
              <span>
                <FaCalendarAlt />
                {test.date}
              </span>

              <span>{test.time}</span>
            </div>

            <button
              style={{
                background: test.color,
              }}
            >
              Start Test
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingTests;