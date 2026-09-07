import "./Chapters.css";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";

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
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { canManageContent } from "../../utils/roles";
import { getApiErrorMessage } from "../../utils/apiError";
import { paths } from "../../routes/paths";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";

function Chapters() {
  // Chapters lists the chapters of one subject: /subjects/:subjectId/chapters
  const { subjectId } = useParams();

  const navigate = useNavigate();

  const canManage = canManageContent();
  const toast = useToast();

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

      console.log("Chapter Data :", response.data);

      const loadedChapters = Array.isArray(response.data) ? response.data : [];

      setChapters(
        loadedChapters.filter(
          (chapter) =>
            String(chapter.subjectId ?? chapter.subject_id) ===
            String(subjectId),
        ),
      );
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  useEffect(() => {
    loadChapters();
  }, [subjectId]);

  const handleSaveChapter = async (newChapter) => {
    try {
      console.log("Create Payload:", newChapter);

      await ChapterService.create(newChapter);

      toast.success("Chapter saved.");
      setShowAddChapter(false);

      loadChapters();
    } catch (error) {
      console.error("Create Error:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to create chapter."));
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

      toast.success("Chapter updated.");
      setShowEditChapter(false);
      setSelectedChapter(null);

      loadChapters();
    } catch (error) {
      console.error("Update Error:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to update chapter."));
    }
  };

  const del = useDeleteConfirm({
    entity: "chapter",
    deleteFn: (chapter) => ChapterService.delete(chapter.chapterId),
    onDeleted: loadChapters,
  });

  // FILE UPLOAD

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const response = await ChapterService.uploadExcel(file);

      toast.success(
        typeof response.data === "string"
          ? response.data
          : "Chapter Excel uploaded.",
      );

      loadChapters();
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "File upload failed."));
    }

    event.target.value = "";
  };
  // Chapter -> Topics
  const openTopics = (chapter) => {
    navigate(paths.chapterTopics(chapter.chapterId));
  };

  // Course + subject names ride on every chapter row
  // (ChapterResponseDTO.courseName / .subjectName).
  const courseName = chapters[0]?.courseName;
  const subjectName = chapters[0]?.subjectName;

  return (
    <div className="chapters-page">
      <Breadcrumbs
        items={[
          { label: courseName || "Course", to: paths.courses() },
          {
            label: subjectName,
            to: chapters[0]?.courseId
              ? paths.courseSubjects(chapters[0].courseId)
              : undefined,
          },
          { label: "Chapters" },
        ]}
      />

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

        {canManage && (
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
        )}
      </div>

      <div className="chapter-filters mb-3">
        <div className="chapter-search">
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

        <div className="chapter-status-filter">
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
                onClick={() => openTopics(chapter)}
              >
                Start Learning
                <FaArrowRight className="ms-2" />
              </button>

              {canManage && (
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
                    onClick={() => del.request(chapter)}
                  >
                    <FaTrash className="me-1" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ChapterForm
        show={showAddChapter}
        onClose={() => setShowAddChapter(false)}
        onSave={handleSaveChapter}
        presetCourseId={chapters[0]?.courseId}
        presetSubjectId={subjectId}
      />

      {selectedChapter && (
        <EditChapterForm
          show={showEditChapter}
          chapter={selectedChapter}
          onClose={() => setShowEditChapter(false)}
          onUpdate={handleUpdateChapter}
        />
      )}
      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.name}"?`}
        body="The topics and questions inside this chapter will be removed too. This can't be undone."
        confirmLabel="Delete chapter"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default Chapters;
