import { useState, useRef, useEffect } from "react";
import { compareQuestionIds } from "../../utils/questionNavigation";
import { createPortal } from "react-dom";
import Select from "react-select";
import CourseService from "../../services/CourseService";
import SubjectService from "../../services/SubjectService";
import ChapterService from "../../services/ChapterService";
import QuestionService from "../../services/QuestionService";
import QuestionUploadErrorsModal from "../../components/Common/QuestionUploadErrorsModal";
import * as XLSX from "xlsx";

import {
  Container,
  Row,
  Col,
  Button,
  Form,
} from "react-bootstrap";

import { FaBan, FaCheck, FaFilter, FaPlus, FaQuestionCircle, FaTimes, FaTrash } from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";
import { canManageContent, currentRole, ROLES } from "../../utils/roles";
import { useQuestionStatuses } from "../../hooks/useQuestionStatuses";
import { paths } from "../../routes/paths";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import ManagementCountTiles from "../../components/Common/ManagementCountTiles";
import { getManagementCounts } from "../../utils/managementCounts";
import TopicService from "../../services/TopicService";
import { useToast } from "../../components/Toast/useToast";
import ActionIconButton from "../../components/Common/ActionIconButton";
import "./QuestionList.css";
import AddQuestionModal from "./AddQuestionModal";
import { normalizeQuestionType } from "../../utils/questionType";
import QuestionType2Modal from "./QuestionType2Modal";
import DataGrid from "../../components/DataGrid";

const getQuestionType = (question) => {
  const type =
    question?.questionType?.name ??
    question?.questionType ??
    question?.questionTypeName ??
    question?.question_type_name;

  return normalizeQuestionType(type);
};

