import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc",
      padding: "24px",
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
        padding: "32px",
        textAlign: "center",
      }}>
        <h2 style={{ marginBottom: "12px", color: "#0f172a" }}>Access denied</h2>
        <p style={{ marginBottom: "20px", color: "#475569", lineHeight: 1.6 }}>
          You do not have permission to view this page.
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard", { replace: true })}
          style={{
            border: "none",
            background: "#2563eb",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
