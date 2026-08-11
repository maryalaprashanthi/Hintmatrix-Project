import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import CollegeService from "../../../services/CollegeService";
import Select from "react-select";
import {
  FaTimes,
  FaUniversity,
  FaCodeBranch,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSave,
} from "react-icons/fa";

import "./AddBranchmodal.css";

function AddBranchModal({ show, onClose, onSave, selectedBranchData }) {
  const [collegeId, setCollegeId] = useState("");
  const [branchName, setBranchName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [collegesList, setCollegesList] = useState([]); // 🌟 ADDED: State store for backend colleges lookup
  // 🌟 ADDED: Fetch available colleges whenever modal opens up
  useEffect(() => {
    if (show) {
      CollegeService.getAllColleges()
        .then((response) => {
          console.log("All Colleges:", response.data);

          const activeColleges = response.data.filter(
            (college) => college.activeRow === true,
          );
          console.log("Active Colleges:", activeColleges);
          setCollegesList(activeColleges);
        })
        .catch((error) => {
          console.error("Failed to load college dropdown indices:", error);
        });
    }
  }, [show]);

  // 🌟 ADDED: Sync inputs when editing an existing record
  useEffect(() => {
    if (selectedBranchData) {
      setCollegeId(selectedBranchData.collegeId || "");
      setBranchName(selectedBranchData.branchName || "");
      setAddress(selectedBranchData.address || "");
      setPhoneNumber(selectedBranchData.phoneNumber || "");
      setEmail(selectedBranchData.email || "");
      setIsActive(
        selectedBranchData.activeRow !== undefined
          ? selectedBranchData.activeRow
          : true,
      );
    } else {
      setCollegeId("");
      setBranchName("");
      setAddress("");
      setPhoneNumber("");
      setEmail("");
      setIsActive(true);
    }
  }, [selectedBranchData, show]);

  if (!show) return null;

  const handleSave = async () => {
    if (
      !String(collegeId).trim() ||
      !branchName.trim() ||
      !address.trim() ||
      !phoneNumber.trim() ||
      !email.trim()
    ) {
      alert("Please fill all the fields.");
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      alert("Phone number must contain exactly 10 digits.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Creates the payload structure matching BranchRequestDTO signatures exactly
    const branchData = {
      // If editing, preserve the branchId tracking key reference string
      ...(selectedBranchData && { branchId: selectedBranchData.branchId }),
      collegeId: Number(collegeId),
      branchName: branchName.trim(),
      address: address.trim(),
      phoneNumber: phoneNumber.trim(), // 🌟 FIXED: Changed 'phone' to 'phoneNumber' to match backend DTO field name exactly
      email: email.trim(),
      activeRow: isActive,
    };
    await onSave(branchData);

    setCollegeId("");
    setBranchName("");
    setAddress("");
    setPhoneNumber("");
    setEmail("");
    setIsActive(true);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="branch-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Add Branch</h2>
            <p>Create a new college branch.</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">Branch Information</h3>

            <div className="form-grid">
              {/* College Id Dropdown */}

              <div className="form-group">
                <label>
                  College Id <span>*</span>
                </label>

                <div className="select-box ">
                  <FaUniversity className="select-icon" />

                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPlacement="bottom"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    value={collegesList
                      .map((college) => ({
                        value: college.collegeId,
                        label: college.instituteName,
                      }))
                      .find((option) => option.value === Number(collegeId))}
                    options={collegesList.map((college) => ({
                      value: college.collegeId,
                      label: college.instituteName,
                    }))}
                    onChange={(selectedOption) =>
                      setCollegeId(selectedOption ? selectedOption.value : "")
                    }
                    placeholder="Search College"
                    isSearchable={true}
                    isClearable={true}
                  />
                </div>
              </div>

              {/* Branch Name */}
              <div className="form-group">
                <label>
                  Branch Name <span>*</span>
                </label>

                <div className="input-box">
                  <FaCodeBranch className="input-icon" />
                   <input
                     type="text"
                     placeholder="Enter Branch Name"
                     value={branchName}
                     onChange={(e) => {
                     const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                     setBranchName(value);
                    }}
                  />
                  
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>
                  Phone Number <span>*</span>
                </label>

                <div className="input-box">
                  <FaPhone className="input-icon" />

                  <input
                    type="tel"
                    inputmode="numeric"
                    placeholder="Enter Phone Number"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPhoneNumber(value);
                    }}
                    maxLength={10}
                  />
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
                    placeholder="branch@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Enter Branch Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="form-card">
            <h3 className="section-title">Status</h3>

            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />

              <label className="form-check-label">Active</label>
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

export default AddBranchModal;
