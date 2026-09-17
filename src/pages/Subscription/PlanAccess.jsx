import React, { useState } from "react";
import "./PlanAccess.css";

const courses = [
  {
    name: "Mathematics",
    description: "Algebra, Geometry, Calculus and more.",
    icon: "π",
    color: "blue",
  },
  {
    name: "Physics",
    description: "Mechanics, Electricity, Magnetism and more.",
    icon: "⚛",
    color: "purple",
  },
  {
    name: "Chemistry",
    description: "Organic, Inorganic, Physical Chemistry and more.",
    icon: "⚗",
    color: "green",
  },
  {
    name: "English",
    description: "Grammar, Vocabulary, Reading and more.",
    icon: "A",
    color: "orange",
  },
  {
    name: "Biology",
    description: "Life Sciences, Human Body, Ecology and more.",
    icon: "♧",
    color: "pink",
  },
  {
    name: "Computer Science",
    description: "Programming, Data Structures, Web Technologies and more.",
    icon: "▣",
    color: "indigo",
  },
];

function PlanAccess() {
  const [selectedCourses, setSelectedCourses] = useState([
    "Mathematics",
    "Physics",
    "Chemistry",
  ]);

  const [activeTab, setActiveTab] = useState("Course Access");

  const toggleCourse = (courseName) => {
    setSelectedCourses((prev) =>
      prev.includes(courseName)
        ? prev.filter((course) => course !== courseName)
        : [...prev, courseName],
    );
  };

  return (
    <div className="plan-access-page">
      <main className="pa-main">
        {/* ================= BREADCRUMB ================= */}
        <div className="breadcrumb">
          <span>‹ Subscription</span>
          <b>›</b>
          <strong>Plan Access</strong>
        </div>

        {/* ================= HERO ================= */}
        <section className="pa-hero">
          <div className="hero-content">
            <span className="hero-label">SUBSCRIPTION MANAGEMENT</span>

            <h1>Plan Access</h1>

            <p>
              Control access and permissions for each subscription plan. Choose
              a plan and manage which courses are available to your users.
            </p>
          </div>

          <div className="hero-illustration">
            <div className="crown-box">♛</div>

            <div className="hero-document">
              <div className="document-dots">• • •</div>

              <div className="document-line checked">
                ✓<i></i>
              </div>

              <div className="document-line checked orange">
                ✓<i></i>
              </div>

              <div className="document-line checked green">
                ✓<i></i>
              </div>
            </div>

            <div className="plant">🌿</div>

            <div className="hero-quote">
              Better learning
              <br />
              builds a brighter
              <br />
              future.
              <div></div>
            </div>
          </div>
        </section>

        {/* ================= PLAN SELECTOR ================= */}
        <section className="plan-selector">
          <div className="plan-selector-left">
            <div className="plan-crown">♛</div>

            <div className="select-area">
              <label>Select Plan</label>

              <div className="select-box">
                <span className="small-crown">♛</span>
                <span>Premium Plan</span>

                <span className="popular">Most Popular</span>

                <span className="select-arrow">⌄</span>
              </div>
            </div>
          </div>

          <div className="plan-stats">
            <div className="stat">
              <div className="stat-icon">₹</div>

              <div>
                <strong>₹ 499</strong>
                <span>/ month</span>
                <small>per user</small>
              </div>
            </div>

            <div className="stat-divider"></div>

            <div className="stat">
              <div className="stat-icon">▣</div>

              <div>
                <strong>Duration</strong>
                <span>1 Month</span>
              </div>
            </div>

            <div className="stat-divider"></div>

            <div className="stat">
              <div className="stat-icon">♟</div>

              <div>
                <strong>Total Courses</strong>
                <span>6 Available</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MAIN MANAGEMENT CARD ================= */}
        <section className="access-container">
          {/* ================= TABS ================= */}
          <div className="access-tabs">
            <button
              type="button"
              className={activeTab === "Course Access" ? "tab active" : "tab"}
              onClick={() => setActiveTab("Course Access")}
            >
              <span>▣</span>
              Course Access
            </button>

            <button
              type="button"
              className={activeTab === "Permissions" ? "tab active" : "tab"}
              onClick={() => setActiveTab("Permissions")}
            >
              <span>⬟</span>
              Permissions
            </button>

            <button
              type="button"
              className={activeTab === "Usage Limits" ? "tab active" : "tab"}
              onClick={() => setActiveTab("Usage Limits")}
            >
              <span>▥</span>
              Usage Limits
            </button>
          </div>

          {/* ================= COURSE ACCESS ================= */}
          {activeTab === "Course Access" && (
            <div className="access-body">
              <div className="course-section">
                <div className="course-header">
                  <div>
                    <h2>Course Access</h2>
                    <p>Select which courses are available in this plan.</p>
                  </div>

                  <div className="selected-count">
                    <span>●</span>
                    {selectedCourses.length} of {courses.length} courses
                    selected
                  </div>
                </div>

                <div className="course-list">
                  {courses.map((course) => {
                    const isSelected = selectedCourses.includes(course.name);

                    return (
                      <div
                        className={`course-row ${isSelected ? "selected" : ""}`}
                        key={course.name}
                        onClick={() => toggleCourse(course.name)}
                      >
                        <div className={`course-icon ${course.color}`}>
                          {course.icon}
                        </div>

                        <div className="course-details">
                          <strong>{course.name}</strong>
                          <span>{course.description}</span>
                        </div>

                        <div
                          className={`course-checkbox ${
                            isSelected ? "checked" : ""
                          }`}
                        >
                          {isSelected && "✓"}
                        </div>

                        <span className="course-arrow">›</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ================= SIDE SUMMARY ================= */}
              <aside className="plan-summary">
                <div className="summary-header">
                  <div className="summary-icon">♛</div>

                  <div>
                    <h3>Premium Plan</h3>
                    <p>Best for institutions and advanced learners</p>
                  </div>
                </div>

                <div className="benefits">
                  <div className="benefit">
                    <span>✓</span>

                    <div>
                      <strong>
                        Access to {selectedCourses.length} of {courses.length}{" "}
                        courses
                      </strong>

                      <small>Choose the courses you want to activate.</small>
                    </div>
                  </div>

                  <div className="benefit">
                    <span>✓</span>

                    <div>
                      <strong>Unlimited practice tests</strong>

                      <small>Let students practice without limits.</small>
                    </div>
                  </div>

                  <div className="benefit">
                    <span>✓</span>

                    <div>
                      <strong>Detailed performance analytics</strong>

                      <small>Track progress and performance.</small>
                    </div>
                  </div>

                  <div className="benefit">
                    <span>✓</span>

                    <div>
                      <strong>Priority support</strong>

                      <small>Get help whenever you need it.</small>
                    </div>
                  </div>
                </div>

                <div className="upgrade-box">
                  <div className="upgrade-icon">★</div>

                  <div>
                    <strong>Upgrade to Premium</strong>

                    <span>Unlock all 6 courses and get the best value!</span>
                  </div>

                  <b>›</b>
                </div>
              </aside>
            </div>
          )}

          {/* ================= PERMISSIONS ================= */}
          {activeTab === "Permissions" && (
            <div className="placeholder-section">
              <div className="placeholder-icon">🔐</div>

              <h2>Plan Permissions</h2>

              <p>
                Configure what users can access with this subscription plan.
              </p>

              <div className="permission-grid">
                <div className="permission-card">
                  <span>✓</span>

                  <div>
                    <strong>View Courses</strong>
                    <small>Allow users to access assigned courses.</small>
                  </div>
                </div>

                <div className="permission-card">
                  <span>✓</span>

                  <div>
                    <strong>Practice Questions</strong>
                    <small>Allow users to practice questions.</small>
                  </div>
                </div>

                <div className="permission-card">
                  <span>✓</span>

                  <div>
                    <strong>View Analytics</strong>
                    <small>Allow users to view performance reports.</small>
                  </div>
                </div>

                <div className="permission-card">
                  <span>✓</span>

                  <div>
                    <strong>Mock Tests</strong>
                    <small>Allow users to attempt mock tests.</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= USAGE LIMITS ================= */}
          {activeTab === "Usage Limits" && (
            <div className="placeholder-section">
              <div className="placeholder-icon">📊</div>

              <h2>Usage Limits</h2>

              <p>
                Configure usage limits and attempts for this subscription plan.
              </p>

              <div className="usage-grid">
                <div className="usage-card">
                  <span>Practice Tests</span>
                  <strong>Unlimited</strong>
                </div>

                <div className="usage-card">
                  <span>Mock Tests</span>
                  <strong>10 / Month</strong>
                </div>

                <div className="usage-card">
                  <span>Exam Attempts</span>
                  <strong>5 / Month</strong>
                </div>
              </div>
            </div>
          )}

          {/* ================= FOOTER ================= */}
          <div className="access-footer">
            <div className="footer-note">
              <span>ⓘ</span>
              Changes will take effect immediately after saving.
            </div>

            <div className="footer-buttons">
              <button type="button" className="cancel-btn">
                Cancel
              </button>

              <button type="button" className="save-btn">
                ▣ &nbsp; Save Access Settings
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PlanAccess;
