/* eslint-disable react/prop-types */
import styles from "./ExamDialog.module.css";

const ClockIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--gold-400)"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

// Copy per reason. All three land on the same card - the attempt is over
// either way - but a candidate who pressed Submit should not be told the clock
// ran out.
const ENDINGS = {
  time: {
    title: "Time's up",
    lead: "Your paper was submitted automatically with ",
  },
  warnings: {
    title: "Exam ended",
    lead: "You used all three warnings, so the paper was submitted for you with ",
  },
  manual: {
    title: "Paper submitted",
    lead: "Your paper is in with ",
  },
};

// 1g. Calm, not alarming: it reports what was saved rather than what was lost,
// and offers one way out. Deliberately has no dismiss - the attempt is over.
const TimeUpDialog = ({ attempted, total, reason, onExit }) => {
  const ending = ENDINGS[reason] ?? ENDINGS.time;

  return (
    <div className={styles.scrim} role="alertdialog" aria-modal="true">
      <div className={styles.timeUpCard}>
        <div className={styles.timeUpIcon}>
          <ClockIcon />
        </div>
        <div className={styles.timeUpTitle}>{ending.title}</div>
        <div className={styles.timeUpBody}>
          {ending.lead}
          <b>
            {attempted} of {total}
          </b>{" "}
          questions attempted. Nothing was lost.
        </div>
        <div className={styles.timeUpActions}>
          <button className={styles.onDark} onClick={onExit} type="button">
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeUpDialog;
