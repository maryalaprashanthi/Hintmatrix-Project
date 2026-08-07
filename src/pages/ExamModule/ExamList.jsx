import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Card,
} from "react-bootstrap";

import {
  FaPlus,
  FaSearch,
  FaClipboardList,
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import "./ExamList.css";
import AddExamModal from "./AddExamModal";

export default function ExamList() {
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");

  const [editExam, setEditExam] = useState(null);

  const [exams, setExams] = useState([
    {
      id: 1,
      examName: "Mid Semester Examination",
      course: "B.Com",
      subject: "Financial Accounting",
      date: "10 Aug 2026",
      students: 120,
      status: "Upcoming",
    },
    {
      id: 2,
      examName: "Model Test Examination",
      course: "B.Sc",
      subject: "Mathematics",
      date: "05 Aug 2026",
      students: 80,
      status: "Completed",
    },
    {
      id: 3,
      examName: "Internal Assessment",
      course: "BBA",
      subject: "Management",
      date: "15 Aug 2026",
      students: 60,
      status: "Cancelled",
    },
  ]);

  const filteredExams = exams.filter((exam) =>
    exam.examName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (exam) => {
    setEditExam(exam);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setExams((prev) => prev.filter((exam) => exam.id !== id));
  };

  return (
    <Container fluid className="exam-page">
      {/* Header */}

      <Row className="align-items-center mb-4">
        <Col md={6}>
          <h2 className="page-title">Exam Management</h2>

          <p className="breadcrumb-text">Home / Exams</p>
        </Col>

        <Col md={6} className="text-end">
          <input
            type="file"
            id="examUpload"
            style={{ display: "none" }}
            onChange={(e) => {
              console.log("Uploaded file:", e.target.files[0]);
            }}
          />

          <Button
            className="me-3"
            variant="primary"
            onClick={() => document.getElementById("examUpload").click()}
          >
            ⬆ Upload
          </Button>

          <Button
            className="add-btn"
            onClick={() => {
              setEditExam(null);
              setShowModal(true);
            }}
          >
            <FaPlus className="me-2" />
            Add Exam
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}

      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <Card className="stats-card">
            <Card.Body>
              <FaClipboardList className="stats-icon total-icon" />

              <h3>{exams.length}</h3>

              <p>Total Exams</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="stats-card">
            <Card.Body>
              <FaCalendarCheck className="stats-icon upcoming-icon" />

              <h3>{exams.filter((e) => e.status === "Upcoming").length}</h3>

              <p>Upcoming</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="stats-card">
            <Card.Body>
              <FaCheckCircle className="stats-icon completed-icon" />

              <h3>{exams.filter((e) => e.status === "Completed").length}</h3>

              <p>Completed</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="stats-card">
            <Card.Body>
              <FaTimesCircle className="stats-icon cancelled-icon" />

              <h3>{exams.filter((e) => e.status === "Cancelled").length}</h3>

              <p>Cancelled</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search Filters */}

      <Row className="filter-row mb-4 g-3 align-items-center">
        <Col lg={6} md={12}>
          <InputGroup className="search-box">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>

            <Form.Control
              placeholder="Search Exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col lg={3} md={6}>
          <Form.Select>
            <option>Status</option>

            <option>Upcoming</option>

            <option>Completed</option>

            <option>Cancelled</option>
          </Form.Select>
        </Col>

        <Col lg={3} md={6}>
          <Form.Select>
            <option>Sort</option>

            <option>Latest</option>

            <option>Oldest</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Exam Cards */}

      <Row className="g-4">
        {filteredExams.length === 0 ? (
          <Col>
            <div className="empty-state">
              <h4>No Exams Found</h4>

              <p>Click Add Exam to create your first exam.</p>
            </div>
          </Col>
        ) : (
          filteredExams.map((exam) => (
            <Col xl={4} lg={4} md={6} sm={12} key={exam.id}>
              <Card className="exam-card">
                <Card.Body>
                  <h5>{exam.examName}</h5>

                  <p className="text-muted">
                    {exam.course} - {exam.subject}
                  </p>

                  <div className="exam-details">
                    <p>📅 {exam.date}</p>

                    <p>👥 Students: {exam.students}</p>
                  </div>

                  <span className={`status ${exam.status.toLowerCase()}`}>
                    {exam.status}
                  </span>

                  <div className="exam-actions mt-3">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleEdit(exam)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(exam.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Modal */}

      <AddExamModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setEditExam(null);
        }}
        examData={editExam}
        onSave={(exam) => {
          if (editExam) {
            setExams((prev) =>
              prev.map((item) =>
                item.id === editExam.id
                  ? {
                      ...item,
                      ...exam,
                    }
                  : item,
              ),
            );
          } else {
            setExams((prev) => [
              ...prev,

              {
                id: prev.length + 1,
                ...exam,
              },
            ]);
          }

          setShowModal(false);
          setEditExam(null);
        }}
      />
    </Container>
  );
}
