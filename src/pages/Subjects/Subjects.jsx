import "./Subjects.css";

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";

import {
  FaLayerGroup,
  FaEdit,
  FaTrash,
  FaSearch,
  FaArrowRight,
  FaBriefcase,
  FaLandmark,
  FaCoins,
} from "react-icons/fa";

import SubjectService from "../../services/SubjectService";
import SubjectForm from "./SubjectForm";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { canManageContent } from "../../utils/roles";
import { getApiErrorMessage } from "../../utils/apiError";
import { paths } from "../../routes/paths";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";
import ManagementCountTiles from "../../components/Common/ManagementCountTiles";
import HierarchyProgress from "../../components/Common/HierarchyProgress";
import { useHierarchyProgress } from "../../hooks/useHierarchyProgress";

// Backend SubjectResponseDTO exposes the name as `subjectName`.
const subjectLabel = (subject) => subject.subjectName || subject.name || "";
const subjectKey = (subject) => subject.subjectId ?? subject.subject_id;

const artFiles = import.meta.glob("../../assets/subjects/*.{png,svg,webp}", {
  eager: true,
  import: "default",
});

const findArtFile = (name) =>
  Object.entries(artFiles).find(
    ([path]) => path.split("/").pop().split(".")[0] === name,
  )?.[1];

const sparkle = (x, y, s = 5) => (
  <path
    d={`M${x},${y - s} L${x + s * 0.3},${y - s * 0.3} L${x + s},${y} L${x + s * 0.3},${y + s * 0.3} L${x},${y + s} L${x - s * 0.3},${y + s * 0.3} L${x - s},${y} L${x - s * 0.3},${y - s * 0.3} Z`}
    fill="#fff"
  />
);

const coins = (x, y) => (
  <g>
    {[0, 7, 14].map((lift) => (
      <g key={lift}>
        <rect
          x={x - 18}
          y={y - lift - 7}
          width="36"
          height="7"
          fill="#f59e0b"
        />
        <ellipse cx={x} cy={y - lift} rx="18" ry="6" fill="#f59e0b" />
        <ellipse cx={x} cy={y - lift - 7} rx="18" ry="6" fill="#fcd34d" />
        <ellipse
          cx={x}
          cy={y - lift - 7}
          rx="11"
          ry="3.5"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />
      </g>
    ))}
  </g>
);

const bar = (x, top, opacity) => (
  <g>
    <rect
      x={x}
      y={top}
      width="18"
      height={112 - top}
      fill="var(--subject-accent)"
      opacity={opacity}
    />
    <polygon
      points={`${x},${top} ${x + 6},${top - 6} ${x + 24},${top - 6} ${x + 18},${top}`}
      fill="#fff"
      opacity="0.55"
    />
    <polygon
      points={`${x + 18},${top} ${x + 24},${top - 6} ${x + 24},106 ${x + 18},112`}
      fill="var(--subject-accent-dark)"
      opacity="0.4"
    />
  </g>
);

