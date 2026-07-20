import React, { useState, useEffect } from "react";
import axios from "axios";
import CourseService from "../services/CourseService";
import BranchService from "../services/BranchService"; 

function CourseForm({ selectedCourseData, onUpdateComplete, onCloseModal }) {
  const emptyCourse = {
    courseId: "",
    branchId: "",
    name: "" 
  };

  const [course, setCourse] = useState(emptyCourse);
  const [branchesList, setBranchesList] = useState([]); 

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = () => {
    axios.get("http://localhost:8080/api/branch", { withCredentials: true })
      .then((response) => {
        if (response.data) {
          setBranchesList(response.data);
        }
      })
      .catch((error) => {
        console.error("Error retrieving live branches list:", error);
      });
  };

  useEffect(() => {
    if (selectedCourseData) {
      setCourse({
        courseId: selectedCourseData.courseId || "",
        branchId: selectedCourseData.branchId || "",
        name: selectedCourseData.name || "" 
      });
    } else {
      setCourse(emptyCourse);
    }
  }, [selectedCourseData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "branchId") {
      setCourse({ ...course, [name]: value === "" ? "" : Number(value) });
      return;
    }
    setCourse({ ...course, [name]: value });
  };

  const handleInlineBranchEdit = () => {
    if (!course.branchId) {
      alert("Please select a branch to modify!");
      return;
    }
    alert(`To modify Branch ID: ${course.branchId}, please shift over to the Branch Management dashboard.`);
  };

  const handleInlineBranchDelete = () => {
    if (!course.branchId) {
      alert("Please select a branch to remove!");
      return;
    }
    if (window.confirm("Are you sure you want to completely remove this branch?")) {
      BranchService.deleteBranch(course.branchId)
        .then(() => {
          alert("Branch Deleted Successfully");
          setCourse({ ...course, branchId: "" });
          loadBranches(); 
          if (onUpdateComplete) onUpdateComplete();
        })
        .catch((err) => console.error("Failed to execute delete:", err));
    }
  };

  const saveCourse = (e) => {
    e.preventDefault();
    if (!course.branchId) {
      alert("Please select an associated branch department!");
      return;
    }

    const courseRequestDTO = {
      branchId: course.branchId,
      name: course.name
    };

    if (course.courseId) {
      CourseService.updateCourse(course.courseId, courseRequestDTO)
        .then(() => {
          alert("Course Updated Successfully");
          clearForm();
        })
        .catch((error) => console.error(error));
    } else {
      CourseService.saveCourse(courseRequestDTO)
        .then(() => {
          alert("Course Saved Successfully");
          clearForm();
        })
        .catch((error) => console.error(error));
    }
  };

  const clearForm = () => {
    setCourse(emptyCourse);
    if (onUpdateComplete) onUpdateComplete();
    if (onCloseModal) onCloseModal();
  };

  return (
    <div className="w-100 text-start" id="courseModalContainer" style={{ color: "#212529" }}>
      
      <style>{`
        #courseModalContainer .form-control, 
        #courseModalContainer .form-select {
          background-color: #ffffff !important;
          color: #111827 !important;
          border: 1px solid #cbd5e1 !important;
          padding: 10px 14px;
          height: 48px;
          border-radius: 6px;
          font-size: 15px;
          width: 100%;
        }
        #courseModalContainer .form-control:focus, 
        #courseModalContainer .form-select:focus {
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15) !important;
          border-color: #0d6efd !important;
        }
        #courseModalContainer label {
          color: #1e293b !important;
          font-weight: 600;
          font-size: 15px;
          line-height: 1.3;
        }
        
        /* 🛠 FIX: Forces action items to keep clear boundaries without compressing dropdown elements */
        .input-btn-group {
          display: flex;
          gap: 10px;
          width: 100%;
          align-items: center;
        }
        .flex-dropdown-wrapper {
          flex: 1;
          min-width: 0; 
        }
        .btn-fixed-action {
          font-weight: 500;
          font-size: 14px;
          height: 48px;
          width: 80px; 
          flex-shrink: 0; 
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-footer {
          height: 48px;
          font-weight: 600;
          padding: 0 32px;
          border-radius: 6px;
        }
      `}</style>

      <h2 className="fw-bold text-dark fs-4 mb-4 text-center d-flex align-items-center justify-content-center gap-2">
        <span>{course.courseId ? "✏️" : "🟦"}</span> 
        {course.courseId ? "Edit Course Details" : "Add New Course"}
      </h2>

      <form onSubmit={saveCourse}>
        
        {/* Row 1: Dropdown Selector Column Setup */}
        <div className="row mb-4 align-items-center">
          <label className="col-sm-4 col-form-label">
            Associated Branch Department
          </label>
          <div className="col-sm-8">
            <div className="input-btn-group">
              <div className="flex-dropdown-wrapper">
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
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn btn-outline-primary btn-fixed-action"
                onClick={handleInlineBranchEdit}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-fixed-action"
                onClick={handleInlineBranchDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Standard Title Fields Setup */}
        <div className="row mb-4 align-items-center">
          <label className="col-sm-4 col-form-label">
            Course Name
          </label>
          <div className="col-sm-8">
            <input
              type="text"
              name="name"
              placeholder="Enter Course Title (e.g. Java Full Stack)"
              value={course.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
        </div>
                                                // here we need to add description .....
        {/* Form Execution Confirmation Area */}
        <div className="d-flex justify-content-center gap-3 mt-4 pt-2">
          <button
            type="button"
            className="btn btn-secondary btn-footer"
            onClick={clearForm}
            style={{ backgroundColor: "#64748b", border: "none" }}
          >
            Close
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-footer fw-bold text-white"
            style={{ backgroundColor: "#0d6efd", border: "none" }}
          >
            {course.courseId ? "Update Course" : "Save Course"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CourseForm;
