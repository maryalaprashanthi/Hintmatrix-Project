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
  MdAssignment,
  MdAssignmentTurnedIn,
  MdBarChart,
  MdInsights,
  MdAccessTime,
  MdSettings,
  MdLogout,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdQuiz,
  MdMenuBook,
  MdSecurity,
  MdAdminPanelSettings,
} from "react-icons/md";

const MENU_PREFIXES = {
  subscription: ["/subscriptions", "/course-subscription"],
  college: ["/college", "/branch", "/section"],
  admin: ["/admin"],
  question: ["/questions"],
  table: ["/table-"],
  learningAnalytics: ["/time-analytics", "/performance", "/practice-performance", "/mock-exam"],
};

const getMenuForPath = (path) =>
  Object.keys(MENU_PREFIXES).find((key) =>
    MENU_PREFIXES[key].some((prefix) => path.startsWith(prefix)),
  ) || null;

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  collapsed,
  setCollapsed,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [openMenu, setOpenMenu] = useState(() => getMenuForPath(pathname));

  const toggleMenu = (key) =>
    setOpenMenu((current) => (current === key ? null : key));

  const subscriptionOpen = openMenu === "subscription";
  const collegeOpen = openMenu === "college";
  const adminOpen = openMenu === "admin";
  const questionOpen = openMenu === "question";
  const tableOpen = openMenu === "table";
  const learningAnalyticsOpen = openMenu === "learningAnalytics";

  const userRole = normalizeRole(localStorage.getItem("role") || ROLES.GUEST);

  const isStudent = userRole === ROLES.STUDENT;
  const isGuest = userRole === ROLES.GUEST;
  const canAccessAdminMenu = canAccessFeature("subscriptions", userRole);
  const canAccessPlans = canAccessFeature("subscriptionsPlans", userRole);
  const canAccessPerformance = canAccessFeature("performance", userRole);
  const canAccessTimeAnalytics = canAccessFeature("timeAnalytics", userRole);
  const canAccessPracticePerformance = canAccessFeature(
    "practicePerformance",
    userRole,
  );
  const canAccessMockExams = canAccessFeature("attemptMockExams", userRole);
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
  const canAccessErrorList = canAccessFeature("attemptExams", userRole);
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
  const examMenuClass = ({ isActive }) =>
    isActive || pathname === "/exams" ? "menu-item active" : "menu-item";
  const subMenuClass = ({ isActive }) =>
    isActive ? "submenu-item active-submenu" : "submenu-item";

  const parentClass = (isOpen) =>
    isOpen ? "menu-item group-open" : "menu-item";

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
                className={parentClass(subscriptionOpen)}
                onClick={() => toggleMenu("subscription")}
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
                  onClick={() => toggleMenu("college")}
                >
                  <div className={parentClass(collegeOpen)}>
                    <div className="menu-left">
                      <MdSchool className="menu-icon" />
                      <span>College</span>
                    </div>
                  </div>
                </NavLink>
              ) : (
                <div
                  className={parentClass(collegeOpen)}
                  onClick={() => toggleMenu("college")}
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
                <span>Practice</span>
              </div>
            </NavLink>
          )}

          {/* Admin */}

          {canAccessAdminMenu && (
            <div className={`admin-menu ${adminOpen ? "open" : ""}`}>
              <div
                className={parentClass(adminOpen)}
                onClick={() => toggleMenu("admin")}
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
                className={parentClass(questionOpen)}
                onClick={() => toggleMenu("question")}
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
                className={parentClass(tableOpen)}
                onClick={() => toggleMenu("table")}
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

          {canAccessErrorList && (
            <NavLink to="/errors" className={menuClass} onClick={closeSidebar}>
              <div className="menu-left">
                <MdListAlt className="menu-icon" />
                <span>Error List</span>
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

          {(canAccessPerformance || canAccessTimeAnalytics || canAccessPracticePerformance || canAccessMockExams) && (
            <div className={`learning-analytics-menu ${learningAnalyticsOpen ? "open" : ""}`}>
              <div
                className={parentClass(learningAnalyticsOpen)}
                onClick={() => toggleMenu("learningAnalytics")}
                aria-expanded={learningAnalyticsOpen}
              >
                <div className="menu-left">
                  <MdInsights className="menu-icon" />
                  <span>Learning Analytics</span>
                </div>
              </div>
              {learningAnalyticsOpen && (
                <div className="submenu">
                  {canAccessTimeAnalytics && (
                    <NavLink to="/time-analytics" className={subMenuClass} onClick={closeSidebar}>
                      <MdAccessTime />
                      <span>Study Time Tracking</span>
                    </NavLink>
                  )}
                  {canAccessPerformance && (
                    <NavLink to="/performance" className={subMenuClass} onClick={closeSidebar}>
                      <MdBarChart />
                      <span>Exam Performance</span>
                    </NavLink>
                  )}
                  {canAccessMockExams && (
                    <NavLink to="/mock-exam" className={subMenuClass} onClick={closeSidebar}>
                      <MdAssignmentTurnedIn />
                      <span>Mock Performance</span>
                    </NavLink>
                  )}
                  {canAccessPracticePerformance && (
                    <NavLink to="/practice-performance" className={subMenuClass} onClick={closeSidebar}>
                      <MdInsights />
                      <span>Practice Performance</span>
                    </NavLink>
                  )}
                </div>
              )}
            </div>
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
