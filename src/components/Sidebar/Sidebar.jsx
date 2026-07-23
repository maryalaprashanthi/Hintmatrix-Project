import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

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
} from "react-icons/md";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const [collegeOpen, setCollegeOpen] = useState(true);
  const [tableOpen, setTableOpen] = useState(false);

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const menuClass = ({ isActive }) =>
    isActive ? "menu-item active" : "menu-item";

  const subMenuClass = ({ isActive }) =>
    isActive
      ? "submenu-item active-submenu"
      : "submenu-item";

  return (
    <aside
      className={`sidebar ${
        sidebarOpen ? "show" : ""
      }`}
    >
      {/* Logo */}

      <div className="sidebar-header">
        <img
          src={logo}
          alt="HintMatrix"
          className="sidebar-logo"
        />
      </div>

      {/* Menu */}

      <div className="sidebar-content">
        <nav className="sidebar-menu">

          <NavLink
            to="/"
            end
            className={menuClass}
            onClick={closeSidebar}
          >
            <div className="menu-left">
              <MdDashboard />
              <span>Dashboard</span>
            </div>
          </NavLink>

          {/* College */}

          <div
            className={`menu-item ${
              collegeOpen ? "active" : ""
            }`}
            onClick={() =>
              setCollegeOpen(!collegeOpen)
            }
          >
            <div className="menu-left">
              <MdSchool />
              <span>College</span>
            </div>

            {collegeOpen ? (
              <MdKeyboardArrowUp />
            ) : (
              <MdKeyboardArrowDown />
            )}
          </div>

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

          {/* Table */}

          <div
            className={`menu-item ${
              tableOpen ? "active" : ""
            }`}
            onClick={() =>
              setTableOpen(!tableOpen)
            }
          >
            <div className="menu-left">
              <MdTableChart />
              <span>Table Details</span>
            </div>

            {tableOpen ? (
              <MdKeyboardArrowUp />
            ) : (
              <MdKeyboardArrowDown />
            )}
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

          <NavLink
            to="/practice"
            className={menuClass}
            onClick={closeSidebar}
          >
            <div className="menu-left">
              <MdOutlineEdit />
              <span>Practice</span>
            </div>
          </NavLink>

          <NavLink
            to="/tests"
            className={menuClass}
            onClick={closeSidebar}
          >
            <div className="menu-left">
              <MdAssignment />
              <span>Tests</span>
            </div>
          </NavLink>

          <NavLink
            to="/sessions"
            className={menuClass}
            onClick={closeSidebar}
          >
            <div className="menu-left">
              <MdVideoLibrary />
              <span>Sessions</span>
            </div>
          </NavLink>

          <NavLink
            to="/results"
            className={menuClass}
            onClick={closeSidebar}
          >
            <div className="menu-left">
              <MdBarChart />
              <span>Results</span>
            </div>
          </NavLink>

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

          <NavLink
            to="/settings"
            className={menuClass}
            onClick={closeSidebar}
          >
            <div className="menu-left">
              <MdSettings />
              <span>Settings</span>
            </div>
          </NavLink>

        </nav>
      </div>

      <div className="logout">
        <MdLogout />
        <span>Logout</span>
      </div>

    </aside>
  );
}