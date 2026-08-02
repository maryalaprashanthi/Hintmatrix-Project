import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./SuccessModal.css";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

function SuccessModal({ show, message, onClose }) {

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000); // Auto close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  return createPortal(
    <div className="success-overlay">

      <div className="success-card">

        {/* Close Icon */}
        <button 
          className="success-close"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        {/* Success Icon */}
        <FaCheckCircle className="success-icon"/>

        <h2>Success!</h2>

        <p>{message}</p>

        {/* Continue Button */}
        <button
          className="continue-btn"
          onClick={onClose}
        >
          Continue
        </button>

      </div>

    </div>,

    document.body
  );
}

export default SuccessModal;