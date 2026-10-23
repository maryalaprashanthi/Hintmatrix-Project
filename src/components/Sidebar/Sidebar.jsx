import React, { useEffect, useRef, useState } from "react";
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
  learningAnalytics: [
    "/time-analytics",
    "/performance",
    "/practice-performance",
  ],
};

const getMenuForPath = (path) =>
  Object.keys(MENU_PREFIXES).find((key) =>
    MENU_PREFIXES[key].some((prefix) => path.startsWith(prefix)),
  ) || null;

const menuClass = ({ isActive }) =>
  isActive ? "menu-item active" : "menu-item";

const subMenuClass = ({ isActive }) =>
  isActive ? "submenu-item active-submenu" : "submenu-item";

const parentClass = (isOpen) => (isOpen ? "menu-item group-open" : "menu-item");

/* ---------- Reusable pieces ---------- */

function MenuLink({
  to,
  icon: Icon,
  label,
  end,
  classFn = menuClass,
  onClick,
}) {
  return (
    <NavLink to={to} end={end} className={classFn} onClick={onClick}>
      <div className="menu-left">
        <Icon className="menu-icon" />
        <span>{label}</span>
      </div>
    </NavLink>
  );
}

function SubLink({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink to={to} end={end} className={subMenuClass} onClick={onClick}>
      <Icon />
      <span>{label}</span>
    </NavLink>
  );
}

function ParentMenu({
  name,
  icon: Icon,
  label,
  isOpen,
  onToggle,
  to,
  children,
}) {
  const header = (
    <div
      className={parentClass(isOpen)}
      onClick={to ? undefined : onToggle}
      aria-expanded={isOpen}
    >
      <div className="menu-left">
        <Icon className="menu-icon" />
        <span>{label}</span>
      </div>
    </div>
  );

  return (
    <div className={`${name}-menu ${isOpen ? "open" : ""}`}>
      {to ? (
        <NavLink to={to} className="college-menu-link" onClick={onToggle}>
          {header}
        </NavLink>
      ) : (
        header
      )}

      {isOpen && <div className="submenu">{children}</div>}
    </div>
  );
}

