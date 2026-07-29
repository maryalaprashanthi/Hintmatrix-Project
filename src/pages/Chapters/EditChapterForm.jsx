import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { FaTimes, FaBook, FaGraduationCap, FaSave } from "react-icons/fa";

import "./ChapterForm.css";
import CourseService from "../../services/CourseService";

function EditChapterForm({ show, chapter, onClose, onUpdate }) {
  const [courseId, setCourseId] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (show) {
      loadCourses();
    }
  }, [show]);

  useEffect(() => {
    if (chapter) {
      setCourseId(chapter.courseId);
      setChapterName(chapter.name);
    }
  }, [chapter]);

  const loadCourses = async () => {
    try {
      const response = await CourseService.getAllCourses();

      setCourses(response.data);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  if (!show) return null;

  const handleUpdate = () => {
    if (!courseId || !chapterName.trim()) {
      alert("Please fill all the fields.");
      return;
    }

    const updatedChapter = {
      courseId: Number(courseId),

      name: chapterName.trim(),
    };

    onUpdate(chapter.chapterId, updatedChapter);
  };

  const handleClose = () => {
    setCourseId("");
    setChapterName("");

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
                    onChange={(e) => setCourseId(e.target.value)}
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
