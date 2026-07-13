import "./StatsCard.css";

import {
  FaBookOpen,
  FaQuestionCircle,
  FaCheckCircle,
  FaClock,
  FaTrophy,
  FaFire,
} from "react-icons/fa";

function StatsCard({ type }) {
  const cards = {
    courses: {
      icon: <FaBookOpen />,
      title: "Total Courses",
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

  const card = cards[type];

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