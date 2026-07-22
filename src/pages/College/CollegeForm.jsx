import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import {
  FaTimes,
  FaUniversity,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaSave,
} from "react-icons/fa";

import "./CollegeForm.css";

function CollegeForm({
  show,
  onClose,
  onSave,
  selectedCollegeData,
}) {
  const [college, setCollege] = useState({
    instituteName: "",
    address: "",
    phoneNumber: "",
    email: "",
  });

  useEffect(() => {
    if (selectedCollegeData) {
      setCollege({
        instituteName: selectedCollegeData.instituteName || "",
        address: selectedCollegeData.address || "",
        phoneNumber: selectedCollegeData.phoneNumber || "",
        email: selectedCollegeData.email || "",
      });
    } else {
      setCollege({
        instituteName: "",
        address: "",
        phoneNumber: "",
        email: "",
      });
    }
  }, [selectedCollegeData]);

  if (!show) return null;

  const handleChange = (e) => {
    setCollege({
      ...college,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    if (
      !college.instituteName.trim() ||
      !college.address.trim() ||
      !college.phoneNumber.trim() ||
      !college.email.trim()
    ) {
      alert("Please fill all the fields.");
      return;
    }

    if (!/^\d{10}$/.test(college.phoneNumber)) {
      alert("Phone number must contain exactly 10 digits.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(college.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    onSave(college);

    setCollege({
      instituteName: "",
      address: "",
      phoneNumber: "",
      email: "",
    });

    onClose();
  };

  return createPortal(
    <div className="modal-overlay">

      <div className="branch-modal">

        {/* Header */}

        <div className="modal-header">

          <div>

            <h2>
              {selectedCollegeData ? "Update College" : "Add College"}
            </h2>

            <p>
              Register a new college.
            </p>

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
              College Information
            </h3>

            <div className="form-grid">

              {/* College Name */}

              <div className="form-group">

                <label>
                  College Name <span>*</span>
                </label>

                <div className="input-box">

                  <FaUniversity className="input-icon" />

                  <input
                    type="text"
                    name="instituteName"
                    placeholder="Enter College Name"
                    value={college.instituteName}
                    onChange={handleChange}
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
                    name="phoneNumber"
                    placeholder="Enter Phone Number"
                    value={college.phoneNumber}
                    onChange={handleChange}
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
                    name="email"
                    placeholder="college@gmail.com"
                    value={college.email}
                    onChange={handleChange}
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
                name="address"
                placeholder="Enter College Address"
                value={college.address}
                onChange={handleChange}
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
            {selectedCollegeData ? "Update College" : "Save"}
          </button>

        </div>

      </div>

    </div>,
    document.body
  );
}

export default CollegeForm;