import React, { useState } from "react";
import "./AddCourseModal.css";
import CourseService from "../../../services/CourseService";
import { createPortal } from "react-dom";

import {
  FaTimes,
  FaBookOpen,
  FaLayerGroup,
  FaSignal,
  FaClock,
  FaImage,
  FaSave,
} from "react-icons/fa";

function AddCourseModal({ show, onClose, onRefresh }) {
  const [courseName, setCourseName] = useState("");
  const [category, setCategory] = useState("Commerce");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("3 Months");

  if (!show) return null;

  const handleSave = (e) => {
    e.preventDefault();

    if (!courseName.trim()) {
      alert("Please enter Course Name");
      return;
    }

    const courseRequestDTO = {
      branchId: 1,
      name: courseName.trim(),
    };

    CourseService.saveCourse(courseRequestDTO)
      .then(() => {
        alert("Course saved successfully!");

        setCourseName("");
        setCategory("Commerce");
        setLevel("Beginner");
        setDuration("3 Months");

        if (onRefresh) onRefresh();

        onClose();
      })
      .catch((error) => {
        console.error(error);

        alert(
          error.response?.data?.message ||
          "Failed to create course."
        );
      });
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="course-modal">

        <div className="modal-header">
          <div className="modal-title">
            <h2>Add New Course</h2>
            <p>Create a new course for HintMatrix students.</p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">

          <div className="form-card">
            <h4 className="section-title">Course Information</h4>

            <div className="form-grid">

              <div className="form-group">
                <label>Course Name</label>

                <div className="input-box">
                  <FaBookOpen className="input-icon" />

                  <input
                    type="text"
                    placeholder="Enter Course Name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>

                <div className="input-box">
                  <FaLayerGroup className="input-icon" />

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Commerce">Commerce</option>
                    <option value="Professional">Professional</option>
                    <option value="School">School</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Level</label>

                <div className="input-box">
                  <FaSignal className="input-icon" />

                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Duration</label>

                <div className="input-box">
                  <FaClock className="input-icon" />

                  <input
                    type="text"
                    placeholder="3 Months"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="form-card">
            <h4 className="section-title">Course Thumbnail</h4>

            <div className="form-group">
              <label>Upload Thumbnail</label>

              <div className="input-box">
                <FaImage className="input-icon" />

                <input
                  type="file"
                  accept="image/*"
                />
              </div>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSave}
          >
            <FaSave className="me-2" />
            Save
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

export default AddCourseModal;