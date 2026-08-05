import React, { useState, useEffect } from "react";
import Select from "react-select";

import CollegeService from "../services/CollegeService";
import BranchService from "../services/BranchService";
import CourseService from "../services/CourseService";

import {
  FaCodeBranch,
  FaLayerGroup,
  FaAlignLeft,
  FaSave,
  FaUniversity,
} from "react-icons/fa";

function SectionForm({ selectedSectionData, onSave, onCancel }) {
  const emptySection = {
    sectionId: "",
    collegeId: "",
    branchId: "",
    courseId: "",
    sectionName: "",
    description: "",
    activeRow: true,
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
        const activeColleges = (response.data || []).filter(
          (college) =>
            college.activeRow === true || college.activeRow === "true",
        );
        setCollegesList(activeColleges);
      })
      .catch(console.error);
  };

  
  const loadBranches = () => {
    BranchService.getAllBranches()
      .then((response) => {
        const activeBranches = (response.data || []).filter(
          (branch) => branch.activeRow === true || branch.activeRow === "true",
        );
        setBranchesList(activeBranches);
      })
      .catch(console.error);
  };

  
  const loadCourses = () => {
    CourseService.getAllCourses()
      .then((response) => {
        const activeCourses = (response.data || []).filter(
          (course) => course.activeRow === true || course.activeRow === "true",
        );
        setCoursesList(activeCourses);
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
        activeRow:
          selectedSectionData.activeRow === false ||
          selectedSectionData.activeRow === "false"
            ? false
            : true,
      });
    } else {
      setSection(emptySection);
    }
  }, [selectedSectionData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSection({
      ...section,
      [name]: value,
    });
  };

  const collegeOptions = collegesList.map((college) => ({
    value: college.collegeId,
    label: college.instituteName,
  }));

  const branchOptions = branchesList
    .filter(
      (branch) => !section.collegeId || branch.collegeId === section.collegeId,
    )
    .map((branch) => ({
      value: branch.branchId,
      label: branch.branchName,
    }));

  const courseOptions = coursesList
    .filter(
      (course) =>
        !section.branchId ||
        Number(course.branchId) === Number(section.branchId),
    )
    .map((course) => ({
      value: course.courseId ?? course.id,
      label: course.courseName ?? course.name ?? course.title,
    }));

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
      activeRow: section.activeRow,
    };

    onSave(requestDTO, section.sectionId);
    setSection(emptySection);
  };

  return (
    <form onSubmit={saveSection}>
      <div className="form-card">
        <h3 className="section-title">Section Information</h3>

        <div className="form-grid">
          {/* College Selection Dropdown */}
          <div className="form-group">
            <label className="form-label fw-semibold">
              College <span className="text-danger">*</span>
            </label>
            <div className="select-box">
              <FaUniversity className="select-icon" />
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={collegeOptions}
                value={
                  collegeOptions.find(
                    (option) => option.value === section.collegeId,
                  ) || null
                }
                onChange={(option) =>
                  setSection({
                    ...section,
                    collegeId: option?.value || "",
                    branchId: "",
                    courseId: "",
                  })
                }
                placeholder="Search College"
                isSearchable
                isClearable
                noOptionsMessage={() => "No active college found"}
              />
            </div>
          </div>

          {/* Branch Selection Dropdown */}
          <div className="form-group">
            <label className="form-label fw-semibold">
              Branch <span className="text-danger">*</span>
            </label>
            <div className="select-box">
              <FaCodeBranch className="select-icon" />
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={branchOptions}
                value={
                  branchOptions.find(
                    (option) => option.value === section.branchId,
                  ) || null
                }
                onChange={(option) =>
                  setSection({
                    ...section,
                    branchId: option?.value || "",
                    courseId: "",
                  })
                }
                placeholder="Search Branch"
                isSearchable
                isClearable
                isDisabled={!section.collegeId}
                noOptionsMessage={() => "No active branch found"}
              />
            </div>
          </div>

          {/* Course Selection Dropdown */}
          <div className="form-group">
            <label className="form-label fw-semibold">
              CourseId <span className="text-danger">*</span>
            </label>
            <div className="select-box">
              <FaCodeBranch className="select-icon" />
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={courseOptions}
                value={
                  courseOptions.find(
                    (option) => option.value === section.courseId,
                  ) || null
                }
                onChange={(option) =>
                  setSection({
                    ...section,
                    courseId: option?.value || "",
                  })
                }
                placeholder="Search Course"
                isSearchable
                isClearable
                isDisabled={!section.branchId}
                noOptionsMessage={() => "No active course found"}
              />
            </div>
          </div>

          {/* Section Name Input */}
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
                onChange={(e) =>
                  setSection({
                    ...section,
                    sectionName: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="form-card">
        <h3 className="section-title">Description</h3>
        <div className="textarea-box">
          <FaAlignLeft className="input-icon" />
          <textarea
            name="description"
            placeholder="Enter Description"
            value={section.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>

     
      <div className="form-card">
        <h3 className="section-title">Status</h3>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={section.activeRow}
            onChange={(e) =>
              setSection({
                ...section,
                activeRow: e.target.checked,
              })
            }
          />
          <label className="form-check-label">Active</label>
        </div>
      </div>

      {/* Footer Buttons Section */}
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          <FaSave className="me-2" />
          Save
        </button>
      </div>
    </form>
  );
}

export default SectionForm;
