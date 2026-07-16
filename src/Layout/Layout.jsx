import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Layout.css";

function Layout() {
  return (
    <div className="app-layout">
      <Navbar />

      <Sidebar />

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;