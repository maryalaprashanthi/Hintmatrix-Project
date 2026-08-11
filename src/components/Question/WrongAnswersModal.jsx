import React from "react";
import { Modal, Button, Table, Badge } from "react-bootstrap";

function WrongAnswersModal({ show, onClose, incorrectEntries = [] }) {
  return (
    <Modal show={show} onHide={onClose} centered size="xl">
      <Modal.Header closeButton className="bg-warning text-dark border-0 py-3">
        <Modal.Title className="fw-bold">⚠️ Mistakes Report</Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        <p className="text-muted mb-3">
          Review your current layout placements below:
        </p>

        {incorrectEntries.length === 0 ? (
          <div className="text-center py-4 text-muted">
            No validation logs found.
          </div>
        ) : (
          <Table
            responsive
            bordered
            hover
            className="align-middle mt-2 shadow-sm"
          >
            <thead className="table-dark text-uppercase small">
              <tr>
                <th style={{ width: "20%" }}>Date</th>
                <th style={{ width: "15%" }}>Element</th>
                <th style={{ width: "30%" }}>Option Selected</th>
                <th style={{ width: "10%" }}>Result</th>
                <th style={{ width: "25%" }}>Hint</th>
              </tr>
            </thead>
            <tbody>
              {incorrectEntries.map((item, index) => {
                const rawDate = item.created_at || item.date;
                const formattedDate = rawDate
                  ? new Date(rawDate).toLocaleString("en-IN")
                  : "N/A";

                // DYNAMIC CONDITION CHECK [1]
                const isCorrect =
                  item.result?.toLowerCase() === "correct" ||
                  item.valid === true;

                return (
                  <tr
                    key={index}
                    style={isCorrect ? { backgroundColor: "#f4fbf7" } : {}}
                  >
                    {/* 1. Date */}
                    <td className="text-secondary small">{formattedDate}</td>

                    {/* 2. Element Name (Green if Correct, Dark if Wrong) [1] */}
                    <td
                      className={`fw-bold ${isCorrect ? "text-success" : "text-dark"}`}
                    >
                      {item.user_answer || item.element}
                    </td>

                    {/* 3. Action taken text description row */}
                    <td className="text-muted small">
                      {item.action || item.optionSelected}
                    </td>

                    {/* 4. Dynamic Badge color swapping (Success vs Danger) [1] */}
                    <td>
                      <Badge
                        bg={isCorrect ? "success" : "danger"}
                        className="text-uppercase px-2 py-1.5"
                      >
                        {item.result || (isCorrect ? "correct" : "wrong")}
                      </Badge>
                    </td>

                    {/* 5. Hint container block mapping cell */}
                    <td
                      style={{ whiteSpace: "pre-line" }}
                      className={`small fw-medium ${isCorrect ? "text-success bg-light" : "text-dark bg-light"}`}
                    >
                      {item.hint}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light">
        <Button variant="dark" className="px-4" onClick={onClose}>
          Close & Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default WrongAnswersModal;