/* ---------- Sidebar ---------- */

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [openMenu, setOpenMenu] = useState(() => getMenuForPath(pathname));

  const toggleMenu = (key) =>
    setOpenMenu((current) => (current === key ? null : key));

  const userRole = normalizeRole(localStorage.getItem("role") || ROLES.GUEST);
  const can = (feature) => canAccessFeature(feature, userRole);

  const isStudent = userRole === ROLES.STUDENT;
  const isGuest = userRole === ROLES.GUEST;

  const canAccessAdminMenu = can("subscriptions");
  const canAccessPlans = can("subscriptionsPlans");
  const canAccessPerformance = can("performance");
  const canAccessTimeAnalytics = can("timeAnalytics");
  const canAccessPracticePerformance = can("practicePerformance");
  const canAccessCollegeMenu = can("colleges");
  const canAccessBranchMenu = can("branches");
  const canAccessCourseMenu = can("courses");
  const canAccessExams = can("attemptExams");

  const handleLogout = () => logoutUser(navigate);

  // On mobile, shrink back to the icon rail after choosing a menu item
  const closeSidebar = () => {
    if (window.innerWidth <= 768) setCollapsed(true);
  };

  // Mobile: tapping anywhere outside the sidebar shrinks it back to the rail
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (collapsed) return;

    const handleOutside = (e) => {
      if (
        window.innerWidth <= 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setCollapsed(true);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [collapsed, setCollapsed]);

  // /exam and /mock-exam are landing pages; their catalogs live at /exams and
  // /mock-exams, which don't prefix-match, so keep the tab lit there too.
  const landingClass =
    (extraPath) =>
    ({ isActive }) =>
      isActive || pathname === extraPath ? "menu-item active" : "menu-item";

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${collapsed ? "collapsed" : ""}`}
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
          <MenuLink
            to="/dashboard"
            end
            icon={MdDashboard}
            label="Dashboard"
            onClick={closeSidebar}
          />

          {/* Subscription */}
          {(canAccessAdminMenu || canAccessPlans) && (
            <ParentMenu
              name="subscription"
              icon={FaCreditCard}
              label="Subscription"
              isOpen={openMenu === "subscription"}
              onToggle={() => toggleMenu("subscription")}
            >
              {canAccessAdminMenu && (
                <SubLink
                  to="/subscriptions"
                  end
                  icon={FaCreditCard}
                  label="Overview"
                  onClick={closeSidebar}
                />
              )}

              <SubLink
                to="/subscriptions/plans"
                icon={FaCreditCard}
                label={canAccessAdminMenu ? "Manage Plans" : "Plans"}
                onClick={closeSidebar}
              />

              {isStudent && (
                <SubLink
                  to="/course-subscription"
                  icon={FaCreditCard}
                  label="Course Subscription"
                  onClick={closeSidebar}
                />
              )}

              {canAccessAdminMenu && (
                <SubLink
                  to="/subscriptions/history"
                  icon={MdListAlt}
                  label="Subscription History"
                  onClick={closeSidebar}
                />
              )}
            </ParentMenu>
          )}

          {/* College / Organization */}
          {canAccessCourseMenu && !isStudent && !isGuest && (
            <ParentMenu
              name="college"
              icon={MdSchool}
              label={canAccessCollegeMenu ? "College" : "Organization"}
              to={canAccessCollegeMenu ? "/college" : undefined}
              isOpen={openMenu === "college"}
              onToggle={() => toggleMenu("college")}
            >
              {canAccessBranchMenu && (
                <SubLink
                  to="/branch"
                  icon={MdAccountTree}
                  label="Branch"
                  onClick={closeSidebar}
                />
              )}
              <SubLink
                to="/courses"
                icon={MdLibraryBooks}
                label="Course"
                onClick={closeSidebar}
              />
              <SubLink
                to="/section"
                icon={MdViewModule}
                label="Section"
                onClick={closeSidebar}
              />
            </ParentMenu>
          )}

          {/* Courses / Practice */}
          {canAccessCourseMenu && (
            <MenuLink
              to="/courses"
              icon={MdMenuBook}
              label={isStudent || isGuest ? "Practice" : "Courses"}
              onClick={closeSidebar}
            />
          )}

          {/* Admin */}
          {canAccessAdminMenu && (
            <ParentMenu
              name="admin"
              icon={MdAdminPanelSettings}
              label="Admin"
              isOpen={openMenu === "admin"}
              onToggle={() => toggleMenu("admin")}
            >
              {can("manageSuperAdmins") && (
                <SubLink
                  to="/admin/super-admin"
                  icon={MdSecurity}
                  label="Super Admin"
                  onClick={closeSidebar}
                />
              )}
              {can("manageCollegeAdmins") && (
                <SubLink
                  to="/admin/college-admin"
                  icon={MdSchool}
                  label="College Admin"
                  onClick={closeSidebar}
                />
              )}
              {can("manageBranchAdmins") && (
                <SubLink
                  to="/admin/branch-admin"
                  icon={MdAccountTree}
                  label="Branch Admin"
                  onClick={closeSidebar}
                />
              )}
              {can("manageStudents") && (
                <SubLink
                  to="/admin/student"
                  icon={MdSchool}
                  label="Student"
                  onClick={closeSidebar}
                />
              )}
            </ParentMenu>
          )}

          {/* Questions */}
          {can("manageQuestions") && (
            <ParentMenu
              name="question"
              icon={MdQuiz}
              label="Questions"
              isOpen={openMenu === "question"}
              onToggle={() => toggleMenu("question")}
            >
              <SubLink
                to="/questions/create-all"
                icon={MdAssignment}
                label="Create Questions"
                onClick={closeSidebar}
              />
              <SubLink
                to="/questions"
                end
                icon={MdListAlt}
                label="All Questions"
                onClick={closeSidebar}
              />
            </ParentMenu>
          )}

          {/* Table Details */}
          {can("tableMetadata") && (
            <ParentMenu
              name="table"
              icon={MdTableChart}
              label="Table Details"
              isOpen={openMenu === "table"}
              onToggle={() => toggleMenu("table")}
            >
              <SubLink
                to="/table-names"
                icon={MdTableRows}
                label="Table Names"
                onClick={closeSidebar}
              />
              <SubLink
                to="/table-headers"
                icon={MdViewHeadline}
                label="Table Headers"
                onClick={closeSidebar}
              />
              <SubLink
                to="/table-attributes"
                icon={MdListAlt}
                label="Table Attributes"
                onClick={closeSidebar}
              />
            </ParentMenu>
          )}

          {/* Single links */}
          {can("ruleEngine") && (
            <MenuLink
              to="/ruleengine"
              icon={MdSettings}
              label="Rule Engine"
              onClick={closeSidebar}
            />
          )}

          {can("attendance") && (
            <MenuLink
              to="/studentattendance"
              icon={MdTableChart}
              label={isStudent ? "My Attendance" : "Student Attendance"}
              onClick={closeSidebar}
            />
          )}

          {canAccessExams && (
            <MenuLink
              to="/errors"
              icon={MdListAlt}
              label="Error List"
              onClick={closeSidebar}
            />
          )}

          {canAccessExams && (
            <MenuLink
              to="/exam"
              icon={MdAssignment}
              label="Exam"
              classFn={landingClass("/exams")}
              onClick={closeSidebar}
            />
          )}

          {can("attemptMockExams") && (
            <MenuLink
              to="/mock-exam"
              icon={MdAssignmentTurnedIn}
              label="Mock Exam"
              classFn={landingClass("/mock-exams")}
              onClick={closeSidebar}
            />
          )}

          {/* Learning Analytics */}
          {(canAccessPerformance ||
            canAccessTimeAnalytics ||
            canAccessPracticePerformance) && (
            <ParentMenu
              name="learning-analytics"
              icon={MdInsights}
              label="Learning Analytics"
              isOpen={openMenu === "learningAnalytics"}
              onToggle={() => toggleMenu("learningAnalytics")}
            >
              {canAccessTimeAnalytics && (
                <SubLink
                  to="/time-analytics"
                  icon={MdAccessTime}
                  label="Study Time Tracking"
                  onClick={closeSidebar}
                />
              )}
              {canAccessPerformance && (
                <SubLink
                  to="/performance"
                  icon={MdBarChart}
                  label="Exam Performance"
                  onClick={closeSidebar}
                />
              )}
              {canAccessPracticePerformance && (
                <SubLink
                  to="/practice-performance"
                  icon={MdInsights}
                  label="Practice Performance"
                  onClick={closeSidebar}
                />
              )}
            </ParentMenu>
          )}

          {/* Settings */}
          {can("settings") && (
            <MenuLink
              to="/settings"
              icon={MdSettings}
              label="Settings"
              onClick={closeSidebar}
            />
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
