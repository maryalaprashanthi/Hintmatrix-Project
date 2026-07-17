import React, { useState, useEffect } from "react";
import axios from "axios";
import CourseService from "../services/CourseService";

function CourseForm({ selectedCourseData, onUpdateComplete }) {
  const emptyCourse = {
    courseId: "",
    branchId: "",
    courseName: "",
    description: ""
  };

  const [course, setCourse] = useState(emptyCourse);
  const [branchesList, setBranchesList] = useState([]); // Shared state array tracking PostgreSQL branch records

  // 1. Fetch available branch directories from your Spring Boot template engine on mount
  useEffect(() => {
    axios.get("http://localhost:8080/getAllBranches")
      .then((response) => {
        if (response.data) {
          setBranchesList(response.data);
        }
      })
      .catch((error) => {
        console.error("Error retrieving live branches list context:", error);
      });
  }, []);

  // Monitors parent selection signals to populate inputs during edit requests
  useEffect(() => {
    if (selectedCourseData) {
      setCourse(selectedCourseData);
    } else {
      setCourse(emptyCourse);
    }
  }, [selectedCourseData]);

  const handleChange = (e) => {
    setCourse({
      ...course,
      [e.target.name]: e.target.value
    });
  };

  const saveCourse = (e) => {
    e.preventDefault();

    if (!course.branchId) {
      alert("Validation Error: Please select an associated branch path from the menu!");
      return;
    }

    if (course.courseId) {
      // Execute PUT Update Request
      CourseService.updateCourse(course)
        .then(() => {
          alert("Course Updated Successfully");
          clearForm();
        })
        .catch((error) => {
          console.error("Error updating course:", error);
        });
    } else {
      // Execute POST Creation Request
      CourseService.saveCourse(course)
        .then(() => {
          alert("Course Saved Successfully");
          clearForm();
        })
        .catch((error) => {
          console.error("Error saving course:", error);
        });
    }
  };

  const clearForm = () => {
    setCourse(emptyCourse);
    if (onUpdateComplete) {
      onUpdateComplete();
    }
  };

  return (
    <div className="w-100 text-start" style={{ color: "#212529" }}>
      
      {/* 🌟 CRITICAL OVERRIDE: Protects modal input fields from transparent background overrides */}
      <style>{`
        #courseModal .form-control, #courseModal .form-select {
          background-color: #ffffff !important;
          background: #ffffff !important;
          color: #111827 !important;
          border: 1px solid #cbd5e1 !important;
          opacity: 1 !important;
          padding: 10px 12px;
        }
        #courseModal .form-control:focus, #courseModal .form-select:focus {
          background-color: #ffffff !important;
          color: #111827 !important;
        }
        #courseModal label, #courseModal h2 {
          color: #1e293b !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Centered Modal Header Typography */}
      <h2 className="fw-bold text-dark fs-4 mb-4 text-center">
        {course.courseId ? "✍️ Edit Course Details" : "📘 Add New Course"}
      </h2>

      <form onSubmit={saveCourse}>
        
        {/* Dynamic Branch Dropdown Selector */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-dark">Associated Branch Department</label>
          <select
            name="branchId"
            className="form-select"
            value={course.branchId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Branch Assignment --</option>
            {branchesList.map((branch) => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName} (ID: {branch.branchId})
              </option>
            ))}
          </select>
        </div>

        {/* Course Name Input */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-dark">Course Name</label>
          <input
            type="text"
            name="courseName"
            placeholder="Enter Course Title (e.g. Java Full Stack)"
            value={course.courseName}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* Description Input */}
        <div className="mb-4">
          <label className="form-label small fw-semibold text-dark">Description</label>
          <textarea
            name="description"
            placeholder="Write clear course specifications or syllabus curriculum details..."
            value={course.description}
            onChange={handleChange}
            className="form-control"
            rows="4"
          />
        </div>

        {/* Standardized Side-By-Side Control Footer Buttons */}
        <div className="d-flex gap-2 justify-content-end pt-2">
          <button
            type="button"
            className="btn btn-outline-secondary px-4 fw-semibold"
            data-bs-dismiss="modal"
            onClick={clearForm}
          >
            Close
          </button>
          
          <button
            type="submit"
            className={`btn px-4 fw-bold text-white ${course.courseId ? "btn-success" : "btn-primary"}`}
          >
            {course.courseId ? "Update Course" : "Save Course"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CourseForm;
