import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";

import {
  MdDashboard,
  MdOutlineEdit,
  MdAssignment,
  MdVideoLibrary,
  MdBarChart,
  MdWorkspacePremium,
  MdSettings,
  MdLogout,
  MdSchool,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdAccountTree,
  MdLibraryBooks,
  MdViewModule,
} from "react-icons/md";

function Sidebar() {
  const [collegeOpen, setCollegeOpen] = useState(true);

  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">

        {/* Dashboard */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdDashboard />
          <span>Dashboard</span>
        </NavLink>

        {/* College Menu */}
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

        {collegeOpen && (
          <div className="submenu">

            <NavLink
              to="/college"
              className={({ isActive }) =>
                isActive ? "submenu-item active-submenu" : "submenu-item"
              }
            >
              <MdSchool />
              <span>College</span>
            </NavLink>

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

        {/* Tests */}
        <NavLink
          to="/tests"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
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