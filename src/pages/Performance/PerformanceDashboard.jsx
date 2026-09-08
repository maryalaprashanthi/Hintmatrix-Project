import { useCallback, useEffect, useMemo, useState } from "react";
import { FaChartLine, FaRedo, FaSearch, FaUsers } from "react-icons/fa";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";

import CourseService from "../../services/CourseService";
import BranchService from "../../services/BranchService";
import CollegeService from "../../services/CollegeService";
import ExamService from "../../services/ExamService";
import PerformanceService from "../../services/PerformanceService";
import SectionService from "../../services/SectionService";
import { currentRole } from "../../utils/roles";
import { getApiErrorMessage } from "../../utils/apiError";
import "./PerformanceDashboard.css";

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

function SummaryCard({ label, value, tone }) {
  return (
    <div className="col-12 col-sm-6 col-xl-2">
      <div className={`performance-summary-card ${tone}`}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function StudentPerformanceView({ data, status, onRetry }) {
  if (status === "loading") {
    return (
      <div className="performance-notice" role="status">
        <span className="spinner-border spinner-border-sm" /> Loading
        performance...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="performance-notice performance-notice-error" role="alert">
        <span>We couldn't load your performance data. Please try again.</span>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={onRetry}
        >
          Try again
        </button>
      </div>
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

function TrendChart({ trend }) {
  if (!trend.length) {
    return (
      <div className="performance-empty">No performance trend available.</div>
    );
  }

  const labels = trend.map(formatTrendLabel);
  const values = trend.map((item) => numberValue(item.averagePercentage));

  return (
    <div className="performance-chart-wrap">
      <LineChart
        className="performance-chart"
        xAxis={[
          {
            scaleType: "point",
            data: labels,
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
            data: values,
            label: "Average percentage",
            area: true,
            showMark: true,
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
            innerRadius: 48,
            outerRadius: 92,
            paddingAngle: 2,
            cornerRadius: 4,
            valueFormatter: ({ value }) => formatNumber(value),
          },
        ]}
        colors={["#16a34a", "#dc2626"]}
        height={250}
        margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
        slotProps={{
          legend: {
            direction: "row",
            position: { vertical: "bottom", horizontal: "middle" },
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
  const [data, setData] = useState(EMPTY_DATA);
  const [options, setOptions] = useState({
    colleges: [],
    branches: [],
    courses: [],
    sections: [],
    exams: [],
  });
  const [filters, setFilters] = useState({
    collegeId: "",
    branchId: "",
    courseId: "",
    sectionId: "",
    examId: "",
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [topPerformersSearch, setTopPerformersSearch] = useState("");
  const [attentionSearch, setAttentionSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [optionsError, setOptionsError] = useState("");

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
      });
      if (results.some((result) => result.status === "rejected")) {
        setOptionsError("Some filter options could not be loaded.");
      }
    });
    loadPerformance();
    return () => {
      active = false;
    };
  }, [isStudent, loadPerformance]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => {
      if (name === "collegeId") {
        return {
          ...current,
          collegeId: value,
          branchId: "",
          courseId: "",
          sectionId: "",
          examId: "",
        };
      }
      if (name === "branchId") {
        return {
          ...current,
          branchId: value,
          courseId: "",
          sectionId: "",
          examId: "",
        };
      }
      if (name === "courseId") {
        return { ...current, courseId: value, sectionId: "", examId: "" };
      }
      if (name === "sectionId") {
        return { ...current, sectionId: value, examId: "" };
      }
      return { ...current, [name]: value };
    });
  };

  const applyFilters = (event) => {
    event.preventDefault();
    const nextFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined,
      ),
    );
    setActiveFilters(nextFilters);
    loadPerformance(nextFilters);
  };

  const clearFilters = () => {
    setFilters({
      collegeId: "",
      branchId: "",
      courseId: "",
      sectionId: "",
      examId: "",
    });
    setActiveFilters({});
    loadPerformance();
  };

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
  const visibleCourses = useMemo(
    () =>
      options.courses.filter(
        (course) =>
          matchesParent(course, filters.branchId, ["branchId", "branch_id"]) &&
          matchesParent(course, filters.collegeId, ["collegeId", "college_id"]),
      ),
    [options.courses, filters.branchId, filters.collegeId],
  );

  const visibleBranches = useMemo(
    () =>
      options.branches.filter((branch) =>
        matchesParent(branch, filters.collegeId, ["collegeId", "college_id"]),
      ),
    [options.branches, filters.collegeId],
  );

  const visibleSections = useMemo(() => {
    return options.sections.filter(
      (section) =>
        matchesParent(section, filters.branchId, ["branchId", "branch_id"]) &&
        matchesParent(section, filters.collegeId, [
          "collegeId",
          "college_id",
        ]) &&
        matchesParent(section, filters.courseId, ["courseId", "course_id"]),
    );
  }, [options.sections, filters.branchId, filters.collegeId, filters.courseId]);

  const visibleExams = useMemo(
    () =>
      options.exams.filter(
        (exam) =>
          matchesParent(exam, filters.branchId, ["branchId", "branch_id"]) &&
          matchesParent(exam, filters.collegeId, ["collegeId", "college_id"]) &&
          matchesParent(exam, filters.courseId, ["courseId", "course_id"]) &&
          matchesParent(exam, filters.sectionId, ["sectionId", "section_id"]),
      ),
    [options.exams, filters.branchId, filters.courseId, filters.sectionId],
  );

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
          onClick={() => loadPerformance(activeFilters)}
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
        <form
          className="performance-filters card shadow-sm border-0"
          onSubmit={applyFilters}
        >
          <div className="row g-3 align-items-end">
            {isSuperAdmin && (
              <div className="col-12 col-md-4 col-xl-3">
                <label htmlFor="performance-college">College</label>
                <select
                  id="performance-college"
                  name="collegeId"
                  value={filters.collegeId}
                  onChange={handleFilterChange}
                >
                  <option value="">All colleges</option>
                  {options.colleges.map((college) => {
                    const id = getId(college, ["collegeId", "id"]);
                    return (
                      <option key={id} value={id}>
                        {getLabel(
                          college,
                          ["instituteName", "collegeName", "name"],
                          "College",
                        )}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            {(isSuperAdmin || isCollegeAdmin) && (
              <div className="col-12 col-md-4 col-xl-3">
                <label htmlFor="performance-branch">Branch</label>
                <select
                  id="performance-branch"
                  name="branchId"
                  value={filters.branchId}
                  onChange={handleFilterChange}
                >
                  <option value="">All branches</option>
                  {visibleBranches.map((branch) => {
                    const id = getId(branch, ["branchId", "id"]);
                    return (
                      <option key={id} value={id}>
                        {getLabel(branch, ["branchName", "name"], "Branch")}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            <div className="col-12 col-md-4 col-xl-3">
              <label htmlFor="performance-course">Course</label>
              <select
                id="performance-course"
                name="courseId"
                value={filters.courseId}
                onChange={handleFilterChange}
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
                value={filters.sectionId}
                onChange={handleFilterChange}
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
                value={filters.examId}
                onChange={handleFilterChange}
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
            <div className="col-12 col-xl-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-grow-1">
                <FaSearch /> Apply
              </button>
              <button
                type="button"
                className="btn btn-light flex-grow-1"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          </div>
          {optionsError && (
            <small className="text-warning d-block mt-3">{optionsError}</small>
          )}
        </form>
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
            onClick={() => loadPerformance(activeFilters)}
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
            />
            <SummaryCard
              label="Exams Conducted"
              value={formatNumber(data.examsConducted)}
              tone="purple"
            />
            <SummaryCard
              label="Average Percentage"
              value={formatPercentage(data.averagePercentage)}
              tone="teal"
            />
            <SummaryCard
              label="Pass Rate"
              value={formatPercentage(data.passRate)}
              tone="green"
            />
            <SummaryCard
              label="Passed"
              value={formatNumber(data.passedResults)}
              tone="orange"
            />
            <SummaryCard
              label="Failed"
              value={formatNumber(data.failedResults)}
              tone="red"
            />
          </div>

          <div className="row g-4 performance-charts-row">
            <div className="col-12 col-xl-8">
              <section className="performance-panel performance-chart-panel">
                <div className="performance-panel-heading">
                  <div>
                    <h2>Performance Trend</h2>
                    <p>Average percentage across conducted exams.</p>
                  </div>
                  <FaChartLine />
                </div>
                <TrendChart trend={trend} />
              </section>
            </div>
            <div className="col-12 col-xl-4">
              <section className="performance-panel performance-chart-panel">
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
