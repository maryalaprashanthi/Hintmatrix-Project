import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  FaTimes,
  FaBook,
  FaLayerGroup,
  FaList,
  FaFileAlt,
  FaSave,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import "./AddQuestionModal.css";

function AddQuestionModal({
  show,
  onClose,
  onSave,
  questionData,
}) {
  const [course, setCourse] = useState("");
  const [chapter, setChapter] = useState("");
  const [category, setCategory] = useState("");
  const [questionText, setQuestionText] = useState("");

  const [attributes, setAttributes] = useState([
    {
      debitBalance: "",
      debitAmount: "",
      creditBalance: "",
      creditAmount: "",
    },
  ]);

  useEffect(() => {
    if (questionData) {
      setCourse(questionData.course || "");
      setChapter(questionData.chapter || "");
      setCategory(questionData.category || "");
      setQuestionText(questionData.questionText || "");
      setAttributes(
        questionData.attributes || [
          {
            debitBalance: "",
            debitAmount: "",
            creditBalance: "",
            creditAmount: "",
          },
        ]
      );
    } else {
      setCourse("");
      setChapter("");
      setCategory("");
      setQuestionText("");
      setAttributes([
        {
          debitBalance: "",
          debitAmount: "",
          creditBalance: "",
          creditAmount: "",
        },
      ]);
    }
  }, [questionData]);

  if (!show) return null;

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const handleAddRow = () => {
    setAttributes([
      ...attributes,
      {
        debitBalance: "",
        debitAmount: "",
        creditBalance: "",
        creditAmount: "",
      },
    ]);
  };
  const handleDeleteRow = (index) => {
    if (attributes.length === 1) return;

    const updatedRows = attributes.filter((_, i) => i !== index);
    setAttributes(updatedRows);
  };
  const handleSave = async () => {
    if (
      !course.trim() ||
      !chapter.trim() ||
      !category.trim() ||
      !questionText.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const newQuestion = {
      course,
      chapter,
      category,
      questionText,
      attributes,
    };

    await onSave(newQuestion);

    handleClose();
  };

  const handleClose = () => {
    setCourse("");
    setChapter("");
    setCategory("");
    setQuestionText("");

    setAttributes([
      {
        debitBalance: "",
        debitAmount: "",
        creditBalance: "",
        creditAmount: "",
      },
    ]);

    onClose();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="table-name-modal">

        {/* Header */}

        <div className="modal-header">
          <div>
            <h2>
              {questionData ? "Update Question" : "Add New Question"}
            </h2>

            <p>
              {questionData
                ? "Update existing question."
                : "Fill in the details below to create a new question."}
            </p>
          </div>

          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}

        <div className="modal-body">

          <div className="form-card">

            <h3 className="section-title">
              Question Details
            </h3>

            <div className="form-grid">

              {/* Course */}

              <div className="form-group">
                <label>
                  Course <span>*</span>
                </label>

                <div className="input-box">
                  <FaBook className="input-icon" />

                  <input
                    type="text"
                    placeholder="Select Course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>
              </div>

              {/* Chapter */}

              <div className="form-group">
                <label>
                  Chapter <span>*</span>
                </label>

                <div className="input-box">
                  <FaLayerGroup className="input-icon" />

                  <input
                    type="text"
                    placeholder="Select Chapter"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}

              <div className="form-group">
                <label>
                  Category <span>*</span>
                </label>

                <div className="input-box">
                  <FaList className="input-icon" />

                  <input
                    type="text"
                    placeholder="Select Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

            </div>

            <div className="form-group mt-4">
              <label>
                Question Text <span>*</span>
              </label>

              <div className="textarea-box">
                <FaFileAlt className="input-icon" />

                <textarea
                  placeholder="Enter question text..."
                  value={questionText}
                  onChange={(e) =>
                    setQuestionText(e.target.value)
                  }
                />
              </div>
            </div>

          </div>

          {/* Question Attributes */}

          <div className="form-card">

            <h3 className="section-title">
              Question Attributes
            </h3>

            <p>Add debit and credit balances for this question.</p>
            <div className="question-table">
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Debit Balance</th>
                  <th>Amount</th>
                  <th>Credit Balance</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attributes.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        placeholder="Debit Balance"
                        value={row.debitBalance}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            "debitBalance",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        placeholder="Amount"
                        value={row.debitAmount}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            "debitAmount",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        placeholder="Credit Balance"
                        value={row.creditBalance}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            "creditBalance",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        placeholder="Amount"
                        value={row.creditAmount}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            "creditAmount",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteRow(index)}
                        disabled={attributes.length === 1}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>


            </table>
            </div>

            <button
              type="button"
              className="btn btn-outline-primary mt-3"
              onClick={handleAddRow}
            >
              <FaPlus className="me-2" />
              Add Row
            </button>


          </div>

        </div>

        {/* Footer */}

        <div className="modal-footer">

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            <FaSave className="me-2" />
            {questionData ? "Update Question" : "Save"}
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
}

export default AddQuestionModal;