const QuestionList = () => {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [recentOnly, setRecentOnly] = useState(false);
  const [visibleQuestionColumns, setVisibleQuestionColumns] = useState([
    "questionText",
    "learningPath",
    "typeLabel",
    "statusLabel",
    "actions",
  ]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [bulkUpdatingStatus, setBulkUpdatingStatus] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsLoadError, setQuestionsLoadError] = useState("");
  const [selectedQuestionRows, setSelectedQuestionRows] = useState([]);
  const [questionGridApi, setQuestionGridApi] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // =========================================================
  // QUESTION UPLOAD ERROR STATES
  // =========================================================

  const [uploadErrors, setUploadErrors] = useState([]);
  const [showUploadErrors, setShowUploadErrors] = useState(false);

  // =========================================================
  // LOCAL STORAGE KEY
  // =========================================================

  const QUESTION_UPLOAD_ERRORS_KEY = "questionUploadErrors";

  const canManage = canManageContent();

  // =========================================================
  // FILE INPUT
  // =========================================================

  const fileInputRef = useRef(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadContext, setUploadContext] = useState({});
  const [uploadOptions, setUploadOptions] = useState({
    courses: [],
    subjects: [],
    chapters: [],
    topics: [],
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingUploadOptions, setLoadingUploadOptions] = useState(false);
  const [uploadOptionsError, setUploadOptionsError] = useState("");

  useEffect(() => {
    if (!showUploadModal) return;
    let cancelled = false;
    setLoadingUploadOptions(true);
    setUploadOptionsError("");
    Promise.all([
      CourseService.getAllCourses(),
      SubjectService.getAll(),
      ChapterService.getAll(),
      TopicService.getAll(),
    ])
      .then(([courses, subjects, chapters, topics]) => {
        if (cancelled) return;
        const rows = (response) =>
          Array.isArray(response.data) ? response.data : [];
        setUploadOptions({
          courses: rows(courses).map((item) => ({
            value: item.courseId,
            label: item.name,
          })),
          subjects: rows(subjects).map((item) => ({
            value: item.subjectId ?? item.subject_id,
            label: item.subjectName ?? item.name,
            courseId: item.courseId ?? item.course_id,
          })),
          chapters: rows(chapters).map((item) => ({
            value: item.chapterId,
            label: item.name,
            subjectId: item.subjectId ?? item.subject_id,
          })),
          topics: rows(topics).map((item) => ({
            value: item.topicId ?? item.topic_id ?? item.id,
            label: item.name,
            chapterId: item.chapterId ?? item.chapter_id,
          })),
        });
      })
      .catch(() => {
        if (!cancelled)
          setUploadOptionsError(
            "Unable to load upload details. Close and try again.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingUploadOptions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showUploadModal]);

  // =========================================================
  // QUESTIONS
  // =========================================================

  const [questions, setQuestions] = useState([]);

  const navigate = useNavigate();

  // /topics/:topicId/questions - the topic id is the only thing in the URL.
  // Its record carries the course / subject / chapter (ids + names) that the
  // filter call, the create-question modal and the breadcrumb all need.
  // No topicId (the flat /questions route) = admin "all questions" mode.
  const { topicId } = useParams();
  const isStudent = currentRole() === ROLES.STUDENT;
  const answerStatuses = useQuestionStatuses(topicId, isStudent);
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    if (!topicId) {
      setTopic(null);
      return;
    }
    TopicService.getById(topicId)
      .then((response) => setTopic(response.data ?? null))
      .catch((error) => console.error("Error loading topic:", error));
  }, [topicId]);

  const courseId = topic?.courseId;
  const subjectId = topic?.subjectId;
  const chapterId = topic?.chapterId;

  // =========================================================
  // QUESTION TYPE
  // =========================================================

  const questionType = getQuestionType(selectedQuestion || questions[0]);

  const showQuestionType2 =
    questionType === "JOURNAL" || questionType === "DROPDOWN";

  // =========================================================
  // LOAD SAVED UPLOAD ERRORS
  // =========================================================
  //
  // This runs whenever the QuestionList page is opened.
  //
  // Therefore:
  //
  // Question List
  //      ↓
  // Navigate another page
  //      ↓
  // Come back
  //      ↓
  // Errors are still available
  //
  // =========================================================

  useEffect(() => {
    try {
      const savedErrors = localStorage.getItem(QUESTION_UPLOAD_ERRORS_KEY);

      if (savedErrors) {
        const parsedErrors = JSON.parse(savedErrors);

        if (Array.isArray(parsedErrors) && parsedErrors.length > 0) {
          setUploadErrors(parsedErrors);
        } else {
          setUploadErrors([]);
        }
      } else {
        setUploadErrors([]);
      }
    } catch (error) {
      console.error("Error loading saved question upload errors:", error);

      setUploadErrors([]);
    }
  }, []);

  // =========================================================
  // LOAD QUESTIONS
  // =========================================================

  // Scoped to one topic (/topics/:topicId/questions) vs the flat admin list.
  const scopedToTopic = Boolean(topicId);

  useEffect(() => {
    // Wait for the topic record before the scoped fetch - it supplies the
    // course + chapter ids the /filter endpoint needs.
    if (scopedToTopic && !topic) return;
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, topicId]);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    setQuestionsLoadError("");
    try {
      let response;

      if (scopedToTopic && topic) {
        response = await QuestionService.getQuestionsByMapping(
          topic.courseId,
          topic.chapterId,
          topicId,
        );
      } else if (!scopedToTopic) {
        // Flat admin list
        response = await QuestionService.getQuestionText();
      } else {
        return;
      }

      const loadedQuestions = Array.isArray(response.data) ? response.data : [];

      if (scopedToTopic) {
        setQuestions(
          loadedQuestions.filter(
            (question) =>
              String(question.topicId ?? question.topic_id) === String(topicId),
          ),
        );
      } else {
        setQuestions(loadedQuestions);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      setQuestionsLoadError("Questions could not be loaded. Check your connection and try again.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const availableQuestionTypes = [
    ...new Set(questions.map(getQuestionType).filter(Boolean)),
  ].sort();

  const filteredQuestions = questions
    .filter((question) => {
      const searchableText = [
        question.questionText,
        question.courseName,
        question.subjectName,
        question.chapterName,
        question.topicName,
        getQuestionType(question),
      ].filter(Boolean).join(" ").toLowerCase();
      const searchMatch = searchableText.includes(search.trim().toLowerCase());
      const active = question.activeRow !== false && question.activeRow !== "false";
      const statusMatch = statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);
      const typeMatch = typeFilter === "ALL" || getQuestionType(question) === typeFilter;
      const createdAt = new Date(question.createdAt).getTime();
      const recentMatch = !recentOnly || (
        Number.isFinite(createdAt) && createdAt >= Date.now() - 7 * 24 * 60 * 60 * 1000
      );
      return searchMatch && statusMatch && typeMatch && recentMatch;
    })
    .sort(compareQuestionIds);
  const questionCounts = getManagementCounts(questions);
  const hasActiveFilters = search.trim() || statusFilter !== "ALL" || typeFilter !== "ALL" || recentOnly;
  const activeFilterCount = [Boolean(search.trim()), statusFilter !== "ALL", typeFilter !== "ALL", recentOnly].filter(Boolean).length;

  const questionColumns = [
    {
      headerName: "Question",
      field: "questionText",
      flex: 2.6,
      minWidth: 300,
      cellRenderer: ({ data }) => (
        <div className="question-grid-question">
          <span className="question-grid-number">Q{data.questionId}</span>
          <span className="question-grid-text" title={data.questionText}>
            {data.questionText || "Untitled question"}
          </span>
        </div>
      ),
    },
    {
      headerName: "Learning path",
      field: "learningPath",
      minWidth: 250,
      flex: 1.5,
      cellRenderer: ({ data }) => (
        <div className="question-grid-path" title={data.learningPath}>
          <span>{[data.courseName, data.subjectName].filter(Boolean).join(" › ") || "Course path unavailable"}</span>
          <strong>{[data.chapterName, data.topicName].filter(Boolean).join(" › ") || "No chapter or topic"}</strong>
        </div>
      ),
    },
    {
      headerName: "Type",
      field: "typeLabel",
      minWidth: 135,
      flex: 0.9,
      cellRenderer: ({ value }) => <span className="question-grid-type">{value}</span>,
    },
    {
      headerName: "Status",
      field: "statusLabel",
      minWidth: isStudent ? 180 : 105,
      maxWidth: isStudent ? 205 : canManage ? 190 : 125,
      cellRenderer: ({ data }) => (
        <div className="question-grid-status-cell">
          <span className={`question-grid-status ${isStudent ? `is-${data.answerStatus.toLowerCase()}` : data.isActive ? "is-active" : "is-inactive"}`}>
            <i /> {data.statusLabel}
          </span>
          {canManage && (
            <Form.Check
              type="switch"
              id={`question-status-${data.questionId}`}
              checked={data.isActive}
              onChange={() => handleToggle(data.questionId)}
              aria-label={`Set question ${data.questionId} ${data.isActive ? "inactive" : "active"}`}
            />
          )}
        </div>
      ),
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 110,
      minWidth: 110,
      maxWidth: 110,
      headerClass: "question-grid-actions-header",
      cellClass: "question-grid-actions-cell",
      wrapHeaderText: false,
      suppressHeaderMenuButton: true,
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: ({ data }) => (
        <div className="question-grid-actions">
          <ActionIconButton type="view" disabled={!data.isActive} onClick={() => handleView(data.question)} title="View question" />
        </div>
      ),
    },
  ];

  const isQuestionActive = (question) =>
    question.activeRow !== false && question.activeRow !== "false";

  const questionRows = filteredQuestions.map((question) => ({
    ...question,
    questionText: question.questionText || "",
    learningPath: [question.courseName, question.subjectName, question.chapterName, question.topicName]
      .filter(Boolean)
      .join(" "),
    typeLabel: getQuestionType(question)?.replace(/_/g, " ") || "Unspecified",
    answerStatus: answerStatuses.items.get(String(question.questionId))?.status || "UNANSWERED",
    statusLabel: isStudent
      ? answerStatuses.loading ? "Loading…" : answerStatuses.error ? "Unavailable"
        : ({ ANSWERED: "Answered", PARTIAL: "Partially answered", UNANSWERED: "Unanswered" }[
          answerStatuses.items.get(String(question.questionId))?.status || "UNANSWERED"])
      : isQuestionActive(question) ? "Active" : "Inactive",
    isActive: isQuestionActive(question),
    question,
  }));

  // =========================================================
  // QUESTION EXCEL UPLOAD
  // =========================================================

  // =========================================================
  // QUESTION EXCEL UPLOAD
  // =========================================================

  const handleFileUpload = async (
    e,
    context = { courseId, chapterId, topicId },
  ) => {
    const file = e.target.files[0];
    const { courseId, chapterId, topicId } = context;

    if (!file) return;
    if (
      ![courseId, chapterId, topicId].every(
        (id) => Number.isInteger(Number(id)) && Number(id) > 0,
      )
    ) {
      toast.error(
        "Select a course, chapter and topic before uploading questions.",
      );
      e.target.value = "";
      return;
    }
    if (uploading) return;
    setUploading(true);
    setShowUploadModal(false);

    console.log("Selected File:", file);

    // =====================================================
    // CLOSE OLD ERROR POPUP
    // =====================================================

    setShowUploadErrors(false);

    try {
      // =====================================================
      // READ EXCEL FILE
      // =====================================================

      const arrayBuffer = await file.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
      });

      const firstSheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[firstSheetName];

      const excelData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      console.log("Excel Data:", excelData);

      // =====================================================
      // CHECK WHETHER THIS IS AN MCQ EXCEL
      // =====================================================

      const excelQuestionType =
        excelData.length > 0
          ? (
              excelData[0].question_type ||
              excelData[0].Question_Type ||
              excelData[0].QUESTION_TYPE ||
              ""
            )
              .toString()
              .trim()
              .toUpperCase()
              .replace(/\s+/g, "_")
          : "";

      console.log("Excel Question Type:", excelQuestionType);

      // =====================================================
      // FILL-IN-THE-BLANKS QUESTION UPLOAD
      // =====================================================

      if (excelQuestionType === "FILL_IN_THE_BLANKS") {
        console.log("Fill-in-the-Blanks Excel upload detected.");

        // ===================================================
        // VALIDATE REQUIRED IDs
        // ===================================================

        if (!courseId || !chapterId || !topicId) {
          toast.error(
            "Course ID, Chapter ID and Topic ID are required for Fill-in-the-Blanks upload.",
          );

          return;
        }

        // ===================================================
        // FILL-IN-THE-BLANKS FORM DATA
        // ===================================================

        const formData = new FormData();

        formData.append("file", file);

        const request = {
          courseId: Number(courseId),
          chapterId: Number(chapterId),
          topicId: Number(topicId),
        };

        formData.append(
          "request",
          new Blob([JSON.stringify(request)], {
            type: "application/json",
          }),
        );

        console.log("Fill-in-the-Blanks Upload Parameters:", request);

        // ===================================================
        // FILL-IN-THE-BLANKS UPLOAD API
        // ===================================================

        const response =
          await QuestionService.uploadFillInTheBlankExcel(formData);

        console.log("Fill-in-the-Blanks Excel upload response:", response);

        console.log(
          "Fill-in-the-Blanks Excel upload response data:",
          response.data,
        );

        const result = response.data;

        // ===================================================
        // GET BACKEND ERRORS
        // ===================================================

        const errors = Array.isArray(result?.errors) ? result.errors : [];

        console.log("Fill-in-the-Blanks Upload Errors:", errors);

        // ===================================================
        // IF ERRORS EXIST
        // ===================================================

        if (errors.length > 0) {
          setUploadErrors(errors);

          localStorage.setItem(
            QUESTION_UPLOAD_ERRORS_KEY,
            JSON.stringify(errors),
          );

          setShowUploadErrors(true);
        }

        // ===================================================
        // IF NO ERRORS
        // ===================================================
        else {
          // Success is announced by the notification popup; avoid a duplicate toast.
          // toast.success(
            // result?.message || "Fill-in-the-Blanks questions uploaded.",
          // );

          setUploadErrors([]);

          localStorage.removeItem(QUESTION_UPLOAD_ERRORS_KEY);

          setShowUploadErrors(false);
        }

        // ===================================================
        // REFRESH QUESTION LIST
        // ===================================================

        await loadQuestions();

        // ===================================================
        // IMPORTANT
        //
        // STOP HERE.
        //
        // Normal Excel upload must NOT execute.
        // ===================================================

        return;
      }

      // =====================================================
      // MATCH-THE-FOLLOWING QUESTION UPLOAD
      // =====================================================

      if (excelQuestionType === "MATCH_THE_FOLLOWING") {
        console.log("Match-the-Following Excel upload detected.");

        // ===================================================
        // VALIDATE REQUIRED IDs
        // ===================================================

        if (!courseId || !chapterId || !topicId) {
          toast.error(
            "Course ID, Chapter ID and Topic ID are required for Match-the-Following upload.",
          );

          return;
        }

        // ===================================================
        // MATCH-THE-FOLLOWING FORM DATA
        // ===================================================

        const formData = new FormData();

        formData.append("file", file);

        const request = {
          courseId: Number(courseId),
          chapterId: Number(chapterId),
          topicId: Number(topicId),
        };

        formData.append(
          "request",
          new Blob([JSON.stringify(request)], {
            type: "application/json",
          }),
        );

        console.log("Match-the-Following Upload Parameters:", request);

        // ===================================================
        // MATCH-THE-FOLLOWING UPLOAD API
        // ===================================================

        const response = await QuestionService.uploadMatchingExcel(formData);

        console.log("Match-the-Following Excel upload response:", response);

        console.log(
          "Match-the-Following Excel upload response data:",
          response.data,
        );

        const result = response.data;

        // ===================================================
        // GET BACKEND ERRORS
        // ===================================================

        const errors = Array.isArray(result?.errors) ? result.errors : [];

        if (errors.length > 0) {
          setUploadErrors(errors);

          localStorage.setItem(
            QUESTION_UPLOAD_ERRORS_KEY,
            JSON.stringify(errors),
          );

          setShowUploadErrors(true);
        } else {
          // Success is announced by the notification popup; avoid a duplicate toast.
          // toast.success(
            // result?.message || "Match-the-Following questions uploaded.",
          // );

          setUploadErrors([]);

          localStorage.removeItem(QUESTION_UPLOAD_ERRORS_KEY);

          setShowUploadErrors(false);
        }

        // ===================================================
        // REFRESH QUESTION LIST
        // ===================================================

        await loadQuestions();

        // ===================================================
        // STOP HERE
        // ===================================================

        return;
      }

      // =====================================================
      // MCQ QUESTION UPLOAD
      // =====================================================

      // =====================================================
      // MCQ QUESTION UPLOAD
      // =====================================================

      if (["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(excelQuestionType)) {
        if (!courseId || !chapterId || !topicId) {
          toast.error("Course, chapter and topic are required for MCQ upload.");
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "request",
          new Blob(
            [
              JSON.stringify({
                courseId: Number(courseId),
                chapterId: Number(chapterId),
                topicId: Number(topicId),
              }),
            ],
            { type: "application/json" },
          ),
        );

        const response = await QuestionService.uploadMcqExcel(formData);
        const result = response.data;
        const errors = Array.isArray(result?.errors) ? result.errors : [];
        setUploadErrors(errors);
        setShowUploadErrors(errors.length > 0);
        if (errors.length > 0) {
          localStorage.setItem(
            QUESTION_UPLOAD_ERRORS_KEY,
            JSON.stringify(errors),
          );
          toast.error(
            result.message || "Some MCQ questions could not be uploaded.",
          );
        } else {
          localStorage.removeItem(QUESTION_UPLOAD_ERRORS_KEY);
          // Success is announced by the notification popup; avoid a duplicate toast.
          // toast.success(result.message || "MCQ questions uploaded.");
          if (!result.success) {
            toast.error(result.message || "MCQ upload failed.");
          }
        }
        await loadQuestions();
        return;
      }

      // =====================================================
      // EXISTING NORMAL QUESTION UPLOAD
      //
      // THIS FLOW REMAINS THE SAME
      // =====================================================

      const formData = new FormData();

      // =====================================================
      // FILE
      // =====================================================

      formData.append("file", file);

      // =====================================================
      // REQUEST DTO
      // =====================================================

      const request = {
        courseId: Number(courseId),
        chapterId: Number(chapterId),
        topicId: Number(topicId),
      };

      formData.append(
        "request",
        new Blob([JSON.stringify(request)], {
          type: "application/json",
        }),
      );

      console.log("Question upload request:", request);

      // =====================================================
      // NORMAL QUESTION UPLOAD
      // =====================================================

      const response = await QuestionService.uploadExcel(formData);

      console.log("Excel upload response:", response);

      console.log("Excel upload response data:", response.data);

      const result = response.data;

      // =====================================================
      // GET BACKEND ERRORS
      // =====================================================

      const errors = Array.isArray(result?.errors) ? result.errors : [];

      console.log("Upload Errors:", errors);

      // =====================================================
      // IF ERRORS EXIST
      // =====================================================

      if (errors.length > 0) {
        setUploadErrors(errors);

        localStorage.setItem(
          QUESTION_UPLOAD_ERRORS_KEY,
          JSON.stringify(errors),
        );

        setShowUploadErrors(true);
      }

      // =====================================================
      // IF NO ERRORS
      // =====================================================
      else {
        // Success is announced by the notification popup; avoid a duplicate toast.
        // toast.success("Questions uploaded.");

        setUploadErrors([]);

        localStorage.removeItem(QUESTION_UPLOAD_ERRORS_KEY);

        setShowUploadErrors(false);
      }

      // =====================================================
      // REFRESH QUESTION LIST
      // =====================================================

      await loadQuestions();
    } catch (error) {
      console.error("Question Excel upload error:", error);

      // =====================================================
      // BACKEND ERROR RESPONSE
      // =====================================================

      const errorData = error.response?.data;

      if (errorData) {
        const errors = Array.isArray(errorData.errors) ? errorData.errors : [];

        // ===================================================
        // SAVE ERRORS
        // ===================================================

        if (errors.length > 0) {
          setUploadErrors(errors);

          localStorage.setItem(
            QUESTION_UPLOAD_ERRORS_KEY,
            JSON.stringify(errors),
          );

          setShowUploadErrors(true);
        } else {
          toast.error(
            typeof errorData === "string"
              ? errorData
              : errorData.message || "Question upload failed.",
          );
        }
      } else {
        toast.error("Question upload failed. Please try again.");
      }
    } finally {
      // =====================================================
      // ALLOWS SAME FILE TO BE SELECTED AGAIN
      // =====================================================

      e.target.value = "";
      setUploading(false);
    }
  };

  // =========================================================
  // VIEW
  // =========================================================

  const handleView = (question) => {
    if (!isQuestionActive(question)) return;

    navigate(paths.question(question.questionId), {
      state: {
        questionListPath: topicId ? paths.topicQuestions(topicId) : paths.allQuestions(),
        questionNavigationIds: filteredQuestions
          .filter(isQuestionActive)
          .map((row) => String(row.questionId)),
        questionNavigationNumbers: Object.fromEntries(
          filteredQuestions.map((row, index) => [String(row.questionId), index + 1]),
        ),
      },
    });
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = async (question) => {
    if (!isQuestionActive(question)) return;
    try {
      const { data } = await QuestionService.getQuestionById(question.questionId);
      if (!getQuestionType(data)) throw new Error("Missing question type");
      setSelectedQuestion(data);
      setShowModal(true);
    } catch {
      toast.error("Unable to load question details. Please try again.");
    }
  };

  // =========================================================
  // ENABLE / DISABLE
  // =========================================================

  const handleToggle = async (id) => {
    const question = questions.find((item) => item.questionId === id);
    if (!question) return;
    const active = !isQuestionActive(question);
    try {
      await QuestionService.setActive(id, active);
      setQuestions((current) => current.map((item) =>
        item.questionId === id ? { ...item, activeRow: active } : item,
      ));
    } catch (error) {
      console.error("Failed to update question status:", error);
      toast.error("Question status could not be updated.");
    }
  };

  const handleBulkSetActive = async (active) => {
    if (!selectedQuestionRows.length || bulkUpdatingStatus) return;
    setBulkUpdatingStatus(true);
    const results = await Promise.allSettled(
      selectedQuestionRows.map((row) => QuestionService.setActive(row.questionId, active)),
    );
    const succeededIds = new Set(
      selectedQuestionRows
        .filter((_, index) => results[index].status === "fulfilled")
        .map((row) => row.questionId),
    );
    const failedRows = selectedQuestionRows.filter((_, index) => results[index].status === "rejected");
    if (succeededIds.size) {
      setQuestions((current) => current.map((item) =>
        succeededIds.has(item.questionId) ? { ...item, activeRow: active } : item,
      ));
      toast.success(`${succeededIds.size} question${succeededIds.size === 1 ? "" : "s"} ${active ? "activated" : "deactivated"}.`);
    }
    setSelectedQuestionRows(failedRows);
    if (failedRows.length) toast.error(`${failedRows.length} question status update${failedRows.length === 1 ? "" : "s"} failed.`);
    setBulkUpdatingStatus(false);
  };

  const confirmBulkDelete = async () => {
    if (!selectedQuestionRows.length || bulkDeleting) return;
    setBulkDeleting(true);
    setBulkDeleteError(null);
    const results = await Promise.allSettled(
      selectedQuestionRows.map((row) => QuestionService.deleteQuestion(row.questionId)),
    );
    const failedRows = selectedQuestionRows.filter((_, index) => results[index].status === "rejected");
    const deletedIds = new Set(
      selectedQuestionRows
        .filter((_, index) => results[index].status === "fulfilled")
        .map((row) => row.questionId),
    );
    if (deletedIds.size) {
      setQuestions((current) => current.filter((question) => !deletedIds.has(question.questionId)));
    }
    setSelectedQuestionRows(failedRows);
    if (failedRows.length) {
      setBulkDeleteError(`${deletedIds.size} deleted; ${failedRows.length} could not be deleted. Retry to continue.`);
    } else {
      setShowBulkDeleteConfirm(false);
      toast.success(`${deletedIds.size} question${deletedIds.size === 1 ? "" : "s"} deleted.`);
    }
    setBulkDeleting(false);
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Container fluid className="question-page">
      {topic && (
        <Breadcrumbs
          items={[
            { label: topic.courseName || "Course", to: paths.courses() },
            {
              label: topic.subjectName,
              to: topic.courseId
                ? paths.courseSubjects(topic.courseId)
                : undefined,
            },
            {
              label: topic.chapterName,
              to: topic.subjectId
                ? paths.subjectChapters(topic.subjectId)
                : undefined,
            },
            {
              label: topic.name,
              to: topic.chapterId
                ? paths.chapterTopics(topic.chapterId)
                : undefined,
            },
            { label: "Questions" },
          ]}
        />
      )}

      {/* =====================================================
          HEADER
      ====================================================== */}

      <Row className="align-items-center mb-4">
        <Col lg={6}>
          <h2 className="page-title">
            {topic?.name ? `${topic.name} — Questions` : "All Questions"}
          </h2>

          <p className="question-count">Manage, review and organize your question bank</p>
        </Col>

        {canManage && (
          <Col
            lg={6}
            className="d-flex justify-content-lg-end align-items-center gap-2 mt-3 mt-lg-0"
          >
            {/* =================================================
                HIDDEN FILE INPUT
            ================================================== */}

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.xlsx,.xls"
              style={{
                display: "none",
              }}
              onChange={handleFileUpload}
            />

            {/* =================================================
                UPLOAD ERRORS BUTTON
                IMPORTANT:
                THIS IS BEFORE UPLOAD BUTTON
                SO IT APPEARS ON THE LEFT SIDE.
            ================================================== */}

            {uploadErrors.length > 0 && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowUploadErrors(true)}
              >
                ⚠ Upload Errors ({uploadErrors.length})
              </Button>
            )}

            {/* =================================================
                UPLOAD BUTTON
            ================================================== */}

            <button
              className="btn btn-primary"
              disabled={uploading}
              onClick={() => {
                if (scopedToTopic) fileInputRef.current?.click();
                else {
                  setUploadFile(null);
                  setShowUploadModal(true);
                }
              }}
            >
              ⬆ Upload
            </button>

            {/* =================================================
                ADD QUESTION
            ================================================== */}

            <Button
              variant="primary"
              onClick={() => {
                setSelectedQuestion(null);

                setShowModal(true);
              }}
            >
              <FaPlus className="me-2" />
              Add Question
            </Button>
          </Col>
        )}
      </Row>

      <ManagementCountTiles
        label="Questions"
        counts={questionCounts}
        icon={FaQuestionCircle}
      />

      {questionsLoadError && (
        <div className="question-load-error" role="alert">
          <span>{questionsLoadError}</span>
          <Button size="sm" variant="outline-danger" onClick={loadQuestions}>
            Try again
          </Button>
        </div>
      )}

      {/* =====================================================
          SEARCH
      ====================================================== */}

      {isStudent && answerStatuses.error && <div className="alert alert-warning" role="alert">{answerStatuses.error}</div>}
      <DataGrid
        rowData={questionRows}
        title="Question bank"
        description="Browse questions with their learning path, type and availability."
        toolbarFilters={canManage ? (
          <div className="question-grid-toolbar-content">
            <div className="question-grid-filters">
              <div className="question-filter-main">
                <div className="question-filter-controls">
                  <span className="question-filter-caption">
                    <FaFilter aria-hidden="true" /> Quick filters
                  </span>
                  <Form.Select className={`question-filter-select${statusFilter !== "ALL" ? " has-value" : ""}`} aria-label="Filter questions by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="ALL">All Statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
                  </Form.Select>
                  <Form.Select className={`question-filter-select${typeFilter !== "ALL" ? " has-value" : ""}`} aria-label="Filter questions by type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                    <option value="ALL">All Types</option>
                    {availableQuestionTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, " ")}</option>)}
                  </Form.Select>
                  <div className="question-quick-filter-chips">
                    <button
                      type="button"
                      className={`question-recent-chip${recentOnly ? " is-selected" : ""}`}
                      aria-pressed={recentOnly}
                      onClick={() => setRecentOnly((active) => !active)}
                    >
                      Added in last 7 days
                    </button>
                  </div>
                  {hasActiveFilters && <Button variant="outline-secondary" className="question-clear-filters" onClick={() => { setSearch(""); setStatusFilter("ALL"); setTypeFilter("ALL"); setRecentOnly(false); }}><FaTimes /> Clear {activeFilterCount}</Button>}
                  <div className="question-column-menu-wrap">
              <Button
                variant="outline-secondary"
                className="question-column-menu-trigger"
                aria-expanded={showColumnMenu}
                onClick={() => setShowColumnMenu((visible) => !visible)}
              >
                Columns
              </Button>
              {showColumnMenu && (
                <div className="question-column-menu" role="group" aria-label="Choose visible columns">
                  {[
                    ["questionText", "Question"],
                    ["learningPath", "Learning path"],
                    ["typeLabel", "Type"],
                    ["statusLabel", "Status"],
                    ["actions", "Actions"],
                  ].map(([field, label]) => (
                    <Form.Check
                      key={field}
                      type="checkbox"
                      label={label}
                      checked={visibleQuestionColumns.includes(field)}
                      disabled={visibleQuestionColumns.length === 1 && visibleQuestionColumns.includes(field)}
                      onChange={(event) => setVisibleQuestionColumns((current) =>
                        event.target.checked
                          ? [...current, field]
                          : current.filter((column) => column !== field),
                      )}
                    />
                  ))}
                  <button type="button" onClick={() => setShowColumnMenu(false)}>Done</button>
                </div>
              )}
              </div>
                  </div>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="question-applied-filters" aria-live="polite">
                  <span className="question-applied-label">Applied</span>
                  {search.trim() && <button type="button" onClick={() => setSearch("")}>Search: “{search.trim()}” <FaTimes /></button>}
                  {statusFilter !== "ALL" && <button type="button" onClick={() => setStatusFilter("ALL")}>{statusFilter === "ACTIVE" ? "Active" : "Inactive"} <FaTimes /></button>}
                  {typeFilter !== "ALL" && <button type="button" onClick={() => setTypeFilter("ALL")}>{typeFilter.replace(/_/g, " ")} <FaTimes /></button>}
                  {recentOnly && <button type="button" onClick={() => setRecentOnly(false)}>Added in last 7 days <FaTimes /></button>}
                  <span className="question-applied-count">{questionRows.length} results</span>
                </div>
              )}
          {canManage && selectedQuestionRows.length > 0 && (
            <div className="question-selection-toolbar">
              <div className="question-selection-summary">
                <span className="question-selection-count">{selectedQuestionRows.length}</span>
                <span>{selectedQuestionRows.length === 1 ? "question selected" : "questions selected"}</span>
                <button type="button" className="question-clear-selection" onClick={() => questionGridApi?.deselectAll()}>
                  Clear selection
                </button>
              </div>
              <div className="question-selection-actions">
                {selectedQuestionRows.length === 1 && (
                  <Button
                    className="question-bulk-action-edit"
                    size="sm"
                    variant="outline-primary"
                    disabled={!selectedQuestionRows[0].isActive}
                    onClick={() => handleEdit(selectedQuestionRows[0].question)}
                  >
                    Edit
                  </Button>
                )}
                <Button className="question-bulk-action-activate" size="sm" variant="outline-success" disabled={bulkUpdatingStatus} onClick={() => handleBulkSetActive(true)}>
                  <FaCheck aria-hidden="true" />
                  Activate
                </Button>
                <Button className="question-bulk-action-deactivate" size="sm" variant="outline-warning" disabled={bulkUpdatingStatus} onClick={() => handleBulkSetActive(false)}>
                  <FaBan aria-hidden="true" />
                  Deactivate
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => {
                    setBulkDeleteError(null);
                    setShowBulkDeleteConfirm(true);
                  }}
                >
                  <FaTrash aria-hidden="true" />
                  Delete selected
                </Button>
              </div>
            </div>
          )}
          </div>
        ) : null}
        quickFilterText={search}
        onQuickFilterTextChange={setSearch}
        searchPlaceholder="Search questions, topics, chapters..."
        countLabel="question"
        countLabelPlural="questions"
        loading={loadingQuestions}
        columnDefs={questionColumns.filter((column) => visibleQuestionColumns.includes(column.field))}
        height={520}
        pageSize={5}
        rowHeight={76}
        rowSelection={canManage ? {
          mode: "multiRow",
          checkboxes: true,
          headerCheckbox: true,
          enableClickSelection: false,
        } : undefined}
        getRowId={({ data }) => String(data.questionId)}
        onGridReady={(event) => setQuestionGridApi(event.api)}
        onSelectionChanged={(event) => setSelectedQuestionRows(event.api.getSelectedRows())}
        noRowsMessage={questionsLoadError ? "Question list unavailable" : questions.length === 0 ? "No questions available yet" : "No questions match these filters. Clear filters to see the full list."}
        defaultColDef={{ wrapHeaderText: true, autoHeaderHeight: true }}
      />

      {/* =====================================================
          ADD / EDIT QUESTION MODAL
      ====================================================== */}

      {showUploadModal &&
        createPortal(
          <div className="modal-overlay">
            <div
              className="table-name-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="question-upload-title"
            >
              <div className="modal-header">
                <div>
                  <h2 id="question-upload-title">Upload Questions</h2>
                  <p>Select where the questions should be uploaded.</p>
                </div>
                <button
                  className="close-btn"
                  aria-label="Close upload"
                  onClick={() => setShowUploadModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-card">
                  {uploadOptionsError && (
                    <div className="alert alert-danger">
                      {uploadOptionsError}
                    </div>
                  )}
                  <div className="form-grid">
                    {[
                      {
                        key: "courseId",
                        label: "Course",
                        options: uploadOptions.courses,
                      },
                      {
                        key: "subjectId",
                        label: "Subject",
                        parent: "courseId",
                        options: uploadOptions.subjects.filter(
                          (item) =>
                            String(item.courseId) ===
                            String(uploadContext.courseId?.value),
                        ),
                      },
                      {
                        key: "chapterId",
                        label: "Chapter",
                        parent: "subjectId",
                        options: uploadOptions.chapters.filter(
                          (item) =>
                            String(item.subjectId) ===
                            String(uploadContext.subjectId?.value),
                        ),
                      },
                      {
                        key: "topicId",
                        label: "Topic",
                        parent: "chapterId",
                        options: uploadOptions.topics.filter(
                          (item) =>
                            String(item.chapterId) ===
                            String(uploadContext.chapterId?.value),
                        ),
                      },
                    ].map(({ key, label, parent, options }) => (
                      <div className="form-group" key={key}>
                        <label htmlFor={`upload-${key}`}>
                          {label} <span>*</span>
                        </label>
                        <Select
                          inputId={`upload-${key}`}
                          className="aq-search-select"
                          classNamePrefix="aq-select"
                          options={options}
                          value={uploadContext[key] ?? null}
                          placeholder={`Select ${label}`}
                          isLoading={loadingUploadOptions}
                          isDisabled={
                            loadingUploadOptions ||
                            Boolean(uploadOptionsError) ||
                            (parent && !uploadContext[parent])
                          }
                          isClearable
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 10000 }),
                          }}
                          onChange={(option) =>
                            setUploadContext((current) => {
                              const next = { ...current, [key]: option };
                              const keys = [
                                "courseId",
                                "subjectId",
                                "chapterId",
                                "topicId",
                              ];
                              keys
                                .slice(keys.indexOf(key) + 1)
                                .forEach((child) => {
                                  next[child] = null;
                                });
                              return next;
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="question-upload-file">
                      Excel File <span>*</span>
                    </label>
                    <input
                      id="question-upload-file"
                      className="form-control"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(event) =>
                        setUploadFile(event.target.files[0] ?? null)
                      }
                    />
                    <small className="text-muted">
                      Use the template for your question type. Question text,
                      answers and other question fields come from Excel; subject
                      is derived from the selected topic.
                    </small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={
                    loadingUploadOptions ||
                    Boolean(uploadOptionsError) ||
                    !uploadFile ||
                    !uploadContext.topicId
                  }
                  onClick={() =>
                    handleFileUpload(
                      { target: { files: [uploadFile], value: "" } },
                      {
                        courseId: uploadContext.courseId?.value,
                        chapterId: uploadContext.chapterId?.value,
                        topicId: uploadContext.topicId?.value,
                      },
                    )
                  }
                >
                  Upload
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showModal &&
        (showQuestionType2 ? (
          <QuestionType2Modal
            show={true}
            questionData={selectedQuestion}
            initialCourseId={courseId}
            initialSubjectId={subjectId}
            initialChapterId={chapterId}
            initialTopicId={topicId}
            onClose={() => {
              setShowModal(false);
              setSelectedQuestion(null);
            }}
            onSave={async (questionData) => {
              const isEdit = Boolean(selectedQuestion?.questionId);
              if (isEdit) {
                await QuestionService.update(
                  selectedQuestion.questionId,
                  questionData,
                );
              } else {
                await QuestionService.create(questionData);
              }

              await loadQuestions();

              setShowModal(false);

              setSelectedQuestion(null);

              toast.success(isEdit ? "Question updated." : "Question added.");
            }}
          />
        ) : (
          <AddQuestionModal
            courseId={courseId}
            subjectId={subjectId}
            chapterId={chapterId}
            topicId={topicId}
            initialData={selectedQuestion}
            onClose={() => {
              setShowModal(false);
              setSelectedQuestion(null);
            }}
            onSave={async () => {
              const isEdit = Boolean(selectedQuestion?.questionId);
              await loadQuestions();

              setShowModal(false);

              setSelectedQuestion(null);

              toast.success(isEdit ? "Question updated." : "Question added.");
            }}
          />
        ))}

      {/* =====================================================
          QUESTION UPLOAD ERROR MODAL
      ====================================================== */}

      <QuestionUploadErrorsModal
        show={showUploadErrors}
        errors={uploadErrors}
        onClose={() => setShowUploadErrors(false)}
      />

      <ConfirmDialog
        open={showBulkDeleteConfirm}
        title={`Delete ${selectedQuestionRows.length} selected questions?`}
        body="The selected questions will be removed. This can't be undone."
        confirmLabel={`Delete ${selectedQuestionRows.length} questions`}
        loading={bulkDeleting}
        error={bulkDeleteError}
        onConfirm={confirmBulkDelete}
        onCancel={() => {
          if (!bulkDeleting) setShowBulkDeleteConfirm(false);
        }}
      />
    </Container>
  );
};

export default QuestionList;
