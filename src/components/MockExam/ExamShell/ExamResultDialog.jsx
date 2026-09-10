/* eslint-disable react/prop-types */
import styles from "./ExamDialog.module.css";

const AwardIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--gold-400)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M8.5 13 7 21l5-2.5L17 21l-1.5-8" />
  </svg>
);

const roundTo = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const formatMarks = (value) =>
  Number.isFinite(Number(value)) ? String(roundTo(Number(value), 2)) : "—";

const formatPercentage = (value) =>
  Number.isFinite(Number(value)) ? roundTo(Number(value), 1) : null;

// The end-of-attempt card for a real (API) paper: it also reports the submit
// itself, since that is a network call the candidate needs to know landed.
// The sample paper keeps using TimeUpDialog instead - nothing is sent there.
const ExamResultDialog = ({
  state,
  result,
  error,
  attempted,
  total,
  onRetry,
  onExit,
}) => {
  const percentage = formatPercentage(result?.percentage);

  return (
    <div className={styles.scrim} role="alertdialog" aria-modal="true">
      <div className={styles.timeUpCard}>
        <div className={styles.timeUpIcon}>
          <AwardIcon />
        </div>

        {state === "submitting" && (
          <>
            <div className={styles.timeUpTitle}>Submitting…</div>
            <div className={styles.timeUpBody}>
              Sending your{" "}
              <b>
                {attempted} of {total}
              </b>{" "}
              answered {total === 1 ? "question" : "questions"} for marking.
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className={styles.timeUpTitle}>Submit didn&rsquo;t go through</div>
            <div className={styles.timeUpBody}>
              {error}
              <br />
              Your answers are still here — nothing was lost.
            </div>
            <div className={styles.timeUpActions}>
              <button className={styles.onDark} onClick={onRetry} type="button">
                Try again
              </button>
              <button className={styles.onDark} onClick={onExit} type="button">
                Back to home
              </button>
            </div>
          </>
        )}

        {state === "done" && (
          <>
            <div className={styles.timeUpTitle}>Paper submitted</div>

            <div className={styles.resultScore}>
              <div className={styles.resultScoreValue}>
                {formatMarks(result?.totalMarks)}
              </div>
              <div className={styles.resultScoreLabel}>Total marks</div>
            </div>

            <div className={styles.timeUpBody}>
              {percentage != null ? (
                <>
                  That&rsquo;s <b>{percentage}%</b> across {total}{" "}
                  {total === 1 ? "question" : "questions"}.
                </>
              ) : (
                <>Your attempt is in. Nothing was lost.</>
              )}
            </div>

            <div className={styles.timeUpActions}>
              <button className={styles.onDark} onClick={onExit} type="button">
                Back to home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamResultDialog;
