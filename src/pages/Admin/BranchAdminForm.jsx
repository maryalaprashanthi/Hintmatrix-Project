import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import {
  FaTimes,
  FaUser,
  FaIdBadge,
  FaBriefcase,
  FaUniversity,
  FaCodeBranch,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaMapMarkerAlt,
  FaSave,
} from "react-icons/fa";

import "./BranchAdminForm.css";

function BranchAdminForm({ show, onClose, onSave, selectedBranchAdminData }) {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  /* Dummy College Data */
  const collegesList = [
    {
      collegeId: 1,
      instituteName: "ABC College",
    },
    {
      collegeId: 2,
      instituteName: "XYZ College",
    },
    {
      collegeId: 3,
      instituteName: "PQR College",
    },
  ];

  /* Dummy Branch Data */
  const branchesList = [
    {
      branchId: 1,
      branchName: "Computer Science",
    },
    {
      branchId: 2,
      branchName: "Electronics",
    },
    {
      branchId: 3,
      branchName: "Mechanical",
    },
  ];

  useEffect(() => {
    if (selectedBranchAdminData) {
      setName(selectedBranchAdminData.name || "");
      setEmployeeId(selectedBranchAdminData.employeeId || "");
      setDesignation(selectedBranchAdminData.designation || "");
      setCollegeId(selectedBranchAdminData.collegeId || "");
      setBranchId(selectedBranchAdminData.branchId || "");
      setEmail(selectedBranchAdminData.email || "");
      setPhoneNumber(selectedBranchAdminData.phoneNumber || "");
      setPassword(selectedBranchAdminData.password || "");
      setAddress(selectedBranchAdminData.address || "");
    } else {
      setName("");
      setEmployeeId("");
      setDesignation("");
      setCollegeId("");
      setBranchId("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setAddress("");
    }
  }, [selectedBranchAdminData, show]);

  if (!show) return null;

  const handleSave = () => {
    if (
      !name.trim() ||
      !employeeId ||
      !designation.trim() ||
      !collegeId ||
      !branchId ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password.trim() ||
      !address.trim()
    ) {
      alert("Please fill all the fields.");
      return;
    }

    const branchAdminData = {
      ...(selectedBranchAdminData && {
        branchAdminId: selectedBranchAdminData.branchAdminId,
      }),

      name,
      employeeId: Number(employeeId),
      designation,
      collegeId: Number(collegeId),
      branchId: Number(branchId),
      email,
      phoneNumber,
      password,
      address,
    };

    onSave(branchAdminData);

    onClose();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="branch-modal">
        {/* Header */}

        <div className="modal-header">
          <div>
            <h2>Add Branch Admin</h2>

            <p>Create a new Branch Administrator.</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}

        <div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">Branch Admin Information</h3>

            <div className="form-grid">
              {/* Name */}
              <div className="form-group">
                <label>
                  Name <span>*</span>
                </label>

                <div className="input-box">
                  <FaUser className="input-icon" />

                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div className="form-group">
                <label>
                  Employee ID <span>*</span>
                </label>

                <div className="input-box">
                  <FaIdBadge className="input-icon" />

                  <input
                    type="number"
                    placeholder="Enter Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  />
                </div>
              </div>

              {/* Designation */}
              <div className="form-group">
                <label>
                  Designation <span>*</span>
                </label>

                <div className="input-box">
                  <FaBriefcase className="input-icon" />

                  <input
                    type="text"
                    placeholder="Enter Designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                </div>
              </div>

              {/* College */}
              <div className="form-group">
                <label>
                  College Id <span>*</span>
                </label>

                <div className="input-box">
                  <FaUniversity className="input-icon" />

                  <select
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                  >
                    <option value="">Select College Id</option>

                    {collegesList.map((college) => (
                      <option key={college.collegeId} value={college.collegeId}>
                        {college.instituteName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch */}
              <div className="form-group">
                <label>
                  Branch Id <span>*</span>
                </label>

                <div className="input-box">
                  <FaCodeBranch className="input-icon" />

                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    <option value="">Select Branch Id</option>

                    {branchesList.map((branch) => (
                      <option key={branch.branchId} value={branch.branchId}>
                        {branch.branchName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label>
                  Email <span>*</span>
                </label>

                <div className="input-box">
                  <FaEnvelope className="input-icon" />

                  <input
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label>
                  Phone Number <span>*</span>
                </label>

                <div className="input-box">
                  <FaPhone className="input-icon" />

                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label>
                  Password <span>*</span>
                </label>

                <div className="input-box">
                  <FaLock className="input-icon" />

                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}

          <div className="form-card">
            <h3 className="section-title">Address</h3>

            <div className="textarea-box">
              <FaMapMarkerAlt className="input-icon" />

              <textarea
                placeholder="Enter Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Footer */}

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            <FaSave className="me-2" />
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default BranchAdminForm;
