import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { BarChart } from "@mui/x-charts/BarChart";
import DataGrid from "../../components/DataGrid";

import {
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaChartPie,
  FaUserFriends,
  FaChartBar,
  FaFilter,
  FaSearch,
  FaChevronDown,
  FaClipboardList,
  FaGraduationCap,
} from "react-icons/fa";

import "./StudentAttendance.css";

import AttendanceService from "../../services/AttendanceService";
import { currentRole, ROLES } from "../../utils/roles";
import { analyzeAttendance } from "../../utils/attendanceSummaryRows";

function StudentAttendance() {
  const role = currentRole();
  const isStudent = role === ROLES.STUDENT;
  const fileInputRef = useRef(null);

  // ==============================
  // STATE
  // ==============================

  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // Filters

  const [selectedDate, setSelectedDate] = useState(getDefaultFromDate());
  const [selectedToDate, setSelectedToDate] = useState(getTodayDate());

  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [appliedStudent, setAppliedStudent] = useState("");

  const [appliedSection, setAppliedSection] = useState("");
  const [appliedDate, setAppliedDate] = useState(getDefaultFromDate());
  const [appliedToDate, setAppliedToDate] = useState(getTodayDate());
  const [organizationFilters, setOrganizationFilters] = useState({ collegeId: "", branchId: "", courseId: "" });
  const [appliedOrganization, setAppliedOrganization] = useState({ collegeId: "", branchId: "", courseId: "" });
  const matchesOrganization = (item, filters) => Object.entries(filters)
    .every(([key, value]) => !value || String(item[key] ?? "") === value);
  const organizationOptions = (field, label, parentFilters) => [...new Map(attendance
    .filter((item) => matchesOrganization(item, parentFilters) && item[field] != null)
    .map((item) => [String(item[field]), { value: String(item[field]), label: item[label] || String(item[field]) }]))
    .values()].sort((first, second) => first.label.localeCompare(second.label));
  const collegeOptions = organizationOptions("collegeId", "collegeName", {});
  const branchOptions = organizationOptions("branchId", "branchName", { collegeId: organizationFilters.collegeId });
  const courseOptions = organizationOptions("courseId", "courseName", {
    collegeId: organizationFilters.collegeId, branchId: organizationFilters.branchId,
  });
  const studentOptions = useMemo(() => [...new Map(attendance
    .filter((item) => item.studentId != null && matchesOrganization(item, organizationFilters) &&
      (!selectedSection || item.section === selectedSection))
    .map((item) => [String(item.studentId).trim(), { value: String(item.studentId).trim(), name: item.studentName || "Student" }]))
    .values()].sort((first, second) => first.name.localeCompare(second.name)), [attendance, organizationFilters, selectedSection]);

  const normalizeAttendanceResponse = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.attendance)) return response.attendance;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.content)) return response.content;
    return [];
  };

  // ==============================
  // GET TODAY DATE
  // ==============================

  function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getDefaultFromDate() {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  // ==============================
  // LOAD ATTENDANCE
  // ==============================

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const data = await (isStudent
        ? AttendanceService.getMyAttendance()
        : AttendanceService.getAllAttendance());

      console.log("Attendance API:", data);

      setAttendance(normalizeAttendanceResponse(data));
    } catch (err) {
      console.error("Failed to load attendance:", err);

      setError(typeof err.response?.data === "string" ? err.response.data : err.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [isStudent]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // ==============================
  // STATUS NORMALIZATION
  // ==============================

  const getStatus = (status) => {
    if (!status) {
      return "";
    }

    const value = status.toString().trim().toLowerCase();

    if (value === "p" || value === "present") {
      return "Present";
    }

    if (value === "l" || value === "late") {
      return "Late";
    }

    if (value === "a" || value === "absent") {
      return "Absent";
    }

    return status;
  };

  // ==============================
  // AVAILABLE SECTIONS
  // ==============================

  const sections = useMemo(() => {
    return [...new Set(attendance.filter((item) => matchesOrganization(item, organizationFilters))
      .map((item) => item.section).filter(Boolean))].sort();
  }, [attendance, organizationFilters]);

  // ==============================
  // FILTER ATTENDANCE
  // ==============================

  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      const dateMatches = (!appliedDate || item.attendanceDate >= appliedDate) &&
        (!appliedToDate || item.attendanceDate <= appliedToDate);

      const sectionMatches = !appliedSection || item.section === appliedSection;

      const studentMatches = !appliedStudent || String(item.studentId ?? "").trim() === appliedStudent;
      return dateMatches && sectionMatches && studentMatches && matchesOrganization(item, appliedOrganization);
    });
  }, [attendance, appliedDate, appliedToDate, appliedSection, appliedOrganization, appliedStudent]);

  // ==============================
  // KPI VALUES
  // ==============================

  const analytics = useMemo(() => analyzeAttendance(filteredAttendance), [filteredAttendance]);
  const totalStudents = isStudent ? analytics.dailyRows.length : analytics.totalStudents;
  const presentCount = analytics.present;
  const lateCount = analytics.late;
  const absentCount = analytics.absent;
  const attendancePercentage = analytics.rate == null ? "—" : `${analytics.rate.toFixed(1)}%`;
  const attendanceChart = {
    dates: analytics.trend.map((item) => item.date),
    present: analytics.trend.map((item) => item.present),
    late: analytics.trend.map((item) => item.late),
    absent: analytics.trend.map((item) => item.absent),
  };
  const studentRows = analytics.dailyRows.map((item) => ({
    ...item, name: item.studentName, section: item.section || "-",
    status: getStatus(item.status), statusDescription: item.statusDescription || "-",
    inTime: item.inTime || "-", outTime: item.outTime || "-",
  }));
  const lowAttendanceColumns = [
    { headerName: "Student ID", field: "studentId", minWidth: 120 },
    { headerName: "Student", field: "name", minWidth: 170, flex: 1 },
    { headerName: "College", field: "college", minWidth: 170 },
    { headerName: "Branch", field: "branch", minWidth: 130 },
    { headerName: "Course", field: "course", minWidth: 140 },
    { headerName: "Section", field: "section", minWidth: 100 },
    { headerName: "Recorded days", field: "days", minWidth: 135 },
    { headerName: "Present", field: "present", minWidth: 100 },
    { headerName: "Late", field: "late", minWidth: 85 },
    { headerName: "Absent", field: "absent", minWidth: 100 },
    { headerName: "Attendance", field: "percentage", minWidth: 125,
      valueFormatter: ({ value }) => `${Number(value).toFixed(1)}%`,
      cellStyle: { color: "#dc3545", fontWeight: 600 } },
  ];

  const studentColumns = useMemo(
    () => [
      { headerName: "Date", field: "attendanceDate", minWidth: 120 },
      { headerName: "College", field: "collegeName", minWidth: 170 },
      { headerName: "Branch", field: "branchName", minWidth: 130 },
      { headerName: "Course", field: "courseName", minWidth: 140 },
      {
        headerName: "Student ID",
        field: "studentId",
        minWidth: 140,
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Student Name",
        field: "name",
        minWidth: 190,
        flex: 2,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Section",
        field: "section",
        minWidth: 120,
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "In Time",
        field: "inTime",
        minWidth: 125,
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Out Time",
        field: "outTime",
        minWidth: 130,
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Status",
        field: "status",
        minWidth: 120,
        flex: 1,
        sortable: true,
        filter: true,

        valueFormatter: (params) => {
          const value = params.value?.toString().trim().toUpperCase();

          if (value === "P" || value === "PRESENT") return "Present";
          if (value === "L" || value === "LATE") return "Late";
          if (value === "A" || value === "ABSENT") return "Absent";

          return params.value || "-";
        },

        cellStyle: (params) => {
          const value = params.value?.toString().trim().toUpperCase();

          if (value === "P" || value === "PRESENT") {
            return {
              color: "#198754",
              fontWeight: "600",
            };
          }

          if (value === "L" || value === "LATE") {
            return {
              color: "#f59e0b",
              fontWeight: "600",
            };
          }

          if (value === "A" || value === "ABSENT") {
            return {
              color: "#dc3545",
              fontWeight: "600",
            };
          }

          return {
            color: "#000000",
          };
        },
      },
    ],
    [],
  );

  // ==============================
  // SECTION GRID COLUMNS
  // ==============================

  // ==============================
  // APPLY FILTERS
  // ==============================

  const handleApplyFilters = () => {
    if (selectedDate && selectedToDate && selectedDate > selectedToDate) {
      setError("From date must be on or before To date.");
      return;
    }
    setError("");
    setAppliedDate(selectedDate);
    setAppliedToDate(selectedToDate);
    setAppliedSection(selectedSection);
    setAppliedStudent(selectedStudent);
    setAppliedOrganization(organizationFilters);
  };

  // ==============================
  // UPLOAD BUTTON
  // ==============================

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // ==============================
  // EXCEL UPLOAD
  // ==============================

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);

      setError("");

      setSuccessMessage("");

      const response = await AttendanceService.uploadExcel(file);

      console.log("Upload response:", response);

      // Success is announced by the notification popup; avoid a duplicate banner.
      // setSuccessMessage("Attendance Excel uploaded successfully.");

      // Reload dashboard
      await loadAttendance();
    } catch (err) {
      console.error("Upload failed:", err);

      setError(typeof err.response?.data === "string" ? err.response.data : err.response?.data?.message || "Attendance upload failed.");
    } finally {
      setUploading(false);

      // Allow same file to be selected again
      event.target.value = "";
    }
  };

  // ==============================
  // FORMAT HEADER DATE
  // ==============================

  const isSingleDay = appliedDate && appliedDate === appliedToDate;
  const formattedDate = isSingleDay ? appliedDate : `${appliedDate || "Beginning"} to ${appliedToDate || "latest"}`;

  // ==============================
  // UI
  // ==============================

  return (
    <div className="attendance-page">
      <main className="attendance-content">
        {/* ================= HEADER ================= */}

        <header className="attendance-header">
          <div className="attendance-heading">
            <div className="heading-calendar">
              <FaCalendarAlt />
            </div>

            <h1>Attendance Dashboard</h1>
          </div>

          {!isStudent && (
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.xlsm"
              style={{
                display: "none",
              }}
              onChange={handleFileChange}
            />
          )}

          <div className="d-flex gap-2 flex-wrap">
            {!isStudent && (
              <button
                className="btn btn-primary"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "⬆ Upload"}
              </button>
            )}

            <label className="header-date">
              <span>From</span>
              <FaCalendarAlt />

              <input
                type="date"
                value={selectedDate}
                max={selectedToDate || undefined}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (isStudent) setAppliedDate(e.target.value);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                }}
              />

              <FaChevronDown />
            </label>
            <label className="header-date">
              <span>To</span>
              <input type="date" value={selectedToDate} min={selectedDate || undefined}
                onChange={(event) => {
                  setSelectedToDate(event.target.value);
                  if (isStudent) setAppliedToDate(event.target.value);
                }}
                style={{ border: "none", background: "transparent", outline: "none" }} />
            </label>
          </div>
        </header>

        {/* ================= MESSAGES ================= */}

        {loading && (
          <div className="alert alert-info">Loading attendance...</div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && attendance.length > 0 && filteredAttendance.length === 0 && (
          <div className="alert alert-info" role="status">
            Attendance records are available, but none match the applied dates and filters.
            <button type="button" className="btn btn-link btn-sm" onClick={() => {
              setSelectedDate(""); setSelectedToDate(""); setAppliedDate(""); setAppliedToDate("");
            }}>Show all dates</button>
          </div>
        )}
        {!loading && !error && attendance.length === 0 && (
          <div className="alert alert-info" role="status">
            {isStudent ? "No attendance records have been uploaded for your Student ID yet." : "No attendance records are available in your assigned scope yet."}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {/* ================= KPI ================= */}
        <p className="text-muted small mb-3" role="status">
          {formattedDate} · {analytics.totalStudents} unique students · {analytics.dailyRows.length} recorded student-days.
          {" "}Present and Late count as attended. Missing records are not counted as absent.
          {analytics.unknown > 0 && ` ${analytics.unknown} unrecognized statuses are excluded from the percentage.`}
        </p>

        <section className="attendance-kpi-grid">
          {/* Total */}

          <div className="attendance-kpi">
            <div className="kpi-icon total-icon">
              <FaUsers />
            </div>
            <div className="kpi-content">
              <div className="kpi-title">
                {isStudent ? "My Attendance Days" : "Total Students"}
              </div>
              <div className="kpi-number">{totalStudents}</div>
            </div>
          </div>

          {/* Present */}

          <div className="attendance-kpi">
            <div className="kpi-icon present-icon">
              <FaCheckCircle />
            </div>
            <div className="kpi-content">
              <div className="kpi-title">{isSingleDay ? "Present" : "Present days"}</div>
              <div className="kpi-number">{presentCount}</div>
            </div>
          </div>

          {/* Absent */}
          <div className="attendance-kpi">
            <div className="kpi-icon attendance-icon"><FaCalendarAlt /></div>
            <div className="kpi-content">
              <div className="kpi-title">{isSingleDay ? "Late" : "Late days"}</div>
              <div className="kpi-number">{lateCount}</div>
            </div>
          </div>

          <div className="attendance-kpi">
            <div className="kpi-icon absent-icon">
              <FaTimesCircle />
            </div>
            <div className="kpi-content">
              <div className="kpi-title">{isSingleDay ? "Absent" : "Absent days"}</div>
              <div className="kpi-number">{absentCount}</div>
            </div>
          </div>

          {/* Percentage */}

          <div className="attendance-kpi">
            <div className="kpi-icon attendance-icon">
              <FaChartPie />
            </div>
            <div className="kpi-content">
              <div className="kpi-title">Attendance</div>
              <div className="kpi-number">{attendancePercentage}</div>
            </div>
          </div>
        </section>

        {/* ================= FILTERS ================= */}

        {!isStudent && (
          <section className="attendance-filter-card">
            <div className="attendance-section-heading">
              <FaFilter />

              <h2>Filters</h2>
            </div>

            <div className="attendance-filter-grid">
              {[
                { field: "collegeId", label: "College", options: collegeOptions },
                { field: "branchId", label: "Branch", options: branchOptions },
                { field: "courseId", label: "Course", options: courseOptions },
              ].filter(({ field }) => field === "collegeId" ? role === ROLES.SUPER_ADMIN
                : field === "branchId" ? role !== ROLES.BRANCH_ADMIN : true)
                .map(({ field, label, options }) => (
                <div className="attendance-filter" key={field}>
                  <label htmlFor={`attendance-${field}`}>{label}</label>
                  <div className="attendance-select">
                    <FaGraduationCap />
                    <select id={`attendance-${field}`} value={organizationFilters[field]}
                      onChange={(event) => {
                        const value = event.target.value;
                        setOrganizationFilters((current) => field === "collegeId"
                          ? { collegeId: value, branchId: "", courseId: "" }
                          : field === "branchId" ? { ...current, branchId: value, courseId: "" }
                          : { ...current, courseId: value });
                        setSelectedSection("");
                        setSelectedStudent("");
                      }}
                      style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: "#24466d" }}>
                      <option value="">All {label === "Branch" ? "branches" : `${label.toLowerCase()}s`}</option>
                      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {!isStudent && (
                <div className="attendance-filter">
                  <label>Section</label>

                  <div className="attendance-select">
                    <FaUserFriends />

                    <select
                      value={selectedSection}
                      onChange={(e) => { setSelectedSection(e.target.value); setSelectedStudent(""); }}
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        color: "#24466d",
                      }}
                    >
                      <option value="">Select Section</option>

                      {sections.map((section) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Apply */}
              <div className="attendance-filter">
                <label htmlFor="attendance-student">Student</label>
                <div className="attendance-select">
                  <FaUsers />
                  <select id="attendance-student" value={selectedStudent}
                    onChange={(event) => setSelectedStudent(event.target.value)}
                    style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: "#24466d" }}>
                    <option value="">All students</option>
                    {studentOptions.map((student) => <option key={student.value} value={student.value}>
                      {student.name} ({student.value})
                    </option>)}
                  </select>
                </div>
              </div>

              <button className="attendance-apply" onClick={handleApplyFilters}>
                <FaSearch />
                Apply Filters
              </button>
            </div>
            <button type="button" className="btn btn-outline-secondary btn-sm mt-3"
              onClick={() => {
                const empty = { collegeId: "", branchId: "", courseId: "" };
                setOrganizationFilters(empty); setAppliedOrganization(empty);
                setSelectedSection(""); setAppliedSection("");
                setSelectedStudent(""); setAppliedStudent("");
                setSelectedDate(""); setSelectedToDate(""); setAppliedDate(""); setAppliedToDate("");
                setError("");
              }}>Clear filters</button>
          </section>
        )}

        {/* ================= TABLES ================= */}

        {(
          <section
            className="attendance-data-card"
            style={{ marginBottom: 24 }}
          >
            <div className="data-card-header">
              <div className="attendance-section-heading">
                <FaChartBar />
                <h2>{isStudent ? "My Attendance Trend" : "Attendance Trend"}</h2>
              </div>
            </div>

            <div style={{ width: "100%", minHeight: 320 }}>
              {attendanceChart.dates.length > 0 ? (
                <BarChart
                  height={300}
                  xAxis={[{ scaleType: "band", data: attendanceChart.dates }]}
                  series={[
                    {
                      data: attendanceChart.present,
                      label: "Present",
                      color: "#16a34a",
                    },
                    {
                      data: attendanceChart.late,
                      label: "Late",
                      color: "#f59e0b",
                    },
                    {
                      data: attendanceChart.absent,
                      label: "Absent",
                      color: "#dc3545",
                    },
                  ]}
                  margin={{ left: 45, right: 20, top: 25, bottom: 55 }}
                  borderRadius={4}
                  slotProps={{ legend: { hidden: false } }}
                />
              ) : (
                <div className="text-muted p-4">
                  No attendance history available.
                </div>
              )}
            </div>
          </section>
        )}

        {!isStudent && (
          <section className="attendance-data-grid">
            {/* TODAY'S ATTENDANCE */}

            <div className="attendance-data-card">
              <div className="data-card-header">
                <div className="attendance-section-heading">
                  <FaClipboardList />

                  <h2>Attendance Records</h2>
                </div>
              </div>

              <DataGrid
                rowData={studentRows}
                columnDefs={studentColumns}
                suppressHorizontalScroll={false}
                alwaysShowHorizontalScroll
                defaultColDef={{ wrapHeaderText: true, autoHeaderHeight: true }}
                height={320}
                pageSize={5}
                description="One record per student per day in the selected range."
                animateRows
              />
            </div>

            <div className="attendance-data-card">
              <div className="data-card-header">
                <div className="attendance-section-heading">
                  <FaTimesCircle /><h2>Students Below 50% Attendance</h2>
                </div>
              </div>
              <DataGrid rowData={analytics.lowAttendance} columnDefs={lowAttendanceColumns}
                height={320} pageSize={5} loading={loading}
                description="For the applied dates and filters. Present + Late divided by recorded days with a known status."
                noRowsMessage="No students below 50% attendance in the selected range." />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default StudentAttendance;
