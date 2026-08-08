/* eslint-disable react/prop-types */
import { useDraggable } from "@dnd-kit/react";
import "./Draggable.css";
import { VscError } from "react-icons/vsc";

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
  console.log("My status is ", status);
  const { ref } = useDraggable({
    id,
    type,
    disabled: solved,
  });
  {
    /* <CheckIcon /> */
    // <PendingIcon />
  }
  return (
    <div
      className={`drag-item ${status == "solved" ? "drag-item-solved" : status == "wrong" ? "drag-item-wrong" : ""}`}
    >
      <button
        //to disable dragging after solved
        ref={solved ? undefined : ref}
        type="button"
        className="drag-btn"
        disabled={solved}
        aria-disabled={solved}
      >
        <span className="drag-btn-content">{children}</span>
        <span className="drag-status-icon">
          {solved ? (
            <CheckIcon />
          ) : status === "wrong" ? (
            <VscError id="icons-styling-wrong" />
          ) : (
            <PendingIcon />
          )}
        </span>
      </button>
    </div>
  );
}
