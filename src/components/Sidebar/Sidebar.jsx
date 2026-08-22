import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../../interceptors/axiosInterceptor";
import "./Sidebar.css";
import { FaCreditCard } from "react-icons/fa";

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
  MdVideoLibrary,
  MdBarChart,
  MdWorkspacePremium,
  MdSettings,
  MdLogout,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdQuiz,
  MdMenuBook,
  MdCategory,
  MdHelpOutline,
  MdSecurity,
  MdPersonOutline,
  MdAdminPanelSettings,
} from "react-icons/md";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [collegeOpen, setCollegeOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const navigate = useNavigate();

  const normalizeRole = (value = "") =>
    value
      .toString()
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

  const userRole = normalizeRole(localStorage.getItem("role") || "GUEST");
  const isStudent = userRole === "STUDENT";
  const canAccessAdminMenu = ["SUPER_ADMIN", "BRANCH_ADMIN"].includes(userRole);
  const canAccessCollegeMenu = ["SUPER_ADMIN", "BRANCH_ADMIN"].includes(userRole);
  const canAccessCourseMenu = ["SUPER_ADMIN", "BRANCH_ADMIN", "STUDENT"].includes(userRole);
  const canAccessQuestionMenu = ["SUPER_ADMIN", "BRANCH_ADMIN"].includes(userRole);
  const canAccessTableMenu = ["SUPER_ADMIN", "BRANCH_ADMIN"].includes(userRole);
  const canAccessRuleEngine = ["SUPER_ADMIN", "BRANCH_ADMIN"].includes(userRole);
  const canAccessStudentAttendance = ["SUPER_ADMIN", "BRANCH_ADMIN"].includes(userRole);
  const canAccessPractice = ["SUPER_ADMIN", "BRANCH_ADMIN", "STUDENT"].includes(userRole);
  const canAccessExam = ["SUPER_ADMIN", "BRANCH_ADMIN", "STUDENT"].includes(userRole);
  const canAccessSessions = ["SUPER_ADMIN", "BRANCH_ADMIN", "STUDENT"].includes(userRole);
  const canAccessResults = ["SUPER_ADMIN", "BRANCH_ADMIN", "STUDENT"].includes(userRole);
  const canAccessCertificates = ["SUPER_ADMIN", "BRANCH_ADMIN", "STUDENT"].includes(userRole);
  const canAccessSettings = ["SUPER_ADMIN", "BRANCH_ADMIN"].includes(userRole);

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

  const subMenuClass = ({ isActive }) =>
    isActive ? "submenu-item active-submenu" : "submenu-item";

  return (
    <aside className={`sidebar ${sidebarOpen ? "show" : ""}`}>
      {/* Logo */}

      <div className="sidebar-header">
        <img src={logo} alt="HintMatrix" className="sidebar-logo" />
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
              <MdDashboard />
              <span>Dashboard</span>
            </div>
          </NavLink>
          {/* Subscription */}
          <NavLink
            to="/subscriptions"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <div className="menu-left">
              <FaCreditCard />
              <span>Subscription</span>
            </div>
          </NavLink>

          {/* Courses */}
          {canAccessCourseMenu && !isStudent && (
            <>
              <NavLink to="/college">
                <div
                  className={`menu-item ${collegeOpen ? "active" : ""}`}
                  onClick={() => setCollegeOpen(!collegeOpen)}
                >
                  <div className="menu-left">
                    <MdSchool />
                    <span>College</span>
                  </div>

                  {collegeOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </div>
              </NavLink>

              {collegeOpen && (
                <div className="submenu">
                  <NavLink
                    to="/branch"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdAccountTree />
                    <span>Branch</span>
                  </NavLink>

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
            </>
          )}

          {isStudent && (
            <NavLink to="/courses" className={menuClass} onClick={closeSidebar}>
              <div className="menu-left">
                <MdLibraryBooks />
                <span>Courses</span>
              </div>
            </NavLink>
          )}

          {/* Admin */}

          {canAccessAdminMenu && (
            <>
              <div
                className={`menu-item ${adminOpen ? "active" : ""}`}
                onClick={() => setAdminOpen(!adminOpen)}
              >
                <div className="menu-left">
                  <MdAdminPanelSettings />
                  <span>Admin</span>
                </div>

                {adminOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>

              {adminOpen && (
                <div className="submenu">
                  <NavLink
                    to="/admin/super-admin"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdSecurity />
                    <span>Super Admin</span>
                  </NavLink>

                  <NavLink
                    to="/admin/branch-admin"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdAccountTree />
                    <span>Branch Admin</span>
                  </NavLink>

                  <NavLink
                    to="/admin/student"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdSchool />
                    <span>Student </span>
                  </NavLink>
                </div>
              )}
            </>
          )}

          {/* Questions */}
          {canAccessQuestionMenu && (
            <>
              <div
                className={`menu-item ${questionOpen ? "active" : ""}`}
                onClick={() => setQuestionOpen(!questionOpen)}
              >
                <div className="menu-left">
                  <MdQuiz />
                  <span>Questions</span>
                </div>

                {questionOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>

              {questionOpen && (
                <div className="submenu">
                  <NavLink
                    to="/questions/chapters"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdMenuBook />
                    <span>Chapters</span>
                  </NavLink>

                  <NavLink
                    to="/questions/question-categories"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdCategory />
                    <span>Question Categories</span>
                  </NavLink>

                  <NavLink
                    to="/questions/questiontype2"
                    className={subMenuClass}
                    onClick={closeSidebar}
                  >
                    <MdQuiz />
                    <span>Question Type 2</span>
                  </NavLink>
                </div>
              )}
            </>
          )}

          {/* Table */}
          {canAccessTableMenu && (
            <>
              <div
                className={`menu-item ${tableOpen ? "active" : ""}`}
                onClick={() => setTableOpen(!tableOpen)}
              >
                <div className="menu-left">
                  <MdTableChart />
                  <span>Table Details</span>
                </div>

                {tableOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
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
            </>
          )}

          {/* Rule Engine */}
          {canAccessRuleEngine && (
            <NavLink
              to="/ruleengine"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdSettings />
                <span>Rule Engine</span>
              </div>
            </NavLink>
          )}
          {/*student attendance*/}
          {canAccessStudentAttendance && (
            <NavLink
              to="/studentattendance"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdTableChart />
                <span>Student Attendance</span>
              </div>
            </NavLink>
          )}

          {canAccessPractice && (
            <NavLink to="/practice" className={menuClass} onClick={closeSidebar}>
              <div className="menu-left">
                <MdOutlineEdit />
                <span>Practice</span>
              </div>
            </NavLink>
          )}

          {canAccessExam && (
            <NavLink to="/Exam" className={menuClass} onClick={closeSidebar}>
              <div className="menu-left">
                <MdAssignment />
                <span>Exam</span>
              </div>
            </NavLink>
          )}

          {canAccessSessions && (
            <NavLink to="/sessions" className={menuClass} onClick={closeSidebar}>
              <div className="menu-left">
                <MdVideoLibrary />
                <span>Sessions</span>
              </div>
            </NavLink>
          )}

          {canAccessResults && (
            <NavLink to="/results" className={menuClass} onClick={closeSidebar}>
              <div className="menu-left">
                <MdBarChart />
                <span>Results</span>
              </div>
            </NavLink>
          )}

          {canAccessCertificates && (
            <NavLink
              to="/certificates"
              className={menuClass}
              onClick={closeSidebar}
            >
              <div className="menu-left">
                <MdWorkspacePremium />
                <span>Certificates</span>
              </div>
            </NavLink>
          )}

          {canAccessSettings && (
            <NavLink to="/settings" className={menuClass} onClick={closeSidebar}>
              <div className="menu-left">
                <MdSettings />
                <span>Settings</span>
              </div>
            </NavLink>
          )}
        </nav>
      </div>

      <button type="button" className="logout" onClick={handleLogout}>
        <MdLogout />
        <span>Logout</span>
      </button>
    </aside>
  );
}
