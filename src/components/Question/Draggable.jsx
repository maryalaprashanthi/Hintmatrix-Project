/* eslint-disable react/prop-types */
import { useDraggable } from "@dnd-kit/react";
import "./Draggable.css";

export default function Draggable({ id, children, type }) {
  const { ref, isDragging } = useDraggable({
    id,
    type,
  });

  return (
    <div className={`drag-item ${isDragging ? "is-dragging" : ""}`}>
      <button ref={ref} type="button" className="drag-btn">
        {children}
      </button>
    </div>
  );
}
