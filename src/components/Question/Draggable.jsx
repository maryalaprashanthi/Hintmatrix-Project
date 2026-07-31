/* eslint-disable react/prop-types */
import { useDraggable } from "@dnd-kit/react";
import "./Draggable.css";

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="#10b981" />
    <path
      d="M8 12.5l2.5 2.5 5.5-6"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PendingIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="#fff"
      stroke="#f59e0b"
      strokeWidth="3"
    />
  </svg>
);

export default function Draggable({ id, children, type, status = "pending" }) {
  const solved = status === "solved";

  const { ref } = useDraggable({
    id,
    type,
    disabled: solved,
  });

  return (
    <div className={`drag-item ${solved ? "drag-item-solved" : ""}`}>
      <button
        ref={solved ? undefined : ref}
        type="button"
        className="drag-btn"
        disabled={solved}
        aria-disabled={solved}
      >
        <span className="drag-btn-content">{children}</span>
        <span className="drag-status-icon">
          {solved ? <CheckIcon /> : <PendingIcon />}
        </span>
      </button>
    </div>
  );
}
