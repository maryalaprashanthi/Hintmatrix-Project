import "./Chapters.css";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import {
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaPlayCircle,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import ChapterService from "../../services/ChapterService";
import ChapterForm from "./ChapterForm";
import EditChapterForm from "./EditChapterForm";

function Chapters() {
  const { courseId } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  const isQuestionsModule = location.pathname.startsWith("/questions");

  const [chapters, setChapters] = useState([]);

  const [showAddChapter, setShowAddChapter] = useState(false);

  const [showEditChapter, setShowEditChapter] = useState(false);

  const [selectedChapter, setSelectedChapter] = useState(null);

  // LOAD CHAPTERS

  const loadChapters = async () => {
    try {
      const response = await ChapterService.getAll();

      console.log("Chapter Data:", response.data);

      setChapters(response.data);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  useEffect(() => {
    loadChapters();
  }, []);

  // CREATE CHAPTER

  const handleSaveChapter = async (newChapter) => {
    try {
      console.log("Create Payload:", newChapter);

      await ChapterService.create(newChapter);

      alert("Chapter created successfully");

      setShowAddChapter(false);

      loadChapters();
    } catch (error) {
      console.error("Create Error:", error.response?.data || error);

      alert("Failed to create chapter");
    }
  };

  // OPEN EDIT MODAL

  const handleEdit = (chapter) => {
    setSelectedChapter(chapter);

    setShowEditChapter(true);
  };

  // UPDATE CHAPTER

  const handleUpdateChapter = async (id, updatedChapter) => {
    try {
      console.log("Update Payload:", updatedChapter);

      await ChapterService.update(id, updatedChapter);

      alert("Chapter updated successfully");

      setShowEditChapter(false);

      setSelectedChapter(null);

      loadChapters();
    } catch (error) {
      console.error("Update Error:", error.response?.data || error);

      alert("Failed to update chapter");
    }
  };

  // DELETE CHAPTER

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chapter?",
    );

    if (!confirmDelete) return;

    try {
      await ChapterService.delete(id);

      alert("Chapter deleted successfully");

      loadChapters();
    } catch (error) {
      console.error("Delete Error:", error.response?.data || error);

      alert("Failed to delete chapter");
    }
  };

  // FILE UPLOAD

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const response = await ChapterService.uploadExcel(file);

      alert(
        typeof response.data === "string"
          ? response.data
          : "Chapter Excel uploaded successfully!",
      );

      loadChapters();
    } catch (error) {
      console.error("Upload Error:", error);

      if (error.response) {
        alert(error.response.data);
      } else {
        alert("File upload failed.");
      }
    }

    event.target.value = "";
  };
  // // Chapter -> Question Categories
  // const openCategories = (chapterTitle) => {
  //   const chapterSlug = chapterTitle.toLowerCase().replaceAll(" ", "-");

  //   if (isQuestionsModule) {
  //     navigate("/questions/question-categories");
  //   } else {
  //     navigate(`/question-categories/${courseId}/${chapterSlug}`);
  //   }
  // };

  const openCategories = (chapter) => {
    console.log("Navigating to:", chapter);
    const chapterSlug = chapter.name.toLowerCase().replaceAll(" ", "-");

    if (isQuestionsModule) {
      navigate(
        `/questions/question-categories/${chapter.chapterId}/${chapterSlug}`,
        {
          state: {
            chapter,
          },
        },
      );
    } else {
      navigate(`/question-categories/${courseId}/${chapterSlug}`, {
        state: {
          chapter,
        },
      });
    }
  };

  return (
    <div className="chapters-page">
      <div className="chapter-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2>All Chapters</h2>

          <p className="mb-0">Select a chapter and start learning</p>
        </div>

        <input
          type="file"
          id="chapterUpload"
          accept=".csv,.xlsx,.xls"
          style={{
            display: "none",
          }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById("chapterUpload").click()}
          >
            ⬆ Upload
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddChapter(true)}
          >
            + Add Chapter
          </button>
        </div>
      </div>

      <div className="row g-4">
        {chapters.map((chapter) => (
          <div className="col-xl-4 col-lg-4 col-md-6" key={chapter.chapterId}>
            <div className="chapter-card">
              <div className="chapter-icon">
                <FaBookOpen />
              </div>

              <h4>{chapter.name}</h4>

              <div className="chapter-info">
                <span>
                  <FaClock />
                  Lessons
                </span>

                <span>
                  <FaCheckCircle />
                  Active
                </span>
              </div>

              {/*  MATCHED LAYOUT: Outlined buttons with icons */}
              <div className="chapter-actions-row">
                <button
                  className="chapter-action-btn outline-blue"
                  onClick={() => handleEdit(chapter)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="chapter-action-btn outline-red"
                  onClick={() => handleDelete(chapter.chapterId)}
                >
                  <FaTrash /> Delete
                </button>
              </div>

              <button
                className="start-btn"
                onClick={() => openCategories(chapter)}
              >
                <FaPlayCircle />
                Start Learning
              </button>
            </div>
          </div>
        ))}
      </div>

      <ChapterForm
        show={showAddChapter}
        onClose={() => setShowAddChapter(false)}
        onSave={handleSaveChapter}
      />

      {selectedChapter && (
        <EditChapterForm
          show={showEditChapter}
          chapter={selectedChapter}
          onClose={() => setShowEditChapter(false)}
          onUpdate={handleUpdateChapter}
        />
      )}
    </div>
  );
}

export default Chapters;
