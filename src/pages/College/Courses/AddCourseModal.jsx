import React from "react";

function AddCourseModal() {
  return (
    <div
      className="modal fade"
      id="addCourseModal"
      tabIndex="-1"
      aria-labelledby="addCourseModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow rounded-4">

          {/* Header */}
          <div className="modal-header">
            <div className="text-center w-100">
              <h2
                id="addCourseModalLabel"
                className="fw-bold mb-2"
              >
                Add New Course
              </h2>

              <p className="text-muted mb-0">
                Create a new course for HintMatrix students.
              </p>
            </div>

            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-4"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body">

            {/* Course Information */}
            <div className="card border-0 shadow-sm mb-4">

              <div className="card-header bg-white">
                <h5 className="fw-bold mb-0">
                  📚 Course Information
                </h5>
              </div>

              <div className="card-body">

                <div className="row">

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Course Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter course name"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Category
                    </label>

                    <select className="form-select">
                      <option>Select Category</option>
                      <option>Degree</option>
                      <option>Intermediate</option>
                      <option>Professional</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Level
                    </label>

                    <select className="form-select">
                      <option>Select Level</option>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Duration
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex : 3 Months"
                    />
                  </div>

                </div>

              </div>

            </div>

            {/* Thumbnail */}

            <div className="card border-0 shadow-sm mb-4">

              <div className="card-header bg-white">
                <h5 className="fw-bold mb-0">
                  🖼 Course Thumbnail
                </h5>
              </div>

              <div className="card-body">

                <input
                  type="file"
                  className="form-control"
                />

              </div>

            </div>

            {/* Description */}

            <div className="card border-0 shadow-sm">

              <div className="card-header bg-white">
                <h5 className="fw-bold mb-0">
                  📝 Course Description
                </h5>
              </div>

              <div className="card-body">

                <textarea
                  className="form-control"
                  rows="8"
                  placeholder="Write course description..."
                ></textarea>

              </div>

            </div>

          </div>

          {/* Footer */}

          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-outline-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
            >
              Save Course
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default AddCourseModal;  