import "./Subjects.css";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";

import {
  FaLayerGroup,
  FaEdit,
  FaTrash,
  FaSearch,
  FaArrowRight,
} from "react-icons/fa";

import SubjectService from "../../services/SubjectService";
import SubjectForm from "./SubjectForm";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { canManageContent } from "../../utils/roles";
import { getApiErrorMessage } from "../../utils/apiError";
import { paths } from "../../routes/paths";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";

// Backend SubjectResponseDTO exposes the name as `subjectName`.
const subjectLabel = (subject) => subject.subjectName || subject.name || "";
const subjectKey = (subject) => subject.subjectId ?? subject.subject_id;

function Subjects() {
  const { courseId } = useParams();

  const navigate = useNavigate();

  const canManage = canManageContent();
  const toast = useToast();

  const [subjects, setSubjects] = useState([]);

  const [showAddSubject, setShowAddSubject] = useState(false);

  const [showEditSubject, setShowEditSubject] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
        {filteredSubjects.map((subject) => (
          <div className="col-xl-4 col-lg-4 col-md-6" key={subjectKey(subject)}>
            <div className="subject-card">
              <div className="subject-icon">
                <FaLayerGroup />
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
        ))}
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
