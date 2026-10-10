/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaBullseye,
  FaCheck,
  FaChartLine,
  FaClock,
  FaClipboardList,
  FaExternalLinkAlt,
  FaRedo,
  FaSearch,
  FaTimes,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa";
import { BarChart, PieChart } from "@mui/x-charts";

import CourseService from "../../services/CourseService";
import BranchService from "../../services/BranchService";
import CollegeService from "../../services/CollegeService";
import ExamService from "../../services/ExamService";
import PerformanceService from "../../services/PerformanceService";
import ActivitySessionService from "../../services/ActivitySessionService";
import PracticePerformanceService from "../../services/PracticePerformanceService";
import SectionService from "../../services/SectionService";
import UserService from "../../services/UserService";
import { currentRole, ROLES } from "../../utils/roles";
import { getApiErrorMessage } from "../../utils/apiError";
import "./PerformanceDashboard.css";

// Same scope-tab pattern as the Practice Performance page: a role sees only
// the tabs its access allows, and a tab with `pick` shows one dropdown for
// it. Only one of college / branch / student is ever filtered on at a time.
const SCOPE_TABS = {
  [ROLES.SUPER_ADMIN]: [
    { key: "all", label: "All App" },
    { key: "college", label: "College", pick: "college" },
    { key: "branch", label: "Branch", pick: "branch" },
    { key: "student", label: "Student", pick: "student" },
  ],
  [ROLES.COLLEGE_ADMIN]: [
    { key: "college", label: "My College" },
    { key: "branch", label: "Branch", pick: "branch" },
    { key: "student", label: "Student", pick: "student" },
  ],
  [ROLES.BRANCH_ADMIN]: [
    { key: "branch", label: "My Branch" },
    { key: "student", label: "Student", pick: "student" },
  ],
};

const EMPTY_DATA = {
  totalStudents: 0,
  examsConducted: 0,
  averagePercentage: 0,
  passRate: 0,
  passedResults: 0,
  failedResults: 0,
  branchPerformance: [],
  coursePerformance: [],
  performanceTrend: [],
  topPerformers: [],
  studentsNeedingAttention: [],
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const listFromResponse = (response) => {
  const value = response?.data;
  if (Array.isArray(value)) return value;
  return asArray(
    value?.content ||
      value?.data ||
      value?.items ||
      value?.colleges ||
      value?.branches ||
      value?.courses ||
      value?.sections ||
      value?.exams,
  );
};

const numberValue = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const formatNumber = (value) => numberValue(value).toLocaleString("en-IN");

const formatPercentage = (value) => `${numberValue(value).toFixed(2)}%`;

const formatTrendLabel = (item) => {
  if (item.examName) {
    return item.examName.length > 18
      ? `${item.examName.slice(0, 16)}...`
      : item.examName;
  }

  if (item.examDate) {
    const date = new Date(item.examDate);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    }
  }

  return "Exam";
};

const getId = (item, keys) =>
  keys.reduce((result, key) => result ?? item?.[key], null);

const getLabel = (item, keys, fallback) => {
  const value = keys.reduce((result, key) => result || item?.[key], "");
  return value || fallback;
};

const matchesParent = (item, selectedId, keys) => {
  if (!selectedId) return true;
  const parentId = getId(item, keys);
  return (
    parentId === null ||
    parentId === undefined ||
    String(parentId) === String(selectedId)
  );
};

const TableEmpty = ({ colSpan, message = "No data available." }) => (
  <tr>
    <td colSpan={colSpan} className="performance-empty-cell">
      {message}
    </td>
  </tr>
);

function SummaryCard({ label, value, tone, icon }) {
  return (
    <div className="col-12 col-sm-6 col-xl-2">
      <div className={`performance-summary-card ${tone}`}>
        <div className="performance-summary-card-icon">{icon}</div>
        <div className="performance-summary-card-content">
          <small>{label}</small>
          <strong>{value}</strong>
        </div>
      </div>
    </div>
  );
}

function StudentPerformanceView({ data, status, onRetry }) {
  if (status === "loading") {
    return (
      <>
        <div className="performance-notice" role="status">
          <span className="spinner-border spinner-border-sm" /> Loading
          performance...
        </div>
        <StudentLearningAnalytics />
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <div className="performance-notice performance-notice-error" role="alert">
          <span>
            We couldn&apos;t load your performance data. Please try again.
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={onRetry}
          >
            Try again
          </button>
        </div>
        <StudentLearningAnalytics />
      </>
    );
  }

  const details = [
    ["Student Name", data.studentName || data.name || "-"],
    ["College", data.collegeName || "-"],
    ["Branch", data.branchName || "-"],
    ["Section", data.sectionName || "-"],
  ];
  const metrics = [
    ["Exams Attempted", formatNumber(data.examsAttempted), "blue"],
    ["Average Percentage", formatPercentage(data.averagePercentage), "teal"],
    ["Highest Percentage", formatPercentage(data.highestPercentage), "green"],
    ["Lowest Percentage", formatPercentage(data.lowestPercentage), "orange"],
    ["Passed Exams", formatNumber(data.passedExams), "green"],
    ["Failed Exams", formatNumber(data.failedExams), "red"],
  ];

  return (
    <>
      <section className="performance-panel student-performance-details">
        <div className="performance-panel-heading">
          <div>
            <h2>Student Performance</h2>
            <p>Your academic performance overview.</p>
          </div>
          <FaUsers />
        </div>
        <div className="row g-3">
          {details.map(([label, value]) => (
            <div className="col-12 col-sm-6 col-lg-3" key={label}>
              <span className="student-detail-label">{label}</span>
              <strong className="student-detail-value">{value}</strong>
            </div>
          ))}
        </div>
      </section>
      <div className="row g-3 performance-summary-row">
        {metrics.map(([label, value, tone]) => (
          <SummaryCard key={label} label={label} value={value} tone={tone} />
        ))}
      </div>
      <StudentLearningAnalytics />
      <div className="row g-4 performance-charts-row">
        <div className="col-12 col-xl-8">
          <section className="performance-panel performance-chart-panel">
            <div className="performance-panel-heading">
              <div>
                <h2>Percentage Overview</h2>
                <p>Your result percentages at a glance.</p>
              </div>
              <FaChartLine />
            </div>
            <StudentPercentageChart data={data} />
          </section>
        </div>
        <div className="col-12 col-xl-4">
          <section className="performance-panel performance-chart-panel">
            <div className="performance-panel-heading">
              <div>
                <h2>Result Summary</h2>
                <p>Passed and failed exams.</p>
              </div>
              <FaUsers />
            </div>
            <ResultPieChart
              passed={data.passedExams}
              failed={data.failedExams}
            />
          </section>
        </div>
      </div>
    </>
  );
}

const formatStudySeconds = (seconds) => {
  if (!Number.isFinite(seconds)) return null;
  const totalSeconds = Math.floor(seconds);
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const totalMinutes = Math.floor(totalSeconds / 60);
  return totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    : `${totalMinutes}m`;
};

const formatStudyTime = (value) => {
  if (typeof value === "number") return formatStudySeconds(value);

  if (typeof value === "string" && /^\d{1,3}:\d{2}(:\d{2})?$/.test(value)) {
    const [hours, minutes, seconds = 0] = value.split(":").map(Number);
    return formatStudySeconds(hours * 3600 + minutes * 60 + seconds);
  }

  if (!value || typeof value !== "object") return null;
  const nestedTime = value.totalTime ?? value.totalDuration ?? value.duration;
  if (typeof nestedTime === "string") {
    const formatted = formatStudyTime(nestedTime);
    if (formatted) return formatted;
  }
  if (value.data && typeof value.data === "object") {
    const formatted = formatStudyTime(value.data);
    if (formatted) return formatted;
  }

  const seconds =
    value.totalSeconds ??
    value.totalActiveSeconds ??
    value.totalTimeSeconds ??
    value.totalDurationSeconds ??
    value.durationSeconds;
  if (seconds !== undefined && Number.isFinite(Number(seconds))) {
    return formatStudySeconds(Number(seconds));
  }

  const minutes = value.totalMinutes ?? value.totalTimeMinutes;
  if (minutes !== undefined && Number.isFinite(Number(minutes))) {
    return formatStudySeconds(Number(minutes) * 60);
  }

  const hours = value.totalHours ?? value.totalTimeHours;
  if (hours !== undefined && Number.isFinite(Number(hours))) {
    return formatStudySeconds(Number(hours) * 3600);
  }

  if (
    value.hours !== undefined ||
    value.minutes !== undefined ||
    value.seconds !== undefined
  ) {
    const totalSeconds =
      Number(value.hours || 0) * 3600 +
      Number(value.minutes || 0) * 60 +
      Number(value.seconds || 0);
    return formatStudySeconds(totalSeconds);
  }

  return null;
};

function StudentLearningAnalytics() {
  const [reloadKey, setReloadKey] = useState(0);
  const [days, setDays] = useState(7);
  const [studyTime, setStudyTime] = useState({ status: "loading", value: "" });
  const [dailyTime, setDailyTime] = useState({ status: "loading", items: [] });
  const [practice, setPractice] = useState({ status: "loading", courses: [] });

  useEffect(() => {
    let active = true;
    setStudyTime({ status: "loading", value: "" });
    setDailyTime({ status: "loading", items: [] });
    setPractice({ status: "loading", courses: [] });

    ActivitySessionService.getTotalTime()
      .then((response) => {
        if (!active) return;
        const formatted = formatStudyTime(response?.data);
        setStudyTime(
          formatted
            ? { status: "ready", value: formatted }
            : { status: "unavailable", value: "" },
        );
      })
      .catch((error) => {
        console.error("Failed to load total study time:", error);
        if (active) setStudyTime({ status: "error", value: "" });
      });

    ActivitySessionService.getDailyTime(days)
      .then((response) => {
        if (!active) return;
        const payload = response?.data;
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
        setDailyTime({ status: "ready", items });
      })
      .catch((error) => {
        console.error("Failed to load daily study time:", error);
        if (active) setDailyTime({ status: "error", items: [] });
      });

    PracticePerformanceService.getMyLevel("course")
      .then((response) => {
        if (!active) return;
        const payload = response?.data;
        const courses = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
        setPractice({ status: "ready", courses });
      })
      .catch((error) => {
        console.error("Failed to load student practice analytics:", error);
        if (active) setPractice({ status: "error", courses: [] });
      });

    return () => {
      active = false;
    };
  }, [days, reloadKey]);

  const attempted = practice.courses.reduce(
    (total, course) => total + numberValue(course.attemptedUnits),
    0,
  );
  const correct = practice.courses.reduce(
    (total, course) => total + numberValue(course.correctUnits),
    0,
  );
  const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
  const courses = [...practice.courses]
    .filter((course) => numberValue(course.attemptedUnits) > 0)
    .sort(
      (first, second) =>
        numberValue(second.accuracyPercentage) -
        numberValue(first.accuracyPercentage),
    )
    .slice(0, 5);
  const periodSeconds = dailyTime.items.reduce(
    (total, item) => total + numberValue(item.activeSeconds),
    0,
  );
  const dailyLabels = dailyTime.items.map((item) => {
    const [year, month, dayOfMonth] = String(item.date || "")
      .split("-")
      .map(Number);
    const date = new Date(year, month - 1, dayOfMonth);
    return Number.isNaN(date.getTime())
      ? String(item.date || "")
      : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  });

  return (
    <section className="performance-panel student-learning-analytics">
      <div className="performance-panel-heading">
        <div>
          <h2>Study Time & Practice</h2>
          <p>Active time tracked in the app and your course-level practice.</p>
        </div>
        <div className="student-learning-actions">
          <label className="visually-hidden" htmlFor="student-study-time-days">
            Daily study-time range
          </label>
          <select
            id="student-study-time-days"
            className="form-select form-select-sm"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setReloadKey((key) => key + 1)}
            aria-label="Refresh study time and practice analytics"
          >
            <FaRedo /> Refresh
          </button>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="student-learning-metric">
            <FaClock aria-hidden="true" />
            <span>All-time active study</span>
            <strong>
              {studyTime.status === "loading"
                ? "Loading..."
                : studyTime.status === "ready"
                  ? studyTime.value
                  : "Unavailable"}
            </strong>
            {studyTime.status === "error" && (
              <small role="alert">Could not load tracked study time.</small>
            )}
            {studyTime.status === "unavailable" && (
              <small role="status">
                The time total was returned in an unsupported format.
              </small>
            )}
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="student-learning-metric">
            <FaClock aria-hidden="true" />
            <span>Study time (last {days} days)</span>
            <strong>
              {dailyTime.status === "loading"
                ? "Loading..."
                : dailyTime.status === "error"
                  ? "Unavailable"
                  : formatStudyTime(periodSeconds)}
            </strong>
            {dailyTime.status === "error" && (
              <small role="alert">Could not load daily study time.</small>
            )}
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="student-learning-metric">
            <FaBullseye aria-hidden="true" />
            <span>Practice accuracy</span>
            <strong>
              {practice.status === "loading"
                ? "Loading..."
                : practice.status === "error"
                  ? "Unavailable"
                  : attempted > 0
                    ? formatPercentage(accuracy)
                    : "—"}
            </strong>
            {practice.status === "error" && (
              <small role="alert">Could not load practice results.</small>
            )}
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="student-learning-metric">
            <FaCheck aria-hidden="true" />
            <span>Practice questions attempted</span>
            <strong>
              {practice.status === "loading"
                ? "Loading..."
                : practice.status === "error"
                  ? "Unavailable"
                  : formatNumber(attempted)}
            </strong>
          </div>
        </div>
      </div>
      <div className="student-daily-study-chart">
        <h3>Daily study time</h3>
        {dailyTime.status === "loading" ? (
          <div className="performance-notice" role="status">
            <span className="spinner-border spinner-border-sm" /> Loading daily
            study time...
          </div>
        ) : dailyTime.status === "error" ? (
          <div className="performance-notice performance-notice-error" role="alert">
            Daily study-time data could not be loaded. Please refresh to try
            again.
          </div>
        ) : dailyTime.items.length ? (
          <div className="performance-chart-wrap">
            <BarChart
              className="performance-chart"
              xAxis={[
                {
                  scaleType: "band",
                  data: dailyLabels,
                  tickLabelStyle: { fill: "#64748b", fontSize: 11 },
                },
              ]}
              yAxis={[
                {
                  min: 0,
                  tickLabelStyle: { fill: "#64748b", fontSize: 11 },
                  valueFormatter: (value) => formatStudyTime(value),
                },
              ]}
              series={[
                {
                  data: dailyTime.items.map((item) =>
                    numberValue(item.activeSeconds),
                  ),
                  label: "Active study time",
                  valueFormatter: (value) => formatStudyTime(value),
                  color: "#6366f1",
                },
              ]}
              grid={{ horizontal: true }}
              height={280}
              margin={{ left: 64, right: 20, top: 24, bottom: 48 }}
              slotProps={{ legend: { hidden: true } }}
            />
          </div>
        ) : (
          <div className="performance-empty">
            No daily study-time data is available for this period.
          </div>
        )}
        <p className="student-daily-study-note">
          Daily history is collected from the rollout of daily tracking; older
          session totals cannot be reliably assigned to dates.
        </p>
      </div>
      {practice.status === "ready" && (
        <div className="student-practice-courses">
          <h3>Practice accuracy by course</h3>
          {courses.length ? (
            <div className="table-responsive">
              <table className="table performance-table mb-0">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Attempted</th>
                    <th>Correct</th>
                    <th>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr key={course.id ?? course.courseId ?? index}>
                      <td>{course.name || course.courseName || "Course"}</td>
                      <td>{formatNumber(course.attemptedUnits)}</td>
                      <td>{formatNumber(course.correctUnits)}</td>
                      <td>
                        {formatPercentage(course.accuracyPercentage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="performance-empty">
              No attempted practice questions yet.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function AdminDailyStudyTime({ filters }) {
  const [days, setDays] = useState(7);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ status: "loading", items: [] });
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let active = true;
    setState({ status: "loading", items: [] });
    ActivitySessionService.getDailyTime(days, JSON.parse(filtersKey))
      .then((response) => {
        if (!active) return;
        const payload = response?.data;
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
        setState({ status: "ready", items });
      })
      .catch((error) => {
        console.error("Failed to load scoped daily study time:", error);
        if (active) setState({ status: "error", items: [] });
      });

    return () => {
      active = false;
    };
  }, [days, filtersKey, reloadKey]);

  const labels = state.items.map((item) => {
    const [year, month, dayOfMonth] = String(item.date || "")
      .split("-")
      .map(Number);
    const date = new Date(year, month - 1, dayOfMonth);
    return Number.isNaN(date.getTime())
      ? String(item.date || "")
      : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  });
  const periodSeconds = state.items.reduce(
    (total, item) => total + numberValue(item.activeSeconds),
    0,
  );

  return (
    <section className="performance-panel student-learning-analytics">
      <div className="performance-panel-heading">
        <div>
          <h2>Daily Student Study Time</h2>
          <p>
            Aggregated active study time for students in your authorized scope.
          </p>
        </div>
        <div className="student-learning-actions">
          <label className="visually-hidden" htmlFor="admin-study-time-days">
            Daily study-time range
          </label>
          <select
            id="admin-study-time-days"
            className="form-select form-select-sm"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setReloadKey((key) => key + 1)}
            aria-label="Refresh daily student study time"
          >
            <FaRedo /> Refresh
          </button>
        </div>
      </div>
      <div className="student-learning-metric student-learning-period-total">
        <FaClock aria-hidden="true" />
        <span>Total student study time (last {days} days)</span>
        <strong>
          {state.status === "loading"
            ? "Loading..."
            : state.status === "error"
              ? "Unavailable"
              : formatStudyTime(periodSeconds)}
        </strong>
      </div>
      {state.status === "loading" ? (
        <div className="performance-notice" role="status">
          <span className="spinner-border spinner-border-sm" /> Loading daily
          study time...
        </div>
      ) : state.status === "error" ? (
        <div className="performance-notice performance-notice-error" role="alert">
          Daily student study-time data could not be loaded. Please refresh to
          try again.
        </div>
      ) : state.items.length ? (
        <div className="student-daily-study-chart">
          <div className="performance-chart-wrap">
            <BarChart
              className="performance-chart"
              xAxis={[
                {
                  scaleType: "band",
                  data: labels,
                  tickLabelStyle: { fill: "#64748b", fontSize: 11 },
                },
              ]}
              yAxis={[
                {
                  min: 0,
                  tickLabelStyle: { fill: "#64748b", fontSize: 11 },
                  valueFormatter: (value) => formatStudyTime(value),
                },
              ]}
              series={[
                {
                  data: state.items.map((item) =>
                    numberValue(item.activeSeconds),
                  ),
                  label: "Student active study time",
                  valueFormatter: (value) => formatStudyTime(value),
                  color: "#6366f1",
                },
              ]}
              grid={{ horizontal: true }}
              height={280}
              margin={{ left: 64, right: 20, top: 24, bottom: 48 }}
              slotProps={{ legend: { hidden: true } }}
            />
          </div>
        </div>
      ) : (
        <div className="performance-empty">
          No student study-time data is available for this period.
        </div>
      )}
      <p className="student-daily-study-note">
        Aggregates are limited to students in the selected authorized scope.
      </p>
    </section>
  );
}

function TrendChart({ trend, onBarClick }) {
  if (!trend.length) {
    return (
      <div className="performance-empty">No performance trend available.</div>
    );
  }

  const labels = trend.map(formatTrendLabel);
  const values = trend.map((item) => numberValue(item.averagePercentage));

  return (
    <div className="performance-chart-wrap">
      <BarChart
        className="performance-chart performance-chart-clickable"
        xAxis={[
          {
            scaleType: "band",
            data: labels,
            tickLabelStyle: { fill: "#94a3b8", fontSize: 11 },
          },
        ]}
        yAxis={[
          {
            min: 0,
            max: 100,
            tickNumber: 5,
            tickLabelStyle: { fill: "#94a3b8", fontSize: 11 },
            valueFormatter: (value) => `${value}%`,
          },
        ]}
        series={[
          {
            data: values,
            label: "Average percentage",
            valueFormatter: (value) => formatPercentage(value),
            color: "#22c55e",
          },
        ]}
        grid={{ horizontal: true, vertical: false }}
        height={280}
        margin={{ left: 52, right: 20, top: 18, bottom: 52 }}
        slotProps={{ legend: { hidden: true } }}
        onItemClick={(event, barItem) => {
          const item = trend[barItem?.dataIndex];
          if (item && onBarClick) onBarClick(item);
        }}
      />
      <p className="performance-chart-hint">
        Click a bar to see its chapters and marks.
      </p>
    </div>
  );
}

// Opens when an admin clicks a trend bar. A bar with a resultId is one
// student's own attempt, so it can be broken down by chapter; a bar that
// averages several students' results has no single attempt to open.
function ChapterBreakdownPanel({ trendItem, state, data, error, onClose }) {
  const navigate = useNavigate();

  if (!trendItem) return null;

  const chapters = asArray(data?.chapters);
  const needsStudent = !trendItem.resultId;

  return (
    <div
      className="performance-breakdown-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="performance-breakdown-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${trendItem.examName || "Exam"} chapter breakdown`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="performance-breakdown-head">
          <FaBookOpen className="performance-breakdown-head-icon" />
          <div>
            <h2>{trendItem.examName || "Exam"}</h2>
            <p>Chapter-by-chapter marks for this attempt.</p>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        {needsStudent && (
          <div className="performance-breakdown-notice">
            This bar is the average of more than one student, so there is no
            single attempt to open. Pick a student in the filters above, then
            click this exam&apos;s bar again.
          </div>
        )}

        {!needsStudent && state === "loading" && (
          <div className="performance-notice" role="status">
            <span className="spinner-border spinner-border-sm" /> Loading
            chapter marks...
          </div>
        )}

        {!needsStudent && state === "error" && (
          <div
            className="performance-notice performance-notice-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {!needsStudent && state === "ready" && (
          <>
            <div className="performance-breakdown-summary">
              <span>{data?.studentName || "Student"}</span>
              <strong>
                {formatNumber(data?.totalMarks)} /{" "}
                {formatNumber(data?.maximumMarks)} marks
              </strong>
              <span>{formatPercentage(data?.percentage)}</span>
            </div>

            {chapters.length ? (
              <ul className="performance-breakdown-chapters">
                {chapters.map((chapter) => {
                  const pct =
                    numberValue(chapter.maxMarks) > 0
                      ? (numberValue(chapter.scoredMarks) /
                          numberValue(chapter.maxMarks)) *
                        100
                      : 0;
                  return (
                    <li key={chapter.chapterId}>
                      <div className="performance-breakdown-chapter-row">
                        <span>{chapter.chapterName || "Chapter"}</span>
                        <strong>
                          {formatNumber(chapter.scoredMarks)} /{" "}
                          {formatNumber(chapter.maxMarks)}
                        </strong>
                      </div>
                      <div className="performance-breakdown-bar">
                        <div
                          className="performance-breakdown-bar-fill"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="performance-empty">
                This exam has no chapters recorded against its questions.
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary performance-breakdown-review-btn"
              onClick={() =>
                navigate(`/exams/${data.examId}/review/${data.resultId}`)
              }
            >
              <FaExternalLinkAlt /> View this exam attempt
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ResultPieChart({ passed, failed }) {
  const passedValue = numberValue(passed);
  const failedValue = numberValue(failed);

  if (passedValue === 0 && failedValue === 0) {
    return <div className="performance-empty">No result data available.</div>;
  }

  return (
    <div className="performance-pie-wrap">
      <PieChart
        className="performance-pie-chart"
        series={[
          {
            data: [
              { id: 0, value: passedValue, label: "Passed" },
              { id: 1, value: failedValue, label: "Failed" },
            ],
            innerRadius: 56,
            outerRadius: 92,
            paddingAngle: 2,
            cornerRadius: 8,
            valueFormatter: ({ value }) => formatNumber(value),
          },
        ]}
        colors={["#22c55e", "#ef4444"]}
        height={250}
        margin={{ top: 8, right: 8, bottom: 28, left: 8 }}
        slotProps={{
          legend: {
            direction: "row",
            position: { vertical: "bottom", horizontal: "middle" },
            itemMarkWidth: 10,
            itemMarkHeight: 10,
            labelStyle: { fontSize: 12, fill: "#475569" },
          },
        }}
      />
    </div>
  );
}

function StudentPercentageChart({ data }) {
  return (
    <div className="performance-chart-wrap student-bar-chart-wrap">
      <BarChart
        className="performance-chart"
        xAxis={[
          {
            scaleType: "band",
            data: ["Average", "Highest", "Lowest", "Pass Rate"],
            tickLabelStyle: { fontSize: 11 },
          },
        ]}
        yAxis={[
          {
            min: 0,
            max: 100,
            tickNumber: 5,
            valueFormatter: (value) => `${value}%`,
          },
        ]}
        series={[
          {
            data: [
              numberValue(data.averagePercentage),
              numberValue(data.highestPercentage),
              numberValue(data.lowestPercentage),
              numberValue(data.passRate),
            ],
            label: "Percentage",
            valueFormatter: (value) => formatPercentage(value),
          },
        ]}
        grid={{ horizontal: true }}
        height={280}
        margin={{ left: 58, right: 24, top: 24, bottom: 48 }}
        colors={["#2563eb"]}
        slotProps={{ legend: { hidden: true } }}
      />
    </div>
  );
}

function PerformanceDashboard() {
  const role = currentRole();
  const isStudent = role === "STUDENT";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isCollegeAdmin = role === "COLLEGE_ADMIN";
  const scopeTabs = SCOPE_TABS[role] ?? [];
  const [data, setData] = useState(EMPTY_DATA);
  const [options, setOptions] = useState({
    colleges: [],
    branches: [],
    courses: [],
    sections: [],
    exams: [],
    students: [],
  });

  // Who the numbers cover (one of college / branch / student at a time, via
  // the scope tabs) and which paper(s) - two independent axes, same split as
  // the Practice Performance page's scope + course/subject.
  const [scope, setScope] = useState({
    mode: scopeTabs[0]?.key ?? "all",
    collegeId: "",
    branchId: "",
    studentId: "",
  });
  const [hierarchy, setHierarchy] = useState({
    courseId: "",
    sectionId: "",
    examId: "",
  });

  const [topPerformersSearch, setTopPerformersSearch] = useState("");
  const [attentionSearch, setAttentionSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [optionsError, setOptionsError] = useState("");
  const [breakdown, setBreakdown] = useState({
    trendItem: null,
    status: "idle",
    data: null,
    error: "",
  });

  const scopeToParams = (currentScope) => {
    if (currentScope.mode === "college" && currentScope.collegeId) {
      return { collegeId: currentScope.collegeId };
    }
    if (currentScope.mode === "branch" && currentScope.branchId) {
      return { branchId: currentScope.branchId };
    }
    if (currentScope.mode === "student" && currentScope.studentId) {
      return { studentId: currentScope.studentId };
    }
    return {};
  };

  const activeParams = useMemo(
    () => ({
      ...scopeToParams(scope),
      ...Object.fromEntries(
        Object.entries(hierarchy).filter(([, value]) => value !== ""),
      ),
    }),
    [scope, hierarchy],
  );
  const activityScope = useMemo(
    () => scopeToParams(scope),
    [scope],
  );

  const loadPerformance = useCallback(
    async (nextFilters = {}) => {
      setStatus("loading");
      try {
        const response = isStudent
          ? await PerformanceService.getStudentPerformance()
          : isSuperAdmin
            ? await PerformanceService.getSuperAdminPerformance(nextFilters)
            : isCollegeAdmin
              ? await PerformanceService.getCollegePerformance(nextFilters)
              : await PerformanceService.getBranchPerformance(nextFilters);
        setData({ ...EMPTY_DATA, ...(response?.data || {}) });
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load performance:", error);
        setStatus("error");
      }
    },
    [isCollegeAdmin, isStudent, isSuperAdmin],
  );

  useEffect(() => {
    let active = true;
    if (isStudent) {
      loadPerformance();
      return () => {
        active = false;
      };
    }
    const optionRequests = [
      ...(isSuperAdmin ? [CollegeService.getAllColleges()] : []),
      ...(isCollegeAdmin ? [BranchService.getAllBranches()] : []),
      ...(isSuperAdmin ? [BranchService.getAllBranches()] : []),
      CourseService.getAllCourses(),
      SectionService.getAllSections(),
      ExamService.getAll(),
      UserService.getAllStudents(),
    ];
    Promise.allSettled(optionRequests).then((results) => {
      if (!active) return;
      const branchOffset = isSuperAdmin ? 1 : 0;
      const colleges = isSuperAdmin ? results[0] : null;
      const branches =
        isSuperAdmin || isCollegeAdmin ? results[branchOffset] : null;
      const offset = isSuperAdmin || isCollegeAdmin ? branchOffset + 1 : 0;
      const courses = results[offset];
      const sections = results[offset + 1];
      const exams = results[offset + 2];
      const students = results[offset + 3];
      setOptions({
        colleges:
          colleges?.status === "fulfilled"
            ? listFromResponse(colleges.value)
            : [],
        branches:
          branches?.status === "fulfilled"
            ? listFromResponse(branches.value)
            : [],
        courses:
          courses.status === "fulfilled" ? listFromResponse(courses.value) : [],
        sections:
          sections.status === "fulfilled"
            ? listFromResponse(sections.value)
            : [],
        exams:
          exams.status === "fulfilled" ? listFromResponse(exams.value) : [],
        students:
          students.status === "fulfilled"
            ? listFromResponse(students.value)
            : [],
      });
      if (results.some((result) => result.status === "rejected")) {
        setOptionsError("Some filter options could not be loaded.");
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent]);

  // Every scope / course / section / exam change reloads immediately - no
  // separate Apply step, same as Practice Performance's filters.
  useEffect(() => {
    if (isStudent) return;
    void loadPerformance(activeParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent, activeParams]);

  const changeScopeMode = (mode) => {
    setScope({ mode, collegeId: "", branchId: "", studentId: "" });
  };

  // Course -> Section -> Exam cascade: changing one clears whatever depends
  // on it, same rule the old form used.
  const handleHierarchyChange = (event) => {
    const { name, value } = event.target;
    setHierarchy((current) => {
      if (name === "courseId") {
        return { courseId: value, sectionId: "", examId: "" };
      }
      if (name === "sectionId") {
        return { ...current, sectionId: value, examId: "" };
      }
      return { ...current, [name]: value };
    });
  };

  const clearHierarchy = () =>
    setHierarchy({ courseId: "", sectionId: "", examId: "" });

  const openChapterBreakdown = async (trendItem) => {
    setBreakdown({ trendItem, status: "idle", data: null, error: "" });

    if (!trendItem.resultId) return;

    setBreakdown((current) => ({ ...current, status: "loading" }));
    try {
      const response = await PerformanceService.getExamResultChapterBreakdown(
        trendItem.resultId,
      );
      setBreakdown((current) => ({
        ...current,
        status: "ready",
        data: response?.data || null,
      }));
    } catch (error) {
      setBreakdown((current) => ({
        ...current,
        status: "error",
        error: getApiErrorMessage(
          error,
          "We couldn't load this attempt's chapter breakdown.",
        ),
      }));
    }
  };

  const closeChapterBreakdown = () =>
    setBreakdown({ trendItem: null, status: "idle", data: null, error: "" });

  const coursePerformance = asArray(data.coursePerformance);
  const branchPerformance = asArray(data.branchPerformance);
  const trend = asArray(data.performanceTrend);
  const topPerformers = asArray(data.topPerformers);
  const studentsNeedingAttention = asArray(data.studentsNeedingAttention);
  const filteredTopPerformers = useMemo(() => {
    const query = topPerformersSearch.trim().toLowerCase();
    return query
      ? topPerformers.filter((row) =>
          String(row.studentName || "")
            .toLowerCase()
            .includes(query),
        )
      : topPerformers;
  }, [topPerformers, topPerformersSearch]);
  const filteredStudentsNeedingAttention = useMemo(() => {
    const query = attentionSearch.trim().toLowerCase();
    return query
      ? studentsNeedingAttention.filter((row) =>
          String(row.studentName || "")
            .toLowerCase()
            .includes(query),
        )
      : studentsNeedingAttention;
  }, [studentsNeedingAttention, attentionSearch]);
  // The scope tab pins at most one of college / branch - used only to
  // narrow the Course / Section / Exam / Student lists, same as scope and
  // path are independent axes on the Practice Performance page.
  const scopeCollegeId = scope.mode === "college" ? scope.collegeId : "";
  const scopeBranchId = scope.mode === "branch" ? scope.branchId : "";

  const visibleCourses = useMemo(
    () =>
      options.courses.filter(
        (course) =>
          matchesParent(course, scopeBranchId, ["branchId", "branch_id"]) &&
          matchesParent(course, scopeCollegeId, ["collegeId", "college_id"]),
      ),
    [options.courses, scopeBranchId, scopeCollegeId],
  );

  const visibleBranches = useMemo(
    () =>
      options.branches.filter((branch) =>
        matchesParent(branch, scope.collegeId, ["collegeId", "college_id"]),
      ),
    [options.branches, scope.collegeId],
  );

  const visibleSections = useMemo(() => {
    return options.sections.filter(
      (section) =>
        matchesParent(section, scopeBranchId, ["branchId", "branch_id"]) &&
        matchesParent(section, scopeCollegeId, ["collegeId", "college_id"]) &&
        matchesParent(section, hierarchy.courseId, [
          "courseId",
          "course_id",
        ]),
    );
  }, [options.sections, scopeBranchId, scopeCollegeId, hierarchy.courseId]);

  const visibleExams = useMemo(
    () =>
      options.exams.filter(
        (exam) =>
          matchesParent(exam, scopeBranchId, ["branchId", "branch_id"]) &&
          matchesParent(exam, scopeCollegeId, ["collegeId", "college_id"]) &&
          matchesParent(exam, hierarchy.courseId, ["courseId", "course_id"]) &&
          matchesParent(exam, hierarchy.sectionId, [
            "sectionId",
            "section_id",
          ]),
      ),
    [
      options.exams,
      scopeBranchId,
      scopeCollegeId,
      hierarchy.courseId,
      hierarchy.sectionId,
    ],
  );

  // The Student picker (scope.mode === "student") - narrowed by whichever
  // college/branch the role already implies, and by the current course /
  // section so the list only ever shows relevant students.
  const visibleStudents = useMemo(
    () =>
      options.students.filter(
        (student) =>
          matchesParent(student, scopeCollegeId, [
            "collegeId",
            "college_id",
          ]) &&
          matchesParent(student, scopeBranchId, ["branchId", "branch_id"]) &&
          matchesParent(student, hierarchy.courseId, [
            "courseId",
            "course_id",
          ]) &&
          matchesParent(student, hierarchy.sectionId, [
            "sectionId",
            "section_id",
          ]),
      ),
    [
      options.students,
      scopeBranchId,
      scopeCollegeId,
      hierarchy.courseId,
      hierarchy.sectionId,
    ],
  );

  // Whose line the trend chart is showing.
  const trendStudentName = useMemo(() => {
    if (scope.mode !== "student" || !scope.studentId) return null;

    const student = options.students.find(
      (candidate) =>
        String(getId(candidate, ["userId", "id"])) === String(scope.studentId),
    );

    return student ? getLabel(student, ["name"], "this student") : "this student";
  }, [scope.mode, scope.studentId, options.students]);

  const activeTab = scopeTabs.find((tab) => tab.key === scope.mode);
  const pickKind = activeTab?.pick;

  const pickList = {
    college: options.colleges.map((college) => ({
      value: String(getId(college, ["collegeId", "id"])),
      label: getLabel(
        college,
        ["instituteName", "collegeName", "name"],
        "College",
      ),
    })),
    branch: visibleBranches.map((branch) => ({
      value: String(getId(branch, ["branchId", "id"])),
      label: getLabel(branch, ["branchName", "name"], "Branch"),
    })),
    student: [...visibleStudents]
      .sort((a, b) =>
        String(getLabel(a, ["name"], "")).localeCompare(
          String(getLabel(b, ["name"], "")),
        ),
      )
      .map((student) => ({
        value: String(getId(student, ["userId", "id"])),
        label: getLabel(student, ["name"], "Student"),
      })),
  };

  const pickValue = pickKind ? scope[`${pickKind}Id`] : "";
  const pickAllLabel = {
    college: "All colleges",
    branch: "All branches",
    student: "All students",
  };

  return (
    <div className="container-fluid performance-page">
      <header className="performance-header">
        <div className="performance-title">
          <div className="performance-title-icon">
            <FaChartLine />
          </div>
          <div>
            <h1>Performance Dashboard</h1>
            <p>Track exam outcomes and identify students who need support.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary performance-refresh"
          onClick={() => loadPerformance(activeParams)}
          disabled={status === "loading"}
        >
          <FaRedo /> Refresh
        </button>
      </header>

      {isStudent && (
        <StudentPerformanceView
          data={data}
          status={status}
          onRetry={() => loadPerformance()}
        />
      )}

      {!isStudent && (
        <section className="performance-filters card shadow-sm border-0">
          {scopeTabs.length > 0 && (
            <div className="performance-scope-row">
              <span className="performance-field-label">Scope</span>
              <div className="performance-scope-tabs" role="tablist">
                {scopeTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={scope.mode === tab.key}
                    className={scope.mode === tab.key ? "is-active" : undefined}
                    onClick={() => changeScopeMode(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="row g-3 align-items-end">
            {pickKind && (
              <div className="col-12 col-md-4 col-xl-3">
                <label htmlFor="performance-pick">
                  {pickKind === "college"
                    ? "College"
                    : pickKind === "branch"
                      ? "Branch"
                      : "Student"}
                </label>
                <select
                  id="performance-pick"
                  value={pickValue}
                  onChange={(event) =>
                    setScope((current) => ({
                      ...current,
                      [`${pickKind}Id`]: event.target.value,
                    }))
                  }
                >
                  <option value="">{pickAllLabel[pickKind]}</option>
                  {pickList[pickKind].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-12 col-md-4 col-xl-3">
              <label htmlFor="performance-course">Course</label>
              <select
                id="performance-course"
                name="courseId"
                value={hierarchy.courseId}
                onChange={handleHierarchyChange}
              >
                <option value="">All courses</option>
                {visibleCourses.map((course) => {
                  const id = getId(course, ["courseId", "id"]);
                  return (
                    <option key={id} value={id}>
                      {getLabel(
                        course,
                        ["courseName", "name", "title"],
                        "Course",
                      )}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-12 col-md-4 col-xl-3">
              <label htmlFor="performance-section">Section</label>
              <select
                id="performance-section"
                name="sectionId"
                value={hierarchy.sectionId}
                onChange={handleHierarchyChange}
              >
                <option value="">All sections</option>
                {visibleSections.map((section) => {
                  const id = getId(section, ["sectionId", "id"]);
                  return (
                    <option key={id} value={id}>
                      {getLabel(section, ["sectionName", "name"], "Section")}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-12 col-md-4 col-xl-3">
              <label htmlFor="performance-exam">Exam</label>
              <select
                id="performance-exam"
                name="examId"
                value={hierarchy.examId}
                onChange={handleHierarchyChange}
              >
                <option value="">All exams</option>
                {visibleExams.map((exam) => {
                  const id = getId(exam, ["examId", "id"]);
                  return (
                    <option key={id} value={id}>
                      {getLabel(exam, ["examName", "name", "title"], "Exam")}
                    </option>
                  );
                })}
              </select>
            </div>
            {(hierarchy.courseId || hierarchy.sectionId || hierarchy.examId) && (
              <div className="col-12 col-md-4 col-xl-3">
                <button
                  type="button"
                  className="btn btn-light w-100"
                  onClick={clearHierarchy}
                >
                  Clear course, section &amp; exam
                </button>
              </div>
            )}
          </div>
          {optionsError && (
            <small className="text-warning d-block mt-3">{optionsError}</small>
          )}
        </section>
      )}

      {!isStudent && status === "loading" && (
        <div className="performance-notice" role="status">
          <span className="spinner-border spinner-border-sm" /> Loading
          performance...
        </div>
      )}
      {!isStudent && status === "error" && (
        <div
          className="performance-notice performance-notice-error"
          role="alert"
        >
          <span>
            {getApiErrorMessage(
              null,
              "We couldn't load performance data. Please try again.",
            )}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => loadPerformance(activeParams)}
          >
            Try again
          </button>
        </div>
      )}

      {!isStudent && status === "ready" && (
        <>
          <div className="row g-3 performance-summary-row">
            <SummaryCard
              label="Total Students"
              value={formatNumber(data.totalStudents)}
              tone="blue"
              icon={<FaUsers />}
            />
            <SummaryCard
              label="Exams Conducted"
              value={formatNumber(data.examsConducted)}
              tone="purple"
              icon={<FaClipboardList />}
            />
            <SummaryCard
              label="Average Percentage"
              value={formatPercentage(data.averagePercentage)}
              tone="teal"
              icon={<FaChartLine />}
            />
            <SummaryCard
              label="Pass Rate"
              value={formatPercentage(data.passRate)}
              tone="green"
              icon={<FaUserCheck />}
            />
            <SummaryCard
              label="Passed"
              value={formatNumber(data.passedResults)}
              tone="orange"
              icon={<FaCheck />}
            />
            <SummaryCard
              label="Failed"
              value={formatNumber(data.failedResults)}
              tone="red"
              icon={<FaTimes />}
            />
          </div>

          <AdminDailyStudyTime filters={activityScope} />

          <div className="row g-4 performance-charts-row">
            <div className="col-12 col-xl-8">
              <section className="performance-panel performance-chart-panel performance-trend-panel">
                <div className="performance-panel-heading">
                  <div>
                    <h2>Performance Trend</h2>
                    <p>
                      {trendStudentName
                        ? `${trendStudentName}'s percentage across exams.`
                        : "Average percentage across conducted exams."}
                    </p>
                  </div>
                  <FaChartLine />
                </div>
                <TrendChart trend={trend} onBarClick={openChapterBreakdown} />
              </section>
            </div>
            <div className="col-12 col-xl-4">
              <section className="performance-panel performance-chart-panel performance-result-panel">
                <div className="performance-panel-heading">
                  <div>
                    <h2>Result Summary</h2>
                    <p>Passed and failed results.</p>
                  </div>
                  <FaUsers />
                </div>
                <ResultPieChart
                  passed={data.passedResults}
                  failed={data.failedResults}
                />
              </section>
            </div>
          </div>

          <PerformanceTable
            title="Course Performance"
            icon={<FaUsers />}
            rows={coursePerformance}
            columns={[
              ["Course", (row) => row.courseName || "Course"],
              ["Students", (row) => formatNumber(row.totalStudents)],
              ["Exams", (row) => formatNumber(row.examsConducted)],
              ["Average %", (row) => formatPercentage(row.averagePercentage)],
              ["Pass Rate", (row) => formatPercentage(row.passRate)],
              ["Passed", (row) => formatNumber(row.passedResults)],
              ["Failed", (row) => formatNumber(row.failedResults)],
            ]}
          />

          {isCollegeAdmin && (
            <PerformanceTable
              title="Branch Performance"
              icon={<FaUsers />}
              rows={branchPerformance}
              columns={[
                ["Branch", (row) => row.branchName || "Branch"],
                ["Students", (row) => formatNumber(row.totalStudents)],
                ["Exams", (row) => formatNumber(row.examsConducted)],
                ["Average %", (row) => formatPercentage(row.averagePercentage)],
                ["Pass Rate", (row) => formatPercentage(row.passRate)],
                ["Passed", (row) => formatNumber(row.passedResults)],
                ["Failed", (row) => formatNumber(row.failedResults)],
              ]}
            />
          )}

          <div className="row g-4">
            <div className="col-12 col-xl-7">
              <PerformanceTable
                title="Top Performers"
                rows={filteredTopPerformers}
                searchValue={topPerformersSearch}
                onSearchChange={setTopPerformersSearch}
                searchPlaceholder="Search student"
                columns={[
                  ["Rank", (_, index) => `#${index + 1}`],
                  ["Student", (row) => row.studentName || "Student"],
                  ["Course", (row) => row.courseName || "-"],
                  ["Section", (row) => row.sectionName || "-"],
                  [
                    "Exams Attempted",
                    (row) => formatNumber(row.examsAttempted),
                  ],
                  [
                    "Average %",
                    (row) => formatPercentage(row.averagePercentage),
                  ],
                  [
                    "Highest %",
                    (row) => formatPercentage(row.highestPercentage),
                  ],
                  ["Pass Rate", (row) => formatPercentage(row.passRate)],
                ]}
              />
            </div>
            <div className="col-12 col-xl-5">
              <PerformanceTable
                title="Students Needing Attention"
                rows={filteredStudentsNeedingAttention}
                searchValue={attentionSearch}
                onSearchChange={setAttentionSearch}
                searchPlaceholder="Search student"
                columns={[
                  ["Student", (row) => row.studentName || "Student"],
                  ["Course", (row) => row.courseName || "-"],
                  ["Section", (row) => row.sectionName || "-"],
                  [
                    "Exams Attempted",
                    (row) => formatNumber(row.examsAttempted),
                  ],
                  [
                    "Average %",
                    (row) => formatPercentage(row.averagePercentage),
                  ],
                  ["Failed Exams", (row) => formatNumber(row.failedExams)],
                  ["Pass Rate", (row) => formatPercentage(row.passRate)],
                ]}
              />
            </div>
          </div>
        </>
      )}

      <ChapterBreakdownPanel
        trendItem={breakdown.trendItem}
        state={breakdown.status}
        data={breakdown.data}
        error={breakdown.error}
        onClose={closeChapterBreakdown}
      />
    </div>
  );
}

function PerformanceTable({
  title,
  icon,
  rows,
  columns,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search",
}) {
  return (
    <section className="performance-panel performance-table-panel">
      <div className="performance-panel-heading">
        <div>
          <h2>{title}</h2>
          <p>
            {rows.length
              ? `${rows.length} ${rows.length === 1 ? "record" : "records"}`
              : "No records in this view."}
          </p>
        </div>
        <div className="performance-table-actions">
          {onSearchChange && (
            <div className="performance-table-search">
              <FaSearch aria-hidden="true" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={`${title} search`}
              />
            </div>
          )}
          {icon}
        </div>
      </div>
      <div className="table-responsive">
        <table className="table performance-table mb-0">
          <thead>
            <tr>
              {columns.map(([heading]) => (
                <th key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr
                  key={
                    row.userId ||
                    row.courseId ||
                    row.branchId ||
                    `${title}-${index}`
                  }
                >
                  {columns.map(([heading, render]) => (
                    <td key={heading}>{render(row, index)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <TableEmpty colSpan={columns.length} />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default PerformanceDashboard;
