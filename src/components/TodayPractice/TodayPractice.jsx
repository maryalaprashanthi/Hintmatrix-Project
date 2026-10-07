/* eslint-disable react/prop-types */
import "./TodayPractice.css";
import { useNavigate } from "react-router-dom";
import { dailyProgress, formatCount } from "../../utils/dashboardMetrics";

function TodayPractice({ questions = 0, goal = 0 }) {
  const navigate = useNavigate();
  const progress = dailyProgress(questions, goal);
  return (
    <div className="practice-card">
      <div className="practice-header">
        <h2>Today&apos;s Practice</h2>
      </div>
      <div
        className="progress-circle"
        role="progressbar"
        aria-label="Daily practice goal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        style={{
          background: `conic-gradient(#2563eb ${progress}%, #e5e7eb ${progress}%)`,
        }}
      >
        <div className="progress-inner">
          <h1>{progress}%</h1>
          <p>Goal Completed</p>
        </div>
      </div>
      <div className="practice-info">
        <h3>
          {formatCount(questions)} / {formatCount(goal)} Questions
        </h3>
        <p>
          {progress === 100
            ? "Daily goal reached. Keep practising!"
            : "Attempt distinct questions today to reach your goal."}
        </p>
        <small>India time · Correct and incorrect answers count</small>
      </div>
      <button
        type="button"
        className="practice-btn"
        onClick={() => navigate("/courses")}
      >
        Start Practising
      </button>
    </div>
  );
}
export default TodayPractice;
