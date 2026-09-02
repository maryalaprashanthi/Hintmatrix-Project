import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import SuccessModal from "../../components/Common/SuccessModal";

import UserService from "../../services/UserService";
import CollegeService from "../../services/CollegeService";

import {
  FaTimes,
  FaUser,
  FaIdBadge,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaMapMarkerAlt,
  FaUniversity,
  FaSave,
} from "react-icons/fa";

import "./BranchAdminForm.css";

function CollegeAdminForm({ show, onClose, onSave, selectedCollegeAdminData }) {
  // FORM STATE

  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  // COLLEGE STATE

  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(false);

  // SAVE STATE

  const [saving, setSaving] = useState(false);

  // SUCCESS MODAL

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");


  // HELPER: normalize backend college payloads
 

  const normalizeCollege = (college = {}) => {
    const collegeId =
      college.collegeId ??
      college.id ??
      college.collegeID ??
      college.college_id ??
      "";

    const collegeName =
      college.instituteName ??
      college.collegeName ??
      college.name ??
      college.college ??
      "Unnamed College";

    return {
      ...college,
      collegeId,
      collegeName,
      instituteName: college.instituteName ?? collegeName,
    };
  };

  
  // FETCH COLLEGES
  

  useEffect(() => {
    if (!show) {
      return;
    }

    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);

        const response = await CollegeService.getAllColleges();

        const collegeList = (response.data || []).map(normalizeCollege);

        setColleges(collegeList);
      } catch (error) {
        console.error("Error fetching colleges:", error);

        alert(error?.response?.data?.message || "Failed to load colleges.");
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, [show]);

 
  // LOAD EXISTING DATA FOR EDIT
  

  useEffect(() => {
    if (!show) {
      return;
    }

    if (selectedCollegeAdminData) {
      setName(selectedCollegeAdminData.name || "");

      setEmployeeId(
        selectedCollegeAdminData.employeeId !== null &&
          selectedCollegeAdminData.employeeId !== undefined
          ? String(selectedCollegeAdminData.employeeId)
          : "",
      );

      setDesignation(selectedCollegeAdminData.designation || "");

      const selectedCollegeId =
        selectedCollegeAdminData.collegeId ??
        selectedCollegeAdminData.college?.collegeId ??
        selectedCollegeAdminData.college?.id ??
        "";

      setCollegeId(
        selectedCollegeId !== null && selectedCollegeId !== undefined
          ? String(selectedCollegeId)
          : "",
      );

      setEmail(selectedCollegeAdminData.email || "");

      setPhoneNumber(selectedCollegeAdminData.phoneNumber || "");

      // Do not load existing password.
      setPassword("");

      setAddress(selectedCollegeAdminData.address || "");
    } else {
      resetForm();
    }
  }, [selectedCollegeAdminData, show]);

  
  // RESET FORM


  const resetForm = () => {
    setName("");
    setEmployeeId("");
    setDesignation("");
    setCollegeId("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setAddress("");
  };


  // VALIDATION


  const validateForm = () => {
    // Name
    if (!name.trim()) {
      alert("Please enter Name.");
      return false;
    }

    // Employee ID
    if (!employeeId.trim()) {
      alert("Please enter Employee ID.");
      return false;
    }

    if (Number(employeeId) <= 0) {
      alert("Please enter a valid Employee ID.");
      return false;
    }

    // Designation
    if (!designation.trim()) {
      alert("Please enter Designation.");
      return false;
    }

    // College
    if (!collegeId) {
      alert("Please select College.");
      return false;
    }

    // Email
    if (!email.trim()) {
      alert("Please enter Email.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      alert("Please enter a valid Email address.");
      return false;
    }

    // Phone
    const cleanedPhone = phoneNumber.replace(/\D/g, "");

    if (!cleanedPhone) {
      alert("Please enter Phone Number.");
      return false;
    }

    if (cleanedPhone.length !== 10) {
      alert("Phone Number must contain exactly 10 digits.");
      return false;
    }

    // Password
    // Required while creating.
    // Optional while editing.
    if (!selectedCollegeAdminData) {
      if (!password.trim()) {
        alert("Please enter Password.");
        return false;
      }
    }

    if (password.trim() && password.trim().length < 6) {
      alert("Password must contain at least 6 characters.");
      return false;
    }

    // Address
    if (!address.trim()) {
      alert("Please enter Address.");
      return false;
    }

    return true;
  };

   // SAVE
  

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const collegeAdminData = {
      name: name.trim(),

      employeeId: Number(employeeId),

      designation: designation.trim(),

      collegeId: Number(collegeId),

      email: email.trim(),

      phoneNumber: phoneNumber.replace(/\D/g, ""),

      address: address.trim(),
    };

    /*
     * Password:
     *
     * CREATE:
     * password is required.
     *
     * EDIT:
     * if password is blank, don't send it.
     * This allows the backend to keep the existing password,
     * assuming your update service supports that behavior.
     */

    if (!selectedCollegeAdminData || password.trim()) {
      collegeAdminData.password = password.trim();
    }

    try {
      setSaving(true);

      await onSave(collegeAdminData);

      setSuccessMessage(
        selectedCollegeAdminData
          ? "College Admin updated successfully!"
          : "College Admin saved successfully!",
      );

      setShowSuccess(true);
    } catch (error) {
      console.error("College Admin Save Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Failed to save College Admin.";

      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

 
  // CLOSE SUCCESS MODAL
  

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  
  // IF MODAL IS NOT OPEN
 

  if (!show) {
    return null;
  }

  
  // RENDER
  

  return createPortal(
    <div className="modal-overlay">
      <div className="branch-modal">
        {/* HEADER */}

        <div className="modal-header">
          <div>
            <h2>
              {selectedCollegeAdminData
                ? "Edit College Admin"
                : "Add College Admin"}
            </h2>

            <p>
              {selectedCollegeAdminData
                ? "Update College Administrator details."
                : "Create a new College Administrator."}
            </p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            disabled={saving}
          >
            <FaTimes />
          </button>
        </div>

        {/*  BODY */}

        <div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">College Admin Information</h3>

            <div className="form-grid">
              {/*  NAME  */}

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
                      setName(e.target.value.replace(/[^A-Za-z\s'-]/g, ""))
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              {/* EMPLOYEE ID  */}

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
                    disabled={saving}
                  />
                </div>
              </div>

              {/*  DESIGNATION */}

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
                    disabled={saving}
                  />
                </div>
              </div>

              {/* COLLEGE  */}

              <div className="form-group">
                <label>
                  College <span>*</span>
                </label>

                <div className="input-box">
                  <FaUniversity className="input-icon" />

                  <select
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    disabled={loadingColleges || saving}
                    style={{
                      paddingLeft: "42px",
                    }}
                  >
                    <option value="">
                      {loadingColleges
                        ? "Loading Colleges..."
                        : "Select College"}
                    </option>

                    {colleges.map((college) => {
                      const normalizedCollege = normalizeCollege(college);
                      const id = normalizedCollege.collegeId;
                      const collegeName = normalizedCollege.collegeName;

                      return (
                        <option key={String(id)} value={String(id)}>
                          {collegeName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/*  EMAIL  */}

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
                    disabled={saving}
                  />
                </div>
              </div>

              {/* PHONE */}

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
                    disabled={saving}
                  />
                </div>
              </div>

              {/* PASSWORD  */}

              <div className="form-group">
                <label>
                  Password {!selectedCollegeAdminData && <span>*</span>}
                </label>

                <div className="input-box">
                  <FaLock className="input-icon" />

                  <input
                    type="password"
                    placeholder={
                      selectedCollegeAdminData
                        ? "Leave blank to keep current password"
                        : "Enter Password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ADDRESS */}

          <div className="form-card">
            <h3 className="section-title">Address</h3>

            <div className="textarea-box">
              <FaMapMarkerAlt className="input-icon" />

              <textarea
                placeholder="Enter Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <FaSave className="me-2" />

            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/*  SUCCESS MODAL */}

      <SuccessModal
        show={showSuccess}
        message={successMessage}
        onClose={handleSuccessClose}
      />
    </div>,
    document.body,
  );
}

export default CollegeAdminForm;
