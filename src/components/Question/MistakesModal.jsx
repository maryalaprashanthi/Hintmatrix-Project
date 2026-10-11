import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import CheckMistakes from "./CheckMistakes";
import { getCurrentUserId } from "../../utils/user";
import "./CheckMistakes.css";

const MistakesModal = ({ questionId, setCheckMistakes }) => {
  const handleClose = () => setCheckMistakes(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setCheckMistakes(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setCheckMistakes]);

  return createPortal(
    <div
      className="check-mistakes-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        className="check-mistakes-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="check-mistakes-title"
      >
        <header className="check-mistakes-header">
          <div className="check-mistakes-heading">
            <h2 id="check-mistakes-title">Check Mistakes</h2>
            <p>Review the incorrect answers you have submitted for this question.</p>
          </div>
          <button
            type="button"
            className="check-mistakes-close"
            aria-label="Close check mistakes"
            onClick={handleClose}
          >
            <FaTimes />
          </button>
        </header>

        <div className="check-mistakes-body">
          <CheckMistakes userId={getCurrentUserId()} questionId={questionId} />
        </div>

      </section>
    </div>,
    document.body,
  );
};

export default MistakesModal;
