import { Routes, Route } from "react-router-dom";

import Layout from "./Layout/Layout";

import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses/Courses";
import CourseForm from "./pages/Courses/CourseForm";
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

        <Route path="/courses" element={<Courses />} />

        <Route path="/courses/new" element={<CourseForm />} />

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