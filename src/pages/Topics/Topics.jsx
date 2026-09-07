import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";

import { FaBookOpen, FaSearch, FaEdit, FaTrash, FaArrowRight } from "react-icons/fa";

import "./Topics.css";
import "./AddTopicModal.css";

import AddTopicModal from "./AddTopicModal";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import TopicService from "../../services/TopicService";
import ChapterService from "../../services/ChapterService";
import { canManageContent } from "../../utils/roles";
import { getApiErrorMessage } from "../../utils/apiError";
import { paths } from "../../routes/paths";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";

const topicIdOf = (topic) => topic.topicId ?? topic.topic_id ?? topic.id;

export default function Topics() {
  // Topics lists the topics of one chapter: /chapters/:chapterId/topics
  const { chapterId } = useParams();
  const navigate = useNavigate();

  const canManage = canManageContent();
  const toast = useToast();

  const [chapter, setChapter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // The chapter record gives the breadcrumb names and seeds the Add-topic
  // modal even when the chapter has no topics yet.
  useEffect(() => {
    ChapterService.getById(chapterId)
      .then((response) => setChapter(response.data ?? null))
      .catch((error) => console.error("Error loading chapter:", error));
  }, [chapterId]);

  const fetchTopics = async () => {
    try {
      const response = await TopicService.getAll();
      const loadedTopics = Array.isArray(response.data) ? response.data : [];

      setTopics(
        loadedTopics.filter(
          (topic) =>
            String(topic.chapterId ?? topic.chapter_id) === String(chapterId),
        ),
      );
    } catch (error) {
      console.error("Error loading Topics:", error);
      toast.error(getApiErrorMessage(error, "Failed to load topics."));
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [chapterId]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const response = await TopicService.uploadExcel(file);

      toast.success(
        typeof response.data === "string"
          ? response.data
          : "Topic Excel uploaded.",
      );
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Topic upload failed."));
    }

    event.target.value = "";
  };

  const del = useDeleteConfirm({
    entity: "topic",
    deleteFn: (topic) => TopicService.delete(topicIdOf(topic)),
    onDeleted: fetchTopics,
  });

  const handleEdit = (topic) => {
    setSelectedTopic(topic);

    setShowModal(true);
  };

  const filteredTopics = topics.filter((topic) => {
    const searchMatch = (topic.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const status = topic.activeRow ? "Active" : "Inactive";

    const statusMatch = statusFilter === "All" || status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Names + parent ids come off the chapter record (or a topic row as a fallback).
  const courseName = chapter?.courseName ?? topics[0]?.courseName;
  const subjectName = chapter?.subjectName ?? topics[0]?.subjectName;
  const chapterName = chapter?.name ?? topics[0]?.chapterName;
  const courseId = chapter?.courseId ?? topics[0]?.courseId;
  const subjectId = chapter?.subjectId ?? topics[0]?.subjectId;

  return (
    <div className="question-category-page">
      <Breadcrumbs
        items={[
          { label: courseName || "Course", to: paths.courses() },
          {
            label: subjectName,
            to: courseId ? paths.courseSubjects(courseId) : undefined,
          },
          {
            label: chapterName || "Chapter",
            to: subjectId ? paths.subjectChapters(subjectId) : undefined,
          },
          { label: "Topics" },
        ]}
      />

      <div className="page-header">
        <div>
          <h1>Topics</h1>

          <p>{chapterName ? `${chapterName} topics` : "Topics"}</p>
        </div>

        {/* Hidden Upload Input */}
        <input
          type="file"
          id="topicUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        {canManage && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => document.getElementById("topicUpload").click()}
            >
              ⬆ Upload
            </button>

            <button
              className="btn btn-primary"
              onClick={() => {
                setShowModal(true);
                setSelectedTopic(null);
              }}
            >
              + Add Topic
            </button>
          </div>
        )}
      </div>

      <div className="category-filters mb-3">
        <div className="category-search">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-0">
              <FaSearch />
            </span>

            <input
              type="text"
              className="form-control border-0"
              placeholder="Search Topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="category-status-filter">
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
        {filteredTopics.map((topic) => (
          <div className="col-xl-4 col-lg-6 col-md-6" key={topicIdOf(topic)}>
            <div className="category-card h-100">
              <div className="card-body">
                <div className="icon-circle">
                  <FaBookOpen />
                </div>

                <h5 className="category-title">{topic.name}</h5>

                <div className="question-count">
                  {topic.questions ?? 0} Questions
                </div>

                <div className="category-status">
                  <span
                    className={`badge ${
                      topic.activeRow
                        ? "bg-success-subtle text-success"
                        : "bg-danger-subtle text-danger"
                    }`}
                  >
                    {topic.activeRow ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="updated-text">Last Updated</div>

                <div className="updated-date">
                  {(topic.updatedAt ?? topic.updated ?? "").toString().slice(0, 10)}
                </div>

                <button
                  className="btn btn-primary view-btn"
                  disabled={!topic.activeRow}
                  onClick={() => navigate(paths.topicQuestions(topicIdOf(topic)))}
                >
                  View Questions
                  <FaArrowRight className="ms-2" />
                </button>
                {canManage && (
                  <div className="d-flex gap-2 mt-2">
                    <button
                      className="btn btn-outline-primary btn-sm action-btn"
                      onClick={() => handleEdit(topic)}
                    >
                      <FaEdit className="me-1" />
                      Edit
                    </button>

                    <button
                      className="btn btn-outline-danger btn-sm action-btn"
                      onClick={() => del.request(topic)}
                    >
                      <FaTrash className="me-1" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredTopics.length === 0 && (
          <div className="col-12">
            <div className="text-center bg-white rounded-4 p-5 shadow-sm">
              <FaSearch size={40} className="text-secondary mb-3" />

              <h5>No Topics Found</h5>

              <p className="text-muted">Try changing your search keyword.</p>
            </div>
          </div>
        )}
      </div>

      <AddTopicModal
        show={showModal}
        closeModal={() => {
          setShowModal(false);
          setSelectedTopic(null);
        }}
        chapterId={chapterId}
        subjectId={subjectId}
        selectedChapter={
          chapter ?? {
            chapterId: Number(chapterId),
            subjectId,
            courseId,
          }
        }
        initialData={selectedTopic}
        refreshTopics={fetchTopics}
        onSuccess={() => toast.success("Topic saved.")}
      />
      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.name}"?`}
        body="The questions inside this topic will be removed too. This can't be undone."
        confirmLabel="Delete topic"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}
