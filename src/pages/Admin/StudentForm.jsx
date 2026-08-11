import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SuccessModal from "../../components/Common/SuccessModal";

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
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (selectedStudentData) {
      setName(selectedStudentData.name || "");
      setStudentCode(selectedStudentData.studentCode || "");
      setCollegeId(selectedStudentData.collegeId || "");
      setBranchId(selectedStudentData.branchId || "");
      setSectionId(selectedStudentData.sectionId || "");
      setGuardianName(selectedStudentData.guardianName || "");
      setGuardianPhoneNumber(
        selectedStudentData.guardianPhoneNumber || "",
      );
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

  // TEMPORARY CHECK
  console.log("STUDENT FORM COLLEGES:", colleges);
  console.log("STUDENT FORM BRANCHES:", branches);
  console.log("STUDENT FORM SECTIONS:", sections);

  if (!show) return null;

  const handleSave = () => {
    if (
      !name.trim() ||
      !studentCode ||
      !collegeId ||
      !branchId ||
      !sectionId ||
      !guardianName.trim() ||
      !guardianPhoneNumber.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password.trim() ||
      !address.trim()
    ) {
      alert("Please fill all the fields.");
      return;
    }

    const studentData = {
      ...(selectedStudentData && {
        userId: selectedStudentData.userId,
      }),

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
    };

    onSave(studentData);
    setShowSuccess(true);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="branch-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>
              {selectedStudentData ? "Edit Student" : "Add Student"}
            </h2>

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
                    onChange={(e) => setName(e.target.value)}
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
                    type="number"
                    placeholder="Enter Student Code"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
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

                  <Typeahead
                    id="college"
                    labelKey={(college) =>
                      college.collegeName ||
                      college.instituteName ||
                      college.name ||
                      String(college.collegeId || "")
                    }
                    options={colleges}
                    placeholder="Select College"
                    selected={colleges.filter(
                      (college) =>
                        String(college.collegeId) ===
                        String(collegeId),
                    )}
                    onChange={(selected) => {
                      setCollegeId(
                        selected.length
                          ? selected[0].collegeId
                          : "",
                      );
                    }}
                    clearButton
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

                  <Typeahead
                    id="branch"
                    labelKey={(branch) =>
                      branch.branchName ||
                      branch.name ||
                      String(branch.branchId || "")
                    }
                    options={branches}
                    placeholder="Select Branch"
                    selected={branches.filter(
                      (branch) =>
                        String(branch.branchId) ===
                        String(branchId),
                    )}
                    onChange={(selected) => {
                      setBranchId(
                        selected.length
                          ? selected[0].branchId
                          : "",
                      );
                    }}
                    clearButton
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

                  <Typeahead
                    id="section"
                    labelKey={(section) =>
                      section.sectionName ||
                      section.name ||
                      String(section.sectionId || "")
                    }
                    options={sections}
                    placeholder="Select Section"
                    selected={sections.filter(
                      (section) =>
                        String(section.sectionId) ===
                        String(sectionId),
                    )}
                    onChange={(selected) => {
                      setSectionId(
                        selected.length
                          ? selected[0].sectionId
                          : "",
                      );
                    }}
                    clearButton
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
                      setGuardianName(e.target.value)
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
                    type="tel"
                    placeholder="Enter Guardian Phone Number"
                    value={guardianPhoneNumber}
                    onChange={(e) =>
                      setGuardianPhoneNumber(e.target.value)
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
                    type="tel"
                    placeholder="Enter Phone Number"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value)
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
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
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

      <SuccessModal
        show={showSuccess}
        message={
          selectedStudentData
            ? "Student updated successfully!"
            : "Student saved successfully!"
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

export default StudentForm;