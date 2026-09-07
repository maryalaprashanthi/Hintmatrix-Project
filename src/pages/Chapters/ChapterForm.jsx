import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { FaTimes, FaBook, FaGraduationCap, FaSave } from "react-icons/fa";

import "./ChapterForm.css";
import CourseService from "../../services/CourseService";
import SubjectService from "../../services/SubjectService";

function ChapterForm({
  show,
  onClose,
  onSave,
  selectedChapterData,
  presetCourseId,
  presetSubjectId,
}) {
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (show) {
      loadCourses();
      loadSubjects();
    }
  }, [show]);

  const loadCourses = async () => {
    try {
      console.log("Loading courses...");

      const response = await CourseService.getAllCourses();

      console.log("Courses:", response.data);

      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error retrieving courses:", error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await SubjectService.getAll();

      setSubjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error retrieving subjects:", error);
    }
  };

  // Only the selected course's subjects are pickable.
  const subjectOptions = subjects.filter(
    (subject) =>
      !courseId ||
      String(subject.courseId ?? subject.course_id) === String(courseId),
  );

  useEffect(() => {
    if (show) {
      if (selectedChapterData) {
        setCourseId(selectedChapterData.courseId || "");
        setSubjectId(
          selectedChapterData.subjectId ??
            selectedChapterData.subject_id ??
            "",
        );
        setChapterName(selectedChapterData.name || "");
        setIsActive(
          selectedChapterData.activeRow !== undefined
            ? selectedChapterData.activeRow
            : true,
        );
      } else {
        // Adding from a subject's page - pre-select that subject/course.
        setCourseId(presetCourseId ? String(presetCourseId) : "");
        setSubjectId(presetSubjectId ? String(presetSubjectId) : "");
        setChapterName("");
        setIsActive(true);
      }
    }
  }, [show, selectedChapterData, presetCourseId, presetSubjectId]);

  if (!show) return null;

  const resetFields = () => {
    setCourseId("");
    setSubjectId("");
    setChapterName("");
    setIsActive(true);
  };

  const handleSave = () => {
    if (!courseId || !subjectId || !chapterName.trim()) {
      alert("Please fill all the fields.");

      return;
    }

    const newChapter = {
      ...(selectedChapterData && {
        chapterId: selectedChapterData.chapterId,
      }),
      courseId: Number(courseId),
      subjectId: Number(subjectId),
      name: chapterName.trim(),
      activeRow: isActive,
    };

    console.log("Chapter Payload:", newChapter);

    onSave(newChapter);

    resetFields();
  };

  const handleClose = () => {
    resetFields();

    onClose();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="chapter-modal">
        {/* Header */}

        <div className="modal-header">
          <div>
            <h2>{selectedChapterData ? "Edit Chapter" : "Add Chapter"}</h2>

            <p>
              {selectedChapterData
                ? "Update the chapter."
                : "Create a new chapter."}
            </p>
          </div>

          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}

        <div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">Chapter Information</h3>

            <div className="form-grid">
              {/* Course Dropdown */}

              <div className="form-group">
                <label>
                  Course <span>*</span>
                </label>

                <div className="input-box">
                  <FaGraduationCap className="input-icon" />

                  <select
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      setSubjectId("");
                    }}
                  >
                    <option value="">Select Course</option>

                    {courses.map((course) => (
                      <option key={course.courseId} value={course.courseId}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Dropdown */}

              <div className="form-group">
                <label>
                  Subject <span>*</span>
                </label>

                <div className="input-box">
                  <FaGraduationCap className="input-icon" />

                  <select
                    value={subjectId}
                    disabled={!courseId}
                    onChange={(e) => setSubjectId(e.target.value)}
                  >
                    <option value="">Select Subject</option>

                    {subjectOptions.map((subject) => (
                      <option
                        key={subject.subjectId ?? subject.subject_id}
                        value={subject.subjectId ?? subject.subject_id}
                      >
                        {subject.subjectName ?? subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chapter Name */}

             <div className="form-group">
             <label>
               Chapter Name <span>*</span>
             </label>

              <div className="input-box">
              <FaBook className="input-icon" />

              <input
              type="text"
              placeholder="Enter Chapter Name"
              value={chapterName}
              onChange={(e) => {
              const value = e.target.value;

              if (/^[A-Za-z\s]*$/.test(value)) {
              setChapterName(value);
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

        {/* Footer */}

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
            Save
          </button>
        </div>
      </div>
    </div>,

    document.body,
  );
}

export default ChapterForm;
