import React, { useState, useRef } from "react";
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

import {
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import "./QuestionList.css";
import AddQuestionModal from "./AddQuestionModal";

const QuestionList = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Upload File Reference
  const fileInputRef = useRef(null);

  const [questions, setQuestions] = useState([
    {
      id: 1,
      code: "EMQ-001",
      title: "Prepare Trading Account from the following information.",
      type: "MCQ",
      difficulty: "Easy",
      marks: 5,
      enabled: true,
    },
    {
      id: 2,
      code: "EMQ-002",
      title: "Prepare Trading Account & Profit & Loss Account.",
      type: "MCQ",
      difficulty: "Easy",
      marks: 5,
      enabled: true,
    },
    {
      id: 3,
      code: "EMQ-003",
      title: "Prepare Final Accounts.",
      type: "Subjective",
      difficulty: "Medium",
      marks: 10,
      enabled: false,
    },
    {
      id: 4,
      code: "EMQ-004",
      title: "Journal Entries.",
      type: "MCQ",
      difficulty: "Hard",
      marks: 10,
      enabled: true,
    },
  ]);

  // Search
  const filteredQuestions = questions.filter((question) =>
    question.title.toLowerCase().includes(search.toLowerCase())
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
    alert(`Viewing: ${question.title}`);
  };

  // Edit
  const handleEdit = (question) => {
    alert(`Editing: ${question.title}`);
  };

  // Enable / Disable
  const handleToggle = (id) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.id === id
          ? {
              ...question,
              enabled: !question.enabled,
            }
          : question
      )
    );
  };

  // Delete
  const handleDeleteClick = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (confirmDelete) {
      setQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question.id !== id)
      );
    }
  };

  return (
    <Container fluid className="question-page">

      {/* Header */}

      <Row className="align-items-center mb-4">

        <Col lg={6}>
          <h2 className="page-title">
            Easy Model Questions
          </h2>

          <p className="question-count">
            {filteredQuestions.length} Questions
          </p>
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

          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
          >
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
              key={question.id}
              className={`question-item ${
                !question.enabled ? "disabled-question" : ""
              }`}
            >

              <Row className="align-items-center">

                <Col lg={8}>

                  <h5 className="question-title">
                    {index + 1}. {question.title}
                  </h5>

                  <div className="question-meta">

                    <Badge bg="primary">
                      {question.code}
                    </Badge>

                    <Badge bg="secondary">
                      {question.type}
                    </Badge>

                    <Badge
                      bg={
                        question.difficulty === "Easy"
                          ? "success"
                          : question.difficulty === "Medium"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {question.difficulty}
                    </Badge>

                    <Badge bg="info">
                      {question.marks} Marks
                    </Badge>

                    <Badge
                      bg={question.enabled ? "success" : "secondary"}
                    >
                      {question.enabled ? "Enabled" : "Disabled"}
                    </Badge>

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
                    id={`switch-${question.id}`}
                    checked={question.enabled}
                    onChange={() => handleToggle(question.id)}
                    label="Disable"
                  />

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteClick(question.id)}
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
        handleClose={() => setShowModal(false)}
      />

    </Container>
  );
};

export default QuestionList;