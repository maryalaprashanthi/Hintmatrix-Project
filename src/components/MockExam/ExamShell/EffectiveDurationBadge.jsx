/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

// How many minutes a student would actually get if they pressed Start right
// now: min(durationMinutes, time left until the exam's own end date) - the
// same formula the running Timer applies, shown as a live preview before
// they've started. Self-ticking, like Timer, so sitting on this screen
// doesn't force the whole start screen to re-render every second.
const computeMinutes = (durationMinutes, endAt) => {
  if (!endAt) return durationMinutes;

  const minutesToEnd = Math.max(0, (endAt - Date.now()) / 60000);

  return Math.min(durationMinutes, Math.ceil(minutesToEnd));
};

const EffectiveDurationBadge = ({ durationMinutes, endDate }) => {
  const endAt = endDate ? new Date(endDate).getTime() : null;

  const [minutes, setMinutes] = useState(() =>
    computeMinutes(durationMinutes, endAt),
  );

  useEffect(() => {
    // No end date (a mock exam, or the sample paper) - nothing to count
    // down to, so the duration never changes while this screen is open.
    if (!endAt) {
      setMinutes(durationMinutes);
      return undefined;
    }

    const tick = () => setMinutes(computeMinutes(durationMinutes, endAt));

    tick();
    const id = window.setInterval(tick, 1000);

    return () => window.clearInterval(id);
  }, [durationMinutes, endAt]);

  return <>{minutes}m</>;
};

export default EffectiveDurationBadge;
