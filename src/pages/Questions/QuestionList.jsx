import { useState, useRef, useEffect } from "react";
import QuestionService from "../../services/QuestionService";
import SuccessModal from "../../components/Common/SuccessModal";
import DeleteModal from "../../components/Common/DeleteModal";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  ListGroup,
  Badge,
} from "react-bootstrap";

import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./QuestionList.css";
import AddQuestionModal from "./AddQuestionModal";

const QuestionList = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const userRole = (localStorage.getItem("role") || "GUEST").toString().trim().toUpperCase();
  const isStudent = userRole === "STUDENT";
  // edit functionality
  // const [questionData,setQuestionData] = useState(null);

  // Upload File Reference
  const fileInputRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const courseId = searchParams.get("courseId");
  const chapterId = searchParams.get("chapterId");
  const categoryId = searchParams.get("categoryId");

  console.log("Course ID:", courseId);
  console.log("Chapter ID:", chapterId);
  console.log("Category ID:", categoryId);

  // load questions
  useEffect(() => {
    loadQuestions();
  }, [courseId, chapterId, categoryId]);

  const loadQuestions = async () => {
    try {
      let response;

      if (courseId && chapterId && categoryId) {
        // Student flow
        response = await QuestionService.getQuestionsByMapping(
          courseId,
          chapterId,
          categoryId,
        );
        console.log("Question API response:", response);
        console.log("Question API data:", response.data);
      } else {
        // Admin flow
        response = await QuestionService.getQuestionText();
        console.log("Admin question response:", response);
        console.log("Admin question data:", response.data);
      }

      const loadedQuestions = Array.isArray(response.data) ? response.data : [];

      if (courseId && chapterId && categoryId) {
        const matchesMapping = (question) =>
          String(question.courseId ?? question.course_id) ===
            String(courseId) &&
          String(question.chapterId ?? question.chapter_id) ===
            String(chapterId) &&
          String(question.categoryId ?? question.category_id) ===
            String(categoryId);

        setQuestions(loadedQuestions.filter(matchesMapping));
      } else {
        setQuestions(loadedQuestions);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  // used to show questions matching searched keywords
  const filteredQuestions = questions.filter((question) =>
    (question.questionText || "").toLowerCase().includes(search.toLowerCase()),
  );

  const isQuestionActive = (question) =>
    question.activeRow !== false && question.activeRow !== "false";

  // Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    console.log("Selected File:", file);

    alert(`Selected File: ${file.name}`);

    // Backend upload API later

    e.target.value = "";
  };

  // View
  const handleView = (question) => {
    if (!isQuestionActive(question)) return;

    navigate(
      `/questions/question-list/${question.questionId}?courseId=${courseId}&chapterId=${chapterId}&categoryId=${categoryId}`,
    );
  };

  // Edit
  const handleEdit = (question) => {
    if (!isQuestionActive(question)) return;

    setSelectedQuestion(question);
    setShowModal(true);
  };

  // Enable / Disable
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

  // Delete
  const handleDeleteClick = async (question) => {
    if (!isQuestionActive(question)) return;

    const { questionId: id } = question;
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this question?",
    );

    if (!confirmDelete) return;

    try {
      // Delete from database
      await QuestionService.deleteQuestion(id);

      // Remove from UI only after successful backend deletion
      setQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question.questionId !== id),
      );

      // Show success message
      setShowDelete(true);
    } catch (error) {
      console.error("Error deleting question:", error);

      alert("Failed to delete question. Please try again.");
    }
  };

  return (
    <Container fluid className="question-page">
      {/* Header */}

      <Row className="align-items-center mb-4">
        <Col lg={6}>
          <h2 className="page-title">Easy Model Questions</h2>

          <p className="question-count">{filteredQuestions.length} Questions</p>
        </Col>

        {!isStudent && (
          <Col
            lg={6}
            className="d-flex justify-content-lg-end gap-2 mt-3 mt-lg-0"
          >
            {/* Hidden Upload Input */}
            {/* Look into this */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            {/* Upload Button */}

            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current.click()}
            >
              ⬆ Upload
            </button>

            {/* Add Question */}

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

      {/* Search */}

      <Row className="mb-4">
        <Col lg={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>

            <Form.Control
              placeholder="Search Questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Question List */}

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

                    <Badge bg="warning">{question.chapterName}</Badge>

                    <Badge bg="info">{question.categoryName}</Badge>
                  </div>
                </Col>

                <Col
                  lg={4}
                  className="d-flex justify-content-lg-end align-items-center flex-wrap gap-2 mt-3 mt-lg-0"
                >
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={!isQuestionActive(question)}
                    onClick={() => handleView(question)}
                  >
                    <FaEye className="me-1" />
                    View
                  </Button>

                  <Button
                    variant="outline-warning"
                    size="sm"
                    disabled={!isQuestionActive(question)}
                    onClick={() => handleEdit(question)}
                  >
                    <FaEdit className="me-1" />
                    Edit
                  </Button>

                  <Form.Check
                    type="switch"
                    id={`switch-${question.questionId}`}
                    checked={isQuestionActive(question)}
                    onChange={() => handleToggle(question.questionId)}
                    label="Disable"
                  />

                  <Button
                    variant="outline-danger"
                    size="sm"
                    disabled={!isQuestionActive(question)}
                    onClick={() => handleDeleteClick(question)}
                  >
                    <FaTrash className="me-1" />
                    Delete
                  </Button>
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

      {showModal && (
        <AddQuestionModal
          courseId={courseId}
          chapterId={chapterId}
          categoryId={categoryId}
          initialData={selectedQuestion}
          onClose={() => {
            setShowModal(false);
            setSelectedQuestion(null);
          }}
          onSave={async () => {
            await loadQuestions();
            setShowModal(false);
            setSelectedQuestion(null);
            setShowSuccess(true);
          }}
        />
      )}
      {showSuccess && (
        <SuccessModal
          show={showSuccess}
          onClose={() => setShowSuccess(false)}
          message="Question added successfully!"
        />
      )}
      {showDelete && (
        <DeleteModal
          show={showDelete}
          onClose={() => setShowDelete(false)}
          message="Question deleted successfully!"
        />
      )}
    </Container>
  );
};

export default QuestionList;
