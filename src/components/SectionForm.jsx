import React, { useState, useEffect } from "react";
import axios from "axios";
import SectionService from "../services/SectionService";
import BranchService from "../services/BranchService";

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

  /* ===============================
      LOAD BRANCHES
  =============================== */

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
      .catch((error) => {
        console.error(error);
      });
  };

  /* ===============================
      EDIT MODE
  =============================== */

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

  /* ===============================
      HANDLE CHANGE
  =============================== */

  const handleChange = (e) => {

    const { name, value } = e.target;

    if (name === "branchId") {

      setSection({
        ...section,
        branchId: value === "" ? "" : Number(value)
      });

      return;
    }

    setSection({
      ...section,
      [name]: value
    });

  };

  /* ===============================
      SAVE / UPDATE
  =============================== */

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

  /* ===============================
      CLEAR FORM
  =============================== */

  const clearForm = () => {

    setSection(emptySection);

    if (onUpdateComplete) {
      onUpdateComplete();
    }

  };

  return (

    <form onSubmit={saveSection}>

      {/* Branch Information Card */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-4">

            Section Information

          </h5>

          <div className="row g-3">

            {/* Branch */}

            <div className="col-md-6">

              <label className="form-label fw-semibold">

                Branch
                <span className="text-danger">
                  *
                </span>

              </label>

              <div className="input-group">

                <span className="input-group-text">

                  <FaCodeBranch />

                </span>

                <select
                  className="form-select"
                  name="branchId"
                  value={section.branchId}
                  onChange={handleChange}
                  required
                >

                  <option value="">

                    Select Branch

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

            <div className="col-md-6">

              <label className="form-label fw-semibold">

                Section Name
                <span className="text-danger">
                  *
                </span>

              </label>

              <div className="input-group">

                <span className="input-group-text">

                  <FaLayerGroup />

                </span>

                <input
                  type="text"
                  className="form-control"
                  name="sectionName"
                  placeholder="Enter Section Name"
                  value={section.sectionName}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>
                        {/* Description */}

            <div className="col-12">

              <label className="form-label fw-semibold">
                Description
              </label>

              <div className="input-group">

                <span className="input-group-text align-items-start pt-3">
                  <FaAlignLeft />
                </span>

                <textarea
                  className="form-control"
                  name="description"
                  rows="4"
                  placeholder="Enter Section Description"
                  value={section.description}
                  onChange={handleChange}
                ></textarea>

              </div>

            </div>

          </div>

        </div>

      </div>
      
      {/* Footer */}

      <div className="mt-4 d-flex justify-content-end gap-2">
  <button type="button" className="btn btn-secondary">
    Cancel
  </button>

  <button type="submit" className="btn btn-primary">
    Save
  </button>
</div>

    </form>

  );

}

export default SectionForm;