const arts = {
  commerce: (
    <>
      <circle cx="84" cy="66" r="50" fill="#fff" opacity="0.45" />
      <ellipse
        cx="80"
        cy="114"
        rx="66"
        ry="5"
        fill="var(--subject-accent-dark)"
        opacity="0.15"
      />
      {bar(20, 78, 0.55)}
      {bar(46, 58, 0.75)}
      {bar(72, 38, 1)}
      <polyline
        points="24,68 52,48 80,26 108,10"
        fill="none"
        stroke="#fff"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <polyline
        points="24,68 52,48 80,26 108,10"
        fill="none"
        stroke="var(--subject-accent-dark)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        [24, 68],
        [52, 48],
        [80, 26],
      ].map(([cx, cy]) => (
        <circle
          key={cx}
          cx={cx}
          cy={cy}
          r="4.5"
          fill="#fff"
          stroke="var(--subject-accent-dark)"
          strokeWidth="2.5"
        />
      ))}
      <polygon points="118,4 112,24 98,12" fill="var(--subject-accent-dark)" />
      {coins(130, 112)}
      {sparkle(12, 34, 5)}
      {sparkle(128, 44, 4)}
    </>
  ),
  civics: (
    <>
      <circle cx="80" cy="62" r="52" fill="#fff" opacity="0.45" />
      <ellipse
        cx="80"
        cy="114"
        rx="68"
        ry="5"
        fill="var(--subject-accent-dark)"
        opacity="0.15"
      />
      <rect
        x="22"
        y="104"
        width="116"
        height="8"
        rx="2"
        fill="var(--subject-accent-dark)"
      />
      <rect
        x="28"
        y="98"
        width="104"
        height="6"
        rx="2"
        fill="var(--subject-accent)"
      />
      <rect x="40" y="58" width="80" height="40" fill="#fff" opacity="0.7" />
      {[46, 61, 76, 91, 106].map((x) => (
        <rect
          key={x}
          x={x}
          y="60"
          width="8"
          height="38"
          rx="2"
          fill="var(--subject-accent)"
          opacity="0.8"
        />
      ))}
      <polygon points="34,58 80,34 126,58" fill="var(--subject-accent-dark)" />
      <polygon points="46,56 80,38 114,56" fill="#fff" opacity="0.25" />
      <path d="M62,34 A18,18 0 0 1 98,34 Z" fill="var(--subject-accent)" />
      <path d="M70,34 A10,18 0 0 1 80,16 L80,34 Z" fill="#fff" opacity="0.3" />
      <rect
        x="77"
        y="10"
        width="6"
        height="8"
        rx="1"
        fill="var(--subject-accent-dark)"
      />
      <line
        x1="80"
        y1="10"
        x2="80"
        y2="2"
        stroke="var(--subject-accent-dark)"
        strokeWidth="1.5"
      />
      <polygon points="80,2 92,5 80,9" fill="#f59e0b" />
      <rect x="12" y="98" width="4" height="14" fill="#92400e" />
      <circle cx="14" cy="90" r="11" fill="#10b981" />
      <circle cx="11" cy="87" r="5" fill="#34d399" />
      <rect x="146" y="98" width="4" height="14" fill="#92400e" />
      <circle cx="148" cy="90" r="11" fill="#10b981" />
      <circle cx="145" cy="87" r="5" fill="#34d399" />
      {sparkle(24, 40, 4)}
      {sparkle(140, 36, 5)}
    </>
  ),
  economics: (
    <>
      <circle cx="82" cy="64" r="50" fill="#fff" opacity="0.45" />
      {[34, 56, 78, 100].map((y) => (
        <line
          key={y}
          x1="10"
          y1={y}
          x2="116"
          y2={y}
          stroke="var(--subject-accent)"
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.3"
        />
      ))}
      <path
        d="M14,98 L40,74 L64,84 L90,52 L112,32 L112,112 L14,112 Z"
        fill="var(--subject-accent)"
        opacity="0.22"
      />
      <polyline
        points="14,98 40,74 64,84 90,52 112,32"
        fill="none"
        stroke="#fff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <polyline
        points="14,98 40,74 64,84 90,52 112,32"
        fill="none"
        stroke="var(--subject-accent)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        [14, 98],
        [40, 74],
        [64, 84],
        [90, 52],
      ].map(([cx, cy]) => (
        <circle
          key={cx}
          cx={cx}
          cy={cy}
          r="4.5"
          fill="#fff"
          stroke="var(--subject-accent)"
          strokeWidth="2.5"
        />
      ))}
      <polygon
        points="126,18 120,40 104,28"
        fill="var(--subject-accent-dark)"
      />
      {coins(140, 112)}
      {sparkle(14, 40, 5)}
      {sparkle(104, 10, 4)}
    </>
  ),
  default: (
    <>
      <circle cx="80" cy="64" r="50" fill="#fff" opacity="0.45" />
      <ellipse
        cx="80"
        cy="114"
        rx="62"
        ry="5"
        fill="var(--subject-accent-dark)"
        opacity="0.15"
      />
      <rect
        x="26"
        y="92"
        width="108"
        height="20"
        rx="4"
        fill="var(--subject-accent-dark)"
      />
      <rect x="26" y="99" width="108" height="4" fill="#fff" opacity="0.25" />
      <rect
        x="36"
        y="72"
        width="96"
        height="20"
        rx="4"
        fill="var(--subject-accent)"
      />
      <rect x="36" y="79" width="96" height="4" fill="#fff" opacity="0.3" />
      <rect
        x="30"
        y="52"
        width="90"
        height="20"
        rx="4"
        fill="var(--subject-accent)"
        opacity="0.75"
      />
      <rect x="30" y="59" width="90" height="4" fill="#fff" opacity="0.3" />
      <path
        d="M58,34 L58,46 Q80,56 102,46 L102,34 L80,42 Z"
        fill="var(--subject-accent)"
      />
      <polygon
        points="80,8 122,26 80,44 38,26"
        fill="var(--subject-accent-dark)"
      />
      <line
        x1="116"
        y1="28"
        x2="116"
        y2="48"
        stroke="#f59e0b"
        strokeWidth="2"
      />
      <circle cx="116" cy="50" r="3.5" fill="#f59e0b" />
      {sparkle(18, 40, 5)}
      {sparkle(140, 60, 4)}
    </>
  ),
};

