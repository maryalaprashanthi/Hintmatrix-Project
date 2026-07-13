import "./App.css";
import "./components/StatsCard/StatsCard.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Practice from "./pages/Practice";
import Tests from "./pages/Tests";
import Results from "./pages/Results";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Common Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/results" element={<Results />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;