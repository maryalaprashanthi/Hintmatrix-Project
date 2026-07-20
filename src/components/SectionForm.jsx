import React, { useState, useEffect } from "react";
import axios from "axios";
import SectionService from "../services/SectionService";
import BranchService from "../services/BranchService"; 

function SectionForm({ selectedSectionData, onUpdateComplete }) {
  const emptySection = {
    sectionId: "",
    branchId: "",
    sectionName: "",
    description: ""
  };

  const [section, setSection] = useState(emptySection);
  const [branchesList, setBranchesList] = useState([]);

  /* ==============================
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
        console.error("Error retrieving dynamic branches list:", error);
      });
  };

  /* ==============================
          EDIT DATA
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

  /* ==============================
        HANDLE CHANGE
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "branchId") {
      setSection({
        ...section,
        branchId: value === "" ? "" : Number(value),
      });
      return;
    }

    setSection({
      ...section,
      [name]: value,
    });
  };

  /* ==============================
      INLINE EDIT BRANCH
  =============================== */
  const handleInlineBranchEdit = () => {
    if (!section.branchId) {
      alert("Please select a branch department.");
      return;
    }
    alert(`Open Branch Module to edit Branch ID : ${section.branchId}`);
  };

  /* ==============================
      INLINE DELETE BRANCH
  =============================== */
  const handleInlineBranchDelete = () => {
    if (!section.branchId) {
      alert("Please select a branch department.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this branch selection and all its sections?")) {
      BranchService.deleteBranch(section.branchId)
        .then(() => {
          alert("Branch deleted successfully.");
          loadBranches();
          setSection({ ...section, branchId: "" });
          if (onUpdateComplete) onUpdateComplete();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  /* ==============================
          SAVE / UPDATE
  =============================== */
  const saveSection = (e) => {
    e.preventDefault();

    if (!section.branchId) {
      alert("Validation Error: Please select an associated branch path from the menu!");
      return;
    }

    const sectionRequestDTO = {
      branchId: section.branchId,
      sectionName: section.sectionName,
      description: section.description
    };

    if (section.sectionId) {
      SectionService.updateSection(section.sectionId, sectionRequestDTO)
        .then(() => {
          alert("Section Updated Successfully");
          clearForm();
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      SectionService.saveSection(sectionRequestDTO)
        .then(() => {
          alert("Section Saved Successfully");
          clearForm();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  /* ==============================
          CLEAR FORM
  =============================== */
  const clearForm = () => {
    setSection(emptySection);
    if (onUpdateComplete) {
      onUpdateComplete();
    }
  };

  return (
    <div id="sectionModal" className="container-fluid" style={{ maxWidth: "900px", margin: "auto" }}>
      <style>{`
        #sectionModal { color:#212529; }
        #sectionModal .form-control, #sectionModal .form-select { height:52px; font-size:16px; padding:12px 15px; border-radius:8px; border:1px solid #ced4da; }
        #sectionModal .form-control:focus, #sectionModal .form-select:focus { box-shadow:none; border-color:#0d6efd; }
        #sectionModal label { font-weight:600; color:#1f2937; }
        .btn-inline { min-width:90px; }
        .form-card { background:white; padding:30px; border-radius:12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      `}</style>

      <div className="form-card">
        <h2 className="text-center fw-bold mb-4">
          {section.sectionId ? "✏ Edit Section Details" : "👥 Add New Section"}
        </h2>

        <form onSubmit={saveSection}>
          
          {/* ================= Associated Branch Department ================= */}
          <div className="row mb-4 align-items-center">
            <label className="col-lg-3 col-md-4 fw-semibold">
              Associated Branch Department
            </label>
            <div className="col-lg-9 col-md-8">
              <select name="branchId" value={section.branchId} onChange={handleChange} className="form-select" required>
                <option value="">---- Select Branch ----</option>
                {branchesList.map((branch) => (
                  <option key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </option>
                ))}
              </select>

              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-primary btn-inline" onClick={handleInlineBranchEdit}>
                  Edit
                </button>
                <button type="button" className="btn btn-outline-danger btn-inline" onClick={handleInlineBranchDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* ================= Section Name ================= */}
          <div className="row mb-4 align-items-center">
            <label className="col-lg-3 col-md-4 fw-semibold">
              Section Name
            </label>
            <div className="col-lg-9 col-md-8">
              <input type="text" name="sectionName" className="form-control" placeholder="Enter Section Label (e.g. Section-A)" value={section.sectionName} onChange={handleChange} required />
            </div>
          </div>

          {/* ================= Description ================= */}
          <div className="row mb-4 align-items-start">
            <label className="col-lg-3 col-md-4 fw-semibold pt-2">
              Description
            </label>
            <div className="col-lg-9 col-md-8">
              <textarea name="description" className="form-control" placeholder="Write section specifications or cohort details..." value={section.description} onChange={handleChange} rows="3" style={{ height: "auto" }} />
            </div>
          </div>

          {/* ================= Form Submission Action Buttons ================= */}
          <div className="d-flex justify-content-end gap-3 mt-4">
            <button type="button" className="btn btn-secondary px-4 py-2" onClick={clearForm}>
              Clear
            </button>
            <button type="submit" className="btn btn-success px-4 py-2">
              {section.sectionId ? "Update Section" : "Save Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SectionForm;
