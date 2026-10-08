/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { formatTime } from "./ExamShell/formatTime";
import styles from "./Timer.module.css";

const secondsUntil = (endAt) => Math.max(0, Math.round((endAt - Date.now()) / 1000));

// Self-contained: ticks its own display every second from a fixed end
// timestamp, so only this leaf re-renders each second - not the whole exam
// page (ExamPage, the question rail, the active question). It still reports
// "time's up" to the parent exactly once, via onExpire, read from a ref so a
// fresh inline callback on every parent render never restarts the interval.
const Timer = ({ endAt, onExpire }) => {
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(endAt));
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;

    const tick = () => {
      const next = secondsUntil(endAt);
      setSecondsLeft(next);

      if (next === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);

    return () => window.clearInterval(id);
  }, [endAt]);

  return (
    <div className={styles.timer}>
      <span className={styles.label}>Time left</span>
      <span className={styles.value}>{formatTime(secondsLeft)}</span>
    </div>
  );
};

export default Timer;
