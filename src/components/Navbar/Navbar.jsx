import "./Navbar.css";
import logo from "../../assets/hintmatrix-logo.png";

import {
  FiSearch,
  FiBell,
  FiChevronDown,
} from "react-icons/fi";

function Navbar() {
  return (
    <header className="navbar">
      {/* Left - Logo */}
      <div className="navbar-left">
        <img
          src={logo}
          alt="HintMatrix Logo"
          className="logo"
        />
      </div>

      {/* Center - Search Bar */}
      <div className="navbar-center">
        <div className="search-box">
          <FiSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search for courses, topics..."
          />
        </div>
      </div>

      {/* Right - Notification & Profile */}
      <div className="navbar-right">
        <div className="notification">
          <FiBell />

          <span className="badge">3</span>
        </div>

        <div className="profile">
          <img
            src="https://i.pravatar.cc/150?img=32"
            alt="Profile"
          />

          <span>Prashanthi</span>

          <FiChevronDown />
        </div>
      </div>
    </header>
  );
}

export default Navbar;