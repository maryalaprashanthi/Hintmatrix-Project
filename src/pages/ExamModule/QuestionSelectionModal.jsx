import React, { useMemo, useState } from "react";
import { Modal, Button, Form, Table, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

import "./QuestionSelectionModal.css";

export default function QuestionSelectionModal({
  show,
  handleClose,
  selectedChapters,
  onAddQuestions,
}) {
  // Dummy Data (Replace with API later)
  const questionData = {
    "Prepare Final Accounts": [
      {
        id: 1,
        text: "Prepare Final Accounts with Adjustments.",
      },
      {
        id: 2,
        text: "Prepare Trading & Profit and Loss Account.",
      },
      {
        id: 3,
        text: "Closing Stock Adjustment.",
      },
    ],

    "Trial Balance": [
      {
        id: 4,
        text: "Prepare Trial Balance.",
      },
      {
        id: 5,
        text: "Rectification of Errors.",
      },
      {
        id: 6,
        text: "Suspense Account.",
      },
    ],

    Depreciation: [
      {
        id: 7,
        text: "Straight Line Method.",
      },
      {
        id: 8,
        text: "Written Down Value Method.",
      },
    ],

    "Partnership Accounts": [
      {
        id: 9,
        text: "Admission of Partner.",
      },
      {
        id: 10,
        text: "Retirement of Partner.",
      },
    ],

    "Bills of Exchange": [
      {
        id: 11,
        text: "Dishonour of Bill.",
      },
      {
        id: 12,
        text: "Renewal of Bill.",
      },
    ],
  };

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [search, setSearch] = useState("");

  const filteredQuestions = useMemo(() => {
    return selectedChapters.flatMap((chapter) =>
      (questionData[chapter] || []).map((q) => ({
        ...q,
        chapter,
      })),
    );
  }, [selectedChapters]);

  const displayedQuestions = filteredQuestions.filter((q) =>
    q.text.toLowerCase().includes(search.toLowerCase()),
  );

  const handleQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAdd = () => {
    const selected = filteredQuestions.filter((q) =>
      selectedQuestions.includes(q.id),
    );

    onAddQuestions(selected);
    handleClose();
  };

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
                <tr key={question.id}>
                  <td className="text-center">
                    <Form.Check
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleQuestion(question.id)}
                    />
                  </td>

                  <td>{question.text}</td>

                  <td>{question.chapter}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-muted py-4">
                  No questions found.
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

          <Button variant="primary" onClick={handleAdd}>
            Add To Exam ({selectedQuestions.length})
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
