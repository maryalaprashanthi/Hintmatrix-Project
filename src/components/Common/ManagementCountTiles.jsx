import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./ManagementCountTiles.css";

export default function ManagementCountTiles({
  label,
  counts,
  icon,
  extraTiles = [],
}) {
  const tiles = [
    { title: `Total ${label}`, count: counts?.total, subtitle: `All ${label}`, icon, color: "blue" },
    { title: `Total Active ${label}`, count: counts?.active, subtitle: "Currently Active", icon: FaCheckCircle, color: "green" },
    { title: `Total Inactive ${label}`, count: counts?.inactive, subtitle: "Currently Inactive", icon: FaTimesCircle, color: "red" },
    ...extraTiles,
  ];

  return (
    <div className="row g-4 management-stats-row">
      {tiles.map(({ title, count, subtitle, icon: Icon, color }) => (
        <div
          className={`col-12 ${tiles.length === 4 ? "col-md-6 col-xl-3" : "col-md-4"}`}
          key={title}
        >
          <div className="management-stat-card">
            <div className={`management-stat-icon ${color}`}>
              <Icon aria-hidden="true" />
            </div>
            <div>
              <small>{title}</small>
              <h3>{count ?? "—"}</h3>
              <span>{subtitle}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
