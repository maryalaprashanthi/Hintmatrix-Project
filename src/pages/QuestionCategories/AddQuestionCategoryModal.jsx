import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { FaTimes, FaSave, FaBook, FaListAlt, FaTag } from "react-icons/fa";

import "./QuestionCategories.css";
import QuestionCategoryService from "../../services/QuestionCategoryService";
import CourseService from "../../services/CourseService";
import ChapterService from "../../services/ChapterService";

function AddQuestionCategoryModal({
  show,
  closeModal,
  chapterName,
  initialData,
  chapterId,
  selectedChapter,
  refreshCategories,
  onSuccess,
}) {
  const [chapterIdState, setChapterIdState] = useState("");
  const [chapters, setChapters] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [shortName, setShortName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [courseId, setCourseId] = useState("");

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    ChapterService.getAll()
      .then((response) => {
        setChapters(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to load chapters", error);
      });
  }, []);
  // Load courses
  useEffect(() => {
    CourseService.getAllCourses()
      .then((response) => {
        setCourses(response.data || []);
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
      setCourseId(
        initialData.courseId
          ? String(initialData.courseId)
          : selectedChapter?.courseId
            ? String(selectedChapter.courseId)
            : "",
      );
      setChapterIdState(
        initialData.chapterId
          ? String(initialData.chapterId)
          : chapterId
            ? String(chapterId)
            : "",
      );
      setCategoryName(initialData.name || "");

      setShortName(initialData.shortName || "");

      setIsActive(
        initialData.activeRow !== undefined ? initialData.activeRow : true,
      );
    } else {
      setCategoryName("");

      setShortName("");

      setCourseId(
        selectedChapter?.courseId ? String(selectedChapter.courseId) : "",
      );
      setChapterIdState(
        initialData?.chapterId
          ? String(initialData.chapterId)
          : chapterId
            ? String(chapterId)
            : "",
      );

      setIsActive(true);
    }
  }, [initialData, show, chapterId, selectedChapter]);

  const courseOptions = courses.map((course) => ({
    value: course.courseId,
    label:
      course.name ||
      course.courseName ||
      course.title ||
      String(course.courseId || ""),
  }));

  const chapterOptions = chapters
    .filter(
      (chapter) => !courseId || Number(chapter.courseId) === Number(courseId),
    )
    .map((chapter) => ({
      value: chapter.chapterId,
      label:
        chapter.name ||
        chapter.chapterName ||
        chapter.title ||
        String(chapter.chapterId || ""),
    }));

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

    if (!chapterIdState) {
      alert("Please select Chapter");
      return;
    }

    const requestDTO = {
      courseId: Number(courseId),

      chapterId: Number(chapterIdState),

      name: categoryName.trim(),

      shortName: shortName.trim(),

      activeRow: isActive,
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

      if (refreshCategories) {
        refreshCategories();
      }

      closeModal();

      if (onSuccess) {
        onSuccess();
      }
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

                    <Select
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                      }}
                      options={courseOptions}
                      value={
                        courseOptions.find(
                          (option) => String(option.value) === String(courseId),
                        ) || null
                      }
                      onChange={(option) => {
                        setCourseId(option?.value || "");
                        setChapterIdState("");
                      }}
                      placeholder="Search Course"
                      isSearchable
                      isClearable
                      noOptionsMessage={() => "No course found"}
                    />
                  </div>
                </div>

                {/* Chapter */}

                <div className="form-group">
                  <label>
                    Chapter <span>*</span>
                  </label>

                  <div className="input-box">
                    <FaListAlt className="input-icon" />

                    <Select
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                      }}
                      options={chapterOptions}
                      value={
                        chapterOptions.find(
                          (option) =>
                            String(option.value) === String(chapterIdState),
                        ) || null
                      }
                      onChange={(option) =>
                        setChapterIdState(option?.value || "")
                      }
                      placeholder="Search Chapter"
                      isSearchable
                      isClearable
                      isDisabled={!courseId}
                      noOptionsMessage={() => "No chapter found"}
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
                      onChange={(e) => {
                        if (/^[A-Za-z\s]*$/.test(e.target.value)) {
                          setCategoryName(e.target.value);
                        }
                      }}
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
