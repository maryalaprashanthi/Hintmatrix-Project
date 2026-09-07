import { useState, useRef, useEffect } from "react";
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

import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";
import { canManageContent } from "../../utils/roles";
import { paths } from "../../routes/paths";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import TopicService from "../../services/TopicService";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";
import "./QuestionList.css";
import AddQuestionModal from "./AddQuestionModal";
import QuestionType2Modal from "./QuestionType2Modal";

const getQuestionType = (question) => {
  const type =
    question?.questionType?.name ??
    question?.questionType ??
    question?.questionTypeName ??
    question?.question_type_name;

  return typeof type === "string"
    ? type.trim().toUpperCase().replace(/\s+/g, "_")
    : undefined;
};

const QuestionList = () => {
  const toast = useToast();
  const [search, setSearch] = useState("");
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

  const filteredQuestions = questions.filter((question) =>
    (question.questionText || "").toLowerCase().includes(search.toLowerCase()),
  );

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

const handleFileUpload = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

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
    // MCQ QUESTION UPLOAD
    // =====================================================

    if (["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(excelQuestionType)) {
      console.log("MCQ Excel upload detected.");

      // ===================================================
      // VALIDATE REQUIRED IDs
      // ===================================================

      if (!courseId || !chapterId || !topicId) {
        toast.error(
          "Course ID, Chapter ID and Topic ID are required for MCQ upload.",
        );

        return;
      }

      // ===================================================
      // MCQ FORM DATA
      // ===================================================

      const formData = new FormData();

      formData.append("file", file);

      formData.append("courseId", courseId);

      formData.append("chapterId", chapterId);

      formData.append("topicId", topicId);

      console.log("MCQ Upload Parameters:", {
        courseId,
        chapterId,
        topicId,
      });

      // ===================================================
      // MCQ UPLOAD API
      // ===================================================

      const response = await QuestionService.uploadMcqExcel(formData);

      console.log("MCQ Excel upload response:", response);

      console.log(
        "MCQ Excel upload response data:",
        response.data,
      );

      // ===================================================
      // SUCCESS MESSAGE
      // ===================================================

      toast.success(
        typeof response.data === "string"
          ? response.data
          : "MCQ questions uploaded.",
      );

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

    console.log(
      "Excel upload response data:",
      response.data,
    );

    const result = response.data;

    // =====================================================
    // GET BACKEND ERRORS
    // =====================================================

    const errors = Array.isArray(result?.errors)
      ? result.errors
      : [];

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

      localStorage.removeItem(
        QUESTION_UPLOAD_ERRORS_KEY,
      );

      setShowUploadErrors(false);
    }

    // =====================================================
    // REFRESH QUESTION LIST
    // =====================================================

    await loadQuestions();
  } catch (error) {
    console.error(
      "Question Excel upload error:",
      error,
    );

    // =====================================================
    // BACKEND ERROR RESPONSE
    // =====================================================

    const errorData = error.response?.data;

    if (errorData) {
      const errors = Array.isArray(errorData.errors)
        ? errorData.errors
        : [];

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
            : errorData.message ||
                "Question upload failed.",
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
  }
};

  // =========================================================
  // VIEW
  // =========================================================

  const handleView = (question) => {
    if (!isQuestionActive(question)) return;

    navigate(paths.question(question.questionId));
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (question) => {
    if (!isQuestionActive(question)) return;

    setSelectedQuestion(question);
    setShowModal(true);
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
              onClick={() => fileInputRef.current?.click()}
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
                !question.activeRow ? "disabled-question" : ""
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
                  </div>
                </Col>

                <Col
                  lg={4}
                  className="d-flex justify-content-lg-end align-items-center flex-wrap gap-2 mt-3 mt-lg-0"
                >
                  {/* VIEW */}

                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={!isQuestionActive(question)}
                    onClick={() => handleView(question)}
                  >
                    <FaEye className="me-1" />
                    View
                  </Button>

                  {canManage && (
                    <>
                      {/* EDIT */}

                      <Button
                        variant="outline-warning"
                        size="sm"
                        disabled={!isQuestionActive(question)}
                        onClick={() => handleEdit(question)}
                      >
                        <FaEdit className="me-1" />
                        Edit
                      </Button>

                      {/* ENABLE / DISABLE */}

                      <Form.Check
                        type="switch"
                        id={`switch-${question.questionId}`}
                        checked={isQuestionActive(question)}
                        onChange={() => handleToggle(question.questionId)}
                        label="Disable"
                      />

                      {/* DELETE */}

                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={!isQuestionActive(question)}
                        onClick={() => del.request(question)}
                      >
                        <FaTrash className="me-1" />
                        Delete
                      </Button>
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
