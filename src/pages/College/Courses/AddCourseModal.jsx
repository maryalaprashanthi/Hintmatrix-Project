import React from "react";
import "./AddCourseModal.css";

function AddCourseModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="course-modal">

        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h2>Add New Course</h2>
            <p>Create a new course for HintMatrix students.</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">

          <div className="card-box">
            <h4>📚 Course Information</h4>

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

          <div className="card-box">
            <h4>🖼 Course Thumbnail</h4>
            <input type="file" className="form-control" />
          </div>

          <div className="card-box">
            <h4>📝 Course Description</h4>

            <textarea
              rows="7"
              className="form-control"
              placeholder="Write course description..."
            ></textarea>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">

          <button className="btn cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="btn save-btn">
            Save Course
          </button>

        </div>

      </div>
    </div>
  );
}

export default AddCourseModal;