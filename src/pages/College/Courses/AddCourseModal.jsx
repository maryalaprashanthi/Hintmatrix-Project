import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";

import {
  FaBook,
  FaLayerGroup,
  FaSignal,
  FaClock,
  FaImage,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import "./AddCourseModal.css";

import BranchService from "../../../services/BranchService";
import CollegeService from "../../../services/CollegeService";

function AddCourseModal({ show, onClose, onSave, selectedCourseData }) {
  const [courseName, setCourseName] = useState("");
  const [category, setCategory] = useState("Commerce");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("3 Months");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [colleges, setColleges] = useState([]);
  const [collegeId, setCollegeId] = useState("");

  const [activeRow, setActiveRow] = useState(true);

  useEffect(() => {
    CollegeService.getAllColleges()
      .then((response) => {
        console.log("College API Response:", response.data);

        const activeColleges = (response.data || []).filter((college) => {
          return (
            college.activeRow === true ||
            college.activeRow === 1 ||
            college.active === true ||
            college.status === 1
          );
        });

        console.log("Active Colleges:", activeColleges);

        setColleges(activeColleges);
      })
      .catch((error) => {
        console.error("Failed to load colleges:", error);
      });
  }, []);

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

  const resetForm = () => {
    setCourseName("");
    setCategory("Commerce");
    setLevel("Beginner");
    setDuration("3 Months");
    setDescription("");
    setThumbnail(null);

    setCollegeId("");
    setBranchId("");

    setActiveRow(true);
  };

  useEffect(() => {
    if (selectedCourseData) {
      setCourseName(selectedCourseData.name || selectedCourseData.title || "");

      setCategory(selectedCourseData.category || "Commerce");

      setLevel(selectedCourseData.level || "Beginner");

      setDuration(selectedCourseData.duration || "3 Months");

      setDescription(selectedCourseData.description || "");

      setActiveRow(selectedCourseData.activeRow ?? true);

      if (selectedCourseData.collegeId) {
        setCollegeId(String(selectedCourseData.collegeId));
      }

      // Existing branch mapping

      if (selectedCourseData.branchId) {
        setBranchId(String(selectedCourseData.branchId));
      } else if (selectedCourseData.branch?.branchId) {
        setBranchId(String(selectedCourseData.branch.branchId));
      }
    } else {
      resetForm();
    }
  }, [selectedCourseData, show]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!courseName.trim()) {
      alert("Please enter Course Name.");
      return;
    }

    if (!collegeId) {
      alert("Please select college.");
      return;
    }

    if (!branchId) {
      alert("Please select branch.");
      return;
    }

    const courseRequestDTO = {
      collegeId: Number(collegeId),
      branchId: Number(branchId),
      name: courseName.trim(),
      activeRow: activeRow,
    };

    const isEdit = selectedCourseData?.courseId || selectedCourseData?.id;
    const courseId = selectedCourseData?.courseId || selectedCourseData?.id;
    try {
      await onSave(courseRequestDTO, isEdit, courseId);

      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const collegeOptions = colleges.map((college) => ({
    value: college.collegeId,

    label: college.instituteName,
  }));
  // Filter branch based on college

  const filteredBranches = branches.filter((branch) => {
    if (!collegeId) return false;

    return (
      String(branch.collegeId) === String(collegeId) ||
      String(branch.college?.collegeId) === String(collegeId)
    );
  });

  const filteredBranchOptions = filteredBranches.map((branch) => ({
    value: String(branch.branchId || branch.id),
    label: branch.branchName || branch.name,
  }));

  if (!show) return null;

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
              {/* College */}

              <div className="form-group">
                <label>College Name</label>

                <div className="input-box">
                  <FaLayerGroup className="input-icon" />
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPlacement="bottom"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    options={collegeOptions}
                    value={collegeOptions.find(
                      (item) => String(item.value) === String(collegeId),
                    )}
                    onChange={(selected) => {
                      setCollegeId(selected ? String(selected.value) : "");
                      setBranchId("");
                    }}
                    placeholder="Search College..."
                    isSearchable
                    isClearable
                  />
                </div>
              </div>

              {/* Branch */}

              <div className="form-group">
                <label>Branch Name</label>

                <div className="input-box">
                  <FaLayerGroup className="input-icon" />
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={filteredBranchOptions}
                    value={filteredBranchOptions.find(
                      (item) => String(item.value) === String(branchId),
                    )}
                    onChange={(selected) => {
                      setBranchId(selected ? String(selected.value) : "");
                    }}
                    placeholder="Search Branch..."
                    isSearchable
                    isClearable
                  />
                </div>
              </div>

              {/* Course Name */}

              <div className="form-group">
                <label>Course Name</label>

                <div className="input-box">
                  <FaBook className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter Course Name"
                    value={courseName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setCourseName(value);
                    }}
                  />
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

          <div className="card-box">
            <h4>Status</h4>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={activeRow}
                onChange={(e) => setActiveRow(e.target.checked)}
              />
              <label className="form-check-label">Active</label>
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
