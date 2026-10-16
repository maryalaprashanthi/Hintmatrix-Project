import "./Chapters.css";

import { useState, useEffect, useMemo } from "react";
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
import ManagementCountTiles from "../../components/Common/ManagementCountTiles";
import { useHierarchyProgress } from "../../hooks/useHierarchyProgress";

const svgProps = {
  viewBox: "0 0 400 172",
  preserveAspectRatio: "xMidYMid meet",
  "aria-hidden": true,
};

const JOURNAL_RINGS = Array.from({ length: 6 }, (_, i) => 32 + i * 20);

const CALCULATOR_KEYS = Array.from({ length: 16 }, (_, i) => [
  142 + (i % 4) * 23,
  72 + Math.floor(i / 4) * 19,
]);

const COIN_LEVELS = [150, 141, 132];

function BookIllustration() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="bk-cover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f66f0" />
          <stop offset="1" stopColor="#1a3cb5" />
        </linearGradient>
        <linearGradient id="bk-page" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfe0ff" />
        </linearGradient>
        <radialGradient id="bk-sphere" cx=".35" cy=".3" r=".75">
          <stop offset="0" stopColor="#8db9ff" />
          <stop offset="1" stopColor="#1f55e0" />
        </radialGradient>
        <g id="bk-half">
          <path
            d="M114 54Q162 50 204 70V146Q162 128 114 132Z"
            fill="url(#bk-page)"
          />
          <path
            d="M126 74l66 12M126 88l66 12M126 102l66 12M126 116l44 8"
            stroke="#9dbcf0"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M114 134Q162 130 204 148"
            stroke="#a9c4f2"
            strokeWidth="2"
            fill="none"
          />
        </g>
      </defs>
      <ellipse cx="320" cy="138" rx="86" ry="36" fill="#fff" opacity=".4" />
      <ellipse cx="86" cy="128" rx="64" ry="30" fill="#fff" opacity=".3" />
      <ellipse cx="204" cy="156" rx="100" ry="8" fill="#1f46c9" opacity=".2" />
      <path
        d="M102 62L204 78L306 62V138L204 156L102 138Z"
        fill="url(#bk-cover)"
      />
      <use href="#bk-half" />
      <use href="#bk-half" transform="translate(408 0) scale(-1 1)" />
      <circle cx="128" cy="44" r="11" fill="url(#bk-sphere)" />
      <path d="M70 98L102 88L90 118Z" fill="#3b7cf0" />
      <path d="M70 98L102 88L92 104Z" fill="#6aa0ff" />
      <path d="M326 98l9-9 9 9-9 9z" fill="#fbc531" />
      <path d="M326 98l9-9v18z" fill="#ffdd75" />
      <g fill="#fff" opacity=".7">
        <circle cx="260" cy="30" r="3" />
        <circle cx="276" cy="38" r="2" />
        <circle cx="160" cy="26" r="2" />
      </g>
    </svg>
  );
}

function JournalIllustration() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="jr-cover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a287fb" />
          <stop offset="1" stopColor="#6c4be4" />
        </linearGradient>
        <linearGradient id="jr-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d3c4ff" />
          <stop offset="1" stopColor="#4a2fb8" />
        </linearGradient>
        <linearGradient id="jr-pen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a58cff" />
          <stop offset="1" stopColor="#6444df" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="124" rx="70" ry="32" fill="#fff" opacity=".35" />
      <ellipse cx="205" cy="158" rx="90" ry="8" fill="#5b3fd0" opacity=".2" />
      <g transform="rotate(-5 200 90)">
        <rect x="158" y="22" width="104" height="134" rx="12" fill="#4b2fb8" />
        <rect
          x="150"
          y="14"
          width="104"
          height="134"
          rx="12"
          fill="url(#jr-cover)"
        />
        {JOURNAL_RINGS.map((y) => (
          <rect
            key={y}
            x="138"
            y={y - 5}
            width="26"
            height="10"
            rx="5"
            fill="url(#jr-ring)"
          />
        ))}
        <rect x="174" y="34" width="64" height="34" rx="6" fill="#f5f1ff" />
        <path
          d="M184 46h40M184 56h26"
          stroke="#b7a6f3"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      <g transform="rotate(16 290 90)">
        <rect
          x="281"
          y="22"
          width="14"
          height="104"
          rx="7"
          fill="url(#jr-pen)"
        />
        <rect x="281" y="30" width="14" height="10" fill="#c4b3ff" />
        <path d="M281 120h14l-7 20z" fill="#3b2796" />
      </g>
      <g fill="#b9a8f5">
        <circle cx="100" cy="85" r="3" />
        <circle cx="112" cy="95" r="2.5" />
        <circle cx="326" cy="92" r="3" />
        <circle cx="340" cy="86" r="2.5" />
      </g>
    </svg>
  );
}

function CalculatorIllustration() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="ca-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2fd1a4" />
          <stop offset="1" stopColor="#0f9f7c" />
        </linearGradient>
        <linearGradient id="ca-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6fbf3" />
          <stop offset="1" stopColor="#bfe9db" />
        </linearGradient>
      </defs>
      <ellipse cx="90" cy="130" rx="60" ry="34" fill="#fff" opacity=".35" />
      <ellipse cx="205" cy="160" rx="96" ry="7" fill="#0b7a62" opacity=".2" />
      <g stroke="#22c79d" strokeWidth="8" strokeLinecap="round">
        <path d="M86 52v20M76 62h20" />
        <path d="M80 112l14 14M94 112l-14 14" />
        <path d="M318 78v14M311 85h14" />
      </g>
      <g transform="rotate(6 270 80)">
        <rect x="240" y="30" width="64" height="92" rx="6" fill="#fff" />
        <path
          d="M252 50h40M252 62h40M252 74h32"
          stroke="#b7e5d5"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      <g transform="rotate(5 186 88)">
        <rect x="138" y="30" width="112" height="132" rx="16" fill="#0b7a62" />
        <rect
          x="130"
          y="22"
          width="112"
          height="132"
          rx="16"
          fill="url(#ca-body)"
        />
        <rect
          x="142"
          y="34"
          width="88"
          height="28"
          rx="6"
          fill="url(#ca-screen)"
        />
        {CALCULATOR_KEYS.map(([x, y], i) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="19"
            height="14"
            rx="4"
            fill={i === 15 ? "#0b7a62" : "#d9f7ec"}
          />
        ))}
      </g>
      {COIN_LEVELS.map((y) => (
        <g key={y}>
          <ellipse cx="292" cy={y + 4} rx="22" ry="8" fill="#d9930a" />
          <rect x="270" y={y} width="44" height="4" fill="#d9930a" />
          <ellipse cx="292" cy={y} rx="22" ry="8" fill="#ffd34d" />
        </g>
      ))}
    </svg>
  );
}

const CARD_THEMES = [
  { name: "blue", Illustration: BookIllustration },
  { name: "purple", Illustration: JournalIllustration },
  { name: "green", Illustration: CalculatorIllustration },
];
const ZIGZAG = [0, 1, 2, 1];

function Chapters() {
  const { subjectId } = useParams();
  const progressParams = useMemo(() => ({ subjectId }), [subjectId]);
  const chapterProgress = useHierarchyProgress("chapter", progressParams);

  const navigate = useNavigate();
  const canManage = canManageContent();
  const toast = useToast();

  const [chapters, setChapters] = useState([]);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [showEditChapter, setShowEditChapter] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const chapterCounts = {
    total: chapters.length,
    active: chapters.filter((chapter) => chapter.activeRow !== false).length,
    inactive: chapters.filter((chapter) => chapter.activeRow === false).length,
  };

  const filteredChapters = chapters.filter((chapter) => {
    const searchMatch = chapter.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const status = chapter.activeRow ? "Active" : "Inactive";
    const statusMatch = statusFilter === "All" || status === statusFilter;

    return searchMatch && statusMatch;
  });

  const loadChapters = async () => {
    try {
      const response = await ChapterService.getAll();
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
      await ChapterService.create(newChapter);
      toast.success("Chapter saved.");
      setShowAddChapter(false);
      loadChapters();
    } catch (error) {
      console.error("Create Error:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to create chapter."));
    }
  };

  const handleEdit = (chapter) => {
    setSelectedChapter(chapter);
    setShowEditChapter(true);
  };

  const handleUpdateChapter = async (id, updatedChapter) => {
    try {
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      // const response = await ChapterService.uploadExcel(file);
      await ChapterService.uploadExcel(file);

      // Success is announced by the notification popup; avoid a duplicate toast.
      // toast.success(
        // typeof response.data === "string"
          // ? response.data
          // : "Chapter Excel uploaded.",
      // );
      loadChapters();
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "File upload failed."));
    }

    event.target.value = "";
  };

  const openTopics = (chapter) => {
    navigate(paths.chapterTopics(chapter.chapterId));
  };

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
          style={{ display: "none" }}
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

      <ManagementCountTiles
        label="Chapters"
        counts={chapterCounts}
        icon={FaBookOpen}
      />

      <div className="chapter-filters mb-2">
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

      <div className="row g-3">
        {filteredChapters.map((chapter, index) => {
          const theme = CARD_THEMES[ZIGZAG[index % ZIGZAG.length]];
          const progress = Number(chapterProgress(chapter.chapterId)) || 0;
          const progressLabel = `${Number(progress.toFixed(1))}%`;

          return (
            <div className="col-xl-4 col-lg-4 col-md-6" key={chapter.chapterId}>
              <div className={`chapter-card theme-${theme.name}`}>
                <div className="chapter-thumb">
                  <theme.Illustration />
                </div>

                <h4>{chapter.name}</h4>

                <span
                  className={`chapter-status ${
                    chapter.activeRow ? "is-active" : "is-inactive"
                  }`}
                >
                  {chapter.activeRow ? "Active" : "Inactive"}
                </span>

                <p className="chapter-desc">{chapter.description}</p>

                <div className="chapter-footer">
                  <div className="chapter-progress-head">
                    <span>Progress</span>
                    <strong>{progressLabel}</strong>
                  </div>

                  <div className="chapter-progress-track">
                    <div
                      className="chapter-progress-fill"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <button
                    className="chapter-start-btn"
                    disabled={!chapter.activeRow}
                    onClick={() => openTopics(chapter)}
                  >
                    Start Learning
                    <FaArrowRight />
                  </button>

                  {canManage && (
                    <div className="chapter-actions-row">
                      <button
                        className="chapter-action-btn outline-blue"
                        onClick={() => handleEdit(chapter)}
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        className="chapter-action-btn outline-red"
                        onClick={() => del.request(chapter)}
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
