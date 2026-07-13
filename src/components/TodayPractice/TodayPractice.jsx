import "./TodayPractice.css";

function TodayPractice() {
  return (
    <div className="practice-card">

      <div className="practice-header">
        <h2>Today's Practice</h2>
      </div>

      <div className="progress-circle">

        <div className="progress-inner">
          <h1>60%</h1>
          <p>Goal Completed</p>
        </div>

      </div>

      <div className="practice-info">
        <h3>12 / 20 Questions</h3>
        <p>Complete today's target to maintain your learning streak.</p>
      </div>

      <button className="practice-btn">
        Start Practicing
      </button>

    </div>
  );
}

export default TodayPractice;