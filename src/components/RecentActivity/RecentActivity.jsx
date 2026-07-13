import "./RecentActivity.css";
import {
  FaCheckCircle,
  FaEdit,
  FaFileAlt,
  FaAward,
} from "react-icons/fa";

function RecentActivity() {
  const activities = [
    {
      title: "Completed GST Quiz",
      subtitle: "Scored 85%",
      time: "2h ago",
      icon: <FaCheckCircle />,
      color: "#22c55e",
      bg: "#ecfdf5",
    },
    {
      title: "Practiced Journal Entries",
      subtitle: "Attempted 20 Questions",
      time: "5h ago",
      icon: <FaEdit />,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      title: "Completed Mock Test",
      subtitle: "Scored 78%",
      time: "1d ago",
      icon: <FaFileAlt />,
      color: "#8b5cf6",
      bg: "#f3e8ff",
    },
    {
      title: "Earned Bronze Badge",
      subtitle: "Completed 5 Quizzes",
      time: "2d ago",
      icon: <FaAward />,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
  ];

  return (
    <div className="recent-card">

      <div className="recent-header">
        <h2>Recent Activity</h2>
        <button>View All</button>
      </div>

      {activities.map((item, index) => (
        <div className="activity" key={index}>

          <div
            className="activity-icon"
            style={{
              background: item.bg,
              color: item.color,
            }}
          >
            {item.icon}
          </div>

          <div className="activity-details">
            <h4>{item.title}</h4>
            <p>{item.subtitle}</p>
          </div>

          <span>{item.time}</span>

        </div>
      ))}

    </div>
  );
}

export default RecentActivity;