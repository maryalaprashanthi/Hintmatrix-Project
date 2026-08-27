import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import styles from "./ExamPage.module.css";

const formatTime = (totalSeconds) =>
  [
    Math.floor(totalSeconds / 3600),
    Math.floor((totalSeconds % 3600) / 60),
    totalSeconds % 60,
  ]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

const Timer = ({ initialSeconds = 45 * 60 }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = window.setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className={styles["exam-status-item"]}>
      <FiClock />
      Time left <strong>{formatTime(seconds)}</strong>
    </span>
  );
};

export default Timer;
