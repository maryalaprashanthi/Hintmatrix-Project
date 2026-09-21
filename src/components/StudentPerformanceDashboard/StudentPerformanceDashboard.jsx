import React from "react";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaUsers,
  FaClock,
  FaBullseye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserGraduate,
  FaBook,
  FaChartLine,
  FaChartBar,
  FaUniversity,
  FaBuilding,
  FaLayerGroup,
  FaArrowUp,
  FaArrowDown,
  FaChevronRight,
} from "react-icons/fa";

import "./StudentPerformanceDashboard.css";

const courses = [
  {
    name: "Accounting",
    performance: 82,
    time: "3,240 hrs",
    students: 480,
  },
  {
    name: "Business Law",
    performance: 76,
    time: "2,860 hrs",
    students: 420,
  },
  {
    name: "Quantitative Aptitude",
    performance: 74,
    time: "2,540 hrs",
    students: 396,
  },
  {
    name: "Business Economics",
    performance: 69,
    time: "2,210 hrs",
    students: 360,
  },
  {
    name: "Cost Accounting",
    performance: 65,
    time: "1,630 hrs",
    students: 310,
  },
  {
    name: "Taxation",
    performance: 62,
    time: "1,020 hrs",
    students: 280,
  },
];

const subjects = [
  { name: "Accounting", value: 82 },
  { name: "Business Law", value: 76 },
  { name: "QA", value: 74 },
  { name: "Business Economics", value: 69 },
  { name: "Cost Accounting", value: 65 },
  { name: "Taxation", value: 62 },
];

const chapters = [
  { name: "Financial Accounting", value: 85 },
  { name: "Contract & Sale of Goods", value: 78 },
  { name: "Matrices & Determinants", value: 72 },
  { name: "National Income", value: 68 },
  { name: "Material Costing", value: 63 },
  { name: "Indirect Taxation", value: 58 },
];

const topics = [
  { name: "Journal Entries", value: 88 },
  { name: "Trial Balance", value: 82 },
  { name: "Ledger", value: 76 },
  { name: "Ratio Analysis", value: 72 },
  { name: "Cost Sheet", value: 68 },
  { name: "GST", value: 61 },
];

const timeByCourse = [
  { name: "Accounting", time: "12h 20m", percentage: 26 },
  { name: "Business Law", time: "10h 15m", percentage: 21 },
  { name: "QA", time: "8h 40m", percentage: 18 },
  { name: "BE", time: "7h 10m", percentage: 15 },
  { name: "Cost Accounting", time: "5h 25m", percentage: 11 },
  { name: "Taxation", time: "4h 30m", percentage: 9 },
];

const timeLogs = [
  {
    date: "21 Apr 2025 (Mon)",
    student: "Rohit Sharma",
    course: "Accounting",
    subject: "Financial Accounting",
    chapter: "Journal Entries",
    topic: "Basics of Journal Entries",
    time: "1h 20m",
    activity: "Practice + Quiz",
  },
  {
    date: "20 Apr 2025 (Sun)",
    student: "Sneha Reddy",
    course: "Business Law",
    subject: "Contract Law",
    chapter: "Offer & Acceptance",
    topic: "Essentials of Contracts",
    time: "45m",
    activity: "Video + Notes",
  },
  {
    date: "19 Apr 2025 (Sat)",
    student: "Akash Verma",
    course: "QA",
    subject: "Permutations & Combinations",
    chapter: "Permutations",
    topic: "Fundamental Concepts",
    time: "1h 10m",
    activity: "Practice",
  },
  {
    date: "18 Apr 2025 (Fri)",
    student: "Priya Nair",
    course: "BE",
    subject: "National Income",
    chapter: "GDP",
    topic: "Methods of Calculation",
    time: "50m",
    activity: "Video + Quiz",
  },
  {
    date: "17 Apr 2025 (Thu)",
    student: "Karan Mehta",
    course: "Cost Accounting",
    subject: "Material Costing",
    chapter: "Methods of Valuation",
    topic: "FIFO",
    time: "1h 15m",
    activity: "Practice",
  },
  {
    date: "16 Apr 2025 (Wed)",
    student: "Ananya Iyer",
    course: "Taxation",
    subject: "GST",
    chapter: "Place of Supply",
    topic: "Intra-State",
    time: "40m",
    activity: "Notes",
  },
];

const StatCard = ({
  icon,
  iconClass,
  title,
  value,
  change,
  decrease = false,
}) => {
  return (
    <div className="sp-stat-card">
      <div className={`sp-stat-icon ${iconClass}`}>{icon}</div>

      <div className="sp-stat-content">
        <div className="sp-stat-title">{title}</div>

        <div className="sp-stat-value">{value}</div>

        <div
          className={`sp-stat-change ${
            decrease ? "sp-change-down" : "sp-change-up"
          }`}
        >
          {decrease ? <FaArrowDown /> : <FaArrowUp />}
          <span>{change}</span>
          <small>vs. last week</small>
        </div>
      </div>
    </div>
  );
};

const ProgressRow = ({ name, value }) => {
  return (
    <div className="sp-progress-row">
      <div className="sp-progress-header">
        <span>{name}</span>
        <strong>{value}%</strong>
      </div>

      <div className="progress sp-progress">
        <div className="progress-bar" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, tabs }) => {
  return (
    <div className="sp-section-header">
      <h5>{title}</h5>

      {tabs && (
        <div className="sp-tabs">
          {tabs.map((tab, index) => (
            <button key={tab} className={index === 0 ? "active" : ""}>
              {tab}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function StudentPerformanceDashboard() {
  return (
    <div className="student-performance-page">
      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <div className="sp-top-header">
        <div>
          <h1>Student Performance & Time Analytics</h1>

          <p>
            Track your students' learning progress, performance and time spent
            across courses, subjects, chapters and topics.
          </p>
        </div>

        <div className="sp-header-controls">
          <button className="sp-date-button">
            <FaCalendarAlt />
            <span>Apr 15, 2025 - Apr 21, 2025</span>
            <FaChevronDown />
          </button>

          <div className="sp-view-buttons">
            <button className="active">Student</button>
            <button>Branch</button>
            <button>College</button>
            <button>App</button>
          </div>
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl">
          <StatCard
            icon={<FaUsers />}
            iconClass="sp-icon-blue"
            title="Total Students"
            value="2,480"
            change="12%"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <StatCard
            icon={<FaClock />}
            iconClass="sp-icon-purple"
            title="Total Time Spent (All Students)"
            value="12,480 hrs"
            change="18%"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <StatCard
            icon={<FaBullseye />}
            iconClass="sp-icon-pink"
            title="Average Performance"
            value="78.6%"
            change="6.4%"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <StatCard
            icon={<FaCheckCircle />}
            iconClass="sp-icon-green"
            title="Course Completion"
            value="72%"
            change="8%"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <StatCard
            icon={<FaExclamationTriangle />}
            iconClass="sp-icon-red"
            title="At-Risk Students"
            value="8.4%"
            change="2.6%"
            decrease
          />
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="row g-3">
        {/* ===================================================
            LEFT MAIN AREA
        =================================================== */}

        <div className="col-12 col-xl-9">
          <div className="row g-3">
            {/* PERFORMANCE OVERVIEW */}

            <div className="col-12 col-lg-6">
              <div className="sp-card h-100">
                <SectionHeader
                  title="Performance Overview"
                  tabs={["Course", "Subject", "Chapter", "Topic"]}
                />

                <div className="sp-overview-content">
                  <div className="sp-donut-wrapper">
                    <div className="sp-donut">
                      <div className="sp-donut-center">
                        <small>Total</small>
                        <strong>78.6%</strong>
                        <small>Performance</small>
                      </div>
                    </div>
                  </div>

                  <div className="sp-legend">
                    {courses.map((course, index) => (
                      <div className="sp-legend-item" key={course.name}>
                        <span
                          className={`sp-legend-dot sp-dot-${index}`}
                        ></span>

                        <span>{course.name}</span>

                        <strong>{course.performance}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TIME SPENT */}

            <div className="col-12 col-lg-6">
              <div className="sp-card h-100">
                <SectionHeader
                  title="Time Spent in App"
                  tabs={["Total", "Course", "Subject", "Chapter", "Topic"]}
                />

                <div className="sp-time-overview">
                  <div className="sp-total-time">
                    <div className="sp-big-clock">
                      <FaClock />
                    </div>

                    <span>Total Time Spent</span>

                    <strong>12,480 hrs</strong>

                    <small>
                      <FaArrowUp /> 18% vs. last week
                    </small>
                  </div>

                  <div className="sp-course-bars">
                    <h6>Time Spent by Course (hrs)</h6>

                    {courses.map((course, index) => (
                      <div className="sp-horizontal-bar" key={course.name}>
                        <span>{course.name}</span>

                        <div className="sp-bar-container">
                          <div
                            className={`sp-bar sp-bar-${index}`}
                            style={{
                              width: `${Math.max(25, course.performance)}%`,
                            }}
                          ></div>
                        </div>

                        <strong>{course.time.replace(" hrs", "")}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TREND */}

            <div className="col-12">
              <div className="sp-card">
                <SectionHeader title="Performance vs Time Trend" />

                <div className="sp-trend-chart">
                  <div className="sp-y-axis">
                    <span>100%</span>
                    <span>80%</span>
                    <span>60%</span>
                    <span>40%</span>
                    <span>20%</span>
                    <span>0%</span>
                  </div>

                  <div className="sp-chart-area">
                    <div className="sp-grid-lines">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>

                    <div className="sp-line-chart">
                      <svg viewBox="0 0 700 250" preserveAspectRatio="none">
                        <polyline
                          points="20,120 130,100 240,75 350,85 460,60 570,85 680,75"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <circle cx="20" cy="120" r="5" />
                        <circle cx="130" cy="100" r="5" />
                        <circle cx="240" cy="75" r="5" />
                        <circle cx="350" cy="85" r="5" />
                        <circle cx="460" cy="60" r="5" />
                        <circle cx="570" cy="85" r="5" />
                        <circle cx="680" cy="75" r="5" />
                      </svg>
                    </div>

                    <div className="sp-chart-bars">
                      {[55, 72, 65, 78, 82, 64, 66].map((height, index) => (
                        <div
                          className="sp-trend-bar"
                          style={{ height: `${height}%` }}
                          key={index}
                        ></div>
                      ))}
                    </div>

                    <div className="sp-x-axis">
                      <span>
                        Mon
                        <br />
                        15 Apr
                      </span>
                      <span>
                        Tue
                        <br />
                        16 Apr
                      </span>
                      <span>
                        Wed
                        <br />
                        17 Apr
                      </span>
                      <span>
                        Thu
                        <br />
                        18 Apr
                      </span>
                      <span>
                        Fri
                        <br />
                        19 Apr
                      </span>
                      <span>
                        Sat
                        <br />
                        20 Apr
                      </span>
                      <span>
                        Sun
                        <br />
                        21 Apr
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COURSE WISE */}

            <div className="col-12 col-lg-6">
              <div className="sp-card h-100">
                <SectionHeader
                  title="Course-wise Performance & Time"
                  tabs={["Performance", "Time Spent"]}
                />

                <div className="sp-course-table">
                  <div className="sp-course-header">
                    <span>Course</span>
                    <span>Performance %</span>
                    <span>Time Spent</span>
                    <span>Students</span>
                    <span></span>
                  </div>

                  {courses.map((course, index) => (
                    <div className="sp-course-row" key={course.name}>
                      <div className="sp-course-name">
                        <span
                          className={`sp-course-icon sp-course-icon-${index}`}
                        >
                          <FaBook />
                        </span>

                        {course.name}
                      </div>

                      <strong>{course.performance}%</strong>

                      <span>{course.time}</span>

                      <span>{course.students}</span>

                      <FaChevronRight />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SUBJECT */}

            <div className="col-12 col-lg-6">
              <div className="sp-card h-100">
                <SectionHeader title="Subject-wise Performance" />

                <div className="sp-subject-content">
                  <div className="sp-small-donut">
                    <div>
                      <small>Overall</small>
                      <strong>78.6%</strong>
                    </div>
                  </div>

                  <div className="sp-subject-list">
                    {subjects.map((subject, index) => (
                      <div key={subject.name}>
                        <span
                          className={`sp-legend-dot sp-dot-${index}`}
                        ></span>

                        <span>{subject.name}</span>

                        <strong>{subject.value}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CHAPTER */}

            <div className="col-12 col-lg-6">
              <div className="sp-card h-100">
                <SectionHeader title="Chapter-wise Performance" />

                <div className="sp-list-content">
                  {chapters.map((chapter) => (
                    <ProgressRow
                      key={chapter.name}
                      name={chapter.name}
                      value={chapter.value}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* TOPIC */}

            <div className="col-12 col-lg-6">
              <div className="sp-card h-100">
                <SectionHeader title="Topic-wise Performance" />

                <div className="sp-list-content">
                  {topics.map((topic) => (
                    <ProgressRow
                      key={topic.name}
                      name={topic.name}
                      value={topic.value}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* DETAILED TIME LOG */}

            <div className="col-12">
              <div className="sp-card">
                <SectionHeader title="Detailed Time Log – Student Wise" />

                <div className="table-responsive">
                  <table className="table sp-time-table">
                    <thead>
                      <tr>
                        <th>Date & Day</th>
                        <th>Student Name</th>
                        <th>Course</th>
                        <th>Subject</th>
                        <th>Chapter</th>
                        <th>Topic</th>
                        <th>Time Spent</th>
                        <th>Activity</th>
                      </tr>
                    </thead>

                    <tbody>
                      {timeLogs.map((log, index) => (
                        <tr key={index}>
                          <td>{log.date}</td>
                          <td>{log.student}</td>
                          <td>{log.course}</td>
                          <td>{log.subject}</td>
                          <td>{log.chapter}</td>
                          <td>{log.topic}</td>
                          <td>{log.time}</td>
                          <td>{log.activity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button className="sp-view-all">View All Student Logs →</button>
              </div>
            </div>

            {/* HIERARCHY */}

            <div className="col-12">
              <div className="sp-card">
                <SectionHeader
                  title="Time Spent – Hierarchy View"
                  tabs={["Course", "Subject", "Chapter", "Topic"]}
                />

                <div className="sp-hierarchy">
                  <div className="sp-hierarchy-header">
                    <span>Level</span>
                    <span>Total Time Spent</span>
                    <span>% of Total</span>
                  </div>

                  <div className="sp-hierarchy-row">
                    <span>
                      <FaBook /> App Level
                    </span>
                    <strong>12,480 hrs</strong>
                    <span>100%</span>
                  </div>

                  <div className="sp-hierarchy-row">
                    <span>
                      <FaUniversity /> College Level
                    </span>
                    <strong>4,820 hrs</strong>
                    <span>38.6%</span>
                  </div>

                  <div className="sp-hierarchy-row">
                    <span>
                      <FaBuilding /> Branch Level
                    </span>
                    <strong>2,940 hrs</strong>
                    <span>23.5%</span>
                  </div>

                  <div className="sp-hierarchy-row">
                    <span>
                      <FaUserGraduate /> Student Level
                    </span>
                    <strong>48 hrs</strong>
                    <span>0.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            RIGHT FILTER / STUDENT PANEL
        =================================================== */}

        <div className="col-12 col-xl-3">
          <div className="sp-right-column">
            {/* QUICK FILTERS */}

            <div className="sp-card sp-filter-card">
              <h5>Quick Filters</h5>

              <div className="sp-filter">
                <label>Course</label>

                <select>
                  <option>All Courses</option>
                  <option>Accounting</option>
                  <option>Business Law</option>
                  <option>Quantitative Aptitude</option>
                </select>
              </div>

              <div className="sp-filter">
                <label>Subject</label>

                <select>
                  <option>All Subjects</option>
                  <option>Financial Accounting</option>
                  <option>Contract Law</option>
                  <option>National Income</option>
                </select>
              </div>

              <div className="sp-filter">
                <label>Branch</label>

                <select>
                  <option>All Branches</option>
                  <option>Hyderabad</option>
                  <option>Bangalore</option>
                </select>
              </div>

              <div className="sp-filter">
                <label>College</label>

                <select>
                  <option>All Colleges</option>
                  <option>Metro College</option>
                  <option>ABC College</option>
                </select>
              </div>

              <div className="sp-filter">
                <label>Date Range</label>

                <div className="sp-date-filter">
                  <FaCalendarAlt />

                  <span>Apr 15, 2025 - Apr 21, 2025</span>
                </div>
              </div>
            </div>

            {/* STUDENT SUMMARY */}

            <div className="sp-card sp-student-card">
              <SectionHeader
                title="Performance & Time Summary"
                tabs={["Student", "Branch", "College", "App"]}
              />

              <div className="sp-student-profile">
                <div className="sp-avatar">RS</div>

                <div>
                  <strong>Rohit Sharma</strong>
                  <span>BSc (H) – 2nd Year</span>
                  <small>Metro College</small>
                </div>
              </div>

              <div className="sp-student-stats">
                <div>
                  <FaClock />

                  <span>Total Time Spent</span>

                  <strong>48 hrs 20 mins</strong>
                </div>

                <div>
                  <FaBullseye />

                  <span>Avg. Performance</span>

                  <strong>78.6%</strong>
                </div>

                <div>
                  <FaCheckCircle />

                  <span>Courses Completed</span>

                  <strong>3 / 6</strong>
                </div>

                <div>
                  <FaCalendarAlt />

                  <span>Last Active</span>

                  <strong>Apr 21, 2025 04:32 PM</strong>
                </div>
              </div>

              <div className="sp-time-course">
                <h6>Time Spent by Course</h6>

                {timeByCourse.map((item, index) => (
                  <div className="sp-student-course-time" key={item.name}>
                    <div>
                      <span>{item.name}</span>
                      <strong>
                        {item.time} ({item.percentage}%)
                      </strong>
                    </div>

                    <div className="progress">
                      <div
                        className={`progress-bar sp-bar-${index}`}
                        style={{
                          width: `${item.percentage * 3.5}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="sp-report-button">
                <FaChartBar />
                View Detailed Student Report
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}

      <div className="sp-footer">
        <span>
          <i></i>
          Last updated: Apr 21, 2025 04:32 PM
        </span>

        <span>|</span>

        <span>Data updates every hour</span>
      </div>
    </div>
  );
}
