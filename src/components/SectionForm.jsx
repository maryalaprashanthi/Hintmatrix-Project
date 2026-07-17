import React, { useState, useEffect } from "react";
import axios from "axios";
import { saveSection, updateSection } from "../services/SectionService";

function SectionForm({ selectedSectionData, onUpdateComplete }) {
  const emptySection = {
    sectionId: "",
    courseId: "",
    sectionName: "",
    description: ""
  };

  const [section, setSection] = useState(emptySection);
  const [coursesList, setCoursesList] = useState([]); // Array state to track active PostgreSQL courses

  // 1. Fetch available global courses from your Spring Boot database on mount
  useEffect(() => {
    axios.get("http://localhost:8080/getAllCourses")
      .then((response) => {
        if (response.data) {
          setCoursesList(response.data);
        }
      })
      .catch((error) => {
        console.error("Error retrieving dynamic courses list for select menu:", error);
      });
  }, []);

  // Monitors parent triggers to inject row selection data when editing is triggered
  useEffect(() => {
    if (selectedSectionData) {
      setSection(selectedSectionData);
    } else {
      setSection(emptySection);
    }
  }, [selectedSectionData]);

  const handleChange = (e) => {
    setSection({
      ...section,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!section.courseId) {
      alert("Validation Error: Please select an associated course path from the menu!");
      return;
    }

    if (section.sectionId) {
      // Execute Named Update Operation
      updateSection(section)
        .then(() => {
          alert("Section Updated Successfully");
          clearForm();
        })
        .catch((error) => {
          console.error("Failed to update section:", error);
        });
    } else {
      // Execute Named Save Operation
      saveSection(section)
        .then(() => {
          alert("Section Saved Successfully");
          clearForm();
        })
        .catch((error) => {
          console.error("Failed to save section:", error);
        });
    }
  };

  const clearForm = () => {
    setSection(emptySection);
    if (onUpdateComplete) {
      onUpdateComplete();
    }
  };

  return (
    <div className="w-100 text-start" style={{ color: "#212529" }}>
      
      {/* 🌟 CRITICAL OVERRIDE: Protects modal input fields from transparent background overrides */}
      <style>{`
        #sectionModal .form-control, #sectionModal .form-select {
          background-color: #ffffff !important;
          background: #ffffff !important;
          color: #111827 !important;
          border: 1px solid #cbd5e1 !important;
          opacity: 1 !important;
          padding: 10px 12px;
        }
        #sectionModal .form-control:focus, #sectionModal .form-select:focus {
          background-color: #ffffff !important;
          color: #111827 !important;
        }
        #sectionModal label, #sectionModal h2 {
          color: #1e293b !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Centered Modal Header Typography */}
      <h2 className="fw-bold text-dark fs-4 mb-4 text-center">
        {section.sectionId ? "✍️ Edit Section Details" : "👥 Add New Section"}
      </h2>

      <form onSubmit={handleSubmit}>
        
        {/* Dynamic Course Select Dropdown Menu instead of raw numeric ID box */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Associated Course Curriculum</label>
          <select
            name="courseId"
            className="form-select"
            value={section.courseId}
            onChange={handleChange}
            required
          >
            <option value="">-- Choose Course Target Context --</option>
            {coursesList.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseName} (ID: {course.courseId})
              </option>
            ))}
          </select>
        </div>

        {/* Section Name Input */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Section Name</label>
          <input
            type="text"
            name="sectionName"
            placeholder="Enter Section Label (e.g. Section-A)"
            value={section.sectionName}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* Description Textarea */}
        <div className="mb-4">
          <label className="form-label small fw-semibold">Description</label>
          <textarea
            name="description"
            placeholder="Write section specifications or cohort details..."
            value={section.description}
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
            className={`btn px-4 fw-bold text-white ${section.sectionId ? "btn-success" : "btn-primary"}`}
          >
            {section.sectionId ? "Update Section" : "Save Section"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SectionForm;
