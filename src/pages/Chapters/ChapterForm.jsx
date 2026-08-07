import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { FaTimes, FaBook, FaGraduationCap, FaSave } from "react-icons/fa";

import "./ChapterForm.css";
import CourseService from "../../services/CourseService";

function ChapterForm({ show, onClose, onSave, selectedChapterData }) {
  const [courseId, setCourseId] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [courses, setCourses] = useState([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (show) {
      loadCourses();
    }
  }, [show]);

  const loadCourses = async () => {
    try {
      console.log("Loading courses...");

      const response = await CourseService.getAllCourses();

      console.log("Courses:", response.data);

      setCourses(response.data);
    } catch (error) {
      console.error("Error retrieving courses:", error);
    }
  };

  useEffect(() => {
    if (show) {
      if (selectedChapterData) {
        setCourseId(selectedChapterData.courseId || "");
        setChapterName(selectedChapterData.name || "");
        setIsActive(
          selectedChapterData.activeRow !== undefined
            ? selectedChapterData.activeRow
            : true,
        );
      } else {
        setCourseId("");
        setChapterName("");
        setIsActive(true);
      }
    }
  }, [show, selectedChapterData]);

  if (!show) return null;

  const handleSave = () => {
    if (!courseId || !chapterName.trim()) {
      alert("Please fill all the fields.");

      return;
    }

    const newChapter = {
      ...(selectedChapterData && {
        chapterId: selectedChapterData.chapterId,
      }),
      courseId: Number(courseId),
      name: chapterName.trim(),
      activeRow: isActive,
    };

    console.log("Chapter Payload:", newChapter);

    onSave(newChapter);

    setCourseId("");

    setChapterName("");
    setIsActive(true);
  };

  const handleClose = () => {
    setCourseId("");
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
