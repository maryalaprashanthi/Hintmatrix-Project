/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { formatTime } from "./formatTime";
import styles from "./ExamDialog.module.css";

// 1e. Never a bare "are you sure?" - the counts are the whole point, so the
// candidate can see what they are about to leave behind and change their mind
// on the evidence.
//
// The design left the secondary slot empty; a confirmation with no way back
// is a trap, so "Keep working" fills it and Escape does the same thing.
const SubmitConfirmDialog = ({
  secondsLeft,
  answered,
  marked,
  unattempted,
  onCancel,
  onConfirm,
}) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.scrim} role="dialog" aria-modal="true">
      <div className={styles.submitCard}>
        <div className={styles.submitTitle}>Submit your paper?</div>
        <div className={styles.submitSub}>
          {formatTime(secondsLeft)} still on the clock — you can keep working.
        </div>

        <div className={styles.summary}>
          <div className={`${styles.summaryTile} ${styles.tileAnswered}`}>
            <div className={styles.summaryValue}>{answered}</div>
            <div className={styles.summaryLabel}>Answered</div>
          </div>
          <div className={`${styles.summaryTile} ${styles.tileMarked}`}>
            <div className={styles.summaryValue}>{marked}</div>
            <div className={styles.summaryLabel}>Marked</div>
          </div>
          <div className={`${styles.summaryTile} ${styles.tileUnattempted}`}>
            <div className={styles.summaryValue}>{unattempted}</div>
            <div className={styles.summaryLabel}>Unattempted</div>
          </div>
        </div>

        <div className={styles.submitActions}>
          <button className={styles.secondary} onClick={onCancel} type="button">
            Keep working
          </button>
          <button className={styles.primary} onClick={onConfirm} type="button">
            Submit anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmDialog;
