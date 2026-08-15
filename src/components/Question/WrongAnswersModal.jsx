import React from "react";
import { Modal, Button, Table, Badge } from "react-bootstrap";

function WrongAnswersModal({ show, onClose, incorrectEntries = [] }) {
  return (
    <Modal show={show} onHide={onClose} centered size="xl">
      <Modal.Header closeButton className="bg-warning text-dark border-0 py-3">
        <Modal.Title className="fw-bold">⚠️ Mistakes Report</Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        <p className="text-muted mb-3">Review your incorrect answers below:</p>

        {incorrectEntries.length === 0 ? (
          <div className="text-center py-4 text-muted">No mistakes found.</div>
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
                const rawDate =
                  item.createdAt ||
                  item.created_at ||
                  item.date ||
                  item.timestamp;
                const formattedDate = rawDate
                  ? new Date(rawDate).toLocaleString("en-IN")
                  : "N/A";

                // DYNAMIC CONDITION CHECK [1]
                const isCorrect =
                  item.result?.toLowerCase() === "correct" ||
                  item.valid === true;

                const element =
                  item.attributeName ||
                  item.element ||
                  `Attribute ${item.attributeId ?? "N/A"}`;

                const optionSelected =
                  item.userAnswer ||
                  item.user_answer ||
                  item.arithmetic ||
                  item.action ||
                  item.optionSelected ||
                  "N/A";
                const result = item.result || (isCorrect ? "correct" : "wrong");

                const hint =
                  item.hint || item.description || "No hint available.";
                return (
                  <tr
                    key={item.answerEventId || index}
                    style={isCorrect ? { backgroundColor: "#f4fbf7" } : {}}
                  >
                    {/* 1. Date */}
                    <td className="text-secondary small">{formattedDate}</td>

                    {/* 2. Element */}
                    <td className="fw-bold text-dark">{element}</td>

                    {/* 3. Option Selected */}
                    <td className="text-muted small">{optionSelected}</td>

                    {/* 4. Result */}
                    <td>
                      <Badge
                        bg={isCorrect ? "success" : "danger"}
                        className="text-uppercase px-2 py-1.5"
                      >
                        {result}
                      </Badge>
                    </td>

                    {/* 5. Hint /Description */}
                    <td
                      style={{ whiteSpace: "pre-line" }}
                      className={`small fw-medium ${isCorrect ? "text-success bg-light" : "text-dark bg-light"}`}
                    >
                      {hint}
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
