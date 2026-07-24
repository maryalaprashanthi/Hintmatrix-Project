import React from "react";
import { createPortal } from "react-dom";
import "./AddCourseModal.css";

function AddCourseModal({ show, onClose }) {
  if (!show) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="course-modal">

        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h2>Add New Course</h2>
            <p>Create a new course for HintMatrix students.</p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Course Information */}
          <div className="card-box">
            <h4>Course Information</h4>

            <div className="form-grid">

              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Course Name"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select className="form-select">
                  <option>Commerce</option>
                  <option>Professional</option>
                  <option>School</option>
                </select>
              </div>

              <div className="form-group">
                <label>Level</label>
                <select className="form-select">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="3 Months"
                />
              </div>

            </div>
          </div>

          {/* Thumbnail */}
          <div className="card-box">
            <h4>Course Thumbnail</h4>

            <input
              type="file"
              className="form-control"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer d-flex justify-content-end gap-3">

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
          >
            Save
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
}

export default AddCourseModal;