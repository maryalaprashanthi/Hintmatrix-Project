

// =========================================================
// ACTIVE FUNCTIONAL CODE (RUNNING PRODUCTION)
// =========================================================
import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

import Layout from "./Layout/Layout";

import Dashboard from "./pages/Dashboard";

// --- UPDATED EXPORT IMPORTS TO MATCH COMMON NESTED FOLDER ARCHITECTURES ---
import College from "./components/College";       
import Section from "./components/Section";       
import Branch from "./components/Branch";         
import Course from "./components/Course"; // Added singular admin Course management page

import Courses from "./pages/Courses/Courses"; // Plural page for original cards grid view
import CourseForm from "./pages/Courses/CourseForm";
import College from "./pages/College/College";
import Courses from "./pages/Courses/Courses";
import Practice from "./pages/Practice";
import Tests from "./pages/Tests";
import Sessions from "./pages/Sessions";
import Results from "./pages/Results";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";

// Import your asset images to initialize the shared state list
import bcom from "./assets/courses/bcom.png.jpeg";
import ca from "./assets/courses/ca-foundation.png.jpeg";
import cbse from "./assets/courses/cbse11.png.jpeg";
import accountancy from "./assets/courses/jr-accountancy.png.jpeg";
import combo from "./assets/courses/combo.png.jpeg";
import inter from "./assets/courses/inter.png.jpeg";

function App() {
  const navigate = useNavigate();

  // 1. Maintain the global list of courses in state using your friend's original mock data
  const [coursesList, setCoursesList] = useState([
    {
      id: 1,
      title: "B.Com - 1st Year",
      image: bcom,
      category: "Commerce",
      level: "Beginner",
      duration: "Self-paced",
      button: "Continue Learning",
      progress: "70%",
    },
    {
      id: 2,
      title: "CA Foundation",
      image: ca,
      category: "Chartered Accountancy",
      level: "Intermediate",
      duration: "Self-paced",
      button: "Continue Learning",
      progress: "55%",
    },
    {
      id: 3,
      title: "CBSE Class-11",
      image: cbse,
      category: "School Curriculum",
      level: "Beginner",
      duration: "Academic Year",
      button: "View Course",
      progress: "40%",
    },
    {
      id: 4,
      title: "Jr. Accountancy",
      image: accountancy,
      category: "Commerce",
      level: "Beginner",
      duration: "30 Lessons",
      button: "Continue Learning",
      progress: "85%",
    },
    {
      id: 5,
      title: "Combo Pack",
      image: combo,
      category: "Multiple Courses",
      level: "All Levels",
      duration: "Unlimited Access",
      button: "View Details",
      progress: "25%",
    },
    {
      id: 6,
      title: "Inter CBSE CAF B.Com",
      image: inter,
      category: "Integrated Program",
      level: "Intermediate",
      duration: "Full Program",
      button: "Continue Learning",
      progress: "60%",
    },
  ]);

  // 2. Action function called from CourseForm to save new course item data
  const handleSaveCourse = (newCourse) => {
    // Add default button action text for presentation cards
    const courseWithUI = {
      ...newCourse,
      button: "Continue Learning",
    };

    setCoursesList((prevList) => [courseWithUI, ...prevList]);
    
    // Programmatically redirect the user back to the main courses view layout
    navigate("/courses");
  };

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Main Dashboard Paths */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 3. New Context Management View Interfaces */}
        <Route path="/college" element={<College />} />
        <Route path="/sections" element={<Section />} />
        <Route path="/branch" element={<Branch />} />
        <Route path="/course" element={<Course />} /> {/* Added singular course admin management route */}

        {/* 4. Pass the dynamic list array state as a prop to your page */}
        <Route path="/courses" element={<Courses dynamicCourses={coursesList} />} />

        {/* 5. Pass the custom callback function save action down as a prop */}
        <Route path="/courses/new" element={<CourseForm onSaveCourse={handleSaveCourse} />} />

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
