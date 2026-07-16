import "./Dashboard.css";

import StatsCard from "../components/StatsCard/StatsCard";
import RecentActivity from "../components/RecentActivity/RecentActivity";
import TodayPractice from "../components/TodayPractice/TodayPractice";
import LeaderBoard from "../components/LeaderBoard/LeaderBoard";
import UpcomingTests from "../components/UpcomingTests/UpcomingTests";

function Dashboard() {
  return (
    <div className="dashboard">

      {/* Welcome */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome To Dashboard 👋</h1>
          <p>Keep learning and keep growing!</p>
        </div>
      </div>

      {/* Statistics */}
      <section className="stats-section">
        <StatsCard type="courses" />
        <StatsCard type="practice" />
        <StatsCard type="completed" />
        <StatsCard type="pending" />
      </section>

      {/* Rank & Streak */}
      <section className="rank-section">
        <StatsCard type="rank" />
        <StatsCard type="streak" />
      </section>

      {/* Bottom */}
      <section className="bottom-section">
        <RecentActivity />
        <TodayPractice />
        <LeaderBoard />
      </section>

      {/* Upcoming Tests */}
      <section className="upcoming-section">
        <UpcomingTests />
      </section>

    </div>
  );
}

export default Dashboard;