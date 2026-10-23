import { Modal, Button, Table } from "react-bootstrap";

export default function RuleEngineUploadErrorsModal({ show, report, onClose }) {
  return (
    <Modal show={show} onHide={onClose} centered size="xl" scrollable>
      <Modal.Header closeButton><Modal.Title>Rule Engine Upload Errors</Modal.Title></Modal.Header>
      <Modal.Body>
        <p>{report?.message}</p>
        <Table bordered responsive hover>
          <thead><tr><th>Excel Row</th><th>Field</th><th>Attribute</th><th>Field Type</th><th>Error / Action</th></tr></thead>
          <tbody>
            {(report?.errors || []).map((error, index) => (
              <tr key={`${error.rowNumber}-${index}`}>
                <td>{error.rowNumber}</td><td>{error.field}</td>
                <td>{error.attributeName || "—"}</td><td>{error.headerName || "—"}</td>
                <td>{error.errorMessage}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="text-muted mb-0">Review created DRAFT attributes in Table Attributes. Retry only the skipped rows to avoid uploading successful rules again.</p>
      </Modal.Body>
      <Modal.Footer><Button variant="secondary" onClick={onClose}>Close</Button></Modal.Footer>
    </Modal>
  );
}
