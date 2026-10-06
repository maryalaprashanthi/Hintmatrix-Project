/* eslint-disable react/prop-types */
import "./RecentActivity.css";
import { useState } from "react";
import { FaCheckCircle, FaEdit, FaFileAlt, FaBookOpen } from "react-icons/fa";
import { activityTime } from "../../utils/dashboardMetrics";

const styles = {
  EXAM: { Icon: FaCheckCircle, color: "#22c55e", bg: "#ecfdf5" },
  PRACTICE: { Icon: FaEdit, color: "#2563eb", bg: "#eff6ff" },
  MOCK: { Icon: FaFileAlt, color: "#8b5cf6", bg: "#f3e8ff" },
  SUBSCRIPTION: { Icon: FaBookOpen, color: "#f59e0b", bg: "#fffbeb" },
};

function RecentActivity({ activities = [] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="recent-card">
      <div className="recent-header">
        <h2>Recent Activity</h2>
        {activities.length > 4 && <button type="button" aria-expanded={expanded}
          onClick={() => setExpanded(value => !value)}>{expanded ? "Show less" : "Show more"}</button>}
      </div>
      {activities.length === 0 && <p className="dashboard-empty">No activity recorded yet.</p>}
      {(expanded ? activities : activities.slice(0, 4)).map(item => {
        const { Icon, color, bg } = styles[item.type] ?? styles.PRACTICE;
        return <div className="activity" key={item.id}>
          <div className="activity-icon" style={{ background: bg, color }}><Icon /></div>
          <div className="activity-details"><h4>{item.title}</h4><p>{item.detail}</p></div>
          <time dateTime={item.occurredAt} title="India time">{activityTime(item.occurredAt)}</time>
        </div>;
      })}
      {activities.some(item => item.type === "PRACTICE") && <p className="dashboard-footnote">Practice entries show the latest stored results for each question.</p>}
    </div>
  );
}
export default RecentActivity;
