/* eslint-disable react/prop-types */
import "./LeaderBoard.css";
import { formatCount, formatPercentage } from "../../utils/dashboardMetrics";

function LeaderBoard({ entries = [], scope }) {
  return (
    <div className="leaderboard-card">
      <div className="leaderboard-header"><h3>Exam Leaderboard</h3></div>
      <p className="dashboard-footnote">{scope} · Average of latest results per exam. Equal averages share a rank.</p>
      {entries.length === 0 && <p className="dashboard-empty">No student exam results yet.</p>}
      {entries.map(student => (
        <div key={student.userId} className={`leader-row ${student.current ? "active-user" : ""}`}>
          <div className="rank-circle" style={{ background: student.rank === 1 ? "#b7791f" : student.rank <= 3 ? "#64748b" : "#2563eb" }}>{student.rank}</div>
          <div className="leader-avatar" aria-hidden="true">{student.name?.trim().charAt(0).toUpperCase() || "S"}</div>
          <div className="leader-info">
            <h4>{student.name}{student.current && " (You)"}</h4>
            <small>{formatCount(student.examsCompleted)} exams</small>
          </div>
          <div className="leader-score">{formatPercentage(student.percentage)}</div>
        </div>
      ))}
    </div>
  );
}
export default LeaderBoard;
