import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { NavLink, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdAccountBalance, // Icon for College
  MdClass,          // Icon for Sections
  MdAccountTree,     // Icon for Branch
  MdBookmarkAdd,    // Icon for Course (Management Panel)
  MdMenuBook,       // Icon for Courses (Grid Display View)
  MdOutlineEdit,
  MdAssignment,
  MdVideoLibrary,
  MdBarChart,
  MdWorkspacePremium,
  MdSettings,
  MdLogout,
  MdExpandMore,     // Sub-menu open indicator chevron icon
  MdExpandLess,    // Sub-menu close indicator chevron icon
  MdSchool,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdApartment,
  MdLibraryBooks,
  MdViewModule,
  MdTableChart, 
  MdTableRows, 
  MdViewHeadline, 
  MdListAlt,
} from "react-icons/md";

function Sidebar() {
  const [collegeOpen, setCollegeOpen] = useState(true);
  const [tableOpen, setTableOpen] = useState(false);
  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        {/* 1. Dashboard */}
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => isActive ? "menu-item active" : "menu-item" }
        >
          <MdDashboard />
          <span>Dashboard</span>
        </NavLink>

        {/* College Menu */}
        <NavLink to="/college">
        <div
          className={`menu-item ${collegeOpen ? "active" : ""}`}
          onClick={() => setCollegeOpen(!collegeOpen)}
          style={{ cursor: "pointer" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
            }}
          >
            <MdSchool />
            <span>College</span>
          </div>

          {collegeOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
        </div>
        </NavLink>

        {collegeOpen && (
          <div className="submenu">

            <NavLink
              to="/courses"
              className={({ isActive }) =>
                isActive ? "submenu-item active-submenu" : "submenu-item"
              }
            >
              <MdLibraryBooks />
              <span>Course</span>
            </NavLink>

             <NavLink
              to="/Branch"
              className={({ isActive }) =>
                isActive ? "submenu-item active-submenu" : "submenu-item"
              }
            >
              <MdAccountTree />
              <span>Branch</span>
            </NavLink>
              <NavLink
              to="/section"
              className={({ isActive }) =>
                isActive ? "submenu-item active-submenu" : "submenu-item"
              }
            >
              <MdViewModule />
              <span>Section</span>
            </NavLink>

            

          </div>
        )}
        {/* Table Details */}
<div
  className={`menu-item ${tableOpen ? "active" : ""}`}
  onClick={() => setTableOpen(!tableOpen)}
  style={{ cursor: "pointer" }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flex: 1,
    }}
  >
    <MdTableChart />
    <span>Table Details</span>
  </div>

  {tableOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
</div>

{tableOpen && (
  <div className="submenu">
    <NavLink
      to="/table-names"
      className={({ isActive }) =>
        isActive ? "submenu-item active-submenu" : "submenu-item"
      }
    >
      <MdTableRows />
      <span>Table Names</span>
    </NavLink>

    <NavLink
      to="/table-headers"
      className={({ isActive }) =>
        isActive ? "submenu-item active-submenu" : "submenu-item"
      }
    >
      <MdViewHeadline />
      <span>Table Headers</span>
    </NavLink>

    <NavLink
      to="/table-attributes"
      className={({ isActive }) =>
        isActive ? "submenu-item active-submenu" : "submenu-item"
      }
    >
      <MdListAlt />
      <span>Table Attributes</span>
    </NavLink>
  </div>
)}


        {/* Practice */}
        <NavLink
          to="/practice"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdOutlineEdit />
          <span>Practice</span>
        </NavLink>

        {/* 5. Tests */}
        <NavLink to="/tests" className={({ isActive }) => isActive ? "menu-item active" : "menu-item" } >
          <MdAssignment />
          <span>Tests</span>
        </NavLink>

        {/* Sessions */}
        <NavLink
          to="/sessions"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdVideoLibrary />
          <span>Sessions</span>
        </NavLink>

        {/* Results */}
        <NavLink
          to="/results"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdBarChart />
          <span>Results</span>
        </NavLink>

        {/* Certificates */}
        <NavLink
          to="/certificates"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdWorkspacePremium />
          <span>Certificates</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdSettings />
          <span>Settings</span>
        </NavLink>

      </nav>

      <div className="logout">
        <MdLogout />
        <span>Logout</span>
      </div>
    </aside>
  );
}

export default Sidebar;
