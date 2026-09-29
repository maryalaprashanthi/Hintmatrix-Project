import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../interceptors/axiosInterceptor";
import "./Sidebar.css";
import { FaCreditCard } from "react-icons/fa";
import { canAccessFeature, normalizeRole, ROLES } from "../../utils/roles";

import logo from "../../assets/hintmatrix-logo.png";

import {
  MdDashboard,
  MdSchool,
  MdAccountTree,
  MdLibraryBooks,
  MdViewModule,
  MdTableChart,
  MdTableRows,
  MdViewHeadline,
  MdListAlt,
  MdOutlineEdit,
  MdAssignment,
  MdAssignmentTurnedIn,
  MdVideoLibrary,
  MdBarChart,
  MdInsights,
  MdWorkspacePremium,
  MdSettings,
  MdLogout,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdQuiz,
  MdMenuBook,
  MdSecurity,
  MdAdminPanelSettings,
} from "react-icons/md";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  collapsed,
  setCollapsed,
}) {
  const [collegeOpen, setCollegeOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(
    window.location.pathname.startsWith("/subscriptions"),
  );

  const navigate = useNavigate();

  const userRole = normalizeRole(localStorage.getItem("role") || ROLES.GUEST);

  const isStudent = userRole === ROLES.STUDENT;
  const isGuest = userRole === ROLES.GUEST;
  const canAccessAdminMenu = canAccessFeature("subscriptions", userRole);
  const canAccessPlans = canAccessFeature("subscriptionsPlans", userRole);
  const canAccessPerformance = canAccessFeature("performance", userRole);
  const canAccessPracticePerformance = canAccessFeature(
    "practicePerformance",
    userRole,
  );
  const canAccessCollegeMenu = canAccessFeature("colleges", userRole);
  const canAccessBranchMenu = canAccessFeature("branches", userRole);
  const canAccessCourseMenu = canAccessFeature("courses", userRole);
  const canManageCollegeAdminUsers = canAccessFeature(
    "manageCollegeAdmins",
    userRole,
  );
  const canManageSuperAdminUsers = canAccessFeature(
    "manageSuperAdmins",
    userRole,
  );
  const canManageBranchAdminUsers = canAccessFeature(
    "manageBranchAdmins",
    userRole,
  );
  const canManageStudentUsers = canAccessFeature("manageStudents", userRole);

  const canAccessQuestionMenu = canAccessFeature("manageQuestions", userRole);
  const canAccessTableMenu = canAccessFeature("tableMetadata", userRole);
  const canAccessRuleEngine = canAccessFeature("ruleEngine", userRole);
  const canAccessStudentAttendance = canAccessFeature("attendance", userRole);
  const canAccessPractice = canAccessFeature("practiceQuestions", userRole);
  const canAccessSessions = canAccessFeature("attemptExams", userRole);
  const canAccessResults = canAccessFeature("results", userRole);
  const canAccessCertificates = canAccessFeature("certificates", userRole);
  const canAccessSettings = canAccessFeature("settings", userRole);

  const handleLogout = () => {
    logoutUser(navigate);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const menuClass = ({ isActive }) =>
    isActive ? "menu-item active" : "menu-item";

  // /exam and /mock-exam are the landing pages; their catalogs live at /exams
  // and /mock-exams, which don't prefix-match, so keep the tab lit there too.
  const { pathname } = useLocation();
  const examMenuClass = ({ isActive }) =>
    isActive || pathname === "/exams" ? "menu-item active" : "menu-item";
  const mockExamMenuClass = ({ isActive }) =>
    isActive || pathname === "/mock-exams" ? "menu-item active" : "menu-item";

  const subMenuClass = ({ isActive }) =>
    isActive ? "submenu-item active-submenu" : "submenu-item";

  return (
    <aside
      className={`sidebar ${sidebarOpen ? "show" : ""} ${
        collapsed ? "collapsed" : ""
      }`}
    >
      {/* Logo */}

      <div className="sidebar-header">
        <div className="sidebar-logo-wrapper">
          <img src={logo} alt="HintMatrix" className="sidebar-logo" />
        </div>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Menu */}

      <div className="sidebar-content">
        <nav className="sidebar-menu">
          {/* Dashboard */}

          <NavLink
            to="/dashboard"
            end
            className={menuClass}
            onClick={closeSidebar}
          >
            <div className="menu-left">
              <MdDashboard className="menu-icon" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          {/* Subscription */}

          {(canAccessAdminMenu || canAccessPlans) && (
            <div
              className={`subscription-menu ${subscriptionOpen ? "open" : ""}`}
            >
              <div
                className={`menu-item ${subscriptionOpen ? "active" : ""}`}
                onClick={() => setSubscriptionOpen((current) => !current)}
              >
                <div className="menu-left">
                  <FaCreditCard className="menu-icon" />
                  <span>Subscription</span>
                </div>
              </div>
              {subscriptionOpen && (
                <div className="submenu">
                  {canAccessAdminMenu && (
                    <NavLink
                      to="/subscriptions"
                      end
                      className={subMenuClass}
                      onClick={closeSidebar}
                    >
                      <FaCreditCard />
                      <span>Overview</span>
                    </NavLink>
                  )}
                  <NavLink
                    to="/subscriptions/plans"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <FaCreditCard />
                    <span>{canAccessAdminMenu ? "Manage Plans" : "Plans"}</span>
                  </NavLink>
                  {isStudent && (
                    <NavLink
                      to="/course-subscription"
                      className={subMenuClass}
                      onClick={closeSidebar}
                    >
                      <FaCreditCard />
                      <span>Course Subscription</span>
                    </NavLink>
                  )}
                  {canAccessAdminMenu && (
                    <NavLink
                      to="/subscriptions/history"
                      className={subMenuClass}
                      onClick={closeSidebar}
                    >
                      <MdListAlt />
                      <span>Subscription History</span>
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Courses */}
          {canAccessCourseMenu && !isStudent && !isGuest && (
            <div className={`college-menu ${collegeOpen ? "open" : ""}`}>
              {canAccessCollegeMenu ? (
                <NavLink
                  to="/college"
                  className="college-menu-link"
                  onClick={() => setCollegeOpen((current) => !current)}
                >
                  <div className={`menu-item ${collegeOpen ? "active" : ""}`}>
                    <div className="menu-left">
                      <MdSchool className="menu-icon" />
                      <span>College</span>
                    </div>
                  </div>
                </NavLink>
              ) : (
                <div
                  className={`menu-item ${collegeOpen ? "active" : ""}`}
                  onClick={() => setCollegeOpen((current) => !current)}
                >
                  <div className="menu-left">
                    <MdSchool className="menu-icon" />
                    <span>Organization</span>
                  </div>
                </div>
              )}

              {collegeOpen && (
                <div className="submenu">
                  {canAccessBranchMenu && (
                    <NavLink
                      to="/branch"
                      className={subMenuClass}
                      onClick={closeSidebar}
                    >
                      <MdAccountTree />
                      <span>Branch</span>
                    </NavLink>
                  )}

                  <NavLink
                    to="/courses"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdLibraryBooks />
                    <span>Course</span>
                  </NavLink>

                  <NavLink
                    to="/section"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdViewModule />
                    <span>Section</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {canAccessCourseMenu && (
            <NavLink to="/courses" className={menuClass} onClick={closeSidebar}>
              <div className="menu-left">
                <MdMenuBook className="menu-icon" />
                <span>Question Bank</span>
              </div>
            </NavLink>
          )}

          {/* Admin */}

          {canAccessAdminMenu && (
            <div className={`admin-menu ${adminOpen ? "open" : ""}`}>
              <div
                className={`menu-item ${adminOpen ? "active" : ""}`}
                onClick={() => setAdminOpen(!adminOpen)}
              >
                <div className="menu-left">
                  <MdAdminPanelSettings className="menu-icon" />
                  <span>Admin</span>
                </div>
              </div>

              {adminOpen && (
                <div className="submenu">
                  {canManageSuperAdminUsers && (
                    <NavLink
                      to="/admin/super-admin"
                      className={subMenuClass}
                      onClick={closeSidebar}
                    >
                      <MdSecurity />
                      <span>Super Admin</span>
                    </NavLink>
                  )}

                  {canManageCollegeAdminUsers && (
                    <NavLink
                      to="/admin/college-admin"
                      className={subMenuClass}
                      onClick={closeSidebar}
                    >
                      <MdSchool />
                      <span>College Admin</span>
                    </NavLink>
                  )}

                  {canManageBranchAdminUsers && (
                    <NavLink
                      to="/admin/branch-admin"
                      className={subMenuClass}
                      onClick={closeSidebar}
                    >
                      <MdAccountTree />
                      <span>Branch Admin</span>
                    </NavLink>
                  )}

                  {canManageStudentUsers && (
                    <NavLink
                      to="/admin/student"
                      className={subMenuClass}
                      onClick={closeSidebar}
                    >
                      <MdSchool />
                      <span>Student</span>
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Questions */}

          {canAccessQuestionMenu && (
            <div className={`question-menu ${questionOpen ? "open" : ""}`}>
              <div
                className={`menu-item ${questionOpen ? "active" : ""}`}
                onClick={() => setQuestionOpen((current) => !current)}
              >
                <div className="menu-left">
                  <MdQuiz className="menu-icon" />
                  <span>Questions</span>
                </div>
              </div>

              {questionOpen && (
                <div className="submenu">
                  <NavLink
                    to="/questions/create-all"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdAssignment />
                    <span>Create Questions</span>
                  </NavLink>

                  <NavLink
                    to="/courses"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdMenuBook />
                    <span>Question Bank</span>
                  </NavLink>

                  <NavLink
                    to="/questions"
                    end
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdListAlt />
                    <span>All Questions</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Table Details */}

          {canAccessTableMenu && (
            <div className={`table-menu ${tableOpen ? "open" : ""}`}>
              <div
                className={`menu-item ${tableOpen ? "active" : ""}`}
                onClick={() => setTableOpen((current) => !current)}
              >
                <div className="menu-left">
                  <MdTableChart className="menu-icon" />
                  <span>Table Details</span>
                </div>
              </div>

              {tableOpen && (
                <div className="submenu">
                  <NavLink
                    to="/table-names"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdTableRows />
                    <span>Table Names</span>
                  </NavLink>

                  <NavLink
                    to="/table-headers"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdViewHeadline />
                    <span>Table Headers</span>
                  </NavLink>

                  <NavLink
                    to="/table-attributes"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdListAlt />
                    <span>Table Attributes</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Rule Engine */}

          {canAccessRuleEngine && (
            <NavLink
              to="/ruleengine"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdSettings className="menu-icon" />
                <span>Rule Engine</span>
              </div>
            </NavLink>
          )}

          {/* Student Attendance */}

          {canAccessStudentAttendance && (
            <NavLink
              to="/studentattendance"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdTableChart className="menu-icon" />
                <span>Student Attendance</span>
              </div>
            </NavLink>
          )}

          {/* Practice */}

          {canAccessPractice && (
            <NavLink
              to="/practice"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdOutlineEdit className="menu-icon" />
                <span>Practice</span>
              </div>
            </NavLink>
          )}

          {/* Exam */}

          {canAccessFeature("attemptExams", userRole) && (
            <NavLink
              to="/exam"
              className={examMenuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdAssignment className="menu-icon" />
                <span>Exam</span>
              </div>
            </NavLink>
          )}

          {/* Mock Exam */}

          {canAccessFeature("attemptMockExams", userRole) && (
            <NavLink
              to="/mock-exam"
              className={mockExamMenuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdAssignmentTurnedIn className="menu-icon" />
                <span>Mock Exam</span>
              </div>
            </NavLink>
          )}

          {/* Performance */}

          {canAccessPerformance && (
            <NavLink
              to="/performance"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdBarChart className="menu-icon" />
                <span>Performance</span>
              </div>
            </NavLink>
          )}

          {canAccessPracticePerformance && (
            <NavLink
              to="/practice-performance"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdInsights className="menu-icon" />
                <span>Practice Performance</span>
              </div>
            </NavLink>
          )}

          {/* Sessions */}

          {canAccessSessions && (
            <NavLink
              to="/sessions"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdVideoLibrary className="menu-icon" />
                <span>Sessions</span>
              </div>
            </NavLink>
          )}

          {/* Results */}

          {canAccessResults && (
            <NavLink to="/results" className={menuClass} onClick={closeSidebar}>
              <div className="menu-left">
                <MdBarChart className="menu-icon" />
                <span>Results</span>
              </div>
            </NavLink>
          )}

          {/* Certificates */}

          {canAccessCertificates && (
            <NavLink
              to="/certificates"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdWorkspacePremium className="menu-icon" />
                <span>Certificates</span>
              </div>
            </NavLink>
          )}

          {/* Settings */}

          {canAccessSettings && (
            <NavLink
              to="/settings"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdSettings className="menu-icon" />
                <span>Settings</span>
              </div>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Logout */}

      <button type="button" className="logout" onClick={handleLogout}>
        <MdLogout />
        <span>Logout</span>
      </button>
    </aside>
  );
}
