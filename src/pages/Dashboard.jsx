import "./Dashboard.css";
import StatsCard from "../components/StatsCard/StatsCard";
import RecentActivity from "../components/RecentActivity/RecentActivity";
import TodayPractice from "../components/TodayPractice/TodayPractice";
import LeaderBoard from "../components/LeaderBoard/LeaderBoard";
import PracticeStreak from "../components/PracticeStreak/PracticeStreak";
import UpcomingTests from "../components/UpcomingTests/UpcomingTests";
import { useEffect, useState } from "react";
import DashboardService from "../services/DashboardService";
import { ADMIN_ROLES, currentRole, ROLES } from "../utils/roles";
import {
  dashboardCards,
  formatCount,
  dashboardGreeting,
} from "../utils/dashboardMetrics";
import { getApiErrorMessage } from "../utils/apiError";
import { getCurrentUserName } from "../utils/user";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const role = currentRole();

  useEffect(() => {
    let alive = true;
    let busy = false;
    const controller = new AbortController();
    async function load() {
      setNow(new Date());
      if (busy || document.visibilityState === "hidden") return;
      busy = true;
      setLoading(true);
      try {
        const response = await DashboardService.getDashboardData({
          signal: controller.signal,
        });
        if (alive) {
          setData(response.data);
          setError("");
        }
      } catch (err) {
        if (alive)
          setError(getApiErrorMessage(err, "Couldn't load dashboard data."));
      } finally {
        busy = false;
        if (alive) setLoading(false);
      }
    }
    void load();
    const timer = window.setInterval(load, 60000);
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", load);
    return () => {
      alive = false;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", load);
    };
  }, [refresh]);

  const cards = dashboardCards(data).map((card) =>
    card.type === "rank" && ADMIN_ROLES.includes(role)
      ? { ...card, subtitle: "Student rankings from exam results" }
      : card,
  );
  return (
    <div className="dashboard container-fluid" aria-busy={loading}>
      <div className="dashboard-header mb-4">
        <div>
          <h1>{dashboardGreeting(getCurrentUserName(), now)}</h1>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary"
          disabled={loading}
          onClick={() => setRefresh((value) => value + 1)}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          {data && " Showing the last loaded values."}
        </div>
      )}
      {!data && loading && <p role="status">Loading your dashboard…</p>}
      {data && (
        <>
          {ADMIN_ROLES.includes(role) && (
            <div className="row g-4 mb-4">
              {[
                ["college", "totalColleges"],
                ["branch", "totalBranches"],
                ["sections", "totalSections"],
                ["course", "totalCourses"],
              ].map(([type, field]) => (
                <div className="col-12 col-sm-6 col-lg-3" key={type}>
                  <StatsCard type={type} data={formatCount(data[field])} />
                </div>
              ))}
            </div>
          )}
          <div className="row g-4 mb-4">
            {cards.slice(0, 4).map((card) => (
              <div className="col-12 col-sm-6 col-lg-3" key={card.type}>
                <StatsCard {...card} />
              </div>
            ))}
          </div>
          <div className="row g-4 mb-4">
            {cards.slice(4).filter((card) => card.type !== "streak").map((card) => (
              <div className="col-12 col-lg-6" key={card.type}>
                <StatsCard {...card} />
              </div>
            ))}
            <div className="col-12 col-lg-6">
              <PracticeStreak streakDays={data.streakDays} week={data.practiceWeek} />
            </div>
          </div>
          <div className="row g-4 mb-4">
            <div className="col-12 col-xl-6">
              <RecentActivity activities={data.recentActivities} />
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <TodayPractice
                questions={data.todayQuestions}
                goal={data.dailyGoal}
              />
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <LeaderBoard
                entries={data.leaderboard}
                scope={data.rankingScope}
              />
            </div>
          </div>
        </>
      )}
      {role !== ROLES.GUEST && (
        <div className="row">
          <div className="col-12">
            <UpcomingTests />
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;
