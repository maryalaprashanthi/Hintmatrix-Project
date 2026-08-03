import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaSave, FaBook, FaListAlt, FaTag } from "react-icons/fa";

import "./QuestionCategories.css";
import QuestionCategoryService from "../../services/QuestionCategoryService";
import CourseService from "../../services/CourseService";

function AddQuestionCategoryModal({
  show,
  closeModal,
  chapterName,
  initialData,
  chapterId,
  selectedChapter,
  refreshCategories,
}) {
  const [chapter, setChapter] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [shortName, setShortName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [courseId, setCourseId] = useState("");

  const [courses, setCourses] = useState([]);

  // Load courses
  useEffect(() => {
    CourseService.getAllCourses()
      .then((response) => {
        setCourses(response.data);
        // Automatically select the course when coming from Chapters
        if (!initialData && selectedChapter?.courseId) {
          setCourseId(String(selectedChapter.courseId));
        }
      })
      .catch((error) => {
        console.error("Failed to load courses", error);
      });
  }, [selectedChapter, initialData]);

  // Load edit data
  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.name || "");

      setShortName(initialData.shortName || "");

      setIsActive(
        initialData.isActive !== undefined ? initialData.isActive : true,
      );

      setCourseId(initialData.courseId ? String(initialData.courseId) : "");
    } else {
      setCategoryName("");

      setShortName("");

      setCourseId(
        selectedChapter?.courseId ? String(selectedChapter.courseId) : "",
      );
      setChapter(chapterName || "");

      setIsActive(true);
    }
  }, [initialData, show]);

  if (!show) return null;

  const handleSave = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Please enter Category Name");

      return;
    }

    if (!courseId) {
      alert("Please select Course");

      return;
    }

    const requestDTO = {
      courseId: Number(courseId),

      chapterId: Number(chapterId),

      name: categoryName.trim(),

      shortName: shortName.trim(),

      isActive: isActive,
    };

    try {
      let response;

      if (initialData) {
        response = await QuestionCategoryService.update(
          initialData.categoryId,
          requestDTO,
        );
      } else {
        response = await QuestionCategoryService.create(requestDTO);
      }

      alert(response.data);

      if (refreshCategories) {
        refreshCategories();
      }

      closeModal();
    } catch (error) {
      console.error(error);

      alert(error.response?.data || "Something went wrong");
    }
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

        <form onSubmit={handleSave}>
          <div className="modal-body">
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

                {/* Chapter */}

                <div className="form-group">
                  <label>
                    Chapter <span>*</span>
                  </label>

                  <div className="input-box">
                    <FaListAlt className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Chapter"
                      value={chapter}
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
              </div>
            </div>

            {/* Status */}

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

          {/* Footer */}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              <FaSave className="me-2" />

              {initialData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>,

    document.body,
  );
}

export default AddQuestionCategoryModal;
