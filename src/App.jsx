import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

import Layout from "./Layout/Layout";

import Dashboard from "./pages/Dashboard";

// --- UPDATED EXPORT IMPORTS TO MATCH COMMON NESTED FOLDER ARCHITECTURES ---
import College from "./pages/College/College";
import Section from "./components/Section";
import CourseForm from "./pages/College/Courses/CourseForm";
import Courses from "./pages/College/Courses/Courses";

import Branch from "./pages/College/Branch/Branch";
import BranchAdmin from "./pages/Admin/BranchAdmin";
import SuperAdmin from "./pages/Admin/SuperAdmin";
import Student from "./pages/Admin/Student";

import Chapters from "./pages/Chapters/Chapters";

import QuestionCategories from "./pages/QuestionCategories/QuestionCategories";
import QuestionList from "./pages/Questions/QuestionList";

import RuleEngine from "./pages/RuleEngine/RuleEngine";

import Login from "./pages/Auth/Login";
// Other Pages
import Practice from "./pages/Practice";
import Tests from "./pages/Tests";
import Sessions from "./pages/Sessions";
import Results from "./pages/Results";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";

// Table Pages
import TableNames from "./pages/Table/TableNames";
import TableHeaders from "./pages/Table/TableHeaders";
import TableAttributes from "./pages/Table/TableAttributes";

// Course Images
import bcom from "./assets/courses/bcom.png.jpeg";
import ca from "./assets/courses/ca-foundation.png.jpeg";
import cbse from "./assets/courses/cbse11.png.jpeg";
import accountancy from "./assets/courses/jr-accountancy.png.jpeg";
import combo from "./assets/courses/combo.png.jpeg";
import inter from "./assets/courses/inter.png.jpeg";
import Landing from "./pages/Landing/Landing";
import QuestionPage from "./components/Question/QuestionPage";
import JournalPage from "./components/Journal Question/JournalPage";

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

      slug: newCourse.title.toLowerCase().replaceAll(" ", "-"),

      button: "Continue Learning",
    };

    setCoursesList((prev) => [courseWithUI, ...prev]);

    navigate("/courses");
  };
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        {/* Dashboard */}

        <Route path="/dashboard" element={<Dashboard />} />

        {/* College */}
        <Route path="/college" element={<College />} />
        <Route path="/branch" element={<Branch />} />
        <Route path="/section" element={<Section />} />

        {/* Branch Admin */}
        <Route path="/branch-admin" element={<BranchAdmin />} />
        <Route path="/admin/branch-admin" element={<BranchAdmin />} />

        {/* Super Admin */}
        <Route path="/admin/super-admin" element={<SuperAdmin />} />

        {/* Student */}
        <Route path="/admin/student" element={<Student />} />

        {/* Courses */}
        <Route
          path="/courses"
          element={<Courses dynamicCourses={coursesList} />}
        />

        <Route
          path="/course"
          element={<Courses dynamicCourses={coursesList} />}
        />

        {/* Course -> Chapters */}
        <Route path="/chapters/:courseId" element={<Chapters />} />

        {/* Questions -> Chapters (NEW) */}
        <Route path="/questions/chapters" element={<Chapters />} />

        {/* Course -> Question Categories */}
        <Route
          path="/question-categories/:courseId/:chapterName"
          element={<QuestionCategories />}
        />

        {/* Questions -> Question Categories (NEW) */}
        <Route
          path="/questions/question-categories"
          element={<QuestionCategories />}
        />
        <Route path="/questions/question-list" element={<QuestionList />} />
        {/* Questions -> Question List */}
        <Route
          path="/questions/question-list/:questionId"
          element={<QuestionPage />}
        />
        <Route
          path="/questions/question-categories/:chapterId/:chapterName"
          element={<QuestionCategories />}
        />

        {/* Add Course */}
        <Route
          path="/courses/new"
          element={<CourseForm onSaveCourse={handleSaveCourse} />}
        />

        {/* Tables */}
        <Route path="/table-names" element={<TableNames />} />
        <Route path="/table-headers" element={<TableHeaders />} />
        <Route path="/table-attributes" element={<TableAttributes />} />

        {/* RuleEngine */}
        <Route path="/ruleengine" element={<RuleEngine />} />

        {/* Learning */}
        <Route path="/practice" element={<Practice />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/results" element={<Results />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/questions/question-list/:id/"
          element={<QuestionPage />}
        />
        <Route path="/journal" element={<JournalPage />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
