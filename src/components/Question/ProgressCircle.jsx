import "./ProgressCircle.css";

const ProgressCircle = ({ solvedCount = 1, totalCount = 20 }) => {
  // Calculate percentage
  const percentage = Math.round((solvedCount / totalCount) * 100);
  // SVG Circle calculations for the progress ring
  console.log("Solved count is ", solvedCount);
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    solvedCount !== null
      ? circumference - (percentage / 100) * circumference
      : 0;
  return (
    <div className="progress-chart-wrapper">
      <svg className="progress-ring" width="70" height="70">
        {/* Background gray circle */}
        <circle
          className="progress-ring-circle-bg"
          stroke="#EAEAEA"
          strokeWidth="6"
          fill="transparent"
          r={radius}
          cx="35"
          cy="35"
        />
        {/* Foreground green circle */}
        <circle
          className="progress-ring-circle"
          stroke="#00C853"
          strokeWidth="6"
          fill="transparent"
          r={radius}
          cx="35"
          cy="35"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <span className="progress-percentage">{percentage}%</span>
    </div>
  );
};

export default ProgressCircle;
