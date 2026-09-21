import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";

import Layout from "./Layout/Layout";

import Dashboard from "./pages/Dashboard";
import Subscription from "./pages/Subscription/Subscription";
import PlanAccess from "./pages/Subscription/PlanAccess";
import SubscriptionPlans from "./pages/Subscription/SubscriptionPlans";
import SubscriptionHistory from "./pages/Subscription/SubscriptionHistory";
import CourseLevelAccess from "./pages/Subscription/courselevelaccess";

// --- UPDATED EXPORT IMPORTS TO MATCH COMMON NESTED FOLDER ARCHITECTURES ---
import College from "./pages/College/College";
import Section from "./components/Section";
import CourseForm from "./pages/College/Courses/CourseForm";
import Courses from "./pages/College/Courses/Courses";

import Branch from "./pages/College/Branch/Branch";
import CollegeAdmin from "./pages/Admin/CollegeAdmin";
import BranchAdmin from "./pages/Admin/BranchAdmin";
import SuperAdmin from "./pages/Admin/SuperAdmin";
import Student from "./pages/Admin/Student";

import Subjects from "./pages/Subjects/Subjects";
import Chapters from "./pages/Chapters/Chapters";

import Topics from "./pages/Topics/Topics";
import QuestionList from "./pages/Questions/QuestionList";
import CreateAllQuestions from "./pages/Questions/CreateAllQuestions";