const subjectArt = (name) => {
  const src = findArtFile(name) || (!arts[name] && findArtFile("default"));

  if (src) {
    return <img className="subject-art" src={src} alt="" />;
  }

  return (
    <svg className="subject-art" viewBox="0 0 160 120" aria-hidden="true">
      {arts[name] || arts.default}
    </svg>
  );
};

const subjectThemes = [
  { key: "commerce", className: "subject-theme-blue", Icon: FaBriefcase },
  { key: "civics", className: "subject-theme-purple", Icon: FaLandmark },
  { key: "economics", className: "subject-theme-green", Icon: FaCoins },
];

const subjectTheme = (subject, index) =>
  subjectThemes.find(
    (theme) => theme.key === subjectLabel(subject).trim().toLowerCase(),
  ) || subjectThemes[index % subjectThemes.length];

function Subjects() {
  const { courseId } = useParams();
  const progressParams = useMemo(() => ({ courseId }), [courseId]);
  const subjectProgress = useHierarchyProgress("subject", progressParams);

  const navigate = useNavigate();

  const canManage = canManageContent();
  const toast = useToast();

  const [subjects, setSubjects] = useState([]);

  const [showAddSubject, setShowAddSubject] = useState(false);

  const [showEditSubject, setShowEditSubject] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const subjectCounts = {
    total: subjects.length,
    active: subjects.filter((subject) => subject.activeRow !== false).length,
    inactive: subjects.filter((subject) => subject.activeRow === false).length,
  };

  const filteredSubjects = subjects.filter((subject) => {
    const searchMatch = subjectLabel(subject)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const status = subject.activeRow ? "Active" : "Inactive";

    const statusMatch = statusFilter === "All" || status === statusFilter;

    return searchMatch && statusMatch;
  });

  // LOAD SUBJECTS

  const loadSubjects = async () => {
    try {
      const response = await SubjectService.getAll();

      console.log("Subject Data :", response.data);

      const loadedSubjects = Array.isArray(response.data) ? response.data : [];

      setSubjects(
        loadedSubjects.filter(
          (subject) =>
            String(subject.courseId ?? subject.course_id) === String(courseId),
        ),
      );
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [courseId]);

  const handleSaveSubject = async (newSubject) => {
    try {
      console.log("Create Payload:", newSubject);

      await SubjectService.create(newSubject);

      toast.success("Subject saved.");
      setShowAddSubject(false);

      loadSubjects();
    } catch (error) {
      console.error("Create Error:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to create subject."));
    }
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setShowEditSubject(true);
  };

  const handleUpdateSubject = async (id, updatedSubject) => {
    try {
      console.log("Update Payload:", updatedSubject);

      await SubjectService.update(id, updatedSubject);

      toast.success("Subject updated.");
      setShowEditSubject(false);
      setSelectedSubject(null);

      loadSubjects();
    } catch (error) {
      console.error("Update Error:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to update subject."));
    }
  };

  const del = useDeleteConfirm({
    entity: "subject",
    deleteFn: (subject) => SubjectService.delete(subjectKey(subject)),
    onDeleted: loadSubjects,
  });

  const openChapters = (subject) => {
    navigate(paths.subjectChapters(subjectKey(subject)));
  };

  // Course name comes free on every subject row (SubjectResponseDTO.courseName).
  const courseName = subjects[0]?.courseName;

  return (
    <div className="subjects-page">
      <Breadcrumbs
        items={[
          { label: courseName || "Course", to: paths.courses() },
          { label: "Subjects" },
        ]}
      />

      <div className="subject-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2>All Subjects</h2>

          <p className="mb-0">Select a subject to see its chapters</p>
        </div>

        {canManage && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => setShowAddSubject(true)}
            >
              + Add Subject
            </button>
          </div>
        )}
      </div>

      <ManagementCountTiles
        label="Subjects"
        counts={subjectCounts}
        icon={FaLayerGroup}
      />

      <div className="subject-filters mb-3">
        <div className="subject-search">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-0">
              <FaSearch />
            </span>

            <input
              type="text"
              className="form-control border-0"
              placeholder="Search Subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="subject-status-filter">
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
        {filteredSubjects.map((subject) => {
          const theme = subjectTheme(subject, subjects.indexOf(subject));

          return (
            <div
              className="col-xl-4 col-lg-4 col-md-6"
              key={subjectKey(subject)}
            >
              <div className={`subject-card ${theme.className}`}>
                <div className="subject-card-top">
                  {subjectArt(subjectLabel(subject).trim().toLowerCase())}

                  <div className="subject-icon">
                    <theme.Icon />
                  </div>

                  <h4>{subjectLabel(subject)}</h4>

                  <div className="subject-info">
                    <span
                      className={`badge ${
                        subject.activeRow
                          ? "bg-success-subtle text-success"
                          : "bg-danger-subtle text-danger"
                      }`}
                    >
                      {subject.activeRow ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {subject.description && (
                    <p className="subject-desc">{subject.description}</p>
                  )}
                </div>

                <div className="hierarchy-card-footer">
                  <HierarchyProgress
                    label="Subject"
                    value={subjectProgress(subjectKey(subject))}
                  />

                  <button
                    className="btn btn-primary view-btn"
                    disabled={!subject.activeRow}
                    onClick={() => openChapters(subject)}
                  >
                    View Chapters
                    <FaArrowRight className="ms-2" />
                  </button>

                  {canManage && (
                    <div className="subject-actions-row mt-3">
                      <button
                        className="subject-action-btn outline-blue"
                        onClick={() => handleEdit(subject)}
                      >
                        <FaEdit className="me-1" />
                        Edit
                      </button>

                      <button
                        className="subject-action-btn outline-red"
                        onClick={() => del.request(subject)}
                      >
                        <FaTrash className="me-1" />
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

      <SubjectForm
        show={showAddSubject}
        onClose={() => setShowAddSubject(false)}
        onSave={handleSaveSubject}
        presetCourseId={courseId}
      />

      {selectedSubject && (
        <SubjectForm
          show={showEditSubject}
          selectedSubjectData={selectedSubject}
          onClose={() => setShowEditSubject(false)}
          onUpdate={handleUpdateSubject}
        />
      )}
      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${subjectLabel(del.pending || {})}"?`}
        body="The chapters, topics and questions inside this subject will be removed too. This can't be undone."
        confirmLabel="Delete subject"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default Subjects;
