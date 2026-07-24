import React, { useState } from "react";
import CourseForm from "./CourseForm";
import CourseTable from "./CourseTable";

function Course() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Triggered when clicking 'Edit' in CourseTable
  const handleEditSignal = (courseData) => {
    // Sets fields matching CourseResponseDTO to pass down to form
    setSelectedCourse(courseData);

    const hiddenTriggerButton = document.getElementById(
      "hiddenCourseModalTrigger"
    );

    if (hiddenTriggerButton) {
      hiddenTriggerButton.click();
    }
  };

  // Triggered after successful POST or PUT in CourseForm
  const handleFormSubmissionComplete = () => {
    setSelectedCourse(null);
    // Toggles boolean state to force CourseTable to re-run its GET request
    setRefreshTrigger((prev) => !prev);

    const modalCloseButton = document.getElementById(
      "courseModalCloseButton"
    );

    if (modalCloseButton) {
      modalCloseButton.click();
    }
  };

  // Explicitly resets form fields when user switches from editing to creating
  const handleAddCourseClick = () => {
    setSelectedCourse(null);
  };

  return (
    <div
      className="container-fluid p-4"
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Scope-isolated styles to handle Bootstrap backdrop layout properly */}
      <style>{`
       .modal-backdrop.show {
        background: rgba(15, 23, 42, 0.25) !important;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
         opacity: 1 !important;
      }
     `}</style>

      {/* Programmatic Hidden Trigger for Edit Actions */}
      <button
        id="hiddenCourseModalTrigger"
        className="d-none"
        data-bs-toggle="modal"
        data-bs-target="#courseModal"
        
      ></button>

      {/* Dashboard Top Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold text-dark mb-1">
            Course Management Dashboard
          </h1>

          <p className="text-muted mb-0">
            Register global academic curriculums and configure system-wide
            training parameters.
          </p>
        </div>

        <button
          className="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-3"
          data-bs-toggle="modal"
          data-bs-target="#courseModal"
          
          onClick={handleAddCourseClick}
        >
          ➕ Add Course
        </button>
      </div>

      {/* Main Table Content Container Card */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">

          <h3 className="fw-bold text-dark fs-5 mb-3">
            Registered Global Courses
          </h3>

          <div className="table-responsive">
            {/* Table receives refresh trigger to re-fetch CourseResponseDTO arrays */}
            <CourseTable
              onEdit={handleEditSignal}
              refresh={refreshTrigger}
            />
          </div>

        </div>
      </div>

      {/* Standard Popup Bootstrap Modal */}
      <div
        className="modal fade"
        id="courseModal"
        tabIndex="-1"
        
        aria-labelledby="courseModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-3">

            <div className="modal-header border-0">
              <button
                id="courseModalCloseButton"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setSelectedCourse(null)}
              ></button>
            </div>

            <div className="modal-body pt-0">
              {/* Form processes DTO mapping dynamically on change operations */}
              <CourseForm
                selectedCourseData={selectedCourse}
                onUpdateComplete={handleFormSubmissionComplete}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Course;
