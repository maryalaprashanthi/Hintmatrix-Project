// mm:ss, clamped at zero. Shared by the timer chip and the submit dialog,
// which quotes the remaining time back to the candidate.
export const formatTime = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds));

  return [Math.floor(safe / 60), safe % 60]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export default formatTime;
