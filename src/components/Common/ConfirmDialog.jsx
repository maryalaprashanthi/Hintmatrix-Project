/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle } from "react-icons/fi";
import "./ConfirmDialog.css";

// A styled replacement for window.confirm() for destructive actions.
//
// The danger lives in the confirm button, not the whole card - the dialog
// stays calm and just states plainly what will happen. Name the resource in
// `title`, spell out the consequence in `body`, and let the buttons say
// exactly what they do ("Delete chapter" / "Cancel").
//
//   <ConfirmDialog
//     open={Boolean(pendingDelete)}
//     title={`Delete "${pendingDelete?.name}"?`}
//     body="This chapter and its topics will be removed. This can't be undone."
//     confirmLabel="Delete chapter"
//     loading={deleting}
//     onConfirm={runDelete}
//     onCancel={() => setPendingDelete(null)}
//   />
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger", // "danger" | "default"
  loading = false,
  error = null, // message shown inline if the action failed; lets them retry
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);
  const cardRef = useRef(null);
  const returnFocusRef = useRef(null);

  // Focus the safe option on open, restore focus to the trigger on close.
  useEffect(() => {
    if (!open) return undefined;

    returnFocusRef.current = document.activeElement;
    const focusTimer = window.setTimeout(() => cancelRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      if (returnFocusRef.current instanceof HTMLElement) {
        returnFocusRef.current.focus();
      }
    };
  }, [open]);

  // Escape to cancel; keep Tab inside the dialog.
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        event.preventDefault();
        onCancel?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = cardRef.current?.querySelectorAll(
        'button:not([disabled])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="confirm-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel?.();
      }}
    >
      <div
        ref={cardRef}
        className={`confirm-card confirm-card--${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={body ? "confirm-body" : undefined}
      >
        <div className="confirm-icon" aria-hidden="true">
          <FiAlertTriangle />
        </div>

        <h2 id="confirm-title" className="confirm-title">
          {title}
        </h2>

        {body && (
          <p id="confirm-body" className="confirm-body">
            {body}
          </p>
        )}

        {error && (
          <p className="confirm-error" role="alert">
            {error}
          </p>
        )}

        <div className="confirm-actions">
          <button
            ref={cancelRef}
            type="button"
            className="confirm-btn confirm-btn--ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {error ? "Close" : cancelLabel}
          </button>

          <button
            type="button"
            className={`confirm-btn confirm-btn--${tone}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting…" : error ? "Try again" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
