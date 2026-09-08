import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaUsers, FaArrowRight, FaCheck } from "react-icons/fa";

import "./Subscription.css";
import CourseService from "../../services/CourseService";
import SubscriptionService from "../../services/SubscriptionService";
import apiClient from "../../services/apiClient";

function Subscription() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [plans, setPlans] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [planId, setPlanId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [message, setMessage] = useState("");
  const isBranchAdmin = localStorage.getItem("role") === "BRANCH_ADMIN";

  useEffect(() => {
    Promise.all([
      CourseService.getAllCourses(),
      SubscriptionService.getPlans(),
      apiClient.get("/api/users/students"),
    ]).then(([courseResponse, planResponse, studentResponse]) => {
      setCourses(courseResponse.data || []);
      setPlans(planResponse.data || []);
      setStudents(studentResponse.data || []);
    }).catch(() => setMessage("Unable to load subscription assignment data."));
  }, []);

  const handleBulkAssign = async (event) => {
    event.preventDefault();
    try {
      await SubscriptionService.activateBulk({
        courseId: Number(courseId),
        planId: Number(planId),
        studentIds: selectedStudentIds.map(Number),
      });
      setMessage("Subscriptions assigned successfully.");
      setSelectedStudentIds([]);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to assign subscriptions.");
    }
  };

  return (
    <div className="container-fluid subscription-page">
      {/* ================= HEADER ================= */}

      <div className="subscription-header">
        <div className="subscription-title">
          <div className="subscription-icon">
            <FaCreditCard />
          </div>

          <div>
            <h2>Subscription Management</h2>

            <p>Create, organize and manage subscription plans.</p>
          </div>
        </div>
      </div>

      {/* ================= SUBSCRIPTION CARDS ================= */}

      <div className="row">
        {/* ================= SUBSCRIPTION PLANS ================= */}

        <div className="col-12 col-md-6 col-lg-4 mb-4">
          <div className="subscription-card">
            {/* IMAGE / ICON AREA */}
            <div className="subscription-banner">
              <div className="subscription-banner-icon">
                <FaCreditCard />
              </div>
            </div>

            {/* CONTENT */}
            <div className="subscription-content">
              <h4>Subscription Plans</h4>

              <p className="subscription-description">
                Create and manage all subscription plans.
              </p>

              <div className="subscription-details">
                <div>
                  <FaCreditCard />
                  <span>Manage Plans</span>
                </div>

                <div>
                  <FaUsers />
                  <span>Plan Access</span>
                </div>
              </div>

              {/* BUTTON */}
              <button
                className="subscription-btn"
                onClick={() => navigate("/subscriptions/plans")}
              >
                <span>View Plans</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4 mb-4">
          <div className="subscription-card">
            {/* IMAGE / ICON AREA */}
            <div className="subscription-banner">
              <div className="subscription-banner-icon">
                <FaUsers />
              </div>
            </div>

            {/* CONTENT */}
            <div className="subscription-content">
              <h4>Course Plans</h4>

              <p className="subscription-description">
                Plans control course access, questions, mock tests and exams.
              </p>

              <div className="subscription-details">
                <div>
                  <FaUsers />
                  <span>Course-level access</span>
                </div>

                <div>
                  <FaCreditCard />
                  <span>Usage limits</span>
                </div>
              </div>

              {/* BUTTON */}
              <button
                className="subscription-btn"
                onClick={() => navigate("/subscriptions/plans")}
              >
                <span>Manage Plans</span>
                <FaArrowRight />
              </button>
            </div>
          </div>

        </div>
      </div>

      {isBranchAdmin && (
        <section className="subscription-bulk-card">
          <div className="subscription-bulk-heading">
            <div>
              <h3><FaUsers /> Assign a course plan to students</h3>
              <p>Select a course, plan, and one or more students from your branch.</p>
            </div>
            <span className="student-count">{students.length} students available</span>
          </div>
          {message && <div className="subscription-message">{message}</div>}
          <form onSubmit={handleBulkAssign} className="subscription-bulk-form">
            <label>
              Course
              <select required value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                <option value="">Select course</option>
                {courses.map((course) => <option key={course.courseId} value={course.courseId}>{course.name}</option>)}
              </select>
            </label>
            <label>
              Plan
              <select required value={planId} onChange={(event) => setPlanId(event.target.value)}>
                <option value="">Select plan</option>
                {plans.filter((plan) => plan.active !== false).map((plan) => <option key={plan.id || plan.planId} value={plan.id || plan.planId}>{plan.name}</option>)}
              </select>
            </label>
            <label className="student-selector">
              Students
              <select
                required
                multiple
                value={selectedStudentIds.map(String)}
                onChange={(event) => setSelectedStudentIds(Array.from(event.target.selectedOptions, (option) => option.value))}
              >
                {students.map((student) => (
                  <option key={student.userId} value={student.userId}>
                    {student.name} ({student.userId})
                  </option>
                ))}
              </select>
              <small>Hold Ctrl or Command to select multiple students.</small>
            </label>
            <button type="submit" className="subscription-submit-btn" disabled={!selectedStudentIds.length}>
              <FaCheck /> Assign subscriptions
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default Subscription;
