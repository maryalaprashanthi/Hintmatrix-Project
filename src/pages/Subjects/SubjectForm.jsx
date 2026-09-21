import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";

import { FaTimes, FaLayerGroup, FaGraduationCap, FaSave } from "react-icons/fa";

import "../Chapters/ChapterForm.css";
import CourseService from "../../services/CourseService";

// One form for both add and edit. `selectedSubjectData` + `onUpdate` drives the
// edit path; `onSave` the create path.
function SubjectForm({
  show,
  onClose,
  onSave,
  onUpdate,
  selectedSubjectData,
  presetCourseId,
}) {
  const isEdit = Boolean(selectedSubjectData);

  const [courseId, setCourseId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [courses, setCourses] = useState([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (show) {
      loadCourses();
    }
  }, [show]);

  const loadCourses = async () => {
    try {
      const response = await CourseService.getAllCourses();

      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error retrieving courses:", error);
    }
  };

  useEffect(() => {
    if (!show) return;

    if (selectedSubjectData) {
      setCourseId(
        selectedSubjectData.courseId ?? selectedSubjectData.course_id ?? "",
      );
      setSubjectName(
        selectedSubjectData.subjectName || selectedSubjectData.name || "",
      );
      setIsActive(
        selectedSubjectData.activeRow !== undefined
          ? selectedSubjectData.activeRow
          : true,
      );
    } else {
      setCourseId(presetCourseId ? String(presetCourseId) : "");
      setSubjectName("");
      setIsActive(true);
    }
  }, [show, selectedSubjectData, presetCourseId]);

  if (!show) return null;

  const resetFields = () => {
    setCourseId("");
    setSubjectName("");
    setIsActive(true);
  };

  const handleSave = () => {
    if (!courseId || !subjectName.trim()) {
      alert("Please fill all the fields.");
      return;
    }

    // Backend SubjectRequestDTO: { courseId, subjectName, activeRow }
    const payload = {
      courseId: Number(courseId),
      subjectName: subjectName.trim(),
      activeRow: isActive,
    };

    console.log("Subject Payload:", payload);

    if (isEdit) {
      onUpdate(
        selectedSubjectData.subjectId ?? selectedSubjectData.subject_id,
        payload,
      );
    } else {
      onSave(payload);
      resetFields();
    }
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  const courseOptions = courses.map((course) => ({
    value: String(course.courseId),
    label: course.name || course.courseName || "Course",
  }));

  return createPortal(
    <div className="modal-overlay">
      <div className="chapter-modal">
        <div className="modal-header">
          <div>
            <h2>{isEdit ? "Edit Subject" : "Add Subject"}</h2>

            <p>{isEdit ? "Update the subject." : "Create a new subject."}</p>
          </div>

          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">Subject Information</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  Course <span>*</span>
                </label>

                <div className="select-box">
                  <FaGraduationCap className="select-icon" />

                  <Select
                    className="aq-search-select"
                    classNamePrefix="aq-select"
                    menuPlacement="bottom"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    options={courseOptions}
                    value={
                      courseOptions.find(
                        (option) => option.value === String(courseId),
                      ) || null
                    }
                    onChange={(option) => setCourseId(option?.value || "")}
                    placeholder="Select Course"
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "No course found"}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Subject Name <span>*</span>
                </label>

                <div className="input-box">
                  <FaLayerGroup className="input-icon" />

                  <input
                    type="text"
                    placeholder="Enter Subject Name"
                    value={subjectName}
                    onChange={(e) => {
                      if (/^[A-Za-z0-9\s&-]*$/.test(e.target.value)) {
                        setSubjectName(e.target.value);
                      }
                    }}
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
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            <FaSave className="me-2" />
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>,

    document.body,
  );
}

export default SubjectForm;
