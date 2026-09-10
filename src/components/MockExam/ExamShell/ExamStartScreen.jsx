/* eslint-disable react/prop-types */
import styles from "./ExamStartScreen.module.css";

// 1d. The rules are stated here rather than in a dismissible toast mid-exam,
// so the fullscreen/warning contract is something the candidate agreed to
// before the clock existed.
const ExamStartScreen = ({
  eyebrow,
  title,
  meta,
  rules,
  onStart,
  isLoading,
  error,
}) => (
  <div className={styles.screen}>
    <div className={styles.card}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.meta}>
        {meta.map((item) => (
          <div className={styles.metaTile} key={item.label}>
            <div className={styles.metaValue}>{item.value}</div>
            <div className={styles.metaLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.rules}>
        <div className={styles.rulesTitle}>Before you begin</div>
        <div className={styles.rulesList}>
          {rules.map((rule, index) => (
            <div className={styles.rule} key={rule}>
              <span className={styles.ruleIndex}>{index + 1}</span>
              {rule}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.start}
          disabled={isLoading || Boolean(error)}
          onClick={onStart}
          type="button"
        >
          Start exam in fullscreen
        </button>
        {error ? (
          <span className={styles.loadNote} role="alert">
            {error}
          </span>
        ) : (
          isLoading && <span className={styles.loadNote}>Loading the paper…</span>
        )}
      </div>
    </div>
  </div>
);

export default ExamStartScreen;
