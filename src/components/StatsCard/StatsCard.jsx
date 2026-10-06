/* eslint-disable react/prop-types */
import "./StatsCard.css";
import { FaBookOpen, FaQuestionCircle, FaCheckCircle, FaClock, FaTrophy,
  FaFire, FaUniversity, FaLayerGroup, FaCodeBranch, FaGraduationCap } from "react-icons/fa";

const cards = {
  college: { Icon: FaUniversity, title: "Total Colleges", subtitle: "Active campuses in your scope", color: "#0284c7", bg: "#e0f2fe" },
  branch: { Icon: FaCodeBranch, title: "Total Branches", subtitle: "Active departments in your scope", color: "#ea580c", bg: "#ffedd5" },
  sections: { Icon: FaLayerGroup, title: "Total Sections", subtitle: "Active cohorts in your scope", color: "#db2777", bg: "#fce7f3" },
  course: { Icon: FaGraduationCap, title: "Total Courses", subtitle: "Active courses in your scope", color: "#0d9488", bg: "#ccfbf1" },
  courses: { Icon: FaBookOpen, title: "My Courses", color: "#2563eb", bg: "#eaf2ff" },
  practice: { Icon: FaQuestionCircle, title: "Practice Questions", color: "#16a34a", bg: "#eafaf0" },
  completed: { Icon: FaCheckCircle, title: "Practice Completion", color: "#f59e0b", bg: "#fff6e8" },
  pending: { Icon: FaClock, title: "Practice Pending", color: "#7c3aed", bg: "#f5efff" },
  rank: { Icon: FaTrophy, title: "Exam Rank", color: "#2563eb", bg: "#eaf2ff" },
  streak: { Icon: FaFire, title: "Practice Streak", color: "#16a34a", bg: "#eafaf0" },
};

function StatsCard({ type, data, subtitle, progress, loading = false }) {
  const card = cards[type] ?? cards.courses;
  const Icon = card.Icon;
  return (
    <div className="dashboard-stat-card" aria-busy={loading}>
      <div className="dashboard-stat-icon" style={{ background: card.bg, color: card.color }}><Icon /></div>
      <div className="dashboard-stat-info">
        <small>{card.title}</small>
        <h3>{data ?? (loading ? "…" : "—")}</h3>
        <span>{subtitle ?? card.subtitle}</span>
        {progress != null && (
          <div className="dashboard-stat-progress" role="progressbar"
            aria-label={card.title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="dashboard-stat-progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%`, background: card.color }} />
          </div>
        )}
      </div>
    </div>
  );
}
export default StatsCard;
