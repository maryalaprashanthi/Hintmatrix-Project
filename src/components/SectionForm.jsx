import React, { useState, useEffect } from "react";
import axios from "axios";
import SectionService from "../services/SectionService";

import {
  FaCodeBranch,
  FaLayerGroup,
  FaAlignLeft,
  FaSave
} from "react-icons/fa";

function SectionForm({
  selectedSectionData,
  onUpdateComplete,
  onCancel
}) {

  const emptySection = {
    sectionId: "",
    branchId: "",
    sectionName: "",
    description: ""
  };

  const [section, setSection] = useState(emptySection);
  const [branchesList, setBranchesList] = useState([]);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = () => {
    axios
      .get("http://localhost:8080/api/branch", {
        withCredentials: true,
      })
      .then((response) => {
        setBranchesList(response.data || []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (selectedSectionData) {
      setSection({
        sectionId: selectedSectionData.sectionId || "",
        branchId: selectedSectionData.branchId || "",
        sectionName: selectedSectionData.sectionName || "",
        description: selectedSectionData.description || ""
      });
    } else {
      setSection(emptySection);
    }
  }, [selectedSectionData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSection({
      ...section,
      [name]: name === "branchId"
        ? (value === "" ? "" : Number(value))
        : value
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

    if (!section.branchId) {
      alert("Please select a branch.");
      return;
    }

    const requestDTO = {
      branchId: section.branchId,
      sectionName: section.sectionName,
      description: section.description
    };

    if (section.sectionId) {
      SectionService.updateSection(
        section.sectionId,
        requestDTO
      )
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

        <h3 className="section-title">
          Section Information
        </h3>

        <div className="form-grid">

          {/* Branch */}

          <div className="form-group">

            <label>
              Course <span>*</span>
            </label>

            <div className="input-box">

              <FaCodeBranch className="input-icon" />

              <select
                name="courseId"
                value={section.branchId}
                onChange={handleChange}
              >

                <option value="">
                  Select Course
                </option>

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

        </div>

      </div>

      <div className="form-card">

        <h3 className="section-title">
          Description
        </h3>

        <div className="textarea-box">

          <FaAlignLeft className="input-icon" />

          <textarea
            name="description"
            placeholder="Enter Section Description"
            value={section.description}
            onChange={handleChange}
          />

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