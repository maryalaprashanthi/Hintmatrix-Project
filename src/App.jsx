import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

import Layout from "./Layout/Layout";

import Dashboard from "./pages/Dashboard";

// --- UPDATED EXPORT IMPORTS TO MATCH COMMON NESTED FOLDER ARCHITECTURES ---
import College from "./pages/College/College";       
import Section from "./components/Section";               
import Course from "./components/Course"; // Added singular admin Course management page
import CourseForm from "./pages/College/Courses/CourseForm";
import Courses from "./pages/College/Courses/Courses";
import Chapters from "./pages/Chapters/Chapters";
import Branch from "./pages/College/Branch/Branch";

// Other Pages
import Practice from "./pages/Practice";
import Tests from "./pages/Tests";
import Sessions from "./pages/Sessions";
import Results from "./pages/Results";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";

// Assets
import bcom from "./assets/courses/bcom.png.jpeg";
import ca from "./assets/courses/ca-foundation.png.jpeg";
import cbse from "./assets/courses/cbse11.png.jpeg";
import accountancy from "./assets/courses/jr-accountancy.png.jpeg";
import combo from "./assets/courses/combo.png.jpeg";
import inter from "./assets/courses/inter.png.jpeg";


function App() {

  const navigate = useNavigate();


  const [coursesList, setCoursesList] = useState([

    {
      id: 1,
      title: "B.Com - 1st Year",
      slug: "bcom",
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
      slug: "ca-foundation",
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
      slug: "cbse-11",
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
      slug: "jr-accountancy",
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
      slug: "combo",
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
      slug: "inter",
      image: inter,
      category: "Integrated Program",
      level: "Intermediate",
      duration: "Full Program",
      button: "Continue Learning",
      progress: "60%",
    },

  ]);


  const handleSaveCourse = (newCourse) => {

    const courseWithUI = {
      ...newCourse,
      slug: newCourse.title
        .toLowerCase()
        .replaceAll(" ", "-"),
      button: "Continue Learning",
    };


    setCoursesList((prevList) => [
      courseWithUI,
      ...prevList,
    ]);


    navigate("/courses");

  };
  return (
    <Routes>

      <Route element={<Layout />}>

        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* College Management */}

        <Route
          path="/college"
          element={<College />}
        />

        <Route
          path="/section"
          element={<Section />}
        />

        <Route
          path="/Branch"
          element={<Branch />}
        />

        <Route
          path="/course"
          element={<Course />}
        />


        {/* Courses */}

        <Route
          path="/courses"
          element={
            <Courses
              dynamicCourses={coursesList}
            />
          }
        />


        {/* Chapters */}

        <Route
          path="/chapters/:courseId"
          element={
            <Chapters />
          }
        />


        {/* Add Course */}

        <Route
          path="/courses/new"
          element={
            <CourseForm
              onSaveCourse={handleSaveCourse}
            />
          }
        />


        {/* Other Pages */}

        <Route
          path="/practice"
          element={<Practice />}
        />

        <Route
          path="/tests"
          element={<Tests />}
        />

        <Route
          path="/sessions"
          element={<Sessions />}
        />

        <Route
          path="/results"
          element={<Results />}
        />

        <Route
          path="/certificates"
          element={<Certificates />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

      </Route>

    </Routes>
  );
}


export default App;
