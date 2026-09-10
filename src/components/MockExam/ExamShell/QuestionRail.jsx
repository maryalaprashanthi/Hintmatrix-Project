/* eslint-disable react/prop-types */
import styles from "./QuestionRail.module.css";

// The design's four statuses, in the order they override each other:
// not visited -> answered -> marked for review -> current.
const cellClassName = ({ isCurrent, isAnswered, isMarked }) =>
  [
    styles.cell,
    isAnswered && styles.cellAnswered,
    isMarked && styles.cellMarked,
    isCurrent && styles.cellCurrent,
  ]
    .filter(Boolean)
    .join(" ");

const LEGEND_SWATCHES = {
  answered: { background: "var(--green-100)", border: "1px solid #86efac" },
  marked: { background: "var(--gold-100)", border: "1px solid var(--gold-200)" },
  notVisited: { background: "var(--paper-000)", border: "1px solid var(--ink-300)" },
  current: { background: "var(--navy-600)", border: "1px solid var(--navy-700)" },
};

const QuestionRail = ({
  questions,
  activeIndex,
  answeredCount,
  visitedCount,
  markedCount,
  onJump,
}) => {
  const total = questions.length;
  const remaining = total - answeredCount;
  const progressPct = total ? (answeredCount / total) * 100 : 0;

  return (
    <aside className={styles.rail} aria-label="Question navigator">
      <div>
        <div className={styles.progressHead}>
          <span className={styles.eyebrow}>Your progress</span>
          <span className={styles.progressCount}>
            {answeredCount}/{total}
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
        <div className={styles.remaining}>
          {remaining === 0 ? "All questions answered" : `${remaining} left to answer`}
        </div>
      </div>

      <div className={styles.divider} />

      <div>
        <div className={`${styles.eyebrow} ${styles.gridLabel}`}>Jump to question</div>
        <div className={styles.grid}>
          {questions.map((question, index) => {
            const isCurrent = index === activeIndex;
            const isMarked = question.isMarked;

            return (
              <button
                aria-current={isCurrent ? "true" : undefined}
                className={cellClassName({
                  isCurrent,
                  isAnswered: question.isAnswered,
                  isMarked,
                })}
                key={question.id}
                onClick={() => onJump(index)}
                type="button"
              >
                {index + 1}
                {isMarked && !isCurrent && <i className={styles.cellDot} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendRow}>
          <i className={styles.legendSwatch} style={LEGEND_SWATCHES.answered} />
          Answered
          <b className={styles.legendCount}>{answeredCount}</b>
        </div>
        <div className={styles.legendRow}>
          <i className={styles.legendSwatch} style={LEGEND_SWATCHES.marked} />
          Marked for review
          <b className={styles.legendCount}>{markedCount}</b>
        </div>
        <div className={styles.legendRow}>
          <i className={styles.legendSwatch} style={LEGEND_SWATCHES.notVisited} />
          Not visited
          <b className={styles.legendCount}>{total - visitedCount}</b>
        </div>
        <div className={styles.legendRow}>
          <i className={styles.legendSwatch} style={LEGEND_SWATCHES.current} />
          Current
          <b className={styles.legendCount}>1</b>
        </div>
      </div>
    </aside>
  );
};

export default QuestionRail;
