/* eslint-disable react/prop-types */
import { formatTime } from "./ExamShell/formatTime";
import styles from "./Timer.module.css";

// Presentational only. The countdown itself lives in ExamPage, because the
// remaining time is also what the submit dialog quotes back to the user and
// what triggers the time-up screen at zero - two things a self-contained
// timer could not reach.
const Timer = ({ secondsLeft }) => (
  <div className={styles.timer}>
    <span className={styles.label}>Time left</span>
    <span className={styles.value}>{formatTime(secondsLeft)}</span>
  </div>
);

export default Timer;
