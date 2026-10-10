import { useState, useRef, useEffect } from "react";
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
  ListGroup,
  Badge,
} from "react-bootstrap";

import { FaSearch, FaPlus, FaQuestionCircle, FaTimes } from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";
import { canManageContent } from "../../utils/roles";
import { paths } from "../../routes/paths";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import ManagementCountTiles from "../../components/Common/ManagementCountTiles";
import { getManagementCounts } from "../../utils/managementCounts";
import TopicService from "../../services/TopicService";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";
import ActionIconButton from "../../components/Common/ActionIconButton";
import "./QuestionList.css";
import AddQuestionModal from "./AddQuestionModal";
import { normalizeQuestionType } from "../../utils/questionType";
import QuestionType2Modal from "./QuestionType2Modal";

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
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const searchMatch = searchableText.includes(search.trim().toLowerCase());
      const active =
        question.activeRow !== false && question.activeRow !== "false";
      const statusMatch =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);
      const typeMatch =
        typeFilter === "ALL" || getQuestionType(question) === typeFilter;

      return searchMatch && statusMatch && typeMatch;
    })
    .sort(
      (first, second) =>
        Number(second.questionId || 0) - Number(first.questionId || 0),
    );
  const questionCounts = getManagementCounts(questions);
  const hasActiveFilters =
    search.trim() || statusFilter !== "ALL" || typeFilter !== "ALL";

  // =========================================================
  // QUESTION ACTIVE CHECK
  // =========================================================

  const isQuestionActive = (question) =>
    question.activeRow !== false && question.activeRow !== "false";

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
          toast.success(
            result?.message || "Fill-in-the-Blanks questions uploaded.",
          );

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
          toast.success(
            result?.message || "Match-the-Following questions uploaded.",
          );

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
          if (result.success) {
            toast.success(result.message || "MCQ questions uploaded.");
          } else {
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
        toast.success("Questions uploaded.");

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

  const handleToggle = (id) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.questionId === id
          ? {
              ...question,
              activeRow: !isQuestionActive(question),
            }
          : question,
      ),
    );
  };

  // =========================================================
  // DELETE
  // =========================================================

  const del = useDeleteConfirm({
    entity: "question",
    deleteFn: async (question) => {
      await QuestionService.deleteQuestion(question.questionId);
      setQuestions((prevQuestions) =>
        prevQuestions.filter((q) => q.questionId !== question.questionId),
      );
    },
  });

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

          <p className="question-count">{filteredQuestions.length} Questions</p>
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

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div className="question-filters mb-3">
        <div className="question-search">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-0">
              <FaSearch />
            </span>

            <input
              type="text"
              className="form-control border-0"
              placeholder="Search Questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Form.Select
          className="question-filter-select"
          aria-label="Filter questions by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Form.Select>

        <Form.Select
          className="question-filter-select"
          aria-label="Filter questions by type"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="ALL">All Types</option>
          {availableQuestionTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </Form.Select>

        {hasActiveFilters && (
          <Button
            variant="outline-secondary"
            className="question-clear-filters"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setTypeFilter("ALL");
            }}
          >
            <FaTimes /> Clear
          </Button>
        )}
      </div>

      <div className="question-results-summary">
        Showing <strong>{filteredQuestions.length}</strong> of{" "}
        <strong>{questions.length}</strong> questions
      </div>

      {/* =====================================================
          QUESTION LIST
      ====================================================== */}

      <ListGroup className="question-list">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question, index) => (
            <ListGroup.Item
              key={question.questionId}
              className={`question-item ${
                !isQuestionActive(question) ? "disabled-question" : ""
              }`}
            >
              <Row className="align-items-center">
                <Col lg={8}>
                  <h5 className="question-title">
                    {index + 1}. {question.questionText}
                  </h5>

                  <div className="question-meta">
                    <Badge bg="success">{question.courseName}</Badge>

                    <Badge bg="secondary">{question.subjectName}</Badge>

                    <Badge bg="warning">{question.chapterName}</Badge>

                    <Badge bg="info">{question.topicName}</Badge>
                    <Badge bg="primary">
                      {getQuestionType(question)?.replace(/_/g, " ") ||
                        "Type not specified"}
                    </Badge>
                  </div>
                </Col>

                <Col
                  lg={4}
                  className="d-flex justify-content-lg-end align-items-center flex-wrap gap-2 mt-3 mt-lg-0"
                >
                  {/* VIEW */}

                  <ActionIconButton
                    type="view"
                    disabled={!isQuestionActive(question)}
                    onClick={() => handleView(question)}
                    title="View question"
                  />

                  {canManage && (
                    <>
                      {/* EDIT */}

                      <ActionIconButton
                        type="edit"
                        disabled={!isQuestionActive(question)}
                        onClick={() => handleEdit(question)}
                        title="Edit question"
                      />

                      {/* DELETE */}

                      <ActionIconButton
                        type="delete"
                        disabled={!isQuestionActive(question)}
                        onClick={() => del.request(question)}
                        title="Delete question"
                      />

                      {/* ENABLE / DISABLE */}

                      <Form.Check
                        type="switch"
                        id={`switch-${question.questionId}`}
                        checked={isQuestionActive(question)}
                        onChange={() => handleToggle(question.questionId)}
                        label={
                          isQuestionActive(question) ? "Active" : "Inactive"
                        }
                      />
                    </>
                  )}
                </Col>
              </Row>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item className="text-center py-5">
            <h5>No Questions Found</h5>

            <p className="text-muted mb-0">
              Try searching with a different keyword.
            </p>
          </ListGroup.Item>
        )}
      </ListGroup>

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
        open={Boolean(del.pending)}
        title="Delete this question?"
        body={
          del.pending?.questionText
            ? `"${del.pending.questionText.slice(0, 120)}${
                del.pending.questionText.length > 120 ? "…" : ""
              }" will be removed. This can't be undone.`
            : "This question will be removed. This can't be undone."
        }
        confirmLabel="Delete question"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </Container>
  );
};

export default QuestionList;
