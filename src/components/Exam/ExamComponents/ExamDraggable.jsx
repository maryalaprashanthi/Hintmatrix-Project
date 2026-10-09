/* eslint-disable react/prop-types */
import { useDraggable } from "@dnd-kit/react";
import "./ExamDraggable.css";

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

const PlacedIcon = () => (
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

// maxDrops comes from the rule engine. Once the row sits in that many
// accounts it stops being draggable. A null maxDrops means no known limit.
export default function ExamDraggable({
  id,
  children,
  type,
  status = "pending",
  placedCount = 0,
  maxDrops = null,
}) {
  const placed = status === "placed";
  const full = maxDrops != null && placedCount >= maxDrops;

  const { ref } = useDraggable({
    id,
    type,
    disabled: full,
  });

  return (
    <div className={`drag-item ${placed ? "drag-item-placed" : ""}`}>
      <button
        ref={full ? undefined : ref}
        type="button"
        className="drag-btn"
        disabled={full}
        aria-disabled={full}
        title={maxDrops != null ? `Placed ${placedCount} of ${maxDrops}` : undefined}
      >
        <span className="drag-btn-content">{children}</span>

        {maxDrops != null && (
          <span className="drag-drop-count">
            {placedCount}/{maxDrops}
          </span>
        )}

        <span className="drag-status-icon">
          {placed ? <PlacedIcon /> : <PendingIcon />}
        </span>
      </button>
    </div>
  );
}
