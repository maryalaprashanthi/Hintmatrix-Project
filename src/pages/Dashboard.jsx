import "./Dashboard.css";

import StatsCard from "../components/StatsCard/StatsCard";
import RecentActivity from "../components/RecentActivity/RecentActivity";
import TodayPractice from "../components/TodayPractice/TodayPractice";
import LeaderBoard from "../components/LeaderBoard/LeaderBoard";
import UpcomingTests from "../components/UpcomingTests/UpcomingTests";

function Dashboard() {
  return (
    <div className="dashboard-content">
      {/* Welcome */}
      <div className="welcome-section">
        <h1>Welcome To Dashboard 👋</h1>
        <p>Keep learning and keep growing!</p>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <StatsCard type="courses" />
        <StatsCard type="practice" />
        <StatsCard type="completed" />
        <StatsCard type="pending" />
      </div>

      {/* Rank & Streak */}
      <div className="rank-grid">
        <StatsCard type="rank" />
        <StatsCard type="streak" />
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid">
        <RecentActivity />
        <TodayPractice />
        <LeaderBoard />
      </div>

      {/* Upcoming Tests */}
      <UpcomingTests />
    </div>
  );
}

export default Dashboard;