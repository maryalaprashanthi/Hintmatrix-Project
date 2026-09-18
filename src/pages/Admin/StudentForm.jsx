import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { validateStudentForm } from "./superAdminValidation";

import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaMapMarkerAlt,
  FaSave,
  FaIdCard,
  FaUniversity,
  FaCodeBranch,
  FaUsers,
} from "react-icons/fa";

import "./StudentForm.css";

function StudentForm({
  show,
  onClose,
  onSave,
  selectedStudentData,
  colleges = [],
  branches = [],
  sections = [],
}) {
  const [name, setName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhoneNumber, setGuardianPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (selectedStudentData) {
      setName(selectedStudentData.name || "");
      setStudentCode(selectedStudentData.studentCode || "");
      setCollegeId(selectedStudentData.collegeId || "");
      setBranchId(selectedStudentData.branchId || "");
      setSectionId(selectedStudentData.sectionId || "");
      setGuardianName(selectedStudentData.guardianName || "");
      setGuardianPhoneNumber(selectedStudentData.guardianPhoneNumber || "");
      setEmail(selectedStudentData.email || "");
      setPhoneNumber(selectedStudentData.phoneNumber || "");
      setPassword(selectedStudentData.password || "");
      setAddress(selectedStudentData.address || "");
    } else {
      setName("");
      setStudentCode("");
      setCollegeId("");
      setBranchId("");
      setSectionId("");
      setGuardianName("");
      setGuardianPhoneNumber("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setAddress("");
    }
  }, [selectedStudentData, show]);

  const collegeOptions = colleges.map((college) => ({
    value: college.collegeId,
    label:
      college.collegeName ||
      college.instituteName ||
      college.name ||
      String(college.collegeId || ""),
  }));

  const branchOptions = branches
    .filter(
      (branch) => !collegeId || Number(branch.collegeId) === Number(collegeId),
    )
    .map((branch) => ({
      value: branch.branchId,
      label: branch.branchName || branch.name || String(branch.branchId || ""),
    }));

  const sectionOptions = sections
    .filter(
      (section) =>
        (!collegeId || Number(section.collegeId) === Number(collegeId)) &&
        (!branchId || Number(section.branchId) === Number(branchId)),
    )
    .map((section) => ({
      value: section.sectionId,
      label:
        section.sectionName || section.name || String(section.sectionId || ""),
    }));

  if (!show) return null;

  const handleSave = () => {
    const validation = validateStudentForm({
      name,
      studentCode,
      collegeId,
      branchId,
      sectionId,
      guardianName,
      guardianPhoneNumber,
      email,
      phoneNumber,
      password,
      address,
    });

    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    const studentData = {
      ...(selectedStudentData && {
        userId: selectedStudentData.userId,
      }),

      name: name.trim(),
      studentCode: Number(studentCode),
      collegeId: Number(collegeId),
      branchId: Number(branchId),
      sectionId: Number(sectionId),
      guardianName: guardianName.trim(),
      guardianPhoneNumber: String(guardianPhoneNumber).replace(/\D/g, ""),
      email: email.trim(),
      phoneNumber: String(phoneNumber).replace(/\D/g, ""),
      password: password.trim(),
      address: address.trim(),
    };

    onSave(studentData);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="branch-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{selectedStudentData ? "Edit Student" : "Add Student"}</h2>

            <p>
              {selectedStudentData
                ? "Update Student details."
                : "Create a new Student."}
            </p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">Student Information</h3>

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

              {/* Student Code */}
              <div className="form-group">
                <label>
                  Student Code <span>*</span>
                </label>

                <div className="input-box">
                  <FaIdCard className="input-icon" />

                  <input
                    type="text"
                    placeholder="Enter Student Code"
                    value={studentCode}
                    onChange={(e) =>
                      setStudentCode(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>
              </div>

              {/* College */}
              <div className="form-group">
                <label>
                  College <span>*</span>
                </label>

                <div className="input-box">
                  <FaUniversity className="input-icon" />

                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    options={collegeOptions}
                    value={
                      collegeOptions.find(
                        (option) => String(option.value) === String(collegeId),
                      ) || null
                    }
                    onChange={(option) => {
                      setCollegeId(option?.value || "");
                      setBranchId("");
                      setSectionId("");
                    }}
                    placeholder="Search College"
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "No college found"}
                  />
                </div>
              </div>

              {/* Branch */}
              <div className="form-group">
                <label>
                  Branch <span>*</span>
                </label>

                <div className="input-box">
                  <FaCodeBranch className="input-icon" />

                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    options={branchOptions}
                    value={
                      branchOptions.find(
                        (option) => String(option.value) === String(branchId),
                      ) || null
                    }
                    onChange={(option) => {
                      setBranchId(option?.value || "");
                      setSectionId("");
                    }}
                    placeholder="Search Branch"
                    isSearchable
                    isClearable
                    isDisabled={!collegeId}
                    noOptionsMessage={() => "No branch found"}
                  />
                </div>
              </div>

              {/* Section */}
              <div className="form-group">
                <label>
                  Section <span>*</span>
                </label>

                <div className="input-box">
                  <FaUsers className="input-icon" />

                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    options={sectionOptions}
                    value={
                      sectionOptions.find(
                        (option) => String(option.value) === String(sectionId),
                      ) || null
                    }
                    onChange={(option) => setSectionId(option?.value || "")}
                    placeholder="Search Section"
                    isSearchable
                    isClearable
                    isDisabled={!branchId}
                    noOptionsMessage={() => "No section found"}
                  />
                </div>
              </div>

              {/* Guardian Name */}
              <div className="form-group">
                <label>
                  Guardian Name <span>*</span>
                </label>

                <div className="input-box">
                  <FaUser className="input-icon" />

                  <input
                    type="text"
                    placeholder="Enter Guardian Name"
                    value={guardianName}
                    onChange={(e) =>
                      setGuardianName(
                        e.target.value.replace(/[^A-Za-z\s]/g, ""),
                      )
                    }
                  />
                </div>
              </div>

              {/* Guardian Phone Number */}
              <div className="form-group">
                <label>
                  Guardian Phone Number <span>*</span>
                </label>

                <div className="input-box">
                  <FaPhone className="input-icon" />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter Guardian Phone Number"
                    value={guardianPhoneNumber}
                    onChange={(e) =>
                      setGuardianPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
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
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter Phone Number"
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
            {selectedStudentData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default StudentForm;
