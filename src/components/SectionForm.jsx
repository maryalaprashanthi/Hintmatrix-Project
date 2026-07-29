import React, { useState, useEffect } from "react";
import axios from "axios";
import SectionService from "../services/SectionService";

import {
  FaCodeBranch,
  FaLayerGroup,
  FaAlignLeft,
  FaSave,
} from "react-icons/fa";

function SectionForm({ selectedSectionData, onUpdateComplete, onCancel }) {
 const emptySection = {
  sectionId: "",
  courseId: "",
  sectionName: "",
  description: "",
};

  const [section, setSection] = useState(emptySection);
  const [coursesList, setCoursesList] = useState([]);

  /* ===============================
      LOAD BRANCHES
  =============================== */

  useEffect(() => {
    loadCourses();
  }, []);

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
  courseId: selectedSectionData.courseId || "",
  sectionName: selectedSectionData.sectionName || "",
  description: selectedSectionData.description || "",
});
    } else {
      setSection(emptySection);
    }
  }, [selectedSectionData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "courseId") {
      setSection({
        ...section,
        courseId: value === "" ? "" : Number(value),
      });

      return;
    }

    setSection({
      ...section,
      [name]: name === "branchId" ? (value === "" ? "" : Number(value)) : value,
    });
  };

  const clearForm = () => {
    setSection(emptySection);

    if (onUpdateComplete) {
      onUpdateComplete();
    }
  };

  const saveSection = (e) => {
    e.preventDefault();

    if (!section.courseId) {
      alert("Please select an associate course.");
      return;
    }

    const requestDTO = {
  courseId: section.courseId,
  sectionName: section.sectionName,
  description: section.description,
};

    if (section.sectionId) {
      SectionService.updateSection(section.sectionId, requestDTO)
        .then(() => {
          alert("Section Updated Successfully");
          clearForm();
        })
        .catch(console.error);
    } else {
      SectionService.saveSection(requestDTO)
        .then(() => {
          alert("Section Saved Successfully");
          clearForm();
        })
        .catch(console.error);
    }
  };

  return (
    <form onSubmit={saveSection}>
      <div className="form-card">
        <h3 className="section-title">Section Information</h3>

        <div className="form-grid">
          {/* course*/}

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
                <option value="">Select Course</option>

                {coursesList.map((course) => (
                  <option
                    //  FIXED: Gracefully checks all common backend ID variants
                    key={course.courseId || course.id}
                    value={course.courseId || course.id}
                  >
                    {/* FIXED: Changed from course.courseName to course.name to match your Java DTO string model property fields */}
                    {course.name || course.title || course.courseName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section Name */}

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
              />
            </div>
          </div>

          <div className="form-group description-group">
    <label>
        Description <span>*</span>
    </label>

    <div className="textarea-box">
        <FaAlignLeft className="input-icon" />

        <textarea
            name="description"
            placeholder="Enter Description"
            value={section.description}
            onChange={handleChange}
            rows={4}
            required
        />
    </div>
</div>
        </div>
      </div>

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
