import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { FaTimes, FaBook, FaGraduationCap, FaSave } from "react-icons/fa";

import "./ChapterForm.css";
import CourseService from "../../services/CourseService";
import SubjectService from "../../services/SubjectService";

function EditChapterForm({ show, chapter, onClose, onUpdate }) {
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

  useEffect(() => {
    if (chapter) {
      setCourseId(chapter.courseId || "");
      setSubjectId(chapter.subjectId ?? chapter.subject_id ?? "");
      setChapterName(chapter.name || "");
      setIsActive(chapter.activeRow !== undefined ? chapter.activeRow : true);
    }
  }, [chapter]);

  const loadCourses = async () => {
    try {
      const response = await CourseService.getAllCourses();

      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await SubjectService.getAll();

      setSubjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  const subjectOptions = subjects.filter(
    (subject) =>
      !courseId ||
      String(subject.courseId ?? subject.course_id) === String(courseId),
  );

  if (!show) return null;

  const handleUpdate = () => {
    if (!courseId || !subjectId || !chapterName.trim()) {
      alert("Please fill all the fields.");
      return;
    }

    const updatedChapter = {
      courseId: Number(courseId),
      subjectId: Number(subjectId),

      name: chapterName.trim(),
      activeRow: isActive,
    };

    onUpdate(chapter.chapterId, updatedChapter);
  };

  const handleClose = () => {
    setCourseId("");
    setSubjectId("");
    setChapterName("");
    setIsActive(true);

    onClose();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="chapter-modal">
        {/* Header */}

        <div className="modal-header">
          <div>
            <h2>Edit Chapter</h2>

            <p>Update chapter information.</p>
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
              {/* Course */}

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

              {/* Subject */}

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
                    value={chapterName}
                    placeholder="Enter Chapter Name"
                    onChange={(e) => setChapterName(e.target.value)}
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
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>

          <button className="btn btn-primary" onClick={handleUpdate}>
            <FaSave className="me-2" />
            Update
          </button>
        </div>
      </div>
    </div>,

    document.body,
  );
}

export default EditChapterForm;
