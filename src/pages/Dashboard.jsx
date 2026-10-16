import "./Dashboard.css";
import StatsCard from "../components/StatsCard/StatsCard";
import RecentActivity from "../components/RecentActivity/RecentActivity";
import TodayPractice from "../components/TodayPractice/TodayPractice";
import LeaderBoard from "../components/LeaderBoard/LeaderBoard";
import PracticeStreak from "../components/PracticeStreak/PracticeStreak";
import UpcomingTests from "../components/UpcomingTests/UpcomingTests";
import { useEffect, useState } from "react";
import DashboardService from "../services/DashboardService";
import { loadOncePerLogin } from "../utils/pageLoadCache";
import { ADMIN_ROLES, currentRole, ROLES } from "../utils/roles";
import {
  dashboardCards,
  formatCount,
  dashboardGreeting,
} from "../utils/dashboardMetrics";
import { getApiErrorMessage } from "../utils/apiError";
import { getCurrentUserName } from "../utils/user";
import { Link } from "react-router-dom";
import { FaBullseye, FaClock, FaBookOpen, FaArrowRight } from "react-icons/fa";
import ActivitySessionService from "../services/ActivitySessionService";
import PracticePerformanceService from "../services/PracticePerformanceService";

const toArray = (payload) => Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
const numeric = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const durationLabel = (seconds) => {
  const totalMinutes = Math.floor(Math.max(0, numeric(seconds)) / 60);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [studentInsights, setStudentInsights] = useState({ status: "loading", studySeconds: null, summary: null, topics: [] });
  const role = currentRole();
  const isStudent = role === ROLES.STUDENT;

  useEffect(() => {
    let alive = true;
    let busy = false;
    // const controller = new AbortController();
    async function load() {
      setNow(new Date());
      // if (busy || document.visibilityState === "hidden") return;
      if (busy) return;
      busy = true;
      setLoading(true);
      try {
        // const response = await DashboardService.getDashboardData({
        //   signal: controller.signal,
        // });
        const response = await loadOncePerLogin("dashboard", () =>
          DashboardService.getDashboardData(),
        );
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
    // const timer = window.setInterval(load, 60000);
    // window.addEventListener("focus", load);
    // document.addEventListener("visibilitychange", load);
    return () => {
      alive = false;
      // controller.abort();
      // window.clearInterval(timer);
      // window.removeEventListener("focus", load);
      // document.removeEventListener("visibilitychange", load);
    };
  // }, [refresh]);
  }, []);

  useEffect(() => {
    if (!isStudent) return undefined;
    let active = true;
    setStudentInsights({ status: "loading", studySeconds: null, summary: null, topics: [] });
    Promise.allSettled([
      ActivitySessionService.getDailyTime(7),
      PracticePerformanceService.getMyLevel("course"),
      PracticePerformanceService.getMyLevel("topic"),
    ]).then(([studyResult, courseResult, topicResult]) => {
      if (!active) return;
      const studySeconds = studyResult.status === "fulfilled"
        ? toArray(studyResult.value?.data).reduce((sum, day) => sum + numeric(day.activeSeconds), 0)
        : null;
      setStudentInsights({
        status: "ready",
        studySeconds,
        summary: courseResult.status === "fulfilled" ? courseResult.value?.data?.summary || {} : null,
        topics: topicResult.status === "fulfilled" ? toArray(topicResult.value?.data?.items) : [],
      });
    });
    return () => { active = false; };
  }, [isStudent]);

  const isAdmin = ADMIN_ROLES.includes(role);
  const cards = dashboardCards(data).filter((card) => !isAdmin || card.type !== "rank");
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
          // onClick={() => setRefresh((value) => value + 1)}
          onClick={() => window.location.reload()}
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
          {isStudent ? (
            <>
              <section className="student-dashboard-hero">
                <div>
                  <span className="student-dashboard-kicker">YOUR LEARNING SPACE</span>
                  <h2>Small steps, steady progress.</h2>
                  <p>Pick up where you left off or choose a topic to practise today.</p>
                </div>
                <Link to="/courses" className="student-dashboard-cta">Continue learning <FaArrowRight aria-hidden="true" /></Link>
              </section>

              <div className="row g-4 mb-4 student-dashboard-stats">
                {cards.slice(0, 4).map((card) => (
                  <div className="col-12 col-sm-6 col-xl-3" key={card.type}>
                    <StatsCard {...card} to={card.type === "courses" ? "/courses" : undefined} />
                  </div>
                ))}
              </div>

              <section className="student-dashboard-insights mb-4" aria-label="Your weekly learning snapshot">
                <div className="student-dashboard-section-heading"><div><h2>This week</h2><p>A quick snapshot of your study and practice.</p></div><Link to="/time-analytics">View learning analytics <FaArrowRight aria-hidden="true" /></Link></div>
                <div className="student-dashboard-insight-grid">
                  <article className="student-dashboard-insight-card is-time"><span><FaClock aria-hidden="true" /> Study time</span><strong>{studentInsights.status === "loading" ? "…" : studentInsights.studySeconds == null ? "—" : durationLabel(studentInsights.studySeconds)}</strong><small>Tracked over the last 7 days</small></article>
                  <article className="student-dashboard-insight-card is-accuracy"><span><FaBullseye aria-hidden="true" /> Practice accuracy</span><strong>{studentInsights.status === "loading" ? "…" : studentInsights.summary == null ? "—" : numeric(studentInsights.summary.attemptedUnits) > 0 ? `${numeric(studentInsights.summary.accuracyPercentage).toFixed(0)}%` : "Not started"}</strong><small>{studentInsights.summary ? `${formatCount(studentInsights.summary.correctUnits)} correct of ${formatCount(studentInsights.summary.attemptedUnits)} attempted units` : "Practice results unavailable"}</small></article>
                  <article className="student-dashboard-insight-card is-review"><span><FaBookOpen aria-hidden="true" /> Topics to review</span><strong>{studentInsights.status === "loading" ? "…" : studentInsights.topics.filter((topic) => numeric(topic.attemptedUnits) > 0 && numeric(topic.accuracyPercentage) < 60).length}</strong><small>{studentInsights.topics.length ? "Topics below 60% accuracy" : "Try a practice topic to get review tips"}</small></article>
                </div>
                {studentInsights.topics.some((topic) => numeric(topic.attemptedUnits) > 0 && numeric(topic.accuracyPercentage) < 60) && (
                  <div className="student-dashboard-review-list"><strong>Start with</strong>{studentInsights.topics.filter((topic) => numeric(topic.attemptedUnits) > 0 && numeric(topic.accuracyPercentage) < 60).sort((a, b) => numeric(a.accuracyPercentage) - numeric(b.accuracyPercentage)).slice(0, 3).map((topic, index) => <span key={`${topic.id ?? topic.name}-${index}`}>{topic.name || topic.topicName || `Topic ${index + 1}`} · {numeric(topic.accuracyPercentage).toFixed(0)}%</span>)}</div>
                )}
              </section>

              <div className="row g-4 mb-4 student-dashboard-content-row">
                <div className="col-12 col-xl-6"><TodayPractice questions={data.todayQuestions} goal={data.dailyGoal} /></div>
                <div className="col-12 col-xl-6"><PracticeStreak streakDays={data.streakDays} week={data.practiceWeek} /></div>
              </div>
              <div className="row g-4 mb-4 student-dashboard-content-row">
                <div className="col-12 col-xl-6"><RecentActivity activities={data.recentActivities} /></div>
                <div className="col-12 col-xl-6"><LeaderBoard entries={data.leaderboard} scope={data.rankingScope} /></div>
              </div>
            </>
          ) : <>
          {ADMIN_ROLES.includes(role) && (
            <div className="row g-4 mb-4">
              {[
                ["college", "totalColleges", "/college"],
                ["branch", "totalBranches", "/branch"],
                ["sections", "totalSections", "/section"],
                ["course", "totalCourses", "/courses"],
              ].map(([type, field, to]) => (
                <div className="col-12 col-sm-6 col-lg-3" key={type}>
                  <StatsCard type={type} data={formatCount(data[field])} to={to} />
                </div>
              ))}
            </div>
          )}
          <div className="row g-4 mb-4">
            {cards.slice(0, 4).map((card) => (
              <div className="col-12 col-sm-6 col-lg-3" key={card.type}>
                <StatsCard
                  {...card}
                  to={card.type === "practice" ? "/questions" : undefined}
                />
              </div>
            ))}
          </div>
          {!isAdmin && <div className="row g-4 mb-4">
            {cards.slice(4).filter((card) => card.type !== "streak").map((card) => (
              <div className="col-12 col-lg-6" key={card.type}>
                <StatsCard {...card} />
              </div>
            ))}
            <div className="col-12 col-lg-6">
              <PracticeStreak streakDays={data.streakDays} week={data.practiceWeek} />
            </div>
          </div>}
          <div className="row g-4 mb-4">
            <div className="col-12 col-xl-6">
              <RecentActivity activities={data.recentActivities} />
            </div>
            {!isAdmin && <div className="col-12 col-md-6 col-xl-3">
              <TodayPractice
                questions={data.todayQuestions}
                goal={data.dailyGoal}
              />
            </div>}
            <div className={isAdmin ? "col-12 col-xl-6" : "col-12 col-md-6 col-xl-3"}>
              <LeaderBoard
                entries={data.leaderboard}
                scope={data.rankingScope}
              />
            </div>
          </div>
          </>}
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
