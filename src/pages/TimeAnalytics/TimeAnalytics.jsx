import { useEffect, useMemo, useState } from "react";
import { FaCalendarDay, FaChartLine, FaClock } from "react-icons/fa";
import { BarChart, LineChart, ScatterChart } from "@mui/x-charts";
import BranchService from "../../services/BranchService";
import CollegeService from "../../services/CollegeService";
import ActivitySessionService from "../../services/ActivitySessionService";
import PracticePerformanceService from "../../services/PracticePerformanceService";
import SectionService from "../../services/SectionService";
import { currentRole, ROLES } from "../../utils/roles";
import "./TimeAnalytics.css";

const numberValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Math.max(0, Math.floor(numberValue(value))));

const formatDuration = (value) => {
  const seconds = Math.max(0, Math.floor(numberValue(value)));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

const getArray = (payload) =>
  Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];

const formatDateLabel = (value) => {
  const [year, month, day] = String(value || "").split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime())
    ? String(value || "")
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const formatDateTimeLabel = (value) => {
  if (!value) return "No login recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const localDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const optionLabel = (items, id, idKeys, labelKeys, fallback) => {
  const item = items.find((candidate) =>
    String(idKeys.map((key) => candidate[key]).find((value) => value != null) ?? "") === String(id),
  );
  return item
    ? labelKeys.map((key) => item[key]).find(Boolean) || fallback
    : fallback;
};

const downloadCsv = (filename, headers, rows) => {
  const escapeCell = (value) => {
    const text = String(value ?? "");
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replaceAll('"', '""')}"`;
  };
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
};

