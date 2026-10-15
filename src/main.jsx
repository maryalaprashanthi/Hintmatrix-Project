import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import ToastProvider from "./components/Toast/ToastProvider";
import NotificationProvider from "./components/Navbar/NotificationProvider";
import "./index.css";
import "./styles/commonDropdown.css";

// 1. Load Bootstrap CSS locally
import "bootstrap/dist/css/bootstrap.min.css";

// Bootstrap JS (Required for Modal, Dropdown, Collapse, etc.)
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <NotificationProvider><App /></NotificationProvider>
      </ToastProvider>
    </BrowserRouter>
    ,
  </React.StrictMode>,
);
