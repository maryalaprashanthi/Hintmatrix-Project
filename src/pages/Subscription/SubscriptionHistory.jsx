import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaBan, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import SubscriptionService from "../../services/SubscriptionService";
import "./SubscriptionHistory.css";

const statusFor = (subscription) => {
  if (subscription.active === false) return "Inactive";
  if (subscription.expiresAt && new Date(subscription.expiresAt) < new Date()) return "Expired";
  return "Active";
};

export default function SubscriptionHistory() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [query, setQuery] = useState("");
  const canDeactivate = ["SUPER_ADMIN", "BRANCH_ADMIN"].includes(
    localStorage.getItem("role"),
  );

  const loadHistory = () => {
    setLoading(true);
    SubscriptionService.getHistory()
      .then((response) => setRecords(response.data || []))
      .catch(() => setError("Unable to load subscription history."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDeactivate = (subscription) => {
    if (subscription.status !== "Active") return;
    if (!window.confirm(`Deactivate the subscription for ${subscription.displayName}?`)) return;

    setError("");
    setMessage("");
    setDeactivatingId(subscription.subscriptionId);
    SubscriptionService.deactivate(subscription.subscriptionId)
      .then(() => {
        setRecords((current) =>
          current.map((record) =>
            record.subscriptionId === subscription.subscriptionId
              ? { ...record, active: false, status: "INACTIVE" }
              : record,
          ),
        );
        setMessage(`Subscription for ${subscription.displayName} was deactivated.`);
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || "Unable to deactivate subscription.");
      })
      .finally(() => setDeactivatingId(null));
  };

  const rowData = useMemo(
    () =>
      records.map((record) => ({
        ...record,
        displayName: record.studentName || `User ${record.userId}`,
        email: record.studentEmail,
        courseName: record.course,
        planName: record.plan,
        status: statusFor(record),
      })),
    [records],
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Student",
        field: "displayName",
        flex: 1.2,
        minWidth: 180,
        cellRenderer: (params) => (
          <div>
            <strong>{params.value}</strong>
            <small className="history-grid-email">{params.data.email || ""}</small>
          </div>
        ),
      },
      { headerName: "Course", field: "courseName", flex: 1, minWidth: 140 },
      { headerName: "Plan", field: "planName", flex: 1, minWidth: 140 },
      {
        headerName: "Status",
        field: "status",
        width: 125,
        cellRenderer: (params) => (
          <span className={`history-status ${params.value.toLowerCase()}`}>
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Started",
        field: "startsAt",
        width: 130,
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : "-",
      },
      {
        headerName: "Expires",
        field: "expiresAt",
        width: 130,
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : "No expiry",
      },
      ...(canDeactivate ? [{
        headerName: "Action",
        field: "subscriptionId",
        width: 145,
        sortable: false,
        filter: false,
        cellRenderer: (params) =>
          params.data.status === "Active" ? (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDeactivate(params.data)}
              disabled={deactivatingId === params.data.subscriptionId}
              title="Deactivate subscription for this user"
            >
              <FaBan /> {deactivatingId === params.data.subscriptionId ? "Working..." : "Deactivate"}
            </Button>
          ) : (
            <span className="history-action-muted">Deactivated</span>
          ),
      }] : []),
    ],
    [canDeactivate, deactivatingId],
  );

  return (
    <div className="subscription-history-page">
      <header className="subscription-history-header">
        <div className="subscription-history-title">
          <button type="button" className="back-btn" onClick={() => navigate("/subscriptions")}>
            <FaArrowLeft />
          </button>
          <div>
            <h1><FaHistory /> Subscription History</h1>
            <p>Review current and previous course subscriptions.</p>
          </div>
        </div>
        <input
          className="subscription-history-search"
          placeholder="Search student, plan or course"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </header>

      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success" dismissible onClose={() => setMessage("")}>{message}</Alert>}
      {loading ? (
        <div className="subscription-history-loading"><Spinner animation="border" /></div>
      ) : (
        <div className="ag-theme-alpine subscription-history-grid">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            quickFilterText={query}
            defaultColDef={{ sortable: true, filter: true, resizable: true }}
            domLayout="autoHeight"
            rowHeight={58}
            headerHeight={48}
            overlayNoRowsTemplate="No subscription history found."
          />
        </div>
      )}
    </div>
  );
}