export default function TimeAnalytics() {
  const role = currentRole();
  const isStudent = role === ROLES.STUDENT;
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isCollegeAdmin = role === ROLES.COLLEGE_ADMIN;
  const [options, setOptions] = useState({ colleges: [], branches: [], sections: [] });
  const [filters, setFilters] = useState({ collegeId: "", branchId: "", sectionId: "" });
  const [days, setDays] = useState(7);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState("");
  const [weeklyGoalStatus, setWeeklyGoalStatus] = useState("loading");
  const [weeklyActivity, setWeeklyActivity] = useState({ status: "loading", daily: [] });
  const [level, setLevel] = useState("CHAPTER");
  const [overview, setOverview] = useState({
    status: "loading",
    total: 0,
    daily: [],
  });
  const [engagement, setEngagement] = useState({ status: "loading", totalStudentCount: 0, activeStudentCount: 0, daily: [], consistency: null });
  const [loginInactivity, setLoginInactivity] = useState({ status: "loading", totalStudentCount: 0, inactiveStudentCount: 0, untrackedStudentCount: 0, students: [] });
  const [comparison, setComparison] = useState({ status: "loading" });
  const [content, setContent] = useState({ status: "loading", items: [] });
  const [practice, setPractice] = useState({ status: "loading", items: [] });

  useEffect(() => {
    if (isStudent) return undefined;
    let active = true;
    const requests = [
      ...(isSuperAdmin ? [CollegeService.getAllColleges()] : []),
      ...(isSuperAdmin || isCollegeAdmin ? [BranchService.getAllBranches()] : []),
      SectionService.getAllSections(),
    ];
    Promise.allSettled(requests).then((results) => {
      if (!active) return;
      let offset = 0;
      const colleges = isSuperAdmin ? getArray(results[offset++]?.value?.data) : [];
      const branches = isSuperAdmin || isCollegeAdmin ? getArray(results[offset++]?.value?.data) : [];
      const sections = getArray(results[offset]?.value?.data);
      setOptions({ colleges, branches, sections });
    });
    return () => { active = false; };
  }, [isStudent, isSuperAdmin, isCollegeAdmin]);

  const scopedFilters = useMemo(() => Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== ""),
  ), [filters]);

  const visibleBranches = useMemo(() => options.branches.filter((branch) => {
    const parentId = branch.collegeId ?? branch.college_id ?? branch.college?.collegeId;
    return !filters.collegeId || String(parentId ?? "") === String(filters.collegeId);
  }), [options.branches, filters.collegeId]);

  const visibleSections = useMemo(() => options.sections.filter((section) => {
    const branchId = section.branchId ?? section.branch_id ?? section.branch?.branchId;
    const collegeId = section.collegeId ?? section.college_id ?? section.college?.collegeId;
    return (!filters.branchId || String(branchId ?? "") === String(filters.branchId))
      && (!filters.collegeId || String(collegeId ?? "") === String(filters.collegeId));
  }), [options.sections, filters.branchId, filters.collegeId]);

  const scopeLabel = useMemo(() => {
    if (isStudent) return "Your study time";
    if (filters.sectionId) {
      return `Section · ${optionLabel(visibleSections, filters.sectionId, ["sectionId", "id"], ["sectionName", "name"], "Selected section")}`;
    }
    if (filters.branchId) {
      return `Branch · ${optionLabel(visibleBranches, filters.branchId, ["branchId", "id"], ["branchName", "name"], "Selected branch")}`;
    }
    if (filters.collegeId) {
      return `College · ${optionLabel(options.colleges, filters.collegeId, ["collegeId", "id"], ["instituteName", "collegeName", "name"], "Selected college")}`;
    }
    return isSuperAdmin ? "All colleges" : isCollegeAdmin ? "Your college" : "Your branch";
  }, [isStudent, isSuperAdmin, isCollegeAdmin, filters, visibleSections, visibleBranches, options.colleges]);

  useEffect(() => {
    let active = true;
    setOverview((current) => ({ ...current, status: "loading" }));
    Promise.all([
      ActivitySessionService.getTotalTime(scopedFilters),
      ActivitySessionService.getDailyTime(days, scopedFilters),
    ])
      .then(([totalResponse, dailyResponse]) => {
        if (!active) return;
        const daily = getArray(dailyResponse?.data);
        setOverview({
          status: "ready",
          total: numberValue(totalResponse?.data?.totalActiveSeconds),
          daily,
        });
      })
      .catch((error) => {
        console.error("Failed to load time analytics overview:", error);
        if (active) setOverview((current) => ({ ...current, status: "error" }));
      });
    return () => {
      active = false;
    };
  }, [days, scopedFilters, isStudent]);

  useEffect(() => {
    if (isStudent) return undefined;
    let active = true;
    setLoginInactivity((current) => ({ ...current, status: "loading" }));
    ActivitySessionService.getLoginInactivity(7, scopedFilters)
      .then((response) => {
        if (!active) return;
        const result = response?.data || {};
        setLoginInactivity({
          status: "ready",
          totalStudentCount: numberValue(result.totalStudentCount),
          inactiveStudentCount: numberValue(result.inactiveStudentCount),
          untrackedStudentCount: numberValue(result.untrackedStudentCount),
          students: getArray(result.students),
        });
      })
      .catch((error) => {
        console.error("Failed to load student login inactivity:", error);
        if (active) setLoginInactivity((current) => ({ ...current, status: "error" }));
      });
    return () => { active = false; };
  }, [scopedFilters, isStudent]);

  useEffect(() => {
    let active = true;
    setComparison({ status: "loading" });
    ActivitySessionService.getPeriodComparison(days, scopedFilters)
      .then((response) => {
        if (active) setComparison({ status: "ready", ...(response?.data || {}) });
      })
      .catch((error) => {
        console.error("Failed to load period comparison:", error);
        if (active) setComparison({ status: "error" });
      });
    return () => { active = false; };
  }, [days, scopedFilters]);

  useEffect(() => {
    if (!isStudent) return undefined;
    let active = true;
    setWeeklyActivity({ status: "loading", daily: [] });
    ActivitySessionService.getDailyTime(30)
      .then((response) => {
        if (active) setWeeklyActivity({ status: "ready", daily: getArray(response?.data) });
      })
      .catch((error) => {
        console.error("Failed to load weekly study goal progress:", error);
        if (active) setWeeklyActivity({ status: "error", daily: [] });
      });
    return () => { active = false; };
  }, [isStudent]);

  useEffect(() => {
    if (!isStudent) return undefined;
    let active = true;
    setWeeklyGoalStatus("loading");
    ActivitySessionService.getWeeklyStudyGoal()
      .then((response) => {
        if (!active) return;
        const value = response?.data?.weeklyGoalHours;
        setWeeklyGoalHours(value == null ? "" : String(value));
        setWeeklyGoalStatus("ready");
      })
      .catch((error) => {
        console.error("Failed to load weekly study goal:", error);
        if (active) setWeeklyGoalStatus("error");
      });
    return () => { active = false; };
  }, [isStudent]);

  useEffect(() => {
    if (isStudent) {
      setEngagement({ status: "ready", totalStudentCount: 0, activeStudentCount: 0, daily: [], consistency: null });
      return undefined;
    }
    let active = true;
    setEngagement((current) => ({ ...current, status: "loading" }));
    ActivitySessionService.getStudentEngagementTrends(days, scopedFilters)
      .then((response) => {
        if (active) {
          setEngagement({
            status: "ready",
            totalStudentCount: numberValue(response?.data?.totalStudentCount),
            activeStudentCount: numberValue(response?.data?.activeStudentCount),
            daily: getArray(response?.data?.daily),
            consistency: response?.data?.consistency || null,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to load student engagement trends:", error);
        if (active) setEngagement((current) => ({ ...current, status: "error" }));
      });
    return () => { active = false; };
  }, [days, scopedFilters, isStudent]);

  useEffect(() => {
    let active = true;
    setContent({ status: "loading", items: [] });
    ActivitySessionService.getContentDailyTime(days, level, scopedFilters)
      .then((response) => {
        if (active) setContent({ status: "ready", items: getArray(response?.data) });
      })
      .catch((error) => {
        console.error("Failed to load content study-time trends:", error);
        if (active) setContent({ status: "error", items: [] });
      });
    return () => {
      active = false;
    };
  }, [days, level, scopedFilters]);

  useEffect(() => {
    if (level === "QUESTION") {
      setPractice({ status: "unavailable", items: [] });
      return undefined;
    }
    let active = true;
    setPractice({ status: "loading", items: [] });
    const request = isStudent
      ? PracticePerformanceService.getMyLevel(level.toLowerCase())
      : PracticePerformanceService.getLevel(level.toLowerCase(), scopedFilters);
    request.then((response) => {
      if (active) setPractice({ status: "ready", items: getArray(response?.data) });
    }).catch((error) => {
      console.error("Failed to load practice accuracy by content:", error);
      if (active) setPractice({ status: "error", items: [] });
    });
    return () => { active = false; };
  }, [level, scopedFilters, isStudent]);

  const dailyItems = useMemo(() => {
    const totals = new Map();
    overview.daily.forEach((item) => {
      const date = String(item.date || "");
      totals.set(date, (totals.get(date) || 0) + numberValue(item.activeSeconds));
    });
    return [...totals.entries()].sort(([first], [second]) => first.localeCompare(second));
  }, [overview.daily]);

  const contentSummary = useMemo(() => {
    const byDate = new Map();
    const byContent = new Map();
    content.items.forEach((item) => {
      const seconds = numberValue(item.activeSeconds);
      const date = String(item.date || "");
      byDate.set(date, (byDate.get(date) || 0) + seconds);
      const id = item.contentId ?? item.contentName;
      const aggregate = byContent.get(id) || {
        id,
        name: item.contentName || `${level.toLowerCase()} ${item.contentId}`,
        seconds: 0,
      };
      aggregate.seconds += seconds;
      byContent.set(id, aggregate);
    });
    return {
      daily: [...byDate.entries()].sort(([first], [second]) => first.localeCompare(second)),
      ranked: [...byContent.values()].map((item) => {
        const performance = practice.items.find((candidate) => String(candidate.id) === String(item.id));
        return { ...item, accuracy: performance?.accuracyPercentage, attempts: numberValue(performance?.attemptedUnits) };
      }).sort((first, second) => second.seconds - first.seconds),
    };
  }, [content.items, level, practice.items]);

  const periodSeconds = overview.daily.reduce(
    (total, item) => total + numberValue(item.activeSeconds),
    0,
  );
  const averageDailySeconds = periodSeconds / days;
  const activeDays = dailyItems.filter(([, seconds]) => seconds > 0).length;
  const weeklyByDate = new Map(weeklyActivity.daily.map((item) => [String(item.date), numberValue(item.activeSeconds)]));
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weeklyStudySeconds = [...weeklyByDate.entries()]
    .filter(([date]) => date >= localDateKey(weekStart))
    .reduce((sum, [, seconds]) => sum + seconds, 0);
  const weeklyGoalSeconds = numberValue(weeklyGoalHours) * 3600;
  const weeklyGoalProgress = weeklyGoalSeconds > 0 ? Math.min(100, (weeklyStudySeconds / weeklyGoalSeconds) * 100) : 0;
  let streakCursor = new Date();
  if (!(weeklyByDate.get(localDateKey(streakCursor)) > 0)) streakCursor.setDate(streakCursor.getDate() - 1);
  let currentStreak = 0;
  while (weeklyByDate.get(localDateKey(streakCursor)) > 0) {
    currentStreak += 1;
    streakCursor.setDate(streakCursor.getDate() - 1);
  }
  const saveWeeklyGoal = (event) => {
    event.preventDefault();
    const hours = Number(weeklyGoalHours);
    if (!Number.isFinite(hours) || hours < 1 || hours > 40) return;
    setWeeklyGoalStatus("saving");
    ActivitySessionService.saveWeeklyStudyGoal(hours)
      .then((response) => {
        setWeeklyGoalHours(String(response?.data?.weeklyGoalHours ?? hours));
        setWeeklyGoalStatus("saved");
      })
      .catch((error) => {
        console.error("Failed to save weekly study goal:", error);
        setWeeklyGoalStatus("error");
      });
  };
  const averagePerActiveStudent = engagement.activeStudentCount > 0
    ? periodSeconds / engagement.activeStudentCount
    : 0;
  const participationRate = engagement.totalStudentCount > 0
    ? (engagement.activeStudentCount / engagement.totalStudentCount) * 100
    : 0;
  const comparisonTimeNow = numberValue(comparison.currentSeconds);
  const comparisonTimeBefore = numberValue(comparison.previousSeconds);
  const comparisonActivityNow = isStudent
    ? numberValue(comparison.currentActiveDays)
    : numberValue(comparison.currentActiveStudentCount);
  const comparisonActivityBefore = isStudent
    ? numberValue(comparison.previousActiveDays)
    : numberValue(comparison.previousActiveStudentCount);
  const trendLabel = (current, previous) => {
    if (previous <= 0) return current > 0 ? "New activity" : "No activity in either period";
    const delta = ((current - previous) / previous) * 100;
    return `${delta > 0 ? "+" : ""}${delta.toFixed(0)}% vs previous period`;
  };
  const trendTone = (current, previous) => current > previous ? "positive" : current < previous ? "negative" : "neutral";
  const visibleTicks = Math.max(1, Math.ceil(dailyItems.length / 7));
  const visibleContentTicks = Math.max(1, Math.ceil(contentSummary.daily.length / 7));
  const topContentSeconds = contentSummary.ranked[0]?.seconds || 0;
  const peakDailySeconds = Math.max(0, ...dailyItems.map(([, seconds]) => seconds));
  const peakContentSeconds = Math.max(0, ...contentSummary.daily.map(([, seconds]) => seconds));
  const peakActiveStudents = Math.max(0, ...engagement.daily.map((item) => numberValue(item.activeStudentCount)));
  const intensityColor = (value, peak) => {
    if (peak <= 0 || value / peak < 0.4) return "#14b8a6";
    if (value / peak < 0.75) return "#3b82f6";
    return "#8b5cf6";
  };
  const practiceScatterPoints = contentSummary.ranked
    .filter((item) => item.attempts > 0 && Number.isFinite(Number(item.accuracy)))
    .map((item) => ({ x: item.seconds, y: numberValue(item.accuracy), id: item.name }));

  return (
    <main className="time-analytics-page">
      <header className="time-analytics-header">
        <div className="time-analytics-title">
          <span className="time-analytics-title-icon" aria-hidden="true"><FaClock /></span>
          <div>
            <p className="time-analytics-eyebrow">LEARNING INSIGHTS</p>
            <h1>Time Analytics</h1>
            <p>{isStudent
              ? "Track your active study time across days, chapters, topics, and questions."
              : "Review cumulative study time and content trends across your students."}</p>
          </div>
        </div>
        <div className="time-analytics-header-controls">
          {!isStudent && <span className="time-analytics-scope-pill">{scopeLabel}</span>}
          <label className="time-analytics-range">
            <span>Date range</span>
            <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>
        </div>
      </header>

      {!isStudent && (
        <section className="time-analytics-filters" aria-label="Student scope filters">
          <div className="time-analytics-filters-heading">
            <strong>Student scope</strong>
            <span>Choose the group included in these totals and trends.</span>
          </div>
          {isSuperAdmin && (
            <label>
              <span>College</span>
              <select value={filters.collegeId} onChange={(event) => setFilters({ collegeId: event.target.value, branchId: "", sectionId: "" })}>
                <option value="">All colleges</option>
                {options.colleges.map((item) => <option key={item.collegeId ?? item.id} value={item.collegeId ?? item.id}>{item.instituteName ?? item.collegeName ?? item.name}</option>)}
              </select>
            </label>
          )}
          {role !== ROLES.BRANCH_ADMIN && (
            <label>
              <span>Branch</span>
              <select value={filters.branchId} onChange={(event) => setFilters((current) => ({ ...current, branchId: event.target.value, sectionId: "" }))}>
                <option value="">All branches</option>
                {visibleBranches.map((item) => <option key={item.branchId ?? item.id} value={item.branchId ?? item.id}>{item.branchName ?? item.name}</option>)}
              </select>
            </label>
          )}
          <label>
            <span>Section</span>
            <select value={filters.sectionId} onChange={(event) => setFilters((current) => ({ ...current, sectionId: event.target.value }))}>
              <option value="">All sections</option>
              {visibleSections.map((item) => <option key={item.sectionId ?? item.id} value={item.sectionId ?? item.id}>{item.sectionName ?? item.name}</option>)}
            </select>
          </label>
        </section>
      )}

      {overview.status === "error" ? (
        <div className="time-analytics-state" role="alert">
          Could not load study-time analytics. Please refresh and try again.
        </div>
      ) : (
        <>
          <section className="time-analytics-summary" aria-label="Study time summary">
            <article className="time-analytics-summary-card">
              <span><FaClock aria-hidden="true" /> All-time tracked time</span>
              <strong>{overview.status === "loading" ? "Loading…" : formatDuration(overview.total)}</strong>
              <small>{isStudent ? "Across your recorded sessions" : `Across students · ${scopeLabel}`}</small>
            </article>
            <article className="time-analytics-summary-card">
              <span><FaChartLine aria-hidden="true" /> Tracked time · {days} days</span>
              <strong>{overview.status === "loading" ? "Loading…" : formatDuration(periodSeconds)}</strong>
              <small>{isStudent ? "Your selected date range" : "Combined student time in this scope"}</small>
            </article>
            <article className="time-analytics-summary-card">
              <span><FaCalendarDay aria-hidden="true" /> {isStudent ? "Active study days" : "Students active"}</span>
              <strong>{overview.status === "loading" || (!isStudent && engagement.status === "loading")
                ? "Loading…"
                : isStudent
                  ? `${activeDays} / ${days}`
                  : engagement.status === "error"
                    ? "—"
                    : formatNumber(engagement.activeStudentCount)}</strong>
              <small>{isStudent
                ? `Days with tracked time in the last ${days}`
                : engagement.status === "error"
                  ? "Engagement data is unavailable"
                  : `${participationRate.toFixed(0)}% of ${formatNumber(engagement.totalStudentCount)} enrolled students`}</small>
            </article>
            <article className="time-analytics-summary-card">
              <span><FaChartLine aria-hidden="true" /> {isStudent ? "Daily average" : "Avg. per active student"}</span>
              <strong>{overview.status === "loading" || (!isStudent && engagement.status === "loading")
                ? "Loading…"
                : !isStudent && engagement.status === "error"
                  ? "—"
                  : formatDuration(isStudent ? averageDailySeconds : averagePerActiveStudent)}</strong>
              <small>{isStudent
                ? `Across the selected ${days}-day range`
                : engagement.status === "error"
                  ? "Average per student is unavailable"
                  : `Per active student · last ${days} days`}</small>
            </article>
          </section>

          <section className="time-analytics-comparison-panel" aria-label="Period comparison">
            <div className="time-analytics-panel-heading">
              <div><h2>Compared with the previous {days} days</h2><p>The selected range against the immediately preceding, equally sized period.</p></div>
            </div>
            {comparison.status === "loading" ? <p className="time-analytics-comparison-loading">Loading period comparison…</p> : comparison.status === "error" ? <p className="time-analytics-comparison-loading">Period comparison is unavailable.</p> : (
              <div className="time-analytics-comparison-grid">
                <article>
                  <span>Study time</span>
                  <strong>{formatDuration(comparisonTimeNow)}</strong>
                  <small>Previous: {formatDuration(comparisonTimeBefore)}</small>
                  <em className={`is-${trendTone(comparisonTimeNow, comparisonTimeBefore)}`}>{trendLabel(comparisonTimeNow, comparisonTimeBefore)}</em>
                </article>
                <article>
                  <span>{isStudent ? "Active study days" : "Student participation"}</span>
                  <strong>{isStudent ? `${formatNumber(comparisonActivityNow)} days` : `${comparison.totalStudentCount ? ((comparisonActivityNow / comparison.totalStudentCount) * 100).toFixed(0) : 0}%`}</strong>
                  <small>Previous: {isStudent ? `${formatNumber(comparisonActivityBefore)} days` : `${comparison.totalStudentCount ? ((comparisonActivityBefore / comparison.totalStudentCount) * 100).toFixed(0) : 0}%`}</small>
                  <em className={`is-${trendTone(comparisonActivityNow, comparisonActivityBefore)}`}>{trendLabel(comparisonActivityNow, comparisonActivityBefore)}</em>
                </article>
              </div>
            )}
          </section>

          {isStudent && (
            <section className="time-analytics-panel time-analytics-student-progress">
              <div className="time-analytics-panel-heading">
                <div><h2>Your weekly consistency</h2><p>Build a steady routine with a goal that you choose.</p></div>
              </div>
              <div className="time-analytics-student-progress-grid">
                <form className="time-analytics-goal-card" onSubmit={saveWeeklyGoal}>
                  <div className="time-analytics-goal-heading">
                    <span>Weekly study goal</span>
                    <strong>{weeklyGoalStatus === "loading" || weeklyActivity.status === "loading" ? "Loading…" : weeklyGoalSeconds > 0 ? `${weeklyGoalProgress.toFixed(0)}%` : "Set a goal"}</strong>
                  </div>
                  {weeklyGoalSeconds > 0 && <>
                    <div className="time-analytics-goal-track" aria-label={`${weeklyGoalProgress.toFixed(0)} percent of weekly study goal completed`}><span style={{ width: `${weeklyGoalProgress}%` }} /></div>
                    <p>{formatDuration(weeklyStudySeconds)} studied of {formatDuration(weeklyGoalSeconds)} this week</p>
                  </>}
                  <label htmlFor="weekly-study-goal">Your target (hours per week)</label>
                  <div className="time-analytics-goal-input-row">
                    <input id="weekly-study-goal" type="number" min="1" max="40" step="0.5" value={weeklyGoalHours} onChange={(event) => setWeeklyGoalHours(event.target.value)} placeholder="e.g. 5" required />
                    <button type="submit" disabled={weeklyGoalStatus === "saving" || weeklyGoalStatus === "loading"}>{weeklyGoalStatus === "saving" ? "Saving…" : weeklyGoalStatus === "saved" ? "Update goal" : "Save goal"}</button>
                  </div>
                  <small>{weeklyGoalStatus === "error" ? "Could not save the goal. Please try again." : weeklyGoalStatus === "saved" ? "Goal saved to your account." : "Your goal syncs with your account across devices."}</small>
                </form>
                <div className="time-analytics-streak-card">
                  <span>Current study streak</span>
                  <strong>{weeklyActivity.status === "loading" ? "…" : weeklyActivity.status === "error" ? "—" : currentStreak}</strong>
                  <small>{currentStreak === 1 ? "consecutive active day" : "consecutive active days"}</small>
                </div>
              </div>
            </section>
          )}

          {!isStudent && (
            <section className="time-analytics-panel">
              <div className="time-analytics-panel-heading">
                <div>
                  <h2>Student engagement</h2>
                  <p>Daily unique active students and participation across {scopeLabel}.</p>
                </div>
              </div>
              {engagement.status === "loading" ? (
                <div className="time-analytics-state" role="status">Loading student engagement…</div>
              ) : engagement.status === "error" ? (
                <div className="time-analytics-state time-analytics-state--error" role="alert">Student engagement trends could not be loaded.</div>
              ) : (
                <div className="time-analytics-engagement-grid">
                  <div className="time-analytics-chart time-analytics-chart--engagement">
                    <BarChart
                      className="time-analytics-bar-chart"
                      xAxis={[{ scaleType: "band", data: engagement.daily.map((item) => formatDateLabel(item.date)), tickLabelInterval: (_value, index) => index % Math.max(1, Math.ceil(engagement.daily.length / 7)) === 0, tickLabelStyle: { fill: "#94a3b8", fontSize: 11 } }]}
                      yAxis={[{ min: 0, tickLabelStyle: { fill: "#94a3b8", fontSize: 11 }, valueFormatter: (value) => formatNumber(value) }]}
                      series={[{ data: engagement.daily.map((item) => numberValue(item.activeStudentCount)), label: "Active students", color: "#3b82f6", colorGetter: ({ value }) => intensityColor(value, peakActiveStudents), valueFormatter: (value) => `${formatNumber(value)} students` }]}
                      grid={{ horizontal: true, vertical: false }} height={280} margin={{ left: 64, right: 20, top: 18, bottom: 48 }} slotProps={{ legend: { hidden: true } }}
                    />
                  </div>
                  <div className="time-analytics-participation">
                    <h3>Participation by day</h3>
                    <p>Share of enrolled students who studied</p>
                    {engagement.daily.map((item) => {
                      const count = numberValue(item.activeStudentCount);
                      const rate = engagement.totalStudentCount ? (count / engagement.totalStudentCount) * 100 : 0;
                      return <div className="time-analytics-participation-row" key={item.date}>
                        <span>{formatDateLabel(item.date)}</span><div className="time-analytics-ranking-track"><span style={{ width: `${rate}%` }} /></div><strong>{rate.toFixed(0)}%</strong>
                      </div>;
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {!isStudent && (
            <section className="time-analytics-panel">
              <div className="time-analytics-panel-heading">
                <div><h2>Study consistency and follow-up</h2><p>Student activity across the last 30 days · {scopeLabel}</p></div>
              </div>
              {engagement.status === "loading" ? (
                <div className="time-analytics-state" role="status">Loading consistency metrics…</div>
              ) : engagement.status === "error" || !engagement.consistency ? (
                <div className="time-analytics-state time-analytics-state--error" role="alert">Consistency metrics could not be loaded.</div>
              ) : (
                <div className="time-analytics-consistency-grid">
                  <div className="time-analytics-consistency-card">
                    <h3>Active days per student</h3>
                    <p>Each student is counted once in one band.</p>
                    <div className="time-analytics-consistency-bars">
                      {[
                        ["0–3 days", engagement.consistency.lowConsistencyStudentCount, "low"],
                        ["4–10 days", engagement.consistency.regularStudentCount, "regular"],
                        ["11–30 days", engagement.consistency.highConsistencyStudentCount, "high"],
                      ].map(([label, count, tone]) => (
                        <div className={`time-analytics-consistency-row is-${tone}`} key={label}>
                          <span>{label}</span><div className="time-analytics-ranking-track"><i style={{ width: `${engagement.totalStudentCount ? (numberValue(count) / engagement.totalStudentCount) * 100 : 0}%` }} /></div><strong>{formatNumber(count)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="time-analytics-at-risk-card">
                    <div className="time-analytics-at-risk-heading">
                      <div><h3>May need follow-up</h3><p>Tracked study in days 8–30, none in the last 7 days.</p></div>
                      <strong>{formatNumber(engagement.consistency.atRiskStudentCount)}</strong>
                    </div>
                    {!!engagement.consistency.atRiskStudents?.length && <button type="button" className="time-analytics-export-button" onClick={() => downloadCsv("study-inactivity.csv", ["Student", "Last active", "Active days in last 30 days"], engagement.consistency.atRiskStudents.map((student) => [student.name || "Student", student.lastActiveDate, student.activeDaysLast30Days]))}>Export listed students</button>}
                    {engagement.consistency.atRiskStudents?.length ? (
                      <>
                        <ul>{engagement.consistency.atRiskStudents.map((student, index) => (
                          <li key={`${student.name}-${student.lastActiveDate}-${index}`}><span>{student.name || "Student"}</span><small>Last active {formatDateLabel(student.lastActiveDate)}</small></li>
                        ))}</ul>
                        {engagement.consistency.atRiskStudentCount > engagement.consistency.atRiskStudents.length && <small className="time-analytics-login-cap">Showing first 100 of {formatNumber(engagement.consistency.atRiskStudentCount)}.</small>}
                      </>
                    ) : <div className="time-analytics-no-risk">No recently inactive students found in this scope.</div>}
                  </div>
                </div>
              )}
            </section>
          )}

          {!isStudent && (
            <section className="time-analytics-panel time-analytics-login-panel">
              <div className="time-analytics-panel-heading">
                <div><h2>Students not logged in for 7+ days</h2><p>Based on successful sign-ins · {scopeLabel}</p></div>
                {loginInactivity.status === "ready" && <div className="time-analytics-login-actions"><span className="time-analytics-inactive-count">{formatNumber(loginInactivity.inactiveStudentCount)} students</span>{!!loginInactivity.students.length && <button type="button" className="time-analytics-export-button" onClick={() => downloadCsv("login-inactivity.csv", ["Student", "Last successful login"], loginInactivity.students.map((student) => [student.name || "Student", student.lastLoginAt]))}>Export listed students</button>}</div>}
              </div>
              {loginInactivity.status === "loading" ? (
                <div className="time-analytics-state" role="status">Loading login activity…</div>
              ) : loginInactivity.status === "error" ? (
                <div className="time-analytics-state time-analytics-state--error" role="alert">Login inactivity could not be loaded.</div>
              ) : (
                <>
                  <p className="time-analytics-login-explainer">{formatNumber(loginInactivity.inactiveStudentCount)} of {formatNumber(loginInactivity.totalStudentCount)} active students have a recorded sign-in older than 7 days.</p>
                  {loginInactivity.students.length ? (
                    <div className="time-analytics-login-table-wrap">
                      <table className="time-analytics-login-table">
                        <thead><tr><th>Student</th><th>Last successful login</th></tr></thead>
                        <tbody>{loginInactivity.students.map((student) => (
                          <tr key={student.userId}><td>{student.name || "Student"}</td><td>{formatDateTimeLabel(student.lastLoginAt)}</td></tr>
                        ))}</tbody>
                      </table>
                      {loginInactivity.inactiveStudentCount > loginInactivity.students.length && <small className="time-analytics-login-cap">Showing the 100 most overdue accounts of {formatNumber(loginInactivity.inactiveStudentCount)}.</small>}
                    </div>
                  ) : <div className="time-analytics-no-risk">No students with a known last login are overdue in this scope.</div>}
                  {loginInactivity.untrackedStudentCount > 0 && <div className="time-analytics-login-unknown">{formatNumber(loginInactivity.untrackedStudentCount)} students have no recorded login timestamp. Login tracking starts at deployment, so their earlier sign-in history is unknown.</div>}
                </>
              )}
            </section>
          )}

          <section className="time-analytics-panel">
            <div className="time-analytics-panel-heading">
              <div>
                <h2>{isStudent ? "Daily study time" : "Daily student study time"}</h2>
                <p>{isStudent ? "Your active time recorded each day." : `Combined student time recorded each day · ${scopeLabel}`}</p>
              </div>
            </div>
            {overview.status === "loading" ? (
              <div className="time-analytics-state" role="status">Loading daily study time…</div>
            ) : dailyItems.length ? (
              <div className="time-analytics-chart">
                <LineChart
                  className="time-analytics-chart-svg"
                  xAxis={[{
                    scaleType: "band",
                    data: dailyItems.map(([date]) => formatDateLabel(date)),
                    tickLabelInterval: (_value, index) => index % visibleTicks === 0,
                    tickLabelStyle: { fill: "#94a3b8", fontSize: 11 },
                  }]}
                  yAxis={[{ min: 0, tickLabelStyle: { fill: "#94a3b8", fontSize: 11 }, valueFormatter: formatDuration }]}
                  series={[{ data: dailyItems.map(([, seconds]) => seconds), label: "Active study time", valueFormatter: formatDuration, color: "#3b82f6", colorGetter: ({ value }) => intensityColor(value, peakDailySeconds), area: true, showMark: true, curve: "monotoneX" }]}
                  grid={{ horizontal: true, vertical: false }}
                  height={280}
                  margin={{ left: 64, right: 20, top: 18, bottom: 48 }}
                  slotProps={{ legend: { hidden: true } }}
                />
              </div>
            ) : (
              <div className="time-analytics-state">No daily study-time data is available for this period.</div>
            )}
          </section>

          <section className="time-analytics-panel">
            <div className="time-analytics-panel-heading time-analytics-content-heading">
              <div>
                <h2>{isStudent ? "Study time by content" : "Students’ study time by content"}</h2>
                <p>{isStudent ? "See where your study time goes." : `See where students spend time · ${scopeLabel}`}</p>
              </div>
              <div className="time-analytics-level-switch" role="group" aria-label="Content level">
                {[["CHAPTER", "Chapters"], ["TOPIC", "Topics"], ["QUESTION", "Questions"]].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={level === value ? "is-active" : ""}
                    aria-pressed={level === value}
                    onClick={() => setLevel(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {content.status === "loading" ? (
              <div className="time-analytics-state" role="status">Loading content study time…</div>
            ) : content.status === "error" ? (
              <div className="time-analytics-state time-analytics-state--error" role="alert">
                Content study-time trends could not be loaded.
              </div>
            ) : content.items.length === 0 ? (
              <div className="time-analytics-state">
                No content-level time is available yet. New activity will appear here.
              </div>
            ) : (
              <div className="time-analytics-content-grid">
                <div className="time-analytics-chart">
                  <BarChart
                    className="time-analytics-chart-svg"
                    xAxis={[{
                      scaleType: "band",
                      data: contentSummary.daily.map(([date]) => formatDateLabel(date)),
                      tickLabelInterval: (_value, index) => index % visibleContentTicks === 0,
                      tickLabelStyle: { fill: "#94a3b8", fontSize: 11 },
                    }]}
                    yAxis={[{ min: 0, tickLabelStyle: { fill: "#94a3b8", fontSize: 11 }, valueFormatter: formatDuration }]}
                    series={[{ data: contentSummary.daily.map(([, seconds]) => seconds), label: "Content study time", valueFormatter: formatDuration, color: "#14b8a6", colorGetter: ({ value }) => intensityColor(value, peakContentSeconds) }]}
                    grid={{ horizontal: true, vertical: false }}
                    height={280}
                    margin={{ left: 64, right: 20, top: 18, bottom: 48 }}
                    slotProps={{ legend: { hidden: true } }}
                  />
                </div>
                <div className="time-analytics-ranking">
                  <div className="time-analytics-ranking-heading">
                    <div>
                      <h3>Most studied {level.toLowerCase()}s</h3>
                      <p>Top content in this date range</p>
                    </div>
                    <span>Time</span>
                  </div>
                  <ol>
                    {contentSummary.ranked.slice(0, 8).map((item) => (
                      <li key={item.id}>
                        <div className="time-analytics-ranking-item">
                          <div className="time-analytics-ranking-line">
                            <span title={item.name}>{item.name}</span>
                            <strong>{formatDuration(item.seconds)}</strong>
                          </div>
                          <small className="time-analytics-practice-context">
                            {level === "QUESTION" ? "Practice accuracy is not available at question level" : practice.status === "loading" ? "Loading practice accuracy…" : practice.status === "error" ? "Practice accuracy unavailable" : item.attempts > 0 ? `Practice accuracy to date · ${numberValue(item.accuracy).toFixed(0)}% (${formatNumber(item.attempts)} attempts)` : "No practice attempts recorded"}
                          </small>
                          <div className="time-analytics-ranking-track" aria-hidden="true">
                            <span style={{ width: `${topContentSeconds > 0 ? (item.seconds / topContentSeconds) * 100 : 0}%` }} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
            <p className="time-analytics-note">
              Content-level history starts when detailed time tracking is enabled.
            </p>
          </section>

          {level !== "QUESTION" && (
            <section className="time-analytics-panel">
              <div className="time-analytics-panel-heading">
                <div>
                  <h2>Study time and practice accuracy</h2>
                  <p>Each point is a {level.toLowerCase()}: selected-range study time versus practice accuracy to date.</p>
                </div>
              </div>
              {content.status === "loading" || practice.status === "loading" ? (
                <div className="time-analytics-state" role="status">Loading study time and accuracy…</div>
              ) : content.status === "error" || practice.status === "error" ? (
                <div className="time-analytics-state time-analytics-state--error" role="alert">The study time and accuracy comparison could not be loaded.</div>
              ) : practiceScatterPoints.length ? (
                <div className="time-analytics-chart time-analytics-scatter-wrap">
                  <ScatterChart
                    className="time-analytics-bar-chart"
                    xAxis={[{ min: 0, valueFormatter: formatDuration, tickLabelStyle: { fill: "#94a3b8", fontSize: 11 }, label: "Study time in selected range" }]}
                    yAxis={[{ min: 0, max: 100, valueFormatter: (value) => `${value}%`, tickLabelStyle: { fill: "#94a3b8", fontSize: 11 }, label: "Practice accuracy to date" }]}
                    series={[{ label: `${level === "CHAPTER" ? "Chapters" : "Topics"} · ${scopeLabel}`, data: practiceScatterPoints, markerSize: 11, color: "#3b82f6", colorGetter: ({ value }) => value.y < 50 ? "#ef4444" : value.y < 75 ? "#f59e0b" : "#14b8a6", valueFormatter: (value) => `${value.id} · ${formatDuration(value.x)} study time · ${numberValue(value.y).toFixed(0)}% accuracy` }]}
                    grid={{ horizontal: true, vertical: false }}
                    height={340}
                    margin={{ left: 76, right: 24, top: 24, bottom: 72 }}
                    slotProps={{ legend: { hidden: true } }}
                  />
                  <div className="time-analytics-scatter-legend" aria-label="Practice accuracy legend">
                    <span><i className="is-low" />Below 50%</span>
                    <span><i className="is-mid" />50–74%</span>
                    <span><i className="is-high" />75% and above</span>
                  </div>
                </div>
              ) : (
                <div className="time-analytics-state">There isn’t enough data yet. Content needs recorded study time and at least one practice attempt to appear here.</div>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
