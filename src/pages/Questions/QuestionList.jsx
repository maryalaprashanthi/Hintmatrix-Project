import React, { useState, useRef, useEffect } from "react";
import QuestionService from "../../services/QuestionService";
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
import { useNavigate } from "react-router-dom";
import "./QuestionList.css";
import AddQuestionModal from "./AddQuestionModal";
import { NavLink } from "react-router-dom";
import CourseService from "../../services/CourseService";
import ChapterService from "../../services/ChapterService";
import QuestionCategoryService from "../../services/QuestionCategoryService";
import TableAttributeService from "../../services/TableAttributeService";

const getData = async () =>
{
  console.log("Full data");
  
  // get courses
  let courseData = await CourseService.getAllCourses();
  courseData = await courseData.data;
  let allCourses = courseData.map((c)=> ({"id":c.id,"name":c.name}));
  // get chapter
  let response = await ChapterService.getAll();
  let chapterData = await response.data;
  // console.log("Chapter data: ",chapterData);
  let allChapters = chapterData.map((c)=>({"id":c.id,"name":c.name}));
  console.log("Chapter data: ",allChapters);
  // get category 
  let categoriesData = await QuestionCategoryService.getAll();
  categoriesData = await categoriesData.data;
  let allCategories = categoriesData.map((c)=>({"id":c.id,"name":c.name}));
  console.log("Categories: ",allCategories);
  const attributesResponse =
  await TableAttributeService.getAll();

const attributesData = attributesResponse.data;

console.log("Table Attributes: ", attributesData);

 

  data = {"categories":allCategories,"chapters":allChapters,"courses":allCourses};
}

let data;

const QuestionList = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Upload File Reference
  const fileInputRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    loadQuestions();
    getData();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await QuestionService.getQuestionText();

      setQuestions(response.data);

      console.log(response.data);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };
  const navigate = useNavigate();

  // Search
  const filteredQuestions = questions.filter((question) =>
    question.questionText.toLowerCase().includes(search.toLowerCase()),
  );

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
    navigate(`/questions/question-list/${question.questionId}`);
  };

  // Edit
  const handleEdit = (question) => {
    alert(`Editing: ${question.questionText}`);
  };

  // Enable / Disable
  const handleToggle = (id) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.questionId === id
          ? {
              ...question,
              activeRow: !question.activeRow,
            }
          : question,
      ),
    );
  };

  // Delete
  const handleDeleteClick = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?",
    );

    if (confirmDelete) {
      setQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question.questionId !== id),
      );
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

        <Col
          lg={6}
          className="d-flex justify-content-lg-end gap-2 mt-3 mt-lg-0"
        >
          {/* Hidden Upload Input */}

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

          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaPlus className="me-2" />
            Add Question
          </Button>
        </Col>
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
                    <Badge bg="primary">ID: {question.questionId}</Badge>

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
                    onClick={() => handleView(question)}
                  >
                    <FaEye className="me-1" />
                    View
                  </Button>

                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => handleEdit(question)}
                  >
                    <FaEdit className="me-1" />
                    Edit
                  </Button>

                  <Form.Check
                    type="switch"
                    id={`switch-${question.questionId}`}
                    checked={question.activeRow}
                    onChange={() => handleToggle(question.questionId)}
                    label="Disable"
                  />

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteClick(question.questionId)}
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

      <AddQuestionModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={(newQuestion) => {
          console.log(newQuestion);

          setShowModal(false);
        }}
        questionData={data}
      />
    </Container>
  );
};

export default QuestionList;
