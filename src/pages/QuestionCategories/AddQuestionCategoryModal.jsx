import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaSave, FaBook, FaListAlt, FaTag } from "react-icons/fa";

import "./QuestionCategories.css";

function AddQuestionCategoryModal({
  show,
  closeModal,
  chapterName,
  initialData,
}) {
  const [categoryName, setCategoryName] = useState("");
  const [shortName, setShortName] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.name || "");
      setShortName(initialData.shortName || "");
      setIsActive(
        initialData.isActive !== undefined ? initialData.isActive : true,
      );
    } else {
      setCategoryName("");
      setShortName("");
      setIsActive(true);
    }
  }, [initialData, show]);

  if (!show) return null;

  const handleSave = (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Please enter Category Name.");
      return;
    }

    const categoryData = {
      categoryName: categoryName.trim(),
      shortName: shortName.trim(),
      chapterName,
      isActive,
    };

    console.log(categoryData);

    closeModal();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="question-modal">
        {/* Header */}

        <div className="modal-header">
          <div className="modal-title">
            <h2>
              {initialData ? "Edit Question Category" : "Add Question Category"}
            </h2>

            <p>
              {initialData
                ? "Update the question category."
                : "Create a new question category."}
            </p>
          </div>

          <button type="button" className="close-btn" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}

        <div className="modal-body">
          <form onSubmit={handleSave}>
            <div className="form-card">
              <h3 className="section-title">Question Category Information</h3>

              <div className="form-grid">
                {/* Course */}

                <div className="form-group">
                  <label>
                    Course <span>*</span>
                  </label>

                  <div className="input-box">
                    <FaBook className="input-icon" />

                    <select>
                      <option>Select Course</option>
                      <option>B.Com - 1st Year</option>
                      <option>CA Foundation</option>
                      <option>CBSE Class-11</option>
                      <option>Jr. Accountancy</option>
                      <option>Combo Pack</option>
                      <option>Inter CBSE CAF B.Com</option>
                    </select>
                  </div>
                </div>

                {/* Chapter */}

                <div className="form-group">
                  <label>
                    Chapter <span>*</span>
                  </label>

                  <div className="input-box">
                    <FaListAlt className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Chapter Name"
                      value={chapterName}
                      onChange={(e) => setChapter(e.target.value)}
                    />
                  </div>
                </div>
                {/* Category Name */}

                <div className="form-group">
                  <label>
                    Category Name <span>*</span>
                  </label>

                  <div className="input-box">
                    <FaTag className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Category Name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Short Name */}

                <div className="form-group">
                  <label>Short Name</label>

                  <div className="input-box">
                    <FaTag className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Short Name"
                      value={shortName}
                      onChange={(e) => setShortName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}

            <div className="form-card">
              <h3 className="section-title">Status</h3>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="activeStatus"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />

                <label className="form-check-label" htmlFor="activeStatus">
                  Active
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}

        <div className="modal-footer d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeModal}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            <FaSave className="me-2" />

            {initialData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default AddQuestionCategoryModal;
