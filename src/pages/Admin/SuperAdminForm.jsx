import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SuccessModal from "../../components/Common/SuccessModal";
import { validateSuperAdminForm } from "./superAdminValidation";

import {
  FaTimes,
  FaUser,
  FaIdBadge,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaMapMarkerAlt,
  FaSave,
} from "react-icons/fa";

import "./SuperAdminForm.css";

function SuperAdminForm({ show, onClose, onSave, selectedSuperAdminData }) {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (selectedSuperAdminData) {
      setName(selectedSuperAdminData.name || "");
      setEmployeeId(selectedSuperAdminData.employeeId || "");
      setDesignation(selectedSuperAdminData.designation || "");
      setEmail(selectedSuperAdminData.email || "");
      setPhoneNumber(selectedSuperAdminData.phoneNumber || "");
      setPassword(
        selectedSuperAdminData.password ||
          selectedSuperAdminData.passwordHash ||
          selectedSuperAdminData.userPassword ||
          "",
      );
      setAddress(selectedSuperAdminData.address || "");
    } else {
      setName("");
      setEmployeeId("");
      setDesignation("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setAddress("");
    }
  }, [selectedSuperAdminData, show]);

  if (!show) return null;

  const handleSave = () => {
    const validation = validateSuperAdminForm({
      name,
      employeeId,
      designation,
      email,
      phoneNumber,
      password,
      address,
    });

    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    const superAdminData = {
      ...(selectedSuperAdminData && {
        userId: selectedSuperAdminData.userId,
      }),

      name: name.trim(),
      employeeId: Number(employeeId),
      designation: designation.trim(),
      email: email.trim(),
      phoneNumber: String(phoneNumber).replace(/\D/g, ""),
      password: password.trim(),
      address: address.trim(),
    };

    onSave(superAdminData);
    setShowSuccess(true);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="superadmin-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>
              {selectedSuperAdminData ? "Edit Super Admin" : "Add Super Admin"}
            </h2>

            <p>
              {selectedSuperAdminData
                ? "Update Super Administrator details."
                : "Create a new Super Administrator."}
            </p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">Super Admin Information</h3>

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
                    onChange={(e) =>
                      setName(e.target.value.replace(/[^A-Za-z\s]/g, ""))
                    }
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
                    type="text"
                    placeholder="Enter Employee ID"
                    value={employeeId}
                    onChange={(e) =>
                      setEmployeeId(e.target.value.replace(/\D/g, ""))
                    }
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
                    type="text"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
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
      <SuccessModal
        show={showSuccess}
        message={
          selectedSuperAdminData
            ? "Super Admin updated successfully!"
            : "Super Admin saved successfully!"
        }
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
      />
    </div>,
    document.body,
  );
}

export default SuperAdminForm;
