import React, { useState, useEffect } from "react";
import axios from "axios";
import BranchService from "../services/BranchService";

function BranchForm({ selectedBranchData, onUpdateComplete }) {
  const emptyBranch = {
    branchId: "",
    collegeId: "",
    branchName: "",
    address: "",
    phoneNumber: "",
    email: ""
  };

  const [branch, setBranch] = useState(emptyBranch);
  const [collegesList, setCollegesList] = useState([]); // State array storing active PostgreSQL campuses

  // 1. Fetch active college items from your database immediately on mount
  useEffect(() => {
    axios.get("http://localhost:8080/getAllColleges")
      .then((response) => {
        if (response.data) {
          setCollegesList(response.data);
        }
      })
      .catch((error) => {
        console.error("Failed to populate active colleges lookup list:", error);
      });
  }, []);

  // Sync data when the user clicks an "Edit" button in the table
  useEffect(() => {
    if (selectedBranchData) {
      setBranch(selectedBranchData);
    } else {
      setBranch(emptyBranch);
    }
  }, [selectedBranchData]);

  const handleChange = (e) => {
    // Prevent entering non-numeric characters inside the phone input box completely
    if (e.target.name === "phoneNumber") {
      const numericValue = e.target.value.replace(/[^0-9]/g, "");
      setBranch({ ...branch, [e.target.name]: numericValue });
      return;
    }
    setBranch({ ...branch, [e.target.name]: e.target.value });
  };

  const saveBranch = (e) => {
    e.preventDefault();

    if (branch.phoneNumber.length !== 10) {
      alert("Validation Error: Phone Number must be exactly 10 numeric digits long!");
      return;
    }

    if (branch.branchId) {
      // Execute PUT / Update operation
      BranchService.updateBranch(branch)
        .then(() => {
          alert("Branch Updated Successfully");
          clearForm();
        })
        .catch(error => {
          console.error("Failed to update branch:", error);
        });
    } else {
      // Execute POST / Create operation
      BranchService.saveBranch(branch)
        .then(() => {
          alert("Branch Saved Successfully");
          clearForm();
        })
        .catch(error => {
          console.error("Failed to save branch:", error);
        });
    }
  };

  const clearForm = () => {
    setBranch(emptyBranch);
    if (onUpdateComplete) {
      onUpdateComplete(); // Notifies parent to refresh the grid and dismiss popup
    }
  };

  return (
    <div className="w-100 text-start" style={{ color: "#212529" }}>
      
      {/* Dynamic Style Wrapper to clear any transparency overrides from layout frameworks */}
      <style>{`
        #branchModal .form-control, #branchModal .form-select {
          background-color: #ffffff !important;
          background: #ffffff !important;
          color: #111827 !important;
          border: 1px solid #cbd5e1 !important;
          opacity: 1 !important;
          padding: 10px 12px;
        }
        #branchModal .form-control:focus, #branchModal .form-select:focus {
          background-color: #ffffff !important;
          color: #111827 !important;
        }
        #branchModal label, #branchModal h2 {
          color: #1e293b !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Centered Modal Header */}
      <h2 className="fw-bold text-dark fs-4 mb-4 text-center">
        {branch.branchId ? "✍️ Edit Branch Details" : "🌿 Add New Branch"}
      </h2>

      <form onSubmit={saveBranch}>
        
        {/* Upgraded Select Dropdown mapping to replace raw inputs */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Parent Academic Institution</label>
          <select
            name="collegeId"
            className="form-select"
            value={branch.collegeId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Associated College --</option>
            {collegesList.map((college) => (
              <option key={college.collegeId} value={college.collegeId}>
                {college.instituteName} (ID: {college.collegeId})
              </option>
            ))}
          </select>
        </div>

        {/* Branch Name Input */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Branch Name</label>
          <input
            type="text"
            name="branchName"
            placeholder="Enter Branch Title (e.g. Computer Science)"
            value={branch.branchName}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* Address Input */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Address Location</label>
          <input
            type="text"
            name="address"
            placeholder="Enter Branch block / building office location"
            value={branch.address}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* Phone Number Input */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="10 digit contact number"
            value={branch.phoneNumber}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            maxLength="10"
            className="form-control"
          />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="form-label small fw-semibold">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="department@institution.edu"
            value={branch.email}
            onChange={handleChange}
            required
            className="form-control"
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
            className={`btn px-4 fw-bold text-white ${branch.branchId ? "btn-success" : "btn-primary"}`}
          >
            {branch.branchId ? "Update Branch" : "Save Branch"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BranchForm;
