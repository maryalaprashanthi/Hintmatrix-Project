import ProgressCircle from "./ProgressCircle";
import "./StatCard.css";

const StatCard = ({ icon, title, amount, subtitle, color, solved, total }) => {
  return (
    <div className="stat-card">
      {/* 1. Left: Icon Wrapper */}
      <div className={`stat-icon-wrapper ${color}`}>{icon}</div>

      {/* 2. Middle: Text Content */}
      <div className="stat-content">
        <span className="stat-title">{title}</span>
        <span className={`stat-amount ${color}`}>{amount}</span>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>

      {/* 3. Right: Progress Circle (Sibling to content, placed on the far right) */}
      {title === "Progress" && (
        <div className="stat-progress">
          <ProgressCircle solvedCount={solved} totalCount={total} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
