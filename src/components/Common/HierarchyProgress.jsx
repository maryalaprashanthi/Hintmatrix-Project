const displayPercentage = (value) => {
  const percentage = Math.min(100, Math.max(0, Number(value) || 0));
  const rounded = Math.round(percentage * 10) / 10;
  return Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
};

const HierarchyProgress = ({ label, value }) => {
  const percentage = displayPercentage(value);

  return (
    <div
      className="hierarchy-progress"
      aria-label={`${label} progress ${percentage} percent`}
    >
      <div className="hierarchy-progress-label">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div
        className="hierarchy-progress-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Number(percentage)}
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default HierarchyProgress;
