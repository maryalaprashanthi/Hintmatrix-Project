import React from "react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

function ActionIconButton({ type = "edit", onClick, title, disabled = false }) {
  const isDelete = type === "delete";
  const isView = type === "view";
  const Icon = isDelete ? FaTrash : isView ? FaEye : FaEdit;
  const color = isDelete ? "#dc2626" : "#2563eb";
  const defaultLabel = isDelete ? "Delete" : isView ? "View" : "Edit";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || defaultLabel}
      aria-label={title || defaultLabel}
      style={{
        width: "32px",
        height: "32px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        borderRadius: "6px",
        background: color,
        color: "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        padding: 0,
        boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
      }}
    >
      <Icon size={14} />
    </button>
  );
}

export default ActionIconButton;
