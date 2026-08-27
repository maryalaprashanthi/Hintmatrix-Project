import React from "react";
import { Modal, Button, Badge, Table } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

const QuestionUploadErrorsModal = ({
  show,
  errors = [],
  onClose,
}) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="xl"
      backdrop="static"
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <FaExclamationTriangle className="text-warning me-2" />

          Question Upload Errors

          <Badge bg="danger" className="ms-2">
            {errors.length}
          </Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {errors.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-0">
              No upload errors found.
            </p>
          </div>
        ) : (
          <Table
            bordered
            hover
            responsive
            className="mb-0"
          >
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Excel Row</th>
                <th>Question</th>
                <th>Header</th>
                <th>Attribute</th>
                <th>Error</th>
              </tr>
            </thead>

            <tbody>
              {errors.map((error, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>

                  <td>
                    {error?.rowNumber || "-"}
                  </td>

                  <td>
                    {error?.questionText || "-"}
                  </td>

                  <td>
                    {error?.headerName || "-"}
                  </td>

                  <td>
                    {error?.attributeName || "-"}
                  </td>

                  <td className="text-danger">
                    {error?.errorMessage ||
                      error?.message ||
                      error?.error ||
                      error?.reason ||
                      "Unknown upload error"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuestionUploadErrorsModal;