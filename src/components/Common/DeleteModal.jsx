import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./DeleteModal.css";
import { FaTrashAlt, FaTimes } from "react-icons/fa";

function DeleteModal({
  show,
  message = "Question deleted successfully!",
  onClose,
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  return createPortal(
    <div className="delete-success-overlay">
      <div className="delete-success-card">
        {/* Close Icon */}
        <button className="delete-success-close" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Delete Icon */}
        <FaTrashAlt className="delete-success-icon" />

        <h2>Deleted!</h2>

        <p>{message}</p>

        {/* Continue Button */}
        <button className="delete-success-continue" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default DeleteModal;
