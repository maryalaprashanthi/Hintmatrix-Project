import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCreditCard,
  FaUsers,
  FaArrowRight,
  FaCheck,
  FaCrown,
  FaRupeeSign,
  FaClock,
  FaEllipsisV,
  FaGraduationCap,
  FaCheckCircle,
} from "react-icons/fa";

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
    ])
      .then(([courseResponse, planResponse, studentResponse]) => {
        setCourses(courseResponse.data || []);
        setPlans(planResponse.data || []);
        setStudents(studentResponse.data || []);
      })
      .catch(() => setMessage("Unable to load subscription assignment data."));
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
      setMessage(
        error.response?.data?.message || "Unable to assign subscriptions.",
      );
    }
  };

  const activePlans = plans.filter((plan) => plan.active !== false);

  return (
    <div className="subscription-page">
      {/* ================= WELCOME BANNER ================= */}

      <section className="subscription-welcome">
        <div className="welcome-content">
          <span className="welcome-label">WELCOME BACK,</span>

          <h1>
            Prashanthi <span>👋</span>
          </h1>

          <p>
            Manage your subscription plans, track usage and keep everything
            running smoothly.
          </p>
        </div>

        <div className="welcome-visual">
          <div className="welcome-glow welcome-glow-one" />
          <div className="welcome-glow welcome-glow-two" />

          <div className="welcome-crown">
            <FaCrown />
          </div>

          <div className="welcome-document">
            <div className="document-top">
              <span />
              <span />
            </div>

            <div className="document-line large" />
            <div className="document-line" />
            <div className="document-line" />

            <div className="document-item">
              <FaCheck />
              <span />
            </div>

            <div className="document-item orange">
              <span />
              <span />
            </div>

            <div className="document-item green">
              <span />
              <span />
            </div>
          </div>

          <div className="welcome-plant">
            <span className="leaf leaf-one" />
            <span className="leaf leaf-two" />
            <span className="leaf leaf-three" />
            <span className="leaf leaf-four" />
            <div className="plant-pot" />
          </div>

          <div className="welcome-quote">
            <strong>“Better learning</strong>
            <strong>builds a brighter</strong>
            <strong>future.”</strong>
            <span />
          </div>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}

      <section className="subscription-stats">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FaCrown />
          </div>

          <div className="stat-info">
            <span>Total Plans</span>
            <strong>{plans.length}</strong>
            <small className="positive">
              ↑ {activePlans.length} active plans
            </small>
          </div>

          <FaEllipsisV className="stat-menu" />
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FaUsers />
          </div>

          <div className="stat-info">
            <span>Active Subscriptions</span>
            <strong>{students.length}</strong>
            <small className="positive">↑ students available</small>
          </div>

          <FaEllipsisV className="stat-menu" />
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <FaRupeeSign />
          </div>

          <div className="stat-info">
            <span>Revenue</span>
            <strong>—</strong>
            <small className="positive">Subscription revenue</small>
          </div>

          <FaEllipsisV className="stat-menu" />
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <FaClock />
          </div>

          <div className="stat-info">
            <span>Expired Subscriptions</span>
            <strong>—</strong>
            <small className="negative">No expiry data</small>
          </div>

          <FaEllipsisV className="stat-menu" />
        </div>
      </section>

      {/* ================= MAIN PLAN CARDS ================= */}

      <section className="subscription-plan-grid">
        {/* SUBSCRIPTION PLANS */}

        <article className="plan-card blue-card">
          <div className="plan-card-header">
            <div className="plan-heading">
              <div className="plan-icon blue">
                <FaCrown />
              </div>

              <div>
                <h2>Subscription Plans</h2>
                <p>Create and manage all subscription plans.</p>
              </div>
            </div>

            <span className="active-badge">
              <span />
              Active
            </span>
          </div>

          <div className="plan-divider" />

          <div className="plan-features">
            <div className="plan-feature">
              <div className="feature-check blue">
                <FaCheck />
              </div>

              <div>
                <strong>Manage Plans</strong>
                <span>Create, edit, and organize subscription plans.</span>
              </div>

              <FaArrowRight className="feature-arrow" />
            </div>

            <div className="plan-feature">
              <div className="feature-check blue">
                <FaCheck />
              </div>

              <div>
                <strong>Plan Access</strong>
                <span>Control access and permissions for each plan.</span>
              </div>

              <FaArrowRight className="feature-arrow" />
            </div>
          </div>

          <button
            className="plan-action blue"
            onClick={() => navigate("/subscriptions/plans")}
          >
            <span>View Plans</span>
            <FaArrowRight />
          </button>

          <div className="card-decoration blue-decoration" />
        </article>

        {/* COURSE PLANS */}

        <article className="plan-card purple-card">
          <div className="plan-card-header">
            <div className="plan-heading">
              <div className="plan-icon purple">
                <FaGraduationCap />
              </div>

              <div>
                <h2>Course Plans</h2>
                <p>
                  Plans control course access, questions, mock tests and exams.
                </p>
              </div>
            </div>
          </div>

          <div className="plan-divider" />

          <div className="plan-features">
            <div className="plan-feature">
              <div className="feature-check purple">
                <FaCheck />
              </div>

              <div>
                <strong>Course-level access</strong>
                <span>Manage course access permissions.</span>
              </div>

              <FaArrowRight className="feature-arrow" />
            </div>

            <div className="plan-feature">
              <div className="feature-check purple">
                <FaCheck />
              </div>

              <div>
                <strong>Usage limits</strong>
                <span>Set limits for course usage and attempts.</span>
              </div>

              <FaArrowRight className="feature-arrow" />
            </div>
          </div>

          <button
            className="plan-action purple"
            onClick={() => navigate("/subscriptions/plans")}
          >
            <span>Manage Plans</span>
            <FaArrowRight />
          </button>

          <div className="card-decoration purple-decoration" />
        </article>
      </section>

      {/* ================= BRANCH ADMIN ASSIGNMENT ================= */}

      {isBranchAdmin && (
        <section className="subscription-bulk-card">
          <div className="subscription-bulk-heading">
            <div>
              <h3>
                <FaUsers />
                Assign a course plan to students
              </h3>

              <p>
                Select a course, plan, and one or more students from your
                branch.
              </p>
            </div>

            <span className="student-count">
              {students.length} students available
            </span>
          </div>

          {message && <div className="subscription-message">{message}</div>}

          <form onSubmit={handleBulkAssign} className="subscription-bulk-form">
            <label>
              Course
              <select
                required
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
              >
                <option value="">Select course</option>

                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Plan
              <select
                required
                value={planId}
                onChange={(event) => setPlanId(event.target.value)}
              >
                <option value="">Select plan</option>

                {activePlans.map((plan) => (
                  <option
                    key={plan.id || plan.planId}
                    value={plan.id || plan.planId}
                  >
                    {plan.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="student-selector">
              Students
              <select
                required
                multiple
                value={selectedStudentIds.map(String)}
                onChange={(event) =>
                  setSelectedStudentIds(
                    Array.from(
                      event.target.selectedOptions,
                      (option) => option.value,
                    ),
                  )
                }
              >
                {students.map((student) => (
                  <option key={student.userId} value={student.userId}>
                    {student.name} ({student.userId})
                  </option>
                ))}
              </select>
              <small>Hold Ctrl or Command to select multiple students.</small>
            </label>

            <button
              type="submit"
              className="subscription-submit-btn"
              disabled={!selectedStudentIds.length}
            >
              <FaCheck />
              Assign subscriptions
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default Subscription;
