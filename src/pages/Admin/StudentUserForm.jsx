import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaMapMarkerAlt,
  FaSave,
} from "react-icons/fa";

import "./StudentUserForm.css";

function StudentUserForm({ show, onClose, onSave, selectedStudentUserData }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (selectedStudentUserData) {
      setName(selectedStudentUserData.name || "");
      setEmail(selectedStudentUserData.email || "");
      setPhoneNumber(selectedStudentUserData.phoneNumber || "");
      setPassword(selectedStudentUserData.password || "");
      setAddress(selectedStudentUserData.address || "");
    } else {
      setName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setAddress("");
    }
  }, [selectedStudentUserData, show]);

  if (!show) return null;

  const handleSave = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password.trim()
    ) {
      alert("Please fill all the required fields.");
      return;
    }

    const studentUserData = {
      ...(selectedStudentUserData && {
        studentUserId: selectedStudentUserData.studentUserId,
      }),

      name,
      email,
      phoneNumber,
      password,
      address,
    };

    onSave(studentUserData);
    onClose();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="branch-modal">
        {/* Header */}

        <div className="modal-header">
          <div>
            <h2>Add Student User</h2>
            <p>Create a new Student User.</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}

        <div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">Student User Information</h3>

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

              {/* Email */}

              <div className="form-group">
                <label>
                  Email Address <span>*</span>
                </label>

                <div className="input-box">
                  <FaEnvelope className="input-icon" />

                  <input
                    type="email"
                    placeholder="Enter Email Address"
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

export default StudentUserForm;
