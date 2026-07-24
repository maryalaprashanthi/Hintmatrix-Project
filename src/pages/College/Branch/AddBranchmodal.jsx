
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import CollegeService from "../../../services/CollegeService"; 

import {
  FaTimes,
  FaUniversity,
  FaCodeBranch,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSave,
} from "react-icons/fa";

import "./AddBranchModal.css";

function AddBranchModal({ show, onClose, onSave,selectedBranchData }) {
  const [collegeId, setCollegeId] = useState("");
  const [branchName, setBranchName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [collegesList, setCollegesList] = useState([]); // 🌟 ADDED: State store for backend colleges lookup
  // 🌟 ADDED: Fetch available colleges whenever modal opens up
  useEffect(() => {
    if (show) {
      CollegeService.getAllColleges()
        .then((response) => {
          setCollegesList(response.data || []);
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
    } else {
      setCollegeId("");
      setBranchName("");
      setAddress("");
      setPhoneNumber("");
      setEmail("");
    }
  }, [selectedBranchData, show]);

  if (!show) return null;

  const handleSave = () => {
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
    };

    onSave(branchData);

    setCollegeId("");
    setBranchName("");
    setAddress("");
    setPhoneNumber("");
    setEmail("");

    onClose();
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

          <button
            className="close-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>

        </div>

        {/* Body */}
        <div className="modal-body">

          <div className="form-card">

            <h3 className="section-title">
              Branch Information
            </h3>

            <div className="form-grid">

              
             {/* College Id Dropdown */}
             

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
            <option value="">
                 Select College Id
            </option>

             {/*  FIXED: Dynamically map the fetched data to options */}
                    {collegesList.map((college) => (
                      <option key={college.collegeId} value={college.collegeId}>
                        {college.instituteName || `College ID: ${college.collegeId}`}
                      </option>
                    ))}

        </select>

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
                    onChange={(e) => setBranchName(e.target.value)}
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
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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

            <h3 className="section-title">
              Address
            </h3>

            <div className="textarea-box">

              <FaMapMarkerAlt className="input-icon" />

              <textarea
                placeholder="Enter Branch Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="modal-footer">

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
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
    document.body
  );
}

export default AddBranchModal;