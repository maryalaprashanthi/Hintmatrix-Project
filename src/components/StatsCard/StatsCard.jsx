import "./StatsCard.css";

import {
  FaBookOpen,
  FaQuestionCircle,
  FaCheckCircle,
  FaClock,
  FaTrophy,
  FaFire,
  FaUniversity,
  FaLayerGroup,
  FaCodeBranch,
  FaGraduationCap, // Icon specifically chosen for the new management Course card
} from "react-icons/fa";

function StatsCard({ type }) {
  const cards = {
    // 1. Core Institutional Context Management Cards
    college: {
      icon: <FaUniversity />,
      title: "Total Colleges",
      value: "2",
      subtitle: "Registered campuses",
      color: "#0284c7", 
      bg: "#e0f2fe",
    },

    sections: {
      icon: <FaLayerGroup />,
      title: "Total Sections",
      value: "5",
      subtitle: "Active student cohorts",
      color: "#db2777", 
      bg: "#fce7f3",
    },

    branch: {
      icon: <FaCodeBranch />,
      title: "Total Branches",
      value: "4",
      subtitle: "Academic departments",
      color: "#ea580c", 
      bg: "#ffedd5",
    },

    course: { // New Management Mapping added here to clear undefined crashes
      icon: <FaGraduationCap />,
      title: "Total Courses",
      value: "6",
      subtitle: "Offered curriculums",
      color: "#0d9488", // Crisp Teal Color Scheme
      bg: "#ccfbf1",
    },

    // 2. Learning & Academic Performance Tracking Cards
    courses: {
      icon: <FaBookOpen />,
      title: "My Courses",
      value: "3",
      subtitle: "+1 this month",
      color: "#2563eb",
      bg: "#eaf2ff",
    },

    practice: {
      icon: <FaQuestionCircle />,
      title: "Practice Questions",
      value: "500",
      subtitle: "+120 this week",
      color: "#16a34a",
      bg: "#eafaf0",
    },

    completed: {
      icon: <FaCheckCircle />,
      title: "Completed",
      value: "75%",
      subtitle: "3 of 4 courses",
      color: "#f59e0b",
      bg: "#fff6e8",
      progress: 75,
    },

    pending: {
      icon: <FaClock />,
      title: "Pending",
      value: "25%",
      subtitle: "1 course left",
      color: "#7c3aed",
      bg: "#f5efff",
      progress: 25,
    },

    rank: {
      icon: <FaTrophy />,
      title: "Rank",
      value: "#1",
      subtitle: "Top performer! Keep it up! 🚀",
      color: "#2563eb",
      bg: "#eaf2ff",
    },

    streak: {
      icon: <FaFire />,
      title: "Streak",
      value: "15 Days",
      subtitle: "Keep it up! 🔥",
      color: "#16a34a",
      bg: "#eafaf0",
    },
  };

  // Fallback structural safety configuration to prevent undefined page crashes
  const card = cards[type] || {
    icon: <FaBookOpen />,
    title: "Stats",
    value: "0",
    subtitle: "No data available",
    color: "#64748b",
    bg: "#f1f5f9",
  };

  return (
    <div className="stats-card">
      <div className="stats-top">
        <div
          className="stats-icon"
          style={{
            background: card.bg,
            color: card.color,
          }}
        >
          {card.icon}
        </div>

        <div className="stats-info">
          <h4>{card.title}</h4>

          <h2
            style={{
              color: card.color,
            }}
          >
            {card.value}
          </h2>
        </div>
      </div>

      {card.progress && (
        <div className="progress">
          <div
            className="progress-fill"
            style={{
              width: `${card.progress}%`,
              background: card.color,
            }}
          ></div>
        </div>
      )}

      <p>{card.subtitle}</p>
    </div>
  );
}

export default StatsCard;
