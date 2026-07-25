import React, { useState } from "react"; // 🌟 FIXED: Imported useState for tracking inputs
import "./AddCourseModal.css";
import CourseService from "../../../services/CourseService";
import { createPortal } from "react-dom";

function AddCourseModal({ show, onClose, onRefresh }) {
  // 🌟 FIXED: Created tracking state hooks for your form data
  const [courseName, setCourseName] = useState("");
  const [category, setCategory] = useState("Commerce");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("3 Months");
  const [description, setDescription] = useState("");

  if (!show) return null;

  // 🌟 FIXED: Added database pipeline orchestrator matching your CourseRequestDTO signatures
  const handleSave = (e) => {
    e.preventDefault();

    if (!courseName.trim()) {
      alert("Please fill in the Course Name.");
      return;
    }

    const courseRequestDTO = {
      branchId: 1, // Satisfies backend @NotNull validation requirement
      name: courseName.trim() // Changed 'courseName' to 'name' to pass Spring Boot validation constraints
    };

    CourseService.saveCourse(courseRequestDTO)
      .then(() => {
        alert("Course saved successfully to database!");
        
        // Reset state variables cleanly
        setCourseName("");
        setCategory("Commerce");
        setLevel("Beginner");
        setDuration("3 Months");
        setDescription("");

        if (onRefresh) onRefresh(); // Dynamically reloads data on main screen grid live
        onClose(); // Close modal window
      })
      .catch((error) => {
        console.error("Backend error creating course record:", error);
        alert(error.response?.data?.message || "Failed to create new course.");
      });
  };


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
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Commerce">Commerce</option>
                  <option value="Professional">Professional</option>
                  <option value="School">School</option>
                </select>
              </div>

              <div className="form-group">
                <label>Level</label>
                <select 
                  className="form-select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="3 Months"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
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

        </div>

      </div>,
    document.body
  );
}

export default AddCourseModal;
