import React, { useMemo, useRef } from "react";
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
  FaMapMarkerAlt,
  FaClipboardList,
  FaGraduationCap,
} from "react-icons/fa";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import "./StudentAttendance.css";

function StudentAttendance() {
  const fileInputRef = useRef(null);

  const students = [
    {
      rollNo: "101",
      name: "Rahul",
      course: "CSE",
      status: "Present",
    },
    {
      rollNo: "102",
      name: "Ravi",
      course: "CSE",
      status: "Present",
    },
    {
      rollNo: "103",
      name: "Suresh",
      course: "CSE",
      status: "Absent",
    },
    {
      rollNo: "104",
      name: "Anil",
      course: "CSE",
      status: "Present",
    },
  ];

  const branches = [
    {
      branch: "Hyderabad",
      students: 500,
      present: 450,
      absent: 50,
      attendance: "90%",
    },
    {
      branch: "Bangalore",
      students: 400,
      present: 340,
      absent: 60,
      attendance: "85%",
    },
    {
      branch: "Vizag",
      students: 350,
      present: 290,
      absent: 60,
      attendance: "82.8%",
    },
  ];

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
        headerName: "Course",
        field: "course",
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
      },
    ],
    [],
  );

  const branchColumns = useMemo(
    () => [
      {
        headerName: "Branch",
        field: "branch",
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

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      console.log("Uploaded:", file.name);
    }
  };

  return (
    <div className="attendance-page">
      <main className="attendance-content">
        {/* Header */}

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
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleUploadClick}>
              ⬆ Upload
            </button>

            <div className="header-date">
              <FaCalendarAlt />
              <span>13 Aug 2026</span>
              <FaChevronDown />
            </div>
          </div>
        </header>

        {/* KPI Cards */}

        <section className="attendance-kpi-grid">
          <div className="attendance-kpi">
            <div className="kpi-icon total-icon">
              <FaUsers />
            </div>

            <div className="kpi-title">Total Students</div>

            <div className="kpi-number">500</div>
          </div>

          <div className="attendance-kpi">
            <div className="kpi-icon present-icon">
              <FaCheckCircle />
            </div>

            <div className="kpi-title">Present</div>

            <div className="kpi-number">450</div>
          </div>

          <div className="attendance-kpi">
            <div className="kpi-icon absent-icon">
              <FaTimesCircle />
            </div>

            <div className="kpi-title">Absent</div>

            <div className="kpi-number">50</div>
          </div>

          <div className="attendance-kpi">
            <div className="kpi-icon attendance-icon">
              <FaChartPie />
            </div>

            <div className="kpi-title">Attendance</div>

            <div className="kpi-number">90%</div>
          </div>
        </section>

        {/* Filters */}

        <section className="attendance-filter-card">
          <div className="attendance-section-heading">
            <FaFilter />
            <h2>Filters</h2>
          </div>

          <div className="attendance-filter-grid">
            <div className="attendance-filter">
              <label>Branch</label>

              <div className="attendance-select">
                <FaGraduationCap />
                <span>Select Branch</span>
                <FaChevronDown className="select-arrow" />
              </div>
            </div>

            <div className="attendance-filter">
              <label>Course</label>

              <div className="attendance-select">
                <FaGraduationCap />
                <span>Select Course</span>
                <FaChevronDown className="select-arrow" />
              </div>
            </div>

            <div className="attendance-filter">
              <label>Section</label>

              <div className="attendance-select">
                <FaUserFriends />
                <span>Select Section</span>
                <FaChevronDown className="select-arrow" />
              </div>
            </div>

            <button className="attendance-apply">
              <FaSearch />
              Apply Filters
            </button>
          </div>
        </section>

        {/* AG Grid Tables */}

        <section className="attendance-data-grid">
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
                rowData={students}
                columnDefs={studentColumns}
                pagination={true}
                paginationPageSize={5}
              />
            </div>
          </div>

          <div className="attendance-data-card">
            <div className="data-card-header">
              <div className="attendance-section-heading">
                <FaChartBar />
                <h2>Attendance by Branch</h2>
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
                rowData={branches}
                columnDefs={branchColumns}
                pagination={true}
                paginationPageSize={5}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentAttendance;
