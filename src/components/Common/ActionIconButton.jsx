import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

function ActionIconButton({ type = "edit", onClick, title }) {
  const isDelete = type === "delete";
  const Icon = isDelete ? FaTrash : FaEdit;
  const color = isDelete ? "#dc2626" : "#2563eb";

  return (
    <button
      type="button"
      onClick={onClick}
      title={title || (isDelete ? "Delete" : "Edit")}
      aria-label={title || (isDelete ? "Delete" : "Edit")}
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
        cursor: "pointer",
        padding: 0,
        boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
      }}
    >
      <Icon size={14} />
    </button>
  );
}

export default ActionIconButton;
