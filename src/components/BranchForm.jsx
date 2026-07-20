import React, { useState, useEffect } from "react";
import axios from "axios";
import BranchService from "../services/BranchService";
import CollegeService from "../services/CollegeService";

function BranchForm({ selectedBranchData, onUpdateComplete }) {
  const emptyBranch = {
    branchId: "",
    collegeId: "",
    branchName: "",
    address: "",
    phoneNumber: "",
    email: "",
  };

  const [branch, setBranch] = useState(emptyBranch);
  const [collegesList, setCollegesList] = useState([]);

  /* ==============================
          LOAD COLLEGES
  =============================== */
  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = () => {
    axios
      .get("http://localhost:8080/api/college", {
        withCredentials: true,
      })
      .then((response) => {
        setCollegesList(response.data || []);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  /* ==============================
          EDIT DATA
  =============================== */
  useEffect(() => {
    if (selectedBranchData) {
      setBranch({
        branchId: selectedBranchData.branchId || "",
        collegeId: selectedBranchData.collegeId || "",
        branchName: selectedBranchData.branchName || "",
        address: selectedBranchData.address || "",
        phoneNumber: selectedBranchData.phoneNumber || "",
        email: selectedBranchData.email || "",
      });
    } else {
      setBranch(emptyBranch);
    }
  }, [selectedBranchData]);

  /* ==============================
        HANDLE CHANGE
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const onlyNumbers = value.replace(/\D/g, "");
      setBranch({
        ...branch,
        phoneNumber: onlyNumbers,
      });
      return;
    }

    if (name === "collegeId") {
      setBranch({
        ...branch,
        collegeId: value === "" ? "" : Number(value),
      });
      return;
    }

    setBranch({
      ...branch,
      [name]: value,
    });
  };

  /* ==============================
      INLINE EDIT COLLEGE
  =============================== */
  const handleInlineCollegeEdit = () => {
    if (!branch.collegeId) {
      alert("Please select a college.");
      return;
    }
    alert(`Open College Module to edit College ID : ${branch.collegeId}`);
  };

  /* ==============================
      INLINE DELETE COLLEGE
  =============================== */
  const handleInlineCollegeDelete = () => {
    if (!branch.collegeId) {
      alert("Please select a college.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this college?")) {
      CollegeService.deleteCollege(branch.collegeId)
        .then(() => {
          alert("College deleted successfully.");
          loadColleges();
          setBranch({ ...branch, collegeId: "" });
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
  const saveBranch = (e) => {
    e.preventDefault();

    if (branch.phoneNumber.length !== 10) {
      alert("Phone Number must contain exactly 10 digits.");
      return;
    }

    const requestDTO = {
      collegeId: branch.collegeId,
      branchName: branch.branchName,
      address: branch.address,
      phoneNumber: branch.phoneNumber,
      email: branch.email,
    };

    if (branch.branchId) {
      BranchService.updateBranch(branch.branchId, requestDTO)
        .then(() => {
          alert("Branch Updated Successfully");
          clearForm();
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      BranchService.saveBranch(requestDTO)
        .then(() => {
          alert("Branch Saved Successfully");
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
    setBranch(emptyBranch);
    if (onUpdateComplete) {
      onUpdateComplete();
    }
  };

  return (
    <div id="branchModal" className="container-fluid" style={{ maxWidth: "900px", margin: "auto" }}>
      <style>{`
        #branchModal { color:#212529; }
        #branchModal .form-control, #branchModal .form-select { height:52px; font-size:16px; padding:12px 15px; border-radius:8px; border:1px solid #ced4da; }
        #branchModal .form-control:focus, #branchModal .form-select:focus { box-shadow:none; border-color:#0d6efd; }
        #branchModal label { font-weight:600; color:#1f2937; }
        .btn-inline { min-width:90px; }
        .form-card { background:white; padding:30px; border-radius:12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      `}</style>

      <div className="form-card">
        <h2 className="text-center fw-bold mb-4">
          {branch.branchId ? "✏ Edit Branch" : "🌿 Add New Branch"}
        </h2>

        <form onSubmit={saveBranch}>
          {/* ================= Parent College ================= */}
          <div className="row mb-4 align-items-center">
            <label className="col-lg-3 col-md-4 fw-semibold">Parent College</label>
            <div className="col-lg-9 col-md-8">
              <select name="collegeId" value={branch.collegeId} onChange={handleChange} className="form-select" required>
                <option value="">---- Select College ----</option>
                {collegesList.map((college) => (
                  <option key={college.collegeId} value={college.collegeId}>
                    {college.instituteName || college.collegeName}
                  </option>
                ))}
              </select>

              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-primary btn-inline" onClick={handleInlineCollegeEdit}>
                  Edit
                </button>
                <button type="button" className="btn btn-outline-danger btn-inline" onClick={handleInlineCollegeDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* ================= Branch Name ================= */}
          <div className="row mb-4 align-items-center">
            <label className="col-lg-3 col-md-4 fw-semibold">Branch Name</label>
            <div className="col-lg-9 col-md-8">
              <input type="text" name="branchName" className="form-control" placeholder="Enter Branch Name" value={branch.branchName} onChange={handleChange} required />
            </div>
          </div>

          {/* ================= Address ================= */}
          <div className="row mb-4 align-items-center">
            <label className="col-lg-3 col-md-4 fw-semibold">Address</label>
            <div className="col-lg-9 col-md-8">
              <input type="text" name="address" className="form-control" placeholder="Enter Branch Address" value={branch.address} onChange={handleChange} required />
            </div>
          </div>

          {/* ================= Phone Number ================= */}
          <div className="row mb-4 align-items-center">
            <label className="col-lg-3 col-md-4 fw-semibold">Phone Number</label>
            <div className="col-lg-9 col-md-8">
              <input type="tel" name="phoneNumber" className="form-control" placeholder="Enter 10 Digit Phone Number" value={branch.phoneNumber} onChange={handleChange} maxLength="10" pattern="[0-9]{10}" required />
            </div>
          </div>

          {/* ================= Email ================= */}
          <div className="row mb-4 align-items-center">
            <label className="col-lg-3 col-md-4 fw-semibold">Email Address</label>
            <div className="col-lg-9 col-md-8">
              <input type="email" name="email" className="form-control" placeholder="Enter Email Address" value={branch.email} onChange={handleChange} required />
            </div>
          </div>

          {/* ================= Form Submission Action Buttons ================= */}
          <div className="d-flex justify-content-end gap-3 mt-4">
            <button type="button" className="btn btn-secondary px-4 py-2" onClick={clearForm}>
              Clear
            </button>
            <button type="submit" className="btn btn-success px-4 py-2">
              {branch.branchId ? "Update Branch" : "Save Branch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BranchForm;
