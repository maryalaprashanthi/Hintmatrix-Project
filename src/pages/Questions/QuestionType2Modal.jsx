import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";

import CourseService from "../../services/CourseService";
import ChapterService from "../../services/ChapterService";
import CategoryService from "../../services/QuestionCategoryService";
import TableHeaderService from "../../services/TableHeaderService";
import TableAttributeService from "../../services/TableAttributeService";

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

import "./QuestionType2Modal.css";

function QuestionType2Modal({ show, onClose, onSave, questionData }) {
  const [courseId, setCourseId] = useState(null);
  const [chapterId, setChapterId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [questionText, setQuestionText] = useState("");

  const [courseOptions, setCourseOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const transactionOptions = [{}];

  const [headerOptions, setHeaderOptions] = useState([]);
  const [attributeOptions, setAttributeOptions] = useState([]);

  const emptyRow = () => ({
    transaction: "",
    amount: "",
    amount2: "",
  });

  const [questionAttributes, setQuestionAttributes] = useState([emptyRow()]);

  useEffect(() => {
    loadCourses();
    loadCategories();
    loadHeaders();
    loadAttributes();
  }, []);

  useEffect(() => {
    if (courseId) {
      loadChapters(courseId.value);
    } else {
      setChapterOptions([]);
    }
  }, [courseId]);

  useEffect(() => {
    if (questionData) {
      setQuestionText(questionData.questionText || "");

      setCourseId(questionData.courseId || null);
      setChapterId(questionData.chapterId || null);
      setCategoryId(questionData.categoryId || null);

      if (
        questionData.questionAttributes &&
        questionData.questionAttributes.length > 0
      ) {
        setQuestionAttributes(questionData.questionAttributes);
      } else {
        setQuestionAttributes([emptyRow()]);
      }
    } else {
      resetForm();
    }
  }, [questionData]);

  const loadCourses = async () => {
    try {
      const response = await CourseService.getAllCourses();

      setCourseOptions(
        response.data.map((item) => ({
          value: item.course_id,
          label: item.course_name,
        })),
      );
    } catch (e) {
      console.log(e);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await CategoryService.getAllCategories();

      setCategoryOptions(
        response.data.map((item) => ({
          value: item.category_id,
          label: item.category_name,
        })),
      );
    } catch (e) {
      console.log(e);
    }
  };

  const loadChapters = async (courseId) => {
    try {
      const response = await ChapterService.getChaptersByCourse(courseId);

      setChapterOptions(
        response.data.map((item) => ({
          value: item.chapter_id,
          label: item.chapter_name,
        })),
      );
    } catch (e) {
      console.log(e);
    }
  };

  const loadHeaders = async () => {
    try {
      const response = await TableHeaderService.getAll();

      setHeaderOptions(
        response.data.map((item) => ({
          value: item.headerId,
          label: item.name,
        })),
      );
    } catch (e) {
      console.log(e);
    }
  };

  const loadAttributes = async () => {
    try {
      const response = await TableAttributeService.getAll();

      setAttributeOptions(
        response.data.map((item) => ({
          value: item.attributeId,
          label: item.name,
        })),
      );
    } catch (e) {
      console.log(e);
    }
  };
  const handleAttributeChange = (index, field, value) => {
    const updated = [...questionAttributes];
    updated[index][field] = value;
    setQuestionAttributes(updated);
  };

  const handleAddRow = () => {
    setQuestionAttributes([...questionAttributes, emptyRow()]);
  };

  const handleDeleteRow = (index) => {
    if (questionAttributes.length === 1) return;

    const updated = questionAttributes.filter((_, i) => i !== index);

    setQuestionAttributes(updated);
  };

  const resetForm = () => {
    setCourseId(null);
    setChapterId(null);
    setCategoryId(null);
    setQuestionText("");

    setQuestionAttributes([emptyRow()]);
  };

  const handleClose = () => {
    resetForm();

    if (onClose) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!courseId || !chapterId || !categoryId || !questionText.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      courseId: courseId.value,
      chapterId: chapterId.value,
      categoryId: categoryId.value,
      questionText: questionText,
      questionAttributes: questionAttributes.map((row) => ({
        headerId: null,
        attributeId: null,
        transaction: row.transaction || null,
        amount: row.amount === "" ? null : Number(row.amount),
        amount2: row.amount2 === "" ? null : Number(row.amount2),
        note: null,
      })),
    };

    try {
      if (onSave) {
        await onSave(payload);
      }

      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  if (!show) return null;
  return createPortal(
    <div className="modal-overlay">
      <div className="table-name-modal">
        {/* Header */}

        <div className="modal-header">
          <div>
            <h2>
              {questionData ? "Edit Question Type 2" : "Add Question Type 2"}
            </h2>

            <p>Fill in the details below to create a new question.</p>
          </div>

          <button type="button" className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}

        <div className="modal-body">
          {/* Question Details */}

          <div className="form-card">
            <h3 className="section-title">Question Details</h3>

            <div className="form-grid">
              {/* Course */}

              <div className="form-group">
                <label>
                  Course Name <span>*</span>
                </label>

                <div className="input-box course-select-box">
                  <FaBook className="input-icon" />

                  <Select
                    className="react-select-container"
                    options={courseOptions}
                    value={
                      courseOptions.find(
                        (option) => option.value === courseId,
                      ) || null
                    }
                    onChange={(selected) => {
                      setCourseId(selected ? selected.value : "");
                      setChapterId("");
                    }}
                    placeholder="Select Course"
                    isSearchable
                    isClearable
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              {/* Chapter */}

              <div className="form-group">
                <label>
                  Chapter Name <span>*</span>
                </label>

                <div className="input-box">
                  <FaLayerGroup className="input-icon" />

                  <Select
                    className="react-select-container"
                    options={chapterOptions}
                    value={
                      chapterOptions.find(
                        (option) => option.value === chapterId,
                      ) || null
                    }
                    onChange={(selected) => {
                      setChapterId(selected ? selected.value : "");
                    }}
                    placeholder="Select Chapter"
                    isSearchable
                    isClearable
                    classNamePrefix="react-select"
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

                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={categoryOptions}
                    value={
                      categoryOptions.find(
                        (option) => option.value === categoryId,
                      ) || null
                    }
                    onChange={(selected) => {
                      setCategoryId(selected ? selected.value : "");
                    }}
                    placeholder="Select Category"
                    isSearchable
                    isClearable
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
                  placeholder="Enter Question Text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Question Attributes */}

          <div className="form-card">
            <h3 className="section-title">Question Attributes</h3>
            <div className="question-table">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Transaction</th>

                    <th>Amount</th>

                    <th>Amount 2</th>

                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {questionAttributes.map((row, index) => (
                    <tr key={index}>
                      {/* Transaction */}
                      <td>
                        <div className="question-attribute-cell">
                          <Select
                            className="react-select-container"
                            classNamePrefix="transaction-select"
                            options={transactionOptions}
                            value={
                              transactionOptions.find(
                                (option) => option.value === row.transaction,
                              ) || null
                            }
                            onChange={(selected) =>
                              handleAttributeChange(
                                index,
                                "transaction",
                                selected ? selected.value : "",
                              )
                            }
                            placeholder="Select Transaction"
                            isSearchable
                            isClearable
                          />
                        </div>
                      </td>

                      <td>
                        <div className="question-attribute-cell">
                          <input
                            type="number"
                            placeholder="0"
                            value={row.amount || ""}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "amount",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </td>

                      <td>
                        <div className="question-attribute-cell">
                          <input
                            type="number"
                            placeholder="0"
                            value={row.amount2 || ""}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "amount2",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </td>

                      {/* Delete */}
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteRow(index)}
                          disabled={questionAttributes.length === 1}
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
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default QuestionType2Modal;
