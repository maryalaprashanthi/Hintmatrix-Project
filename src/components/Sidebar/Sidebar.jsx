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
  MdExpandLess      // Sub-menu close indicator chevron icon
} from "react-icons/md";

function Sidebar() {
  const location = useLocation();

  // 1. Detect if any child management view subpaths are currently active
  const isManagementPathActive = ["/course", "/sections", "/branch"].includes(location.pathname);

  // 2. State tracking whether the user has manually toggled the accordion open/closed
  const [isCollegeExpanded, setIsCollegeExpanded] = useState(isManagementPathActive || location.pathname === "/college");

  // 3. Keep accordion synced automatically if the user changes routes outside the sidebar
  useEffect(() => {
    if (isManagementPathActive || location.pathname === "/college") {
      setIsCollegeExpanded(true);
    }
  }, [location.pathname, isManagementPathActive]);

  const handleCollegeToggle = () => {
    setIsCollegeExpanded((prev) => !prev);
  };

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

        {/* 2. College Parent Header Link */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <NavLink 
            to="/college" 
            onClick={handleCollegeToggle} 
            className={({ isActive }) => isActive || isManagementPathActive ? "menu-item active" : "menu-item" }
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <MdAccountBalance />
              <span>College</span>
            </div>
            <span style={{ fontSize: "20px", display: "flex", alignItems: "center" }}>
              {isCollegeExpanded ? <MdExpandLess /> : <MdExpandMore />}
            </span>
          </NavLink>

          {/* --- Collapsible Sub-Menu Layout Box Container (Reordered) --- */}
          {isCollegeExpanded && (
            <div className="sidebar-submenu-box" style={{ display: "flex", flexDirection: "column", paddingLeft: "24px", margin: "4px 0", gap: "2px" }}>
              
              {/* Sub-menu item 1: Branch (Moved to Top) */}
              <NavLink 
                to="/branch" 
                className={({ isActive }) => isActive ? "menu-item active submenu-item" : "menu-item submenu-item" }
                style={{ fontSize: "14px", padding: "10px 16px" }}
              >
                <MdAccountTree />
                <span>Branch</span>
              </NavLink>

              {/* Sub-menu item 2: Course (Moved to Middle) */}
              <NavLink 
                to="/course" 
                className={({ isActive }) => isActive ? "menu-item active submenu-item" : "menu-item submenu-item" }
                style={{ fontSize: "14px", padding: "10px 16px" }}
              >
                <MdBookmarkAdd />
                <span>Course</span>
              </NavLink>

              {/* Sub-menu item 3: Sections (Moved to Bottom) */}
              <NavLink 
                to="/sections" 
                className={({ isActive }) => isActive ? "menu-item active submenu-item" : "menu-item submenu-item" }
                style={{ fontSize: "14px", padding: "10px 16px" }}
              >
                <MdClass />
                <span>Sections</span>
              </NavLink>

            </div>
          )}
        </div>

        {/* 3. Courses */}
        <NavLink to="/courses" className={({ isActive }) => isActive ? "menu-item active" : "menu-item" } >
          <MdMenuBook />
          <span>Courses</span>
        </NavLink>

        {/* 4. Practice */}
        <NavLink to="/practice" className={({ isActive }) => isActive ? "menu-item active" : "menu-item" } >
          <MdOutlineEdit />
          <span>Practice</span>
        </NavLink>

        {/* 5. Tests */}
        <NavLink to="/tests" className={({ isActive }) => isActive ? "menu-item active" : "menu-item" } >
          <MdAssignment />
          <span>Tests</span>
        </NavLink>

        {/* 6. Sessions */}
        <NavLink to="/sessions" className={({ isActive }) => isActive ? "menu-item active" : "menu-item" } >
          <MdVideoLibrary />
          <span>Sessions</span>
        </NavLink>

        {/* 7. Results */}
        <NavLink to="/results" className={({ isActive }) => isActive ? "menu-item active" : "menu-item" } >
          <MdBarChart />
          <span>Results</span>
        </NavLink>

        {/* 8. Certificates */}
        <NavLink to="/certificates" className={({ isActive }) => isActive ? "menu-item active" : "menu-item" } >
          <MdWorkspacePremium />
          <span>Certificates</span>
        </NavLink>

        {/* 9. Settings */}
        <NavLink to="/settings" className={({ isActive }) => isActive ? "menu-item active" : "menu-item" } >
          <MdSettings />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Logout Action Footer */}
      <div className="logout">
        <MdLogout />
        <span>Logout</span>
      </div>
    </aside>
  );
}

export default Sidebar;