import RuleEngine from "./pages/RuleEngine/RuleEngine";
import StudentAttendance from "./pages/StudentAttendance/StudentAttendance";

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import OAuthSuccess from "./pages/Auth/OAuthSuccess";
// Other Pages
import Practice from "./pages/Practice";
import ExamList from "./pages/ExamModule/ExamList";
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
import JournalPage from "./components/JournalQuestion/JournalPage";
import DropdownPage from "./components/DropdownQuestions/DropdownPage";
import CourseSubscribe from "./pages/CourseSubscribe";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import {
  ADMIN_ROLES,
  ATTEMPT_ROLES,
  CONTENT_MANAGER_ROLES,
  RESULT_ROLES,
  ROLES,
  VIEWER_ROLES,
} from "./utils/roles";
import Unauthorized from "./pages/Unauthorized/Unauthorized";
import ExamPage from "./components/Exam/ExamPage";
import MockExamPage from "./components/MockExam/MockExamPage";
import ExamHub from "./pages/ExamHub/ExamHub";
import ExamCatalog from "./pages/ExamCatalog/ExamCatalog";
import MockExamCatalog from "./pages/MockExamCatalog/MockExamCatalog";
import ExamReview from "./pages/ExamReview/ExamReview";
import ExamPaper from "./pages/ExamPaper/ExamPaper";
import PerformanceDashboard from "./pages/Performance/PerformanceDashboard";
import PracticePerformance from "./pages/PracticePerformance/PracticePerformance";

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
      <Route path="/signup" element={<Signup />} />
      <Route path="/oauth2/success" element={<OAuthSuccess />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={VIEWER_ROLES}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance"
          element={
            <ProtectedRoute allowedRoles={ATTEMPT_ROLES}>
              <PerformanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice-performance"
          element={
            <ProtectedRoute allowedRoles={ATTEMPT_ROLES}>
              <PracticePerformance />
            </ProtectedRoute>
          }
        />
        {/* Subscription */}
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <Subscription />
            </ProtectedRoute>
          }
        />
        <Route path="/course-level-access" element={<CourseLevelAccess />} />
        <Route path="/plan-access" element={<PlanAccess />} />
        <Route
          path="/subscriptions/plans"
          element={
            <ProtectedRoute allowedRoles={VIEWER_ROLES}>
              <SubscriptionPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions/history"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <SubscriptionHistory />
            </ProtectedRoute>
          }
        />
        {/* College */}
        <Route
          path="/college"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <College />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branch"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN]}
            >
              <Branch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/section"
          element={
            <ProtectedRoute allowedRoles={CONTENT_MANAGER_ROLES}>
              <Section />
            </ProtectedRoute>
          }
        />

        {/* College Admin */}
        <Route
          path="/college-admin"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <CollegeAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/college-admin"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <CollegeAdmin />
            </ProtectedRoute>
          }
        />

        {/* Branch Admin */}
        <Route
          path="/branch-admin"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "COLLEGE_ADMIN"]}>
              <BranchAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/branch-admin"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "COLLEGE_ADMIN"]}>
              <BranchAdmin />
            </ProtectedRoute>
          }
        />

        {/* Super Admin */}
        <Route
          path="/admin/super-admin"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdmin />
            </ProtectedRoute>
          }
        />

        {/* Student */}
        <Route
          path="/admin/student"
          element={
            <ProtectedRoute
              allowedRoles={[
                "SUPER_ADMIN",
                "COLLEGE_ADMIN",
                "BRANCH_ADMIN",
                "STUDENT",
              ]}
            >
              <Student />
            </ProtectedRoute>
          }
        />

        {/* Courses */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={VIEWER_ROLES}>
              <Courses dynamicCourses={coursesList} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course"
          element={
            <ProtectedRoute allowedRoles={VIEWER_ROLES}>
              <Courses dynamicCourses={coursesList} />
            </ProtectedRoute>
          }
        />

        {/* Add Course */}
        <Route
          path="/courses/new"
          element={
            <ProtectedRoute allowedRoles={CONTENT_MANAGER_ROLES}>
              <CourseForm onSaveCourse={handleSaveCourse} />
            </ProtectedRoute>
          }
        />

        {/*
          Content drill-down: Course > Subject > Chapter > Topic > Questions.
          One parent id per segment, nothing in query strings or router state.
          The list pages are available for question-bank browsing; authoring
          remains protected by the separate create route.
        */}
        <Route
          path="/courses/:courseId/subjects"
          element={
            <ProtectedRoute allowedRoles={VIEWER_ROLES}>
              <Subjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects/:subjectId/chapters"
          element={
            <ProtectedRoute allowedRoles={VIEWER_ROLES}>
              <Chapters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapters/:chapterId/topics"
          element={
            <ProtectedRoute allowedRoles={VIEWER_ROLES}>
              <Topics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topics/:topicId/questions"
          element={
            <ProtectedRoute allowedRoles={VIEWER_ROLES}>
              <QuestionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <ProtectedRoute allowedRoles={VIEWER_ROLES}>
              <QuestionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions/create-all"
          element={
            <ProtectedRoute allowedRoles={CONTENT_MANAGER_ROLES}>
              <CreateAllQuestions />
            </ProtectedRoute>
          }
        />
        <Route path="/questions/:questionId" element={<QuestionPage />} />

        {/* Tables */}
        <Route path="/table-names" element={<TableNames />} />
        <Route path="/table-headers" element={<TableHeaders />} />
        <Route path="/table-attributes" element={<TableAttributes />} />

        {/* RuleEngine */}
        <Route path="/ruleengine" element={<RuleEngine />} />

        {/* studentattendance */}
        <Route path="/studentattendance" element={<StudentAttendance />} />

        {/* Learning */}
        <Route path="/practice" element={<Practice />} />
        <Route
          path="/exam-list"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <ExamList />
            </ProtectedRoute>
          }
        />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/results" element={<Results />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/journal/:questionId" element={<JournalPage />} />
        <Route path="/dropdown/:questionId" element={<DropdownPage />} />
        <Route path="/course-subscribe" element={<CourseSubscribe />} />
        <Route path="/course-subscription" element={<CourseSubscribe />} />
        <Route
          path="/exam"
          element={
            <ProtectedRoute allowedRoles={ATTEMPT_ROLES}>
              <ExamHub key="exam" kind="exam" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mock-exam"
          element={
            <ProtectedRoute allowedRoles={ATTEMPT_ROLES}>
              <ExamHub key="mock" kind="mock" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute allowedRoles={ATTEMPT_ROLES}>
              <ExamCatalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mock-exams"
          element={
            <ProtectedRoute allowedRoles={ATTEMPT_ROLES}>
              <MockExamCatalog />
            </ProtectedRoute>
          }
        />
        {/* ExamPaper reads exam vs mock from the path; the keys stop a
            half-filled form leaking between the two. */}
        <Route
          path="/exam-paper"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <ExamPaper key="exam-create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-paper/:examId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <ExamPaper key="exam-edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mock-exam-paper"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <ExamPaper key="mock-create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mock-exam-paper/:examId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <ExamPaper key="mock-edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mcq-questions/create"
          element={
            <ProtectedRoute allowedRoles={CONTENT_MANAGER_ROLES}>
              <Navigate to="/questions/create-all" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mcq-questions/practice"
          element={<Navigate to="/courses" replace />}
        />
        <Route
          path="/mcq-questions/list"
          element={
            <ProtectedRoute allowedRoles={CONTENT_MANAGER_ROLES}>
              <Navigate to="/questions" replace />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path="/exams/:examId"
        element={
          <ProtectedRoute allowedRoles={ATTEMPT_ROLES}>
            <ExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/:examId/review/:resultId"
        element={
          <ProtectedRoute allowedRoles={RESULT_ROLES}>
            <ExamReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mock-exams/:examId"
        element={
          <ProtectedRoute allowedRoles={ATTEMPT_ROLES}>
            <MockExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mock-exams/:examId/review/:resultId"
        element={
          <ProtectedRoute allowedRoles={RESULT_ROLES}>
            <ExamReview />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
