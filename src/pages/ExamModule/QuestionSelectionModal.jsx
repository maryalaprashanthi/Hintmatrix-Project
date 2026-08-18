import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import "./QuestionSelectionModal.css";

export default function QuestionSelectionModal({
  show,
  handleClose,
  examId,
  onAddQuestions,
}) {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [search, setSearch] = useState("");

  const displayedQuestions = questions.filter((question) =>
    question.questionText?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAdd = async () => {
    if (selectedQuestions.length === 0) {
      return;
    }

    try {
      await onAddQuestions(selectedQuestions);

      alert("Questions added to exam successfully.");

      setSelectedQuestions([]);
      handleClose();
    } catch (error) {
      console.error("Error adding questions:", error);

      alert("Failed to add questions to exam.");
    }
  };
  useEffect(() => {
    if (!show || !examId) return;

    const fetchAvailableQuestions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/exams/${examId}/available-questions`,
        );

        setQuestions(response.data);
        setSelectedQuestions([]);
      } catch (error) {
        console.error("Error fetching available questions:", error);
        setQuestions([]);
      }
    };

    fetchAvailableQuestions();
  }, [show, examId]);

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Select Questions</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>

          <Form.Control
            placeholder="Search Question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <Table bordered hover responsive>
          <thead>
            <tr>
              <th style={{ width: "80px" }}>Select</th>
              <th>Question</th>
              <th style={{ width: "220px" }}>Chapter</th>
            </tr>
          </thead>

          <tbody>
            {displayedQuestions.length > 0 ? (
              displayedQuestions.map((question) => (
                <tr key={question.questionId}>
                  <td className="text-center">
                    <Form.Check
                      type="checkbox"
                      checked={selectedQuestions.includes(question.questionId)}
                      onChange={() => handleQuestion(question.questionId)}
                    />
                  </td>

                  <td>{question.questionText}</td>

                  <td>{question.chapterName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-muted py-4">
                  No available questions found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <div>
          <strong>Selected Questions : {selectedQuestions.length}</strong>
        </div>

        <div>
          <Button variant="secondary" className="me-2" onClick={handleClose}>
            Cancel
          </Button>
          <br />
          <Button variant="primary" onClick={handleAdd}>
            Add To Exam ({selectedQuestions.length})
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
