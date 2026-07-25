import { FaTimes, FaSave } from "react-icons/fa";
import { createPortal } from "react-dom";
import "./QuestionCategories.css"

function AddQuestionCategoryModal({
  show,
  closeModal,
  chapterName,
}) {
  if (!show) return null;

  return  createPortal(
    <div className="modal-overlay">
      <div className="question-modal">

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Add Question Category</h2>
            <p>Create a new question category.</p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={closeModal}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">

          <form>

            {/* Question Category Information */}
            <div className="form-card">

              <h3 className="section-title">
                Question Category Information
              </h3>

              <div className="form-grid">

                {/* Course */}
                <div className="form-group">
                  <label>
                    Course <span>*</span>
                  </label>

                  <div className="input-box">
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
                    <input
                      type="text"
                      value={chapterName}
                      readOnly
                    />
                  </div>
                </div>

                {/* Category Name */}
                <div className="form-group">
                  <label>
                    Category Name <span>*</span>
                  </label>

                  <div className="input-box">
                    <input
                      type="text"
                      placeholder="Enter Category Name"
                    />
                  </div>
                </div>

                {/* Short Name */}
                <div className="form-group">
                  <label>
                    Short Name
                  </label>

                  <div className="input-box">
                    <input
                      type="text"
                      placeholder="Enter Short Name"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Status */}
            <div className="form-card">

              <h3 className="section-title">
                Status
              </h3>

              <div className="form-check form-switch">

                <input
                  className="form-check-input"
                  type="checkbox"
                  id="activeStatus"
                  defaultChecked
                />

                <label
                  className="form-check-label"
                  htmlFor="activeStatus"
                >
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
            className="btn btn-outline-secondary"
            onClick={closeModal}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <FaSave />
            Save
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
}

export default AddQuestionCategoryModal;