import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { FaTimes, FaSave, FaBook, FaListAlt, FaTag, FaLayerGroup } from "react-icons/fa";

import "./Topics.css";
import TopicService from "../../services/TopicService";
import CourseService from "../../services/CourseService";
import SubjectService from "../../services/SubjectService";
import ChapterService from "../../services/ChapterService";

const idOf = (value) => (value === "" || value == null ? "" : String(value));

function AddTopicModal({
  show,
  closeModal,
  initialData,
  chapterId,
  subjectId,
  selectedChapter,
  refreshTopics,
  onSuccess,
}) {
  const [courseId, setCourseId] = useState("");
  const [subjectIdState, setSubjectIdState] = useState("");
  const [chapterIdState, setChapterIdState] = useState("");
  const [topicName, setTopicName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    CourseService.getAllCourses()
      .then((response) => setCourses(response.data || []))
      .catch((error) => console.error("Failed to load courses", error));

    SubjectService.getAll()
      .then((response) => setSubjects(response.data || []))
      .catch((error) => console.error("Failed to load subjects", error));

    ChapterService.getAll()
      .then((response) => setChapters(response.data || []))
      .catch((error) => console.error("Failed to load chapters", error));
  }, []);

  // Seed the form: edit data first, else whatever context the Topics page passed.
  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setCourseId(
        idOf(
          initialData.courseId ??
            selectedChapter?.courseId ??
            "",
        ),
      );
      setSubjectIdState(
        idOf(
          initialData.subjectId ??
            subjectId ??
            selectedChapter?.subjectId ??
            "",
        ),
      );
      setChapterIdState(
        idOf(initialData.chapterId ?? chapterId ?? ""),
      );
      setTopicName(initialData.name || "");
      setIsActive(
        initialData.activeRow !== undefined ? initialData.activeRow : true,
      );
    } else {
      setCourseId(idOf(selectedChapter?.courseId ?? ""));
      setSubjectIdState(
        idOf(subjectId ?? selectedChapter?.subjectId ?? ""),
      );
      setChapterIdState(idOf(chapterId ?? ""));
      setTopicName("");
      setIsActive(true);
    }
  }, [initialData, show, chapterId, subjectId, selectedChapter]);

  const courseOptions = courses.map((course) => ({
    value: course.courseId,
    label: course.name || course.courseName || String(course.courseId || ""),
  }));

  const subjectOptions = subjects
    .filter(
      (subject) =>
        !courseId ||
        String(subject.courseId ?? subject.course_id) === String(courseId),
    )
    .map((subject) => ({
      value: subject.subjectId ?? subject.subject_id,
      label:
        subject.subjectName || subject.name || String(subject.subjectId || ""),
    }));

  const chapterOptions = chapters
    .filter((chapter) => {
      if (subjectIdState) {
        return (
          String(chapter.subjectId ?? chapter.subject_id) ===
          String(subjectIdState)
        );
      }
      return (
        !courseId ||
        String(chapter.courseId ?? chapter.course_id) === String(courseId)
      );
    })
    .map((chapter) => ({
      value: chapter.chapterId,
      label: chapter.name || chapter.chapterName || String(chapter.chapterId || ""),
    }));

  if (!show) return null;

  const handleSave = async (e) => {
    e.preventDefault();

    if (!topicName.trim()) {
      alert("Please enter Topic Name");
      return;
    }

    if (!courseId) {
      alert("Please select Course");
      return;
    }

    if (!subjectIdState) {
      alert("Please select Subject");
      return;
    }

    if (!chapterIdState) {
      alert("Please select Chapter");
      return;
    }

    // Backend TopicRequestDTO: { courseId, subjectId, chapterId, name, activeRow }
    const requestDTO = {
      courseId: Number(courseId),
      subjectId: Number(subjectIdState),
      chapterId: Number(chapterIdState),
      name: topicName.trim(),
      activeRow: isActive,
    };

    try {
      if (initialData) {
        await TopicService.update(
          initialData.topicId ?? initialData.topic_id ?? initialData.id,
          requestDTO,
        );
      } else {
        await TopicService.create(requestDTO);
      }

      if (refreshTopics) refreshTopics();

      closeModal();

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);

      alert(error.response?.data || "Something went wrong");
    }
  };

  const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 99999 }),
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="question-modal">
        <div className="modal-header">
          <div className="modal-title">
            <h2>{initialData ? "Edit Topic" : "Add Topic"}</h2>

            <p>
              {initialData
                ? "Update the topic."
                : "Create a new topic."}
            </p>
          </div>

          <button type="button" className="close-btn" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-card">
              <h3 className="section-title">Topic Information</h3>

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
                      styles={selectStyles}
                      options={courseOptions}
                      value={
                        courseOptions.find(
                          (option) => String(option.value) === String(courseId),
                        ) || null
                      }
                      onChange={(option) => {
                        setCourseId(option?.value || "");
                        setSubjectIdState("");
                        setChapterIdState("");
                      }}
                      placeholder="Search Course"
                      isSearchable
                      isClearable
                      noOptionsMessage={() => "No course found"}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="form-group">
                  <label>
                    Subject <span>*</span>
                  </label>

                  <div className="input-box">
                    <FaLayerGroup className="input-icon" />

                    <Select
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={selectStyles}
                      options={subjectOptions}
                      value={
                        subjectOptions.find(
                          (option) =>
                            String(option.value) === String(subjectIdState),
                        ) || null
                      }
                      onChange={(option) => {
                        setSubjectIdState(option?.value || "");
                        setChapterIdState("");
                      }}
                      placeholder="Search Subject"
                      isSearchable
                      isClearable
                      isDisabled={!courseId}
                      noOptionsMessage={() => "No subject found"}
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
                      styles={selectStyles}
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
                      isDisabled={!subjectIdState}
                      noOptionsMessage={() => "No chapter found"}
                    />
                  </div>
                </div>

                {/* Topic Name */}
                <div className="form-group">
                  <label>
                    Topic Name <span>*</span>
                  </label>

                  <div className="input-box">
                    <FaTag className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Topic Name"
                      value={topicName}
                      onChange={(e) => {
                        if (/^[A-Za-z0-9\s&-]*$/.test(e.target.value)) {
                          setTopicName(e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
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

export default AddTopicModal;
