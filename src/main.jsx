import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

// 1. Load Bootstrap CSS locally
import "bootstrap/dist/css/bootstrap.min.css";

// 2. Load Bootstrap JS Bundle locally (🌟 REQUIRED FOR POPUP MODALS TO OPEN AND CLOSE OFFLINE)
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
