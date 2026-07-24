import { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaBook,
  FaGraduationCap,
  FaSave,
} from "react-icons/fa";

import "./ChapterForm.css";

function ChapterForm({ show, onClose, onSave }) {
  const [courseId, setCourseId] = useState("");
  const [chapterName, setChapterName] = useState("");

  if (!show) return null;

  const handleSave = () => {
    if (!courseId || !chapterName.trim()) {
      alert("Please fill all the fields.");
      return;
    }

    const newChapter = {
      courseId: Number(courseId),
      chapterName,
    };

    onSave(newChapter);

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
            <h2>Add Chapter</h2>
            <p>Create a new chapter.</p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>

        </div>

        {/* Body */}
        <div className="modal-body">

          <div className="form-card">

            <h3 className="section-title">
              Chapter Information
            </h3>

            <div className="form-grid">

              {/* Course Id */}
              <div className="form-group">

                <label>
                  Course Id <span>*</span>
                </label>

                <div className="input-box">

                  <FaGraduationCap className="input-icon" />

                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">
                      Select Course Id
                    </option>

                    <option value="1">Course 1</option>
                    <option value="2">Course 2</option>
                    <option value="3">Course 3</option>

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
                    onChange={(e) => setChapterName(e.target.value)}
                  />

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
    </div>,
    document.body
  );
}

export default ChapterForm;