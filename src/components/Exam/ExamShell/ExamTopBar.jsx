/* eslint-disable react/prop-types */
import Timer from "../Timer";
import styles from "./ExamTopBar.module.css";

const WarningIcon = ({ size = 15, stroke = "var(--amber-600)" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth="2.2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 9v5" />
    <path d="M12 17.5v.2" />
  </svg>
);

const FullscreenIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
  </svg>
);

// 1a's header. Progress is a hairline rail across the very top so it reads as
// ambient rather than as another number to track; the timer is the only piece
// given inverse contrast, because it is the one thing worth glancing at.
const ExamTopBar = ({
  eyebrow,
  title,
  progressPct,
  warnings,
  maxWarnings,
  secondsLeft,
  isFullscreen,
  onToggleFullscreen,
  bannerMessage,
  onDismissBanner,
}) => (
  <header>
    <div className={styles.progressTrack}>
      <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
    </div>

    <div className={styles.bar}>
      <div className={styles.identity}>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <div className={styles.title}>{title}</div>
      </div>

      <div className={styles.controls}>
        {warnings > 0 && (
          <div className={styles.warnPill} role="status">
            <WarningIcon />
            <span className={styles.warnLabel}>
              Warning {warnings} of {maxWarnings}
            </span>
            <span className={styles.warnDots}>
              {Array.from({ length: maxWarnings }, (_, index) => (
                <i
                  className={[
                    styles.warnDot,
                    index < warnings && styles.warnDotUsed,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={index}
                />
              ))}
            </span>
          </div>
        )}

        <Timer secondsLeft={secondsLeft} />

        <button
          className={styles.ghostButton}
          onClick={onToggleFullscreen}
          type="button"
        >
          <FullscreenIcon />
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </div>
    </div>

    {bannerMessage && (
      <div className={styles.banner} role="alert">
        <WarningIcon />
        <span className={styles.bannerText}>
          <b>{bannerMessage.cause}</b> {bannerMessage.consequence}
        </span>
        <button
          className={styles.bannerAction}
          onClick={onDismissBanner}
          type="button"
        >
          Return to fullscreen
        </button>
      </div>
    )}
  </header>
);

export default ExamTopBar;
