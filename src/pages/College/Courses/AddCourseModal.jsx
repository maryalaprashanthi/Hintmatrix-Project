import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import {
  FaBook,
  FaLayerGroup,
  FaSignal,
  FaClock,
  FaFileAlt,
  FaImage,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import "./AddCourseModal.css";

import BranchService from "../../../services/BranchService";
import CourseService from "../../../services/CourseService";

function AddCourseModal({ show, onClose, onRefresh, selectedCourseData }) {
  const [courseName, setCourseName] = useState("");
  const [category, setCategory] = useState("Commerce");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("3 Months");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  // Load branches
  useEffect(() => {
    BranchService.getAllBranches()
      .then((response) => {
        setBranches(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to load branches:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedCourseData) {
      setCourseName(selectedCourseData.name || selectedCourseData.title || "");

      setCategory(selectedCourseData.category || "Commerce");

      setLevel(selectedCourseData.level || "Beginner");

      setDuration(selectedCourseData.duration || "3 Months");

      setDescription(selectedCourseData.description || "");

      // Existing branch mapping

      if (selectedCourseData.branchId) {
        setBranchId(selectedCourseData.branchId);
      } else if (selectedCourseData.branch?.branchId) {
        setBranchId(selectedCourseData.branch.branchId);
      }
    } else {
      setCourseName("");
      setCategory("Commerce");
      setLevel("Beginner");
      setDuration("3 Months");
      setDescription("");
      setThumbnail(null);
      setBranchId("");
    }
  }, [selectedCourseData, show]);

  if (!show) return null;

  const handleSave = (e) => {
    e.preventDefault();

    if (!courseName.trim()) {
      alert("Please enter Course Name.");
      return;
    }

    if (!branchId) {
      alert("Please select branch.");
      return;
    }

    const courseRequestDTO = {
      branchId: Number(branchId),
      name: courseName.trim(),
    };

    const isEdit = selectedCourseData?.courseId || selectedCourseData?.id;

    const courseId = selectedCourseData?.courseId || selectedCourseData?.id;

    const apiCall = isEdit
      ? CourseService.updateCourse(courseId, courseRequestDTO)
      : CourseService.saveCourse(courseRequestDTO);

    apiCall
      .then((response) => {
        if (response.data && typeof response.data === "string") {
          alert(response.data);
        } else {
          alert(
            isEdit
              ? "Course updated successfully!"
              : "Course saved successfully!",
          );
        }

        setCourseName("");
        setCategory("Commerce");
        setLevel("Beginner");
        setDuration("3 Months");
        setDescription("");
        setThumbnail(null);
        setBranchId("");

        if (onRefresh) {
          onRefresh();
        }

        onClose();
      })
      .catch((error) => {
        console.error(error);

        alert(error.response?.data?.message || "Failed to save course.");
      });
  };
  return createPortal(
    <div className="modal-overlay">
      <div className="course-modal">
        {/* Header */}

        <div className="modal-header">
          <div className="modal-title">
            <h2>{selectedCourseData ? "Edit Course" : "Add New Course"}</h2>

            <p>
              {selectedCourseData
                ? "Update course details."
                : "Create a new course for HintMatrix students."}
            </p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}

        <div className="modal-body">
          <div className="card-box">
            <h4>Course Information</h4>

            <div className="form-grid">
              {/* Course Name */}

              <div className="form-group">
                <label>Course Name</label>

                <div className="input-box">
                  <FaBook className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter Course Name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                  />
                </div>
              </div>

              {/* Branch */}

              <div className="form-group">
                <label>Branch Name</label>

                <div className="input-box">
                  <FaLayerGroup className="input-icon" />

                  <select
                    className="form-select"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    <option value="">Select Branch</option>

                    {branches.map((branch) => (
                      <option
                        key={branch.branchId || branch.id}
                        value={branch.branchId || branch.id}
                      >
                        {branch.branchName || branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}

              <div className="form-group">
                <label>Category</label>

                <div className="input-box">
                  <FaLayerGroup className="input-icon" />

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
              </div>

              {/* Level */}

              <div className="form-group">
                <label>Level</label>

                <div className="input-box">
                  <FaSignal className="input-icon" />

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
              </div>

              {/* Duration */}

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

          {/* Thumbnail */}

          <div className="card-box">
            <h4>Course Thumbnail</h4>

            <div className="input-box">
              <FaImage className="input-icon" />

              <input
                type="file"
                onChange={(e) => setThumbnail(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="modal-footer d-flex justify-content-end gap-3">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            <FaSave className="me-2" />

            {selectedCourseData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>,

    document.body,
  );
}

export default AddCourseModal;
