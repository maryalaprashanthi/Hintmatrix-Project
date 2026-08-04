import React, { useState, useEffect } from "react";
import axios from "axios";

import CollegeService from "../services/CollegeService";
import BranchService from "../services/BranchService";

import {
  FaCodeBranch,
  FaLayerGroup,
  FaAlignLeft,
  FaSave,
} from "react-icons/fa";

function SectionForm({ selectedSectionData, onSave, onCancel }) {

  const emptySection = {
  sectionId: "",
  collegeId: "",
  branchId: "",
  courseId: "",
  sectionName: "",
  description: "",
};

  const [section, setSection] = useState(emptySection);
  const [coursesList, setCoursesList] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
const [branchesList, setBranchesList] = useState([]);

  useEffect(() => {
    loadColleges();
    loadBranches();
    loadCourses();
  }, []);

  const loadColleges = () => {
  CollegeService.getAllColleges()
    .then((response) => {
      setCollegesList(response.data || []);
    })
    .catch(console.error);
};

const loadBranches = () => {
  BranchService.getAllBranches()
    .then((response) => {
      setBranchesList(response.data || []);
    })
    .catch(console.error);
};

  const loadCourses = () => {
    axios
      .get("http://localhost:8080/api/course", {
        withCredentials: true,
      })
      .then((response) => {
        setCoursesList(response.data || []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (selectedSectionData) {
      setSection({
    sectionId: selectedSectionData.sectionId || "",
    collegeId: Number(selectedSectionData.collegeId) || "",
    branchId: Number(selectedSectionData.branchId) || "",
    courseId: Number(selectedSectionData.courseId) || "",
    sectionName: selectedSectionData.sectionName || "",
    description: selectedSectionData.description || "",
});
    } else {
      setSection(emptySection);
    }
  }, [selectedSectionData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
    name === "collegeId" ||
    name === "branchId" ||
    name === "courseId"
) {
    setSection({
        ...section,
        [name]: value === "" ? "" : Number(value),
    });

    return;
}

    setSection({
      ...section,
      [name]: value,
    });
  };

  const saveSection = (e) => {
    e.preventDefault();

    if (!section.collegeId) {
    alert("Please select college.");
    return;
}

if (!section.branchId) {
    alert("Please select branch.");
    return;
}

    if (!section.courseId) {
      alert("Please select an associate course.");
      return;
    }

    const requestDTO = {
    collegeId: section.collegeId,
    branchId: section.branchId,
    courseId: section.courseId,
    sectionName: section.sectionName,
    description: section.description,
};

    onSave(requestDTO, section.sectionId);

    setSection(emptySection);
  };

  return (
    <form onSubmit={saveSection}>

      <div className="form-card">

        <h3 className="section-title">
          Section Information
        </h3>

        <div className="form-grid">

          <div className="form-group">
    <label className="form-label fw-semibold">
        College
        <span className="text-danger">*</span>
    </label>

    <div className="input-box">
        <FaCodeBranch className="input-icon" />

        <select
            className="form-select"
            name="collegeId"
            value={section.collegeId}
            onChange={handleChange}
            required
        >
            <option value="">Select College</option>

            {collegesList.map((college) => (
                <option
                    key={college.collegeId}
                    value={college.collegeId}
                >
                    {college.instituteName}
                </option>
            ))}
        </select>
    </div>
</div>

<div className="form-group">
    <label className="form-label fw-semibold">
        Branch
        <span className="text-danger">*</span>
    </label>

    <div className="input-box">
        <FaCodeBranch className="input-icon" />

        <select
            className="form-select"
            name="branchId"
            value={section.branchId}
            onChange={handleChange}
            required
        >
            <option value="">Select Branch</option>

            {branchesList.map((branch) => (
                <option
                    key={branch.branchId}
                    value={branch.branchId}
                >
                    {branch.branchName}
                </option>
            ))}
        </select>
    </div>
</div>

          <div className="form-group">
            <label className="form-label fw-semibold">
              CourseId
              <span className="text-danger">*</span>
            </label>

            <div className="input-box">
              <FaCodeBranch className="input-icon" />

              <select
                className="form-select"
                name="courseId"
                value={section.courseId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Course
                </option>

                {coursesList.map((course) => (
                  <option
                    key={course.courseId || course.id}
                    value={course.courseId || course.id}
                  >
                    {course.name || course.title || course.courseName}
                  </option>
                ))}

              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              Section Name <span>*</span>
            </label>

            <div className="input-box">
              <FaLayerGroup className="input-icon" />

              <input
                type="text"
                name="sectionName"
                placeholder="Enter Section Name"
                value={section.sectionName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group description-group">
            <label>Description</label>

            <div className="textarea-box">
              <FaAlignLeft className="input-icon" />

              <textarea
                name="description"
                placeholder="Enter Description"
                value={section.description}
                onChange={handleChange}
                rows={4}
                
              />
            </div>
          </div>

        </div>

      </div>

      <div className="modal-footer">

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary"
        >
          <FaSave className="me-2" />
          Save
        </button>

      </div>

    </form>
  );
}

export default SectionForm;