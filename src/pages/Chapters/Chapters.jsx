import "./Chapters.css";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import {
  FaBookOpen,
  FaEdit,
  FaTrash,
  FaSearch,
  FaArrowRight,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredChapters = chapters.filter((chapter) => {
    const searchMatch = chapter.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const status = chapter.activeRow ? "Active" : "Inactive";

    const statusMatch = statusFilter === "All" || status === statusFilter;

    return searchMatch && statusMatch;
  });

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
    console.log("Selected Chapter:", chapter);

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

      <div className="row align-items-center mb-3">
        <div className="col-lg-8 col-md-7 mb-3 mb-md-0">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-0">
              <FaSearch />
            </span>

            <input
              type="text"
              className="form-control border-0"
              placeholder="Search Chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-lg-4 col-md-5">
          <select
            className="form-select shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {filteredChapters.map((chapter) => (
          <div className="col-xl-4 col-lg-4 col-md-6" key={chapter.chapterId}>
            <div className="chapter-card">
              <div className="chapter-icon">
                <FaBookOpen />
              </div>

              <h4>{chapter.name}</h4>

              <div className="chapter-info">
                <span
                  className={`badge ${
                    chapter.activeRow
                      ? "bg-success-subtle text-success"
                      : "bg-danger-subtle text-danger"
                  }`}
                >
                  {chapter.activeRow ? "Active" : "Inactive"}
                </span>
              </div>

              {/*  MATCHED LAYOUT: Outlined buttons with icons */}
              <button
                className="btn btn-primary view-btn"
                disabled={!chapter.activeRow}
                onClick={() => openCategories(chapter)}
              >
                Start Learning
                <FaArrowRight className="ms-2" />
              </button>

              <div className="chapter-actions-row mt-3">
                <button
                  className="chapter-action-btn outline-blue"
                  onClick={() => handleEdit(chapter)}
                >
                  <FaEdit className="me-1" />
                  Edit
                </button>

                <button
                  className="chapter-action-btn outline-red"
                  onClick={() => handleDelete(chapter.chapterId)}
                >
                  <FaTrash className="me-1" />
                  Delete
                </button>
              </div>
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
