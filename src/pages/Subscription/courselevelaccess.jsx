import React, { useState } from "react";
import "./CourseLevelAccess.css";

const initialCourses = [
  {
    id: 1,
    name: "Mathematics",
    icon: "π",
    access: true,
  },
  {
    id: 2,
    name: "Physics",
    icon: "⚛",
    access: true,
  },
  {
    id: 3,
    name: "Chemistry",
    icon: "⚗",
    access: true,
  },
  {
    id: 4,
    name: "English",
    icon: "A",
    access: false,
  },
  {
    id: 5,
    name: "Biology",
    icon: "♧",
    access: false,
  },
  {
    id: 6,
    name: "Computer Science",
    icon: "</>",
    access: false,
  },
];

const CourseLevelAccess = () => {
  const [selectedPlan, setSelectedPlan] = useState("Premium Plan");

  const [courses, setCourses] = useState(initialCourses);

  const [openAction, setOpenAction] = useState(null);

  const handleToggle = (id) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === id ? { ...course, access: !course.access } : course,
      ),
    );
  };

  const handleSave = () => {
    console.log("Selected Plan:", selectedPlan);
    console.log("Course Access:", courses);

    alert("Course access changes saved successfully!");
  };

  const handleCancel = () => {
    setCourses(initialCourses);
    setSelectedPlan("Premium Plan");
    setOpenAction(null);
  };

  return (
    <div className="course-level-access-page">
      {/* Breadcrumb */}
      <div className="cla-breadcrumb">
        <span>Subscription</span>

        <span className="cla-breadcrumb-arrow">›</span>

        <span className="cla-breadcrumb-current">Course Level Access</span>
      </div>

      {/* Page Header */}
      <div className="cla-page-header">
        <h1>Course Level Access</h1>

        <p>Manage course access permissions for each plan.</p>
      </div>

      {/* Main Card */}
      <div className="cla-main-card">
        {/* Plan Selection */}
        <div className="cla-plan-section">
          <label htmlFor="cla-plan">Select Plan</label>

          <div className="cla-plan-select">
            <div className="cla-plan-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 20H19L17.5 7H6.5L5 20Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />

                <path
                  d="M9 7C9 4.8 10.3 3 12 3C13.7 3 15 4.8 15 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <path
                  d="M4 20H20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <select
              id="cla-plan"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <option value="Premium Plan">Premium Plan</option>

              <option value="Basic Plan">Basic Plan</option>

              <option value="Standard Plan">Standard Plan</option>

              <option value="Enterprise Plan">Enterprise Plan</option>
            </select>

            <span className="cla-select-arrow">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Course Table */}
        <div className="cla-table-container">
          <table className="cla-course-table">
            <thead>
              <tr>
                <th className="cla-course-column">Course</th>

                <th className="cla-access-column">Access</th>

                <th className="cla-actions-column">Actions</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  {/* Course */}
                  <td>
                    <div className="cla-course-name">
                      <span className="cla-course-icon">{course.icon}</span>

                      <span>{course.name}</span>
                    </div>
                  </td>

                  {/* Access Toggle */}
                  <td>
                    <button
                      type="button"
                      className={`cla-toggle ${
                        course.access ? "cla-toggle-on" : "cla-toggle-off"
                      }`}
                      onClick={() => handleToggle(course.id)}
                      aria-label={`Toggle ${course.name} access`}
                    >
                      <span className="cla-toggle-circle"></span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="cla-action-wrapper">
                      <button
                        type="button"
                        className="cla-action-button"
                        onClick={() =>
                          setOpenAction(
                            openAction === course.id ? null : course.id,
                          )
                        }
                        aria-label={`Actions for ${course.name}`}
                      >
                        <span></span>
                        <span></span>
                        <span></span>
                      </button>

                      {openAction === course.id && (
                        <div className="cla-action-menu">
                          <button
                            type="button"
                            onClick={() => handleToggle(course.id)}
                          >
                            {course.access ? "Disable Access" : "Enable Access"}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="cla-footer">
          <button
            type="button"
            className="cla-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="cla-save-button"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseLevelAccess;
