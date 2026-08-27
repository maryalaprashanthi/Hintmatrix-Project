import { useState, useRef, useEffect } from "react";
import QuestionService from "../../services/QuestionService";
import SuccessModal from "../../components/Common/SuccessModal";
import DeleteModal from "../../components/Common/DeleteModal";
import QuestionUploadErrorsModal from "../../components/Common/QuestionUploadErrorsModal";

import {
  Container,
  Row,
  Col,
  Button,
  Form,
  ListGroup,
  Badge,
} from "react-bootstrap";

import {
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import { useNavigate, useSearchParams } from "react-router-dom";
import "./QuestionList.css";
import AddQuestionModal from "./AddQuestionModal";
import QuestionType2Modal from "./QuestionType2Modal";
import { getQuestionTypeByChapter } from "../../utils/questionTypeMapping";

const QuestionList = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // =========================================================
  // QUESTION UPLOAD ERROR STATES
  // =========================================================

  const [uploadErrors, setUploadErrors] = useState([]);
  const [showUploadErrors, setShowUploadErrors] = useState(false);

  // =========================================================
  // LOCAL STORAGE KEY
  // =========================================================

  const QUESTION_UPLOAD_ERRORS_KEY = "questionUploadErrors";

  const userRole = (localStorage.getItem("role") || "GUEST")
    .toString()
    .trim()
    .toUpperCase();

  const isStudent = userRole === "STUDENT";

  // =========================================================
  // FILE INPUT
  // =========================================================

  const fileInputRef = useRef(null);

  // =========================================================
  // QUESTIONS
  // =========================================================

  const [questions, setQuestions] = useState([]);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const courseId = searchParams.get("courseId");
  const chapterId = searchParams.get("chapterId");
  const categoryId = searchParams.get("categoryId");

  // =========================================================
  // QUESTION TYPE
  // =========================================================

  const questionType = getQuestionTypeByChapter(chapterId);

  const showQuestionType2 =
    questionType === "JOURNAL" ||
    questionType === "DROPDOWN";

  console.log("Course ID:", courseId);
  console.log("Chapter ID:", chapterId);
  console.log("Category ID:", categoryId);

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
      const savedErrors = localStorage.getItem(
        QUESTION_UPLOAD_ERRORS_KEY,
      );

      if (savedErrors) {
        const parsedErrors = JSON.parse(savedErrors);

        if (
          Array.isArray(parsedErrors) &&
          parsedErrors.length > 0
        ) {
          setUploadErrors(parsedErrors);
        } else {
          setUploadErrors([]);
        }
      } else {
        setUploadErrors([]);
      }
    } catch (error) {
      console.error(
        "Error loading saved question upload errors:",
        error,
      );

      setUploadErrors([]);
    }
  }, []);

  // =========================================================
  // LOAD QUESTIONS
  // =========================================================

  useEffect(() => {
    loadQuestions();
  }, [courseId, chapterId, categoryId]);

  const loadQuestions = async () => {
    try {
      let response;

      if (courseId && chapterId && categoryId) {
        // Student flow
        response =
          await QuestionService.getQuestionsByMapping(
            courseId,
            chapterId,
            categoryId,
          );

        console.log(
          "Question API response:",
          response,
        );

        console.log(
          "Question API data:",
          response.data,
        );
      } else {
        // Admin flow
        response =
          await QuestionService.getQuestionText();

        console.log(
          "Admin question response:",
          response,
        );

        console.log(
          "Admin question data:",
          response.data,
        );
      }

      const loadedQuestions =
        Array.isArray(response.data)
          ? response.data
          : [];

      if (
        courseId &&
        chapterId &&
        categoryId
      ) {
        const matchesMapping = (question) =>
          String(
            question.courseId ??
              question.course_id,
          ) === String(courseId) &&
          String(
            question.chapterId ??
              question.chapter_id,
          ) === String(chapterId) &&
          String(
            question.categoryId ??
              question.category_id,
          ) === String(categoryId);

        setQuestions(
          loadedQuestions.filter(
            matchesMapping,
          ),
        );
      } else {
        setQuestions(loadedQuestions);
      }
    } catch (error) {
      console.error(
        "Error loading questions:",
        error,
      );
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredQuestions = questions.filter(
    (question) =>
      (question.questionText || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  // =========================================================
  // QUESTION ACTIVE CHECK
  // =========================================================

  const isQuestionActive = (question) =>
    question.activeRow !== false &&
    question.activeRow !== "false";

  // =========================================================
  // QUESTION EXCEL UPLOAD
  // =========================================================

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    console.log(
      "Selected File:",
      file,
    );

    // =====================================================
    // CLOSE OLD ERROR POPUP
    // =====================================================

    setShowUploadErrors(false);

    const formData = new FormData();

    try {
      // =====================================================
      // FILE
      // =====================================================

      formData.append(
        "file",
        file,
      );

      // =====================================================
      // REQUEST DTO
      // =====================================================

      const request = {
        courseId: Number(courseId),
        chapterId: Number(chapterId),
        categoryId: Number(categoryId),
      };

      formData.append(
        "request",
        new Blob(
          [JSON.stringify(request)],
          {
            type: "application/json",
          },
        ),
      );

      console.log(
        "Question upload request:",
        request,
      );

      // =====================================================
      // UPLOAD
      // =====================================================

      const response =
        await QuestionService.uploadExcel(
          formData,
        );

      console.log(
        "Excel upload response:",
        response,
      );

      console.log(
        "Excel upload response data:",
        response.data,
      );

      const result = response.data;

      // =====================================================
      // GET BACKEND ERRORS
      // =====================================================

      const errors =
        Array.isArray(result?.errors)
          ? result.errors
          : [];

      console.log(
        "Upload Errors:",
        errors,
      );

      // =====================================================
      // IMPORTANT:
      //
      // IF ERRORS EXIST
      //
      // Save them permanently in localStorage.
      //
      // This means navigation will NOT remove them.
      // =====================================================

      if (errors.length > 0) {
        setUploadErrors(errors);

        localStorage.setItem(
          QUESTION_UPLOAD_ERRORS_KEY,
          JSON.stringify(errors),
        );

        // Open popup immediately
        setShowUploadErrors(true);
      }

      // =====================================================
      // IMPORTANT:
      //
      // IF NO ERRORS
      //
      // ALL PREVIOUS ERRORS ARE RESOLVED.
      //
      // Remove them from localStorage.
      // =====================================================

      else {
        console.log(
          "All questions uploaded successfully.",
        );

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

      const errorData =
        error.response?.data;

      if (errorData) {
        const errors =
          Array.isArray(
            errorData.errors,
          )
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
          alert(
            typeof errorData === "string"
              ? errorData
              : errorData.message ||
                  "Question upload failed.",
          );
        }
      } else {
        alert(
          "Question upload failed. Please try again.",
        );
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
    if (!isQuestionActive(question))
      return;

    navigate(
      `/questions/question-list/${question.questionId}?courseId=${courseId}&chapterId=${chapterId}&categoryId=${categoryId}`,
    );
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (question) => {
    if (!isQuestionActive(question))
      return;

    setSelectedQuestion(question);
    setShowModal(true);
  };

  // =========================================================
  // ENABLE / DISABLE
  // =========================================================

  const handleToggle = (id) => {
    setQuestions(
      (prevQuestions) =>
        prevQuestions.map(
          (question) =>
            question.questionId === id
              ? {
                  ...question,
                  activeRow:
                    !isQuestionActive(
                      question,
                    ),
                }
              : question,
        ),
    );
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteClick = async (
    question,
  ) => {
    if (!isQuestionActive(question))
      return;

    const {
      questionId: id,
    } = question;

    const confirmDelete =
      window.confirm(
        "Are you sure you want to permanently delete this question?",
      );

    if (!confirmDelete)
      return;

    try {
      await QuestionService.deleteQuestion(
        id,
      );

      setQuestions(
        (prevQuestions) =>
          prevQuestions.filter(
            (question) =>
              question.questionId !==
              id,
          ),
      );

      setShowDelete(true);
    } catch (error) {
      console.error(
        "Error deleting question:",
        error,
      );

      alert(
        "Failed to delete question. Please try again.",
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Container
      fluid
      className="question-page"
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <Row className="align-items-center mb-4">

        <Col lg={6}>

          <h2 className="page-title">
            Easy Model Questions
          </h2>

          <p className="question-count">
            {filteredQuestions.length} Questions
          </p>

        </Col>

        {!isStudent && (
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
              onChange={
                handleFileUpload
              }
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
                onClick={() =>
                  setShowUploadErrors(
                    true,
                  )
                }
              >
                ⚠ Upload Errors (
                {uploadErrors.length})
              </Button>
            )}

            {/* =================================================
                UPLOAD BUTTON
            ================================================== */}

            <button
              className="btn btn-primary"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              ⬆ Upload
            </button>

            {/* =================================================
                ADD QUESTION
            ================================================== */}

            <Button
              variant="primary"
              onClick={() => {
                setSelectedQuestion(
                  null,
                );

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
              onChange={(e) =>
                setSearch(
                  e.target.value,
                )
              }
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          QUESTION LIST
      ====================================================== */}

      <ListGroup className="question-list">

        {filteredQuestions.length >
        0 ? (

          filteredQuestions.map(
            (
              question,
              index,
            ) => (

              <ListGroup.Item
                key={
                  question.questionId
                }
                className={`question-item ${
                  !question.activeRow
                    ? "disabled-question"
                    : ""
                }`}
              >

                <Row className="align-items-center">

                  <Col lg={8}>

                    <h5 className="question-title">

                      {index + 1}.{" "}

                      {
                        question.questionText
                      }

                    </h5>

                    <div className="question-meta">

                      <Badge bg="success">
                        {
                          question.courseName
                        }
                      </Badge>

                      <Badge bg="warning">
                        {
                          question.chapterName
                        }
                      </Badge>

                      <Badge bg="info">
                        {
                          question.categoryName
                        }
                      </Badge>

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
                      disabled={
                        !isQuestionActive(
                          question,
                        )
                      }
                      onClick={() =>
                        handleView(
                          question,
                        )
                      }
                    >
                      <FaEye className="me-1" />
                      View
                    </Button>

                    {/* EDIT */}

                    <Button
                      variant="outline-warning"
                      size="sm"
                      disabled={
                        !isQuestionActive(
                          question,
                        )
                      }
                      onClick={() =>
                        handleEdit(
                          question,
                        )
                      }
                    >
                      <FaEdit className="me-1" />
                      Edit
                    </Button>

                    {/* ENABLE / DISABLE */}

                    <Form.Check
                      type="switch"
                      id={`switch-${question.questionId}`}
                      checked={isQuestionActive(
                        question,
                      )}
                      onChange={() =>
                        handleToggle(
                          question.questionId,
                        )
                      }
                      label="Disable"
                    />

                    {/* DELETE */}

                    <Button
                      variant="outline-danger"
                      size="sm"
                      disabled={
                        !isQuestionActive(
                          question,
                        )
                      }
                      onClick={() =>
                        handleDeleteClick(
                          question,
                        )
                      }
                    >
                      <FaTrash className="me-1" />
                      Delete
                    </Button>

                  </Col>

                </Row>

              </ListGroup.Item>

            ),
          )

        ) : (

          <ListGroup.Item className="text-center py-5">

            <h5>
              No Questions Found
            </h5>

            <p className="text-muted mb-0">
              Try searching with a
              different keyword.
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
            questionData={
              selectedQuestion
            }
            initialCourseId={
              courseId
            }
            initialChapterId={
              chapterId
            }
            initialCategoryId={
              categoryId
            }
            onClose={() => {
              setShowModal(false);
              setSelectedQuestion(
                null,
              );
            }}
            onSave={async (
              questionData,
            ) => {

              if (
                selectedQuestion?.questionId
              ) {

                await QuestionService.update(
                  selectedQuestion.questionId,
                  questionData,
                );

              } else {

                await QuestionService.create(
                  questionData,
                );

              }

              await loadQuestions();

              setShowModal(false);

              setSelectedQuestion(
                null,
              );

              setShowSuccess(true);
            }}
          />

        ) : (

          <AddQuestionModal
            courseId={
              courseId
            }
            chapterId={
              chapterId
            }
            categoryId={
              categoryId
            }
            initialData={
              selectedQuestion
            }
            onClose={() => {
              setShowModal(false);
              setSelectedQuestion(
                null,
              );
            }}
            onSave={async () => {

              await loadQuestions();

              setShowModal(false);

              setSelectedQuestion(
                null,
              );

              setShowSuccess(true);
            }}
          />

        ))}

      {/* =====================================================
          QUESTION UPLOAD ERROR MODAL
      ====================================================== */}

      <QuestionUploadErrorsModal
        show={
          showUploadErrors
        }
        errors={
          uploadErrors
        }
        onClose={() =>
          setShowUploadErrors(
            false,
          )
        }
      />

      {/* =====================================================
          SUCCESS MODAL
      ====================================================== */}

      {showSuccess && (
        <SuccessModal
          show={
            showSuccess
          }
          onClose={() =>
            setShowSuccess(
              false,
            )
          }
          message="Question added successfully!"
        />
      )}

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {showDelete && (
        <DeleteModal
          show={
            showDelete
          }
          onClose={() =>
            setShowDelete(
              false,
            )
          }
          message="Question deleted successfully!"
        />
      )}

    </Container>
  );
};

export default QuestionList;