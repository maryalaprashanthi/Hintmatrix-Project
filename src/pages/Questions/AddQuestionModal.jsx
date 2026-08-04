import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";

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
  const [courseId, setCourseId] = useState(null);
  const [chapterId, setChapterId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [questionText, setQuestionText] = useState("");

  // Empty options (Backend team will populate)
  const courseOptions = [];
  const chapterOptions = [];
  const categoryOptions = [];
  const balanceOptions = [];

  const [attributes, setAttributes] = useState([
    {
      debitBalance: null,
      debitAmount: "",
      creditBalance: null,
      creditAmount: "",
    },
  ]);

  useEffect(() => {
    if (questionData) {
      setCourseId(questionData.courseId || null);
      setChapterId(questionData.chapterId || null);
      setCategoryId(questionData.categoryId || null);
      setQuestionText(questionData.questionText || "");

      setAttributes(
        questionData.attributes || [
          {
            debitBalance: null,
            debitAmount: "",
            creditBalance: null,
            creditAmount: "",
          },
        ]
      );
    } else {
      setCourseId(null);
      setChapterId(null);
      setCategoryId(null);
      setQuestionText("");

      setAttributes([
        {
          debitBalance: null,
          debitAmount: "",
          creditBalance: null,
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
        debitBalance: null,
        debitAmount: "",
        creditBalance: null,
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
      !courseId ||
      !chapterId ||
      !categoryId ||
      !questionText.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const newQuestion = {
      courseId,
      chapterId,
      categoryId,
      questionText,
      attributes,
    };

    await onSave(newQuestion);

    handleClose();
  };

  const handleClose = () => {
    setCourseId(null);
    setChapterId(null);
    setCategoryId(null);
    setQuestionText("");

    setAttributes([
      {
        debitBalance: null,
        debitAmount: "",
        creditBalance: null,
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

          {/* Course ID */}
            <div className="form-group">

  <label>
    Course ID <span>*</span>
  </label>

  <div className="input-box ">

    <FaBook className="input-icon" />
          <datalist id="Course Id">
            <option value=" 1" />
            <option value=" 2" />
            <option value=" 3" />
            <option value=" 4" />
          </datalist>


    <div className="select-wrapper">
      <Select
    className="react-select-container"
    classNamePrefix="react-select"
    options={courseOptions}
    value={courseId}
    onChange={setCourseId}
    placeholder="Select Course Id"
    isSearchable={false}
/>
    </div>
  </div>
</div>
         {/* Chapter ID */}

          <div className="form-group">
            <label>
              Chapter ID <span>*</span>
            </label>

            <div className="input-box">
              <FaLayerGroup className="input-icon" />

              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={chapterOptions}
                value={chapterId}
                onChange={setChapterId}
                placeholder="Select Chapter Id"
                isSearchable={false}
              />
            </div>
          </div>

          {/* Category ID */}

          <div className="form-group">
            <label>
              Category ID <span>*</span>
            </label>

            <div className="input-box">
              <FaList className="input-icon" />

              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={categoryOptions}
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Select Category Id"
                isSearchable={false}
              />
            </div>
          </div>

        </div>

        {/* Question Text */}

        <div className="form-group mt-4">
          <label>
            Question Text <span>*</span>
          </label>

          <div className="textarea-box">
            <FaFileAlt className="input-icon" />

            <textarea
              placeholder="Enter question text..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
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

                  {/* Debit Balance */}

                  <td>
                    <Select
                      classNamePrefix="react-select"
                      options={balanceOptions}
                      value={row.debitBalance}
                      onChange={(selected) =>
                        handleAttributeChange(
                          index,
                          "debitBalance",
                          selected
                        )
                      }
                      placeholder="-"
                      isSearchable
                    />
                  </td>

                  {/* Debit Amount */}

                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
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

                  {/* Credit Balance */}

                  <td>
                    <Select
                      classNamePrefix="react-select"
                      options={balanceOptions}
                      value={row.creditBalance}
                      onChange={(selected) =>
                        handleAttributeChange(
                          index,
                          "creditBalance",
                          selected
                        )
                      }
                      placeholder="-"
                      isSearchable
                    />
                  </td>

                  {/* Credit Amount */}

                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
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

                  {/* Delete */}

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
       </div>
    </div>,
    document.body
  );
}
export default AddQuestionModal;
