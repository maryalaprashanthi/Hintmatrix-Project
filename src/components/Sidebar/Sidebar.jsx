import "./Sidebar.css";
import { NavLink } from "react-router-dom";

import {
  MdDashboard,
  MdMenuBook,
  MdOutlineEdit,
  MdAssignment,
  MdBarChart,
  MdWorkspacePremium,
  MdSettings,
  MdLogout,
} from "react-icons/md";

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">

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

        <NavLink
          to="/courses"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdMenuBook />
          <span>Courses</span>
        </NavLink>

        <NavLink
          to="/practice"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdOutlineEdit />
          <span>Practice</span>
        </NavLink>

        <NavLink
          to="/tests"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdAssignment />
          <span>Tests</span>
        </NavLink>

        <NavLink
          to="/results"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdBarChart />
          <span>Results</span>
        </NavLink>

        <NavLink
          to="/certificates"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <MdWorkspacePremium />
          <span>Certificates</span>
        </NavLink>

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