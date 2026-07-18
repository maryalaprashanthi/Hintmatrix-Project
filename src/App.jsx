import { Routes, Route } from "react-router-dom";

import Layout from "./Layout/Layout";

import Dashboard from "./pages/Dashboard";
import College from "./pages/College/College";
import Courses from "./pages/Courses/Courses";
import Practice from "./pages/Practice";
import Tests from "./pages/Tests";
import Sessions from "./pages/Sessions";
import Results from "./pages/Results";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

        <Route path="/" element={<Dashboard />} />
         
         <Route path="/college" element={<College />} />

        <Route path="/courses" element={<Courses />} />

        <Route path="/practice" element={<Practice />} />

        <Route path="/tests" element={<Tests />} />

        <Route path="/sessions" element={<Sessions />} />

        <Route path="/results" element={<Results />} />

        <Route path="/certificates" element={<Certificates />} />

        <Route path="/settings" element={<Settings />} />

      </Route>
    </Routes>
  );
}

export default App;