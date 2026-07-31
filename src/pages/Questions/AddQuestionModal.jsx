import { useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "./AddQuestionModal.css";
import {
  FaPlus,
  FaTrash,
  FaBook,
  FaLayerGroup,
  FaList,
} from "react-icons/fa";

export default function AddQuestionModal({
  show,
  handleClose,
}) {

  const [course, setCourse] = useState("");
  const [chapter, setChapter] = useState("");
  const [category, setCategory] = useState("");

  const [rows, setRows] = useState([
    {
      debit: "",
      debitAmount: "",
      credit: "",
      creditAmount: "",
    },
  ]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        debit: "",
        debitAmount: "",
        credit: "",
        creditAmount: "",
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length === 1) return;

    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleSave = () => {

    alert("Question Saved Successfully");

    console.log({
      course,
      chapter,
      category,
      rows,
    });

    handleClose();
  };

  return (

    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="xl"
      backdrop="static"
      keyboard={false}
    >

      <Modal.Header closeButton>

        <Modal.Title className="fw-bold">

          Add New Question

        </Modal.Title>

      </Modal.Header>

      <Modal.Body>

        <div className="container-fluid">

          <div className="row g-4">

            <div className="col-md-4">

              <Form.Label className="fw-semibold">

                <FaBook className="me-2 text-primary" />

                Course

              </Form.Label>

              <Form.Select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >

                <option value="">Select Course</option>

                <option>B.Com</option>

                <option>CA Foundation</option>

                <option>CBSE</option>

              </Form.Select>

            </div>

            <div className="col-md-4">

              <Form.Label className="fw-semibold">

                <FaLayerGroup className="me-2 text-success" />

                Chapter

              </Form.Label>

              <Form.Select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              >

                <option value="">Select Chapter</option>

                <option>Chapter 1</option>

                <option>Chapter 2</option>

                <option>Chapter 3</option>

              </Form.Select>

            </div>

            <div className="col-md-4">

              <Form.Label className="fw-semibold">

                <FaList className="me-2 text-warning" />

                Category

              </Form.Label>

              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >

                <option value="">Select Category</option>

                <option>Easy Model Questions</option>

                <option>CBSE Model Questions</option>

                <option>State Board Questions</option>

              </Form.Select>

            </div>

          </div>

          <hr className="my-4"/>

          <h5 className="fw-bold mb-3">

            Question Attributes

          </h5>

          <Table bordered hover responsive>

            <thead className="table-primary">

              <tr>

                <th>Debit Balance</th>

                <th>Amount</th>

                <th>Credit Balance</th>

                <th>Amount</th>

                <th width="80">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {rows.map((row, index) => (
                <tr key={index}>
                                     <td>
                    <Form.Select
                      value={row.debit}
                      onChange={(e) => {
                        const updated = [...rows];
                        updated[index].debit = e.target.value;
                        setRows(updated);
                      }}
                    >
                      <option value="">Select Debit</option>
                      <option>Cash</option>
                      <option>Bank</option>
                      <option>Purchases</option>
                      <option>Furniture</option>
                    </Form.Select>
                  </td>

                  <td>
                    <Form.Control
                      type="number"
                      placeholder="Amount"
                      value={row.debitAmount}
                      onChange={(e) => {
                        const updated = [...rows];
                        updated[index].debitAmount = e.target.value;
                        setRows(updated);
                      }}
                    />
                  </td>

                  <td>
                    <Form.Select
                      value={row.credit}
                      onChange={(e) => {
                        const updated = [...rows];
                        updated[index].credit = e.target.value;
                        setRows(updated);
                      }}
                    >
                      <option value="">Select Credit</option>
                      <option>Sales</option>
                      <option>Capital</option>
                      <option>Bank</option>
                      <option>Creditors</option>
                    </Form.Select>
                  </td>

                  <td>
                    <Form.Control
                      type="number"
                      placeholder="Amount"
                      value={row.creditAmount}
                      onChange={(e) => {
                        const updated = [...rows];
                        updated[index].creditAmount = e.target.value;
                        setRows(updated);
                      }}
                    />
                  </td>

                  <td className="text-center">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveRow(index)}
                    >
                      <FaTrash />
                    </Button>
                  </td>

                </tr>
              ))}

            </tbody>

          </Table>

          <div className="d-flex justify-content-start mt-3">

            <Button
              variant="outline-primary"
              onClick={handleAddRow}
            >
              <FaPlus className="me-2" />
              Add Row
            </Button>

          </div>

        </div>

      </Modal.Body>

      <Modal.Footer>

        <Button
          variant="secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleSave}
        >
          Save Question
        </Button>

      </Modal.Footer>

    </Modal>

  );

} 