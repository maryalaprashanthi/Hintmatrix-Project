import React, { useState } from "react";
import CourseForm from "./CourseForm";
import CourseTable from "./CourseTable";

function Course() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Called when Edit button is clicked
  const handleEditSignal = (courseData) => {
    setSelectedCourse(courseData);

    const hiddenTriggerButton = document.getElementById(
      "hiddenCourseModalTrigger"
    );

    if (hiddenTriggerButton) {
      hiddenTriggerButton.click();
    }
  };

  // Called after Save/Update
  const handleFormSubmissionComplete = () => {
    setSelectedCourse(null);
    setRefreshTrigger((prev) => !prev);

    const modalCloseButton = document.getElementById(
      "courseModalCloseButton"
    );

    if (modalCloseButton) {
      modalCloseButton.click();
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Remove Bootstrap Backdrop */}
      <style>{`
        .modal-backdrop {
          display: none !important;
        }

        body.modal-open {
          overflow: auto !important;
          padding-right: 0 !important;
        }
      `}</style>

      {/* Hidden Trigger */}
      <button
        id="hiddenCourseModalTrigger"
        className="d-none"
        data-bs-toggle="modal"
        data-bs-target="#courseModal"
        data-bs-backdrop="false"
      ></button>

      {/* Header */}
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
          data-bs-backdrop="false"
          onClick={() => setSelectedCourse(null)}
        >
          ➕ Add Course
        </button>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">

          <h3 className="fw-bold text-dark fs-5 mb-3">
            Registered Global Courses
          </h3>

          <div className="table-responsive">
            <CourseTable
              onEdit={handleEditSignal}
              refresh={refreshTrigger}
            />
          </div>

        </div>
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="courseModal"
        tabIndex="-1"
        data-bs-backdrop="false"
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
              ></button>
            </div>

            <div className="modal-body pt-0">
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