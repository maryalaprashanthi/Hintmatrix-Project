import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Select, { components } from "react-select";

import { FaTimes, FaBook, FaCalendarAlt } from "react-icons/fa";

import "./AddExamModal.css";

// Checkbox option for chapter dropdown

const CheckboxOption = (props) => {
  return (
    <components.Option {...props}>
      <input type="checkbox" checked={props.isSelected} readOnly />

      <span className="ms-2">{props.label}</span>
    </components.Option>
  );
};

export default function AddExamModal({ show, handleClose, examData, onSave }) {
  const collegeOptions = [
    {
      value: 1,
      label: "ABC College",
    },

    {
      value: 2,
      label: "XYZ College",
    },
  ];

  const branchOptions = [
    {
      value: 1,
      label: "Commerce",
    },

    {
      value: 2,
      label: "Science",
    },
  ];

  const courseOptions = [
    {
      value: 1,
      label: "B.Com",
    },

    {
      value: 2,
      label: "BBA",
    },
  ];

  const sectionOptions = [
    {
      value: 1,
      label: "Section A",
    },

    {
      value: 2,
      label: "Section B",
    },
  ];

  const chapterOptions = [
    {
      value: 1,
      label: "Prepare Final Accounts",
    },

    {
      value: 2,
      label: "Trial Balance",
    },

    {
      value: 3,
      label: "Depreciation",
    },

    {
      value: 4,
      label: "Partnership Accounts",
    },

    {
      value: 5,
      label: "Bills of Exchange",
    },
  ];

  const [examName, setExamName] = useState("");

  const [college, setCollege] = useState(null);

  const [branch, setBranch] = useState(null);

  const [course, setCourse] = useState(null);

  const [section, setSection] = useState(null);

  const [chapters, setChapters] = useState([]);

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");
  // Fill form when editing

  useEffect(() => {
    if (examData) {
      setExamName(examData.examName || "");

      setCollege(examData.college || null);

      setBranch(examData.branch || null);

      setCourse(examData.course || null);

      setSection(examData.section || null);

      setChapters(examData.chapters || []);

      setStartDate(examData.startDate || "");

      setEndDate(examData.endDate || "");
    }
  }, [examData]);

  const handleSave = () => {
    if (!examName.trim()) {
      alert("Enter Exam Name");
      return;
    }

    if (!college) {
      alert("Select College");
      return;
    }

    if (!course) {
      alert("Select Course");
      return;
    }

    if (chapters.length === 0) {
      alert("Select at least one chapter");
      return;
    }

    const payload = {
      examName,

      college,

      branch,

      course,

      section,

      chapters,

      startDate,

      endDate,
    };

    onSave(payload);

    onClose();
  };

  const onClose = () => {
    setExamName("");

    setCollege(null);

    setBranch(null);

    setCourse(null);

    setSection(null);

    setChapters([]);

    setStartDate("");

    setEndDate("");

    handleClose();
  };

  if (!show) return null;

  return createPortal(
    <>
      <div className="modal-overlay">
        <div className="branch-modal">
          <div className="modal-header">
            <div>
              <h2>{examData ? "Edit Exam" : "Add Exam"}</h2>

              <p>
                {examData
                  ? "Update examination details."
                  : "Create a new examination."}
              </p>
            </div>

            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <div className="modal-body">
            <div className="form-card">
              <h3 className="section-title">Exam Information</h3>

              <div className="form-grid">
                {/* Exam Name */}

                <div className="form-group">
                  <label>
                    Exam Name <span>*</span>
                  </label>

                  <div className="input-box">
                    <FaBook className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Exam Name"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                    />
                  </div>
                </div>

                {/* College */}

                <div className="form-group">
                  <label>
                    College <span>*</span>
                  </label>

                  <Select
                    options={collegeOptions}
                    value={college}
                    onChange={setCollege}
                    placeholder="Select College"
                    isSearchable
                  />
                </div>

                {/* Branch */}

                <div className="form-group">
                  <label>Branch</label>

                  <Select
                    options={branchOptions}
                    value={branch}
                    onChange={setBranch}
                    placeholder="Select Branch"
                    isSearchable
                  />
                </div>

                {/* Course */}

                <div className="form-group">
                  <label>
                    Course <span>*</span>
                  </label>

                  <Select
                    options={courseOptions}
                    value={course}
                    onChange={setCourse}
                    placeholder="Select Course"
                    isSearchable
                  />
                </div>

                {/* Section */}

                <div className="form-group">
                  <label>Section</label>

                  <Select
                    options={sectionOptions}
                    value={section}
                    onChange={setSection}
                    placeholder="Select Section"
                    isSearchable
                  />
                </div>

                {/* Chapter Autocomplete + Checkbox */}

                <div className="form-group">
                  <label>
                    Select Chapters <span>*</span>
                  </label>

                  <Select
                    options={chapterOptions}
                    value={chapters}
                    onChange={(selected) => {
                      setChapters(selected || []);
                    }}
                    placeholder="Search & Select Chapters"
                    isSearchable={true}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    components={{
                      Option: CheckboxOption,
                    }}
                    filterOption={(option, inputValue) =>
                      option.label

                        .toLowerCase()

                        .includes(inputValue.toLowerCase())
                    }
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}

            <div className="form-card">
              <h3 className="section-title">Schedule</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Start Date</label>

                  <div className="input-box">
                    <FaCalendarAlt className="input-icon" />

                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>End Date</label>

                  <div className="input-box">
                    <FaCalendarAlt className="input-icon" />

                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>

              <button className="btn btn-primary" onClick={handleSave}>
                {examData ? "Update Exam" : "Save Exam"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,

    document.body,
  );
}
