import { useState } from "react";
import { createPortal } from "react-dom";

import {
  FaTimes,
  FaCloudUploadAlt,
  FaBook,
  FaUser,
  FaClock,
  FaLayerGroup,
  FaPen,
  FaSave,
} from "react-icons/fa";

import "./AddCourseModal.css";

function AddCourseModal({ show, onClose, onSave }) {
  const [courseName, setCourseName] = useState("");
  const [category, setCategory] = useState("Commerce");
  const [instructor, setInstructor] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  if (!show) return null;

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (!courseName.trim()) {
      alert("Please enter Course Name");
      return;
    }

    const newCourse = {
      title: courseName,
      image: imagePreview,
      category,
      level,
      duration,
      description,
      progress: "0%",
      button: "Start Learning",
    };

    onSave(newCourse);

    setCourseName("");
    setCategory("Commerce");
    setInstructor("");
    setCourseCode("");
    setLevel("Beginner");
    setDuration("");
    setDescription("");
    setImagePreview("");

    onClose();
  };

  return createPortal(
    <div className="modal-overlay">

      <div className="course-modal">

        {/* Header */}

        <div className="modal-header">

          <div>

            <h2>Add New Course</h2>

            <p>Create a new course for HintMatrix students.</p>

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

          <div className="top-section">

            {/* LEFT SIDE */}

            <div className="form-card info-card">

              <h3 className="section-title">

                <FaBook />

                Course Information

              </h3>

              <div className="form-grid">
              {/* Course Name */}

<div className="form-group">
  <label>
    Course Name <span>*</span>
  </label>

  <div className="input-box">
    <FaBook className="input-icon" />

    <input
      type="text"
      placeholder="Enter Course Name"
      value={courseName}
      onChange={(e) => setCourseName(e.target.value)}
    />
  </div>
</div>

{/* Category */}

<div className="form-group">
  <label>
    Category <span>*</span>
  </label>

  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
  >
    <option>Commerce</option>
    <option>CA Foundation</option>
    <option>School Curriculum</option>
    <option>Integrated Program</option>
  </select>
</div>

{/* Instructor */}

<div className="form-group">
  <label>Instructor</label>

  <div className="input-box">
    <FaUser className="input-icon" />

    <input
      type="text"
      placeholder="Instructor Name"
      value={instructor}
      onChange={(e) => setInstructor(e.target.value)}
    />
  </div>
</div>

{/* Course Code */}

<div className="form-group">
  <label>Course Code</label>

  <div className="input-box">
    <FaLayerGroup className="input-icon" />

    <input
      type="text"
      placeholder="BCOM101"
      value={courseCode}
      onChange={(e) => setCourseCode(e.target.value)}
    />
  </div>
</div>

{/* Level */}

<div className="form-group">
  <label>Level</label>

  <select
    value={level}
    onChange={(e) => setLevel(e.target.value)}
  >
    <option>Beginner</option>
    <option>Intermediate</option>
    <option>Advanced</option>
  </select>
</div>

{/* Duration */}

<div className="form-group">
  <label>Duration</label>

  <div className="input-box">
    <FaClock className="input-icon" />

    <input
      type="text"
      placeholder="Ex: 30 Lessons"
      value={duration}
      onChange={(e) => setDuration(e.target.value)}
    />
  </div>
</div>

</div>

</div>

{/* RIGHT SIDE */}

<div className="form-card upload-card">

  <h3 className="section-title">
    <FaCloudUploadAlt />
    Course Thumbnail
  </h3>
  <div className="upload-container">

  <FaCloudUploadAlt className="upload-icon" />

  <label>Upload Course Image</label>

  <input
    type="file"
    accept="image/*"
    onChange={handleImage}
  />

  {imagePreview && (
    <img
      src={imagePreview}
      alt="Preview"
      className="image-preview"
    />
  )}

</div>

</div>

</div>

{/* Description */}

<div className="form-card">

  <h3 className="section-title">

    <FaPen />

    Course Description

  </h3>

  <div className="textarea-box">

    <FaPen className="input-icon" />

    <textarea
      placeholder="Write course description..."
      value={description}
      onChange={(e) => setDescription(e.target.value)}
    />

  </div>

</div>

{/* Footer */}

<div className="modal-footer">

  <button
    className="cancel-btn"
    onClick={onClose}
  >
    Cancel
  </button>

  <button
    className="save-btn"
    onClick={handleSave}
  >
    <FaSave />
    Save Course
  </button>

</div>
        </div>

      </div>

    </div>,

    document.body

  );

}

export default AddCourseModal;
