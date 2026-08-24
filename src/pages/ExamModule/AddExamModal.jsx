import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Select, { components } from "react-select";
import apiClient from "../../services/apiClient";
import { FaTimes, FaBook, FaCalendarAlt } from "react-icons/fa";

import "./AddExamModal.css";

// Checkbox option for chapter dropdown

const CheckboxOption = (props) => {
  return (
    <components.Option {...props}>
      <input type="checkbox" checked={props.isSelected} readOnly />

      <span className="ms-2" style={{ color: "#212529" }}>
        {props.label}
      </span>
    </components.Option>
  );
};

export default function AddExamModal({ show, handleClose, examData, onSave }) {
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);

  const [examName, setExamName] = useState("");

  const [college, setCollege] = useState(null);

  const [branch, setBranch] = useState(null);

  const [course, setCourse] = useState(null);

  const [section, setSection] = useState(null);

  const [chapters, setChapters] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  useEffect(() => {
    if (!show) return;

    const fetchColleges = async () => {
      try {
        const response = await apiClient.get("/api/college");

        setCollegeOptions(
          response.data.map((college) => ({
            value: college.collegeId,
            label: college.instituteName,
          })),
        );
      } catch (error) {
        console.error("Error fetching colleges:", error);
        setCollegeOptions([]);
      }
    };

    fetchColleges();
  }, [show]);
  const handleCollegeChange = (selected) => {
    setCollege(selected);

    setBranch(null);
    setCourse(null);
    setSection(null);
    setChapters([]);

    setBranchOptions([]);
    setCourseOptions([]);
    setSectionOptions([]);
    setChapterOptions([]);
  };
  useEffect(() => {
    if (!college?.value) {
      setBranchOptions([]);
      return;
    }

    const fetchBranches = async () => {
      try {
        const response = await apiClient.get("/api/branch");

        const filtered = response.data
          .filter((branch) => branch.collegeId === college.value)
          .map((branch) => ({
            value: branch.branchId,
            label: branch.branchName,
          }));

        setBranchOptions(filtered);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranchOptions([]);
      }
    };

    fetchBranches();
  }, [college]);
  useEffect(() => {
    if (!college?.value || !branch?.value) {
      setCourseOptions([]);
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await apiClient.get("/api/course");

        const filtered = response.data
          .filter(
            (course) =>
              course.collegeId === college.value &&
              course.branchId === branch.value,
          )
          .map((course) => ({
            value: course.courseId,
            label: course.name,
          }));

        setCourseOptions(filtered);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourseOptions([]);
      }
    };

    fetchCourses();
  }, [college, branch]);
  const handleBranchChange = (selected) => {
    setBranch(selected);

    setCourse(null);
    setSection(null);
    setChapters([]);

    setCourseOptions([]);
    setSectionOptions([]);
    setChapterOptions([]);
  };
  useEffect(() => {
    if (!course?.value) {
      setSectionOptions([]);
      return;
    }

    const fetchSections = async () => {
      try {
        const response = await apiClient.get("/api/section");

        const filtered = response.data
          .filter((section) => section.courseId === course.value)
          .map((section) => ({
            value: section.sectionId,
            label: section.sectionName,
          }));

        setSectionOptions(filtered);
      } catch (error) {
        console.error("Error fetching sections:", error);
        setSectionOptions([]);
      }
    };

    fetchSections();
  }, [course]);
  const handleCourseChange = (selected) => {
    setCourse(selected);

    setSection(null);
    setChapters([]);

    setSectionOptions([]);
    setChapterOptions([]);
  };
  useEffect(() => {
    if (!course?.value) {
      setChapterOptions([]);
      return;
    }

    const fetchChapters = async () => {
      try {
        const response = await apiClient.get("/api/chapter");

        const filtered = response.data
          .filter((chapter) => chapter.courseId === course.value)
          .map((chapter) => ({
            value: chapter.chapterId,
            label: chapter.name,
          }));

        setChapterOptions(filtered);
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setChapterOptions([]);
      }
    };

    fetchChapters();
  }, [course]);
  useEffect(() => {
    if (!examData || collegeOptions.length === 0) return;

    setExamName(examData.examName || "");

    const selectedCollege = collegeOptions.find(
      (item) => item.value === examData.collegeId,
    );

    setCollege(selectedCollege || null);

    if (examData.startDate) {
      const start = examData.startDate.split("T");

      setStartDate(start[0] || "");
      setStartTime(start[1]?.substring(0, 5) || "");
    } else {
      setStartDate("");
      setStartTime("");
    }

    if (examData.endDate) {
      const end = examData.endDate.split("T");

      setEndDate(end[0] || "");
      setEndTime(end[1]?.substring(0, 5) || "");
    } else {
      setEndDate("");
      setEndTime("");
    }
  }, [examData, collegeOptions]);
  useEffect(() => {
    if (!examData || !examData.branchId || branchOptions.length === 0) return;

    const selectedBranch = branchOptions.find(
      (item) => item.value === examData.branchId,
    );

    setBranch(selectedBranch || null);
  }, [examData, branchOptions]);
  useEffect(() => {
    if (!examData || !examData.courseId || courseOptions.length === 0) return;

    const selectedCourse = courseOptions.find(
      (item) => item.value === examData.courseId,
    );

    setCourse(selectedCourse || null);
  }, [examData, courseOptions]);
  useEffect(() => {
    if (!examData || !examData.sectionId || sectionOptions.length === 0) return;

    const selectedSection = sectionOptions.find(
      (item) => item.value === examData.sectionId,
    );

    setSection(selectedSection || null);
  }, [examData, sectionOptions]);
  useEffect(() => {
    if (!examData || !examData.chapterIds || chapterOptions.length === 0) {
      return;
    }

    const selectedChapters = chapterOptions.filter((item) =>
      examData.chapterIds.includes(item.value),
    );

    setChapters(selectedChapters);
  }, [examData, chapterOptions]);

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

    if (startDate && endDate && endDate < startDate) {
      alert("End date cannot be before start date");
      return;
    }
    if (!startDate || !startTime) {
      alert("Select start date and start time");
      return;
    }

    if (!endDate || !endTime) {
      alert("Select end date and end time");
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      alert("End date and time must be after start date and time");
      return;
    }
    const payload = {
      examName: examName.trim(),

      collegeId: college.value,

      branchId: branch?.value || null,

      courseId: course.value,

      sectionId: section?.value || null,

      chapterIds: chapters.map((chapter) => chapter.value),

      startDate: startDate && startTime ? `${startDate}T${startTime}:00` : null,

      endDate: endDate && endTime ? `${endDate}T${endTime}:00` : null,
    };

    console.log("Exam payload:", payload);

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
    setStartTime("");
    setEndTime("");

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
                    onChange={handleCollegeChange}
                    placeholder="Search College..."
                    isSearchable
                    isClearable
                  />
                </div>

                {/* Branch */}

                <div className="form-group">
                  <label>Branch</label>

                  <Select
                    options={branchOptions}
                    value={branch}
                    onChange={handleBranchChange}
                    placeholder="Search Branch..."
                    isSearchable
                    isClearable
                    isDisabled={!college}
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
                    onChange={handleCourseChange}
                    placeholder="Search Course..."
                    isSearchable
                    isClearable
                    isDisabled={!branch}
                  />
                </div>

                {/* Section */}

                <div className="form-group">
                  <label>Section</label>

                  <Select
                    options={sectionOptions}
                    value={section}
                    onChange={setSection}
                    placeholder="Search Section..."
                    isSearchable
                    isClearable
                    isDisabled={!course}
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
                    onChange={(selected) => setChapters(selected || [])}
                    placeholder="Search & Select Chapters..."
                    isSearchable
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    components={{
                      Option: CheckboxOption,
                    }}
                    isDisabled={!course}
                  />
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3 className="section-title">Schedule</h3>

              <div className="form-grid">
                {/* Start Date */}
                <div className="form-group">
                  <label>Start Date</label>

                  <div className="input-box">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Start Time */}
                <div className="form-group">
                  <label>Start Time</label>

                  <div className="input-box">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="form-group">
                  <label>End Date</label>

                  <div className="input-box">
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* End Time */}
                <div className="form-group">
                  <label>End Time</label>

                  <div className="input-box">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* <-- CLOSE modal-body HERE */}
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
    </>,

    document.body,
  );
}

