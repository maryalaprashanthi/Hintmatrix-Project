import React, { useEffect, useState } from "react";
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
import ExamService from "../../services/ExamService";
import "./ExamList.css";
import AddExamModal from "./AddExamModal";
import QuestionSelectionModal from "./QuestionSelectionModal";

export default function ExamList() {
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");

  const [editExam, setEditExam] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);

  const [exams, setExams] = useState([]);

  const filteredExams = exams.filter((exam) =>
    exam.examName.toLowerCase().includes(search.toLowerCase()),
  );
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await ExamService.getAll();

      const formattedExams = response.data.map((exam) => ({
        id: exam.examId,
        examName: exam.examName,
        courseId: exam.courseId,
        courseName: exam.courseName,
        startDate: exam.startDate,
        endDate: exam.endDate,
        status: getExamStatus(exam.startDate, exam.endDate),
      }));

      setExams(formattedExams);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };
  const getExamStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return "Upcoming";
    }

    if (now >= start && now <= end) {
      return "Ongoing";
    }

    return "Completed";
  };

  const handleEdit = (exam) => {
    setEditExam(exam);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) {
      return;
    }

    try {
      await ExamService.delete(id);

      alert("Exam deleted successfully");

      fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);

      alert(error.response?.data?.message || "Failed to delete exam");
    }
  };
  const handleAddQuestions = (examId) => {
    setSelectedExamId(examId);
    setShowQuestionModal(true);
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

      <Row className="stats-row mb-4">
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

      <Row className="filter-row mb-4">
        <Col lg={6} md={12} className="filter-search">
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

        <Col lg={3} md={6} className="filter-select">
          <Form.Select>
            <option>Status</option>

            <option>Upcoming</option>

            <option>Completed</option>

            <option>Cancelled</option>
          </Form.Select>
        </Col>

        <Col lg={3} md={6} className="filter-select">
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

                  <p className="text-muted">Course Name: {exam.courseName}</p>

                  <div className="exam-details">
                    <p>
                      📅 Start:{" "}
                      {new Date(exam.startDate).toLocaleString("en-IN")}
                    </p>

                    <p>
                      📅 End: {new Date(exam.endDate).toLocaleString("en-IN")}
                    </p>
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

                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleAddQuestions(exam.id)}
                    >
                      Add Questions
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
        onSave={async (exam) => {
          try {
            if (editExam) {
              await ExamService.update(editExam.id, exam);
              alert("Exam updated successfully");
            } else {
              await ExamService.create(exam);
              alert("Exam created successfully");
            }

            // Fetch exams again and calculate status
            await fetchExams();

            setShowModal(false);
            setEditExam(null);
          } catch (error) {
            console.error("Error saving exam:", error);

            alert(error.response?.data?.message || "Failed to save exam");
          }
        }}
      />
      <QuestionSelectionModal
        show={showQuestionModal}
        handleClose={() => {
          setShowQuestionModal(false);
          setSelectedExamId(null);
        }}
        examId={selectedExamId}
        onAddQuestions={async (questionIds) => {
          await ExamService.addQuestions(selectedExamId, questionIds);
        }}
      />
    </Container>
  );
}
