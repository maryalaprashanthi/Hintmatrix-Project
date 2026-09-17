import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ManagementCountTiles({ label, counts, icon }) {
  return (
    <div className="row g-3 mb-4">
      {[
        { title: `Total ${label}`, count: counts?.total, icon, color: "primary" },
        { title: `Total Active ${label}`, count: counts?.active, icon: FaCheckCircle, color: "success" },
        { title: `Total Inactive ${label}`, count: counts?.inactive, icon: FaTimesCircle, color: "danger" },
      ].map(({ title, count, icon: Icon, color }) => (
        <div className="col-12 col-md-4" key={title}>
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <Icon className={`text-${color} flex-shrink-0`} size={32} aria-hidden="true" />
              <div>
                <div className="fw-semibold">{title}</div>
                <div className={`fs-3 fw-bold text-${color}`}>{count ?? "—"}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
