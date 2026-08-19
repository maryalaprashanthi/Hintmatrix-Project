import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AgGridReact } from "ag-grid-react";

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

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import "./StudentAttendance.css";

import AttendanceService from "../../services/AttendanceService";

function StudentAttendance() {
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

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const [selectedSection, setSelectedSection] = useState("");

  const [appliedSection, setAppliedSection] = useState("");

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

  // ==============================
  // LOAD ATTENDANCE
  // ==============================

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const data = await AttendanceService.getAllAttendance();

      console.log("Attendance API:", data);

      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load attendance:", err);

      setError(err.response?.data || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

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
    return [...new Set(attendance.map((item) => item.section).filter(Boolean))];
  }, [attendance]);

  // ==============================
  // FILTER ATTENDANCE
  // ==============================

  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      const dateMatches = !selectedDate || item.attendanceDate === selectedDate;

      const sectionMatches = !appliedSection || item.section === appliedSection;

      return dateMatches && sectionMatches;
    });
  }, [attendance, selectedDate, appliedSection]);

  // ==============================
  // KPI VALUES
  // ==============================

  const totalStudents = filteredAttendance.length;

  const presentCount = filteredAttendance.filter(
    (item) => getStatus(item.status) === "Present",
  ).length;

  const lateCount = filteredAttendance.filter(
    (item) => getStatus(item.status) === "Late",
  ).length;

  const absentCount = filteredAttendance.filter(
    (item) => getStatus(item.status) === "Absent",
  ).length;

  // Present + Late = Attended
  const attendedCount = presentCount + lateCount;

  const attendancePercentage =
    totalStudents > 0 ? Math.round((attendedCount / totalStudents) * 100) : 0;

  // ==============================
  // TODAY'S ATTENDANCE
  // ==============================

  const studentRows = useMemo(() => {
    return filteredAttendance.map((item) => ({
      attendanceId: item.attendanceId,

      rollNo: item.rollNo,

      name: item.studentName,

      section: item.section || "-",

      status: getStatus(item.status),

      statusDescription: item.statusDescription || "-",

      inTime: item.inTime || "-",

      outTime: item.outTime || "-",
    }));
  }, [filteredAttendance]);

  // ==============================
  // ATTENDANCE BY SECTION
  // ==============================

  const sectionRows = useMemo(() => {
    const grouped = {};

    filteredAttendance.forEach((item) => {
      const section = item.section || "Unknown";

      if (!grouped[section]) {
        grouped[section] = {
          section,
          students: 0,
          present: 0,
          late: 0,
          absent: 0,
        };
      }

      grouped[section].students++;

      const status = getStatus(item.status);

      if (status === "Present") {
        grouped[section].present++;
      }

      if (status === "Late") {
        grouped[section].late++;
      }

      if (status === "Absent") {
        grouped[section].absent++;
      }
    });

    return Object.values(grouped).map((item) => {
      const attended = item.present + item.late;

      const percentage =
        item.students > 0
          ? ((attended / item.students) * 100).toFixed(1)
          : "0.0";

      return {
        ...item,

        attendance: `${percentage}%`,
      };
    });
  }, [filteredAttendance]);

  // ==============================
  // STUDENT GRID COLUMNS
  // ==============================

  const studentColumns = useMemo(
    () => [
      {
        headerName: "Roll No",
        field: "rollNo",
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Student Name",
        field: "name",
        flex: 2,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Section",
        field: "section",
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "In Time",
        field: "inTime",
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Out Time",
        field: "outTime",
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Status",
        field: "status",
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

  const sectionColumns = useMemo(
    () => [
      {
        headerName: "Section",
        field: "section",
        flex: 2,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Students",
        field: "students",
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Present",
        field: "present",
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Absent",
        field: "absent",
        flex: 1,
        sortable: true,
        filter: true,
      },

      {
        headerName: "Attendance",
        field: "attendance",
        flex: 1.5,
        sortable: true,
        filter: true,
      },
    ],
    [],
  );

  // ==============================
  // APPLY FILTERS
  // ==============================

  const handleApplyFilters = () => {
    setAppliedSection(selectedSection);
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

      setSuccessMessage("Attendance Excel uploaded successfully.");

      // Reload dashboard
      await loadAttendance();
    } catch (err) {
      console.error("Upload failed:", err);

      setError(err.response?.data || "Attendance upload failed.");
    } finally {
      setUploading(false);

      // Allow same file to be selected again
      event.target.value = "";
    }
  };

  // ==============================
  // FORMAT HEADER DATE
  // ==============================

  const formattedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

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

          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv"
            style={{
              display: "none",
            }}
            onChange={handleFileChange}
          />

          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "⬆ Upload"}
            </button>

            <div className="header-date">
              <FaCalendarAlt />

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                }}
              />

              <FaChevronDown />
            </div>
          </div>
        </header>

        {/* ================= MESSAGES ================= */}

        {loading && (
          <div className="alert alert-info">Loading attendance...</div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {/* ================= KPI ================= */}

        <section className="attendance-kpi-grid">
          {/* Total */}

          <div className="attendance-kpi">
            <div className="kpi-icon total-icon">
              <FaUsers />
            </div>

            <div className="kpi-title">Total Students</div>

            <div className="kpi-number">{totalStudents}</div>
          </div>

          {/* Present */}

          <div className="attendance-kpi">
            <div className="kpi-icon present-icon">
              <FaCheckCircle />
            </div>

            <div className="kpi-title">Present</div>

            <div className="kpi-number">{presentCount}</div>
          </div>

          {/* Absent */}

          <div className="attendance-kpi">
            <div className="kpi-icon absent-icon">
              <FaTimesCircle />
            </div>

            <div className="kpi-title">Absent</div>

            <div className="kpi-number">{absentCount}</div>
          </div>

          {/* Percentage */}

          <div className="attendance-kpi">
            <div className="kpi-icon attendance-icon">
              <FaChartPie />
            </div>

            <div className="kpi-title">Attendance</div>

            <div className="kpi-number">{attendancePercentage}%</div>
          </div>
        </section>

        {/* ================= FILTERS ================= */}

        <section className="attendance-filter-card">
          <div className="attendance-section-heading">
            <FaFilter />

            <h2>Filters</h2>
          </div>

          <div className="attendance-filter-grid">
            {/* Branch */}

            <div className="attendance-filter">
              <label>Branch</label>

              <div
                className="attendance-select"
                style={{
                  opacity: 0.6,
                  cursor: "not-allowed",
                }}
              >
                <FaGraduationCap />

                <span>Branch unavailable</span>

                <FaChevronDown className="select-arrow" />
              </div>
            </div>

            {/* Course */}

            <div className="attendance-filter">
              <label>Course</label>

              <div
                className="attendance-select"
                style={{
                  opacity: 0.6,
                  cursor: "not-allowed",
                }}
              >
                <FaGraduationCap />

                <span>Course unavailable</span>

                <FaChevronDown className="select-arrow" />
              </div>
            </div>

            {/* Section */}

            <div className="attendance-filter">
              <label>Section</label>

              <div className="attendance-select">
                <FaUserFriends />

                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
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

            {/* Apply */}

            <button className="attendance-apply" onClick={handleApplyFilters}>
              <FaSearch />
              Apply Filters
            </button>
          </div>
        </section>

        {/* ================= TABLES ================= */}

        <section className="attendance-data-grid">
          {/* TODAY'S ATTENDANCE */}

          <div className="attendance-data-card">
            <div className="data-card-header">
              <div className="attendance-section-heading">
                <FaClipboardList />

                <h2>Today's Attendance</h2>
              </div>
            </div>

            <div
              className="ag-theme-quartz"
              style={{
                height: 320,
                width: "100%",
              }}
            >
              <AgGridReact
                rowData={studentRows}
                columnDefs={studentColumns}
                pagination={true}
                paginationPageSize={5}
                animateRows={true}
              />
            </div>
          </div>

          {/* ATTENDANCE BY SECTION */}

          <div className="attendance-data-card">
            <div className="data-card-header">
              <div className="attendance-section-heading">
                <FaChartBar />

                <h2>Attendance by Section</h2>
              </div>
            </div>

            <div
              className="ag-theme-quartz"
              style={{
                height: 320,
                width: "100%",
              }}
            >
              <AgGridReact
                rowData={sectionRows}
                columnDefs={sectionColumns}
                pagination={true}
                paginationPageSize={5}
                animateRows={true}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentAttendance;
