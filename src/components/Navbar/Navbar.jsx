import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../interceptors/axiosInterceptor";
import "./Navbar.css";

import {
  FiSearch,
  FiBell,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const userRole = localStorage.getItem("role") || "GUEST";

  const handleLogout = () => {
    logoutUser(navigate);
  };

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", close);

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  return (
    <header className="navbar">
      {/* Mobile Menu */}
      <div className="navbar-left">
        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FiMenu />
        </button>
      </div>

      {/* Search */}
      <div className="navbar-center">
        <div className="search-box">
          <FiSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search courses, topics..."
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="navbar-right">
        <div className="nav-icon">
          <FiBell />
        </div>

        <div className="profile" ref={menuRef}>
          <div
            className="profile-trigger"
            onClick={() => setShowMenu(!showMenu)}
          >
            <img
              src="https://i.pravatar.cc/150?img=32"
              alt="Profile"
            />

            <div className="profile-info">
              <span className="profile-name">
                Prashanthi
              </span>

              <span className="profile-role">
                {userRole}
              </span>
            </div>

            <FiChevronDown />
          </div>

          {showMenu && (
            <div className="profile-dropdown">
              <button>
                <FiUser />
                My Profile
              </button>

              <button>
                <FiSettings />
                Settings
              </button>

              <button className="logout-btn" onClick={handleLogout} type="button">
                <FiLogOut />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}