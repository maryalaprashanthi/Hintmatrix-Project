import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import CourseService from "../../services/CourseService";
import ChapterService from "../../services/ChapterService";
import QuestionCategoryService from "../../services/QuestionCategoryService";
import TableAttributeService from "../../services/TableAttributeService";
import QuestionService from "../../services/QuestionService";

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
  courseId: initialCourseId,
  chapterId: initialChapterId,
  categoryId: initialCategoryId,
  initialData,
  onClose,
  onSave,
}) {
  const [courseId, setCourseId] = useState(null);
  const [chapterId, setChapterId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [questionText, setQuestionText] = useState("");

  // Empty options (Backend team will populate)
  const [courseOptions, setCourseOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [balanceOptions, setBalanceOptions] = useState([]);

  const [attributes, setAttributes] = useState([
    {
      debitBalance: "",
      debitAmount: "",
      creditBalance: "",
      creditAmount: "",
    },
  ]);

  useEffect(() => {
    getData();
    loadTableAttributes();
  }, []);

  const getData = async () => {
    try {
      console.log("Reached here");
      // get courses
      let courseData = await CourseService.getAllCourses();
      courseData = await courseData.data;
      console.log("Courses data: ", courseData);
      let allCourses = courseData.map((c) => ({
        id: c.courseId,
        name: c.name,
      }));
      console.log("All courses: ", allCourses);
      // get chapter
      let response = await ChapterService.getAll();
      let chapterData = await response.data;
      let allChapters = chapterData.map((c) => ({
        id: c.chapterId,
        name: c.name,
      }));
      // get category
      let categoriesData = await QuestionCategoryService.getAll();
      categoriesData = await categoriesData.data;
      let allCategories = categoriesData.map((c) => ({
        id: c.categoryId,
        name: c.name,
      }));

      let courseOptionsData = allCourses.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      let categoryOptionsData = allCategories.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      let chapterOptionData = allChapters.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setCategoryOptions(categoryOptionsData);
      setChapterOptions(chapterOptionData);
      setCourseOptions(courseOptionsData);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const loadTableAttributes = async () => {
    try {
      const response = await TableAttributeService.getRuleAttributes();

      console.log("TABLE ATTRIBUTE API RESPONSE:", response);
      console.log("TABLE ATTRIBUTE DATA:", response.data);

      const data = response.data.map((item) => ({
        value: item.attributeId,
        label: item.name,
        amount: item.amount ?? item.amount1 ?? item.amount2 ?? "",
      }));

      console.log("DROPDOWN OPTIONS:", data);

      setBalanceOptions(data);
    } catch (error) {
      console.error("TABLE ATTRIBUTE ERROR:", error);
      console.error("STATUS:", error.response?.status);
      console.error("ERROR DATA:", error.response?.data);
    }
  };
  useEffect(() => {
    const selectedCourseId = initialData?.courseId ?? initialCourseId;
    const selectedChapterId = initialData?.chapterId ?? initialChapterId;
    const selectedCategoryId = initialData?.categoryId ?? initialCategoryId;

    setQuestionText(initialData?.questionText || "");

    if (selectedCourseId && courseOptions.length > 0) {
      const selectedCourse = courseOptions.find(
        (option) => option.value === Number(selectedCourseId),
      );
      if (selectedCourse) {
        setCourseId(selectedCourse);
      }
    }
    if (selectedChapterId && chapterOptions.length > 0) {
      const selectedChapter = chapterOptions.find(
        (option) => option.value === Number(selectedChapterId),
      );
      if (selectedChapter) {
        setChapterId(selectedChapter);
      }
    }
    if (selectedCategoryId && categoryOptions.length > 0) {
      const selectedCategory = categoryOptions.find(
        (option) => option.value === Number(selectedCategoryId),
      );
      if (selectedCategory) {
        setCategoryId(selectedCategory);
      }
    }
  }, [
    initialCourseId,
    initialChapterId,
    initialCategoryId,
    initialData,
    courseOptions,
    chapterOptions,
    categoryOptions,
  ]);

  useEffect(() => {
    let cancelled = false;

    const loadQuestionDetails = async () => {
      if (!initialData?.questionId) {
        setAttributes([
          {
            debitBalance: "",
            debitAmount: "",
            creditBalance: "",
            creditAmount: "",
          },
        ]);
        return;
      }

      try {
        const response = await QuestionService.getQuestionById(
          initialData.questionId,
        );
        const question = response.data || initialData;
        const questionAttributes = question.questionAttributes || [];
        const isCreditAttribute = (attribute) =>
          [
            attribute.transaction,
            attribute.type,
            attribute.side,
            attribute.headerName,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes("credit")) ||
          String(attribute.headerId) === "3";

        if (cancelled) return;

        setQuestionText(question.questionText || "");
        setAttributes(
          questionAttributes.length > 0
            ? (() => {
                const debitAttributes = questionAttributes.filter(
                  (attribute) => !isCreditAttribute(attribute),
                );
                const creditAttributes =
                  questionAttributes.filter(isCreditAttribute);
                const rowCount = Math.max(
                  debitAttributes.length,
                  creditAttributes.length,
                );

                return Array.from({ length: rowCount }, (_, index) => {
                  const debit = debitAttributes[index];
                  const credit = creditAttributes[index];

                  return {
                    debitOriginal: debit || null,
                    debitQuestionAttributeId: debit?.questionAttributeId ?? "",
                    debitBalance:
                      debit?.attributeId ?? debit?.attribute_id ?? "",
                    debitAttributeName: debit?.attributeName || "",
                    debitAmount:
                      debit?.amount ?? debit?.amount1 ?? debit?.amount2 ?? "",
                    creditQuestionAttributeId:
                      credit?.questionAttributeId ?? "",
                    creditOriginal: credit || null,
                    creditBalance:
                      credit?.attributeId ?? credit?.attribute_id ?? "",
                    creditAttributeName: credit?.attributeName || "",
                    creditAmount:
                      credit?.amount ??
                      credit?.amount1 ??
                      credit?.amount2 ??
                      "",
                  };
                });
              })()
            : [
                {
                  debitBalance: "",
                  debitAmount: "",
                  creditBalance: "",
                  creditAmount: "",
                },
              ],
        );
      } catch (error) {
        console.error("Question details load error:", error);
      }
    };

    loadQuestionDetails();

    return () => {
      cancelled = true;
    };
  }, [initialData]);

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
    if (!courseId || !chapterId || !categoryId || !questionText.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const questionAttributes = attributes.flatMap((row) => {
      const mappedAttributes = [];

      if (row.debitBalance) {
        const debitAmount =
          row.debitAmount === "" ? null : Number(row.debitAmount);
        mappedAttributes.push({
          ...(row.debitOriginal || {}),
          ...(row.debitQuestionAttributeId && {
            questionAttributeId: row.debitQuestionAttributeId,
          }),
          headerId: 1,
          headerName: "Debit Particulars",
          attributeId: Number(row.debitBalance),
          attributeName: row.debitAttributeName || undefined,
          amount: debitAmount,
          amount1: debitAmount,
          amount2: null,
          transaction: "Debit",
        });
      }

      if (row.creditBalance) {
        const creditAmount =
          row.creditAmount === "" ? null : Number(row.creditAmount);
        mappedAttributes.push({
          ...(row.creditOriginal || {}),
          ...(row.creditQuestionAttributeId && {
            questionAttributeId: row.creditQuestionAttributeId,
          }),
          headerId: 3,
          headerName: "Credit Particulars",
          attributeId: Number(row.creditBalance),
          attributeName: row.creditAttributeName || undefined,
          amount: creditAmount,
          amount1: creditAmount,
          amount2: null,
          transaction: "Credit",
        });
      }

      return mappedAttributes;
    });

    const questionData = {
      courseId: Number(courseId.value),
      chapterId: Number(chapterId.value),
      categoryId: Number(categoryId.value),
      questionText: questionText.trim(),
      questionAttributes,
    };
    try {
      const response = initialData?.questionId
        ? await QuestionService.update(initialData.questionId, questionData)
        : await QuestionService.create(questionData);
      await onSave(response.data);
      handleClose();
    } catch (error) {
      console.error("Save Question Error:", error);
      alert(`Failed to ${initialData ? "update" : "create"} question.`);
    }
  };

  const handleClose = () => {
    setCourseId(null);
    setChapterId(null);
    setCategoryId(null);
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
            <h2>{initialData ? "Edit Question" : "Add New Question"}</h2>

            <p>
              {initialData
                ? "Update the question details below."
                : "Fill in the details below to create a new question."}
            </p>
          </div>

          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>
        {/* Body */}

        <div div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">Question Details</h3>

            <div className="form-grid">
              {/* Course ID */}
              <div className="form-group">
                <label>
                  Course Name <span>*</span>
                </label>

                <div className="input-box ">
                  <FaList className="input-icon" />
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={courseOptions}
                    value={courseId}
                    onChange={setCourseId}
                    placeholder="Select Course Name"
                    isSearchable={true}
                    isDisabled={!!initialCourseId}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>
              </div>
              {/* Chapter ID */}

              <div className="form-group">
                <label>
                  Chapter Name <span>*</span>
                </label>

                <div className="input-box">
                  <FaList className="input-icon" />
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={chapterOptions}
                    value={chapterId}
                    onChange={setChapterId}
                    placeholder="Select Chapter Name"
                    isSearchable={true}
                    isDisabled={!!initialChapterId}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>
              </div>

              {/* Category ID */}

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
                    value={categoryId}
                    onChange={setCategoryId}
                    placeholder="Select Category"
                    isSearchable={true}
                    isDisabled={!!initialCategoryId}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Question Text */}

            {/* <div className="form-group mt-4"> */}
            <div className="form-group full-width">
              <label>
                Question Text <span>*</span>
              </label>

              <div className="textarea-box">
                <FaFileAlt className="input-icon" />

                <textarea
                  placeholder="Enter question text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* Question Attributes */}

          <div className="form-card question-attributes-section">
            <h3 className="section-title ">Question Attributes</h3>

            <div className="question-table ">
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
                          className="react-select-container"
                          classNamePrefix="credit-select"
                          options={balanceOptions}
                          value={balanceOptions.find(
                            (option) => option.value == row.debitBalance,
                          )}
                          onChange={(selected) =>
                            (() => {
                              const updated = [...attributes];
                              updated[index] = {
                                ...updated[index],
                                debitBalance: selected ? selected.value : "",
                                debitAttributeName: selected?.label || "",
                                debitAmount: selected ? selected.amount : "",
                              };
                              setAttributes(updated);
                            })()
                          }
                          placeholder="Enter Debit Balance"
                          isSearchable
                          isClearable
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 99999,
                            }),
                          }}
                        />
                      </td>
                      {/* Debit Amount */}

                      <td>
                        <input
                          className="amount-input"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={row.debitAmount}
                          onChange={(e) =>
                            handleAttributeChange(
                              index,
                              "debitAmount",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* Credit Balance */}
                      <td>
                        <Select
                          className="react-select-container"
                          classNamePrefix="credit-select"
                          options={balanceOptions}
                          value={balanceOptions.find(
                            (option) => option.value === row.creditBalance,
                          )}
                          onChange={(selected) =>
                            (() => {
                              const updated = [...attributes];
                              updated[index] = {
                                ...updated[index],
                                creditBalance: selected ? selected.value : "",
                                creditAttributeName: selected?.label || "",
                                creditAmount: selected ? selected.amount : "",
                              };
                              setAttributes(updated);
                            })()
                          }
                          placeholder="Enter Credit Balance"
                          isSearchable
                          isClearable
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 99999,
                            }),
                          }}
                        />
                      </td>
                      {/* Credit Amount */}
                      <td>
                        <input
                          className="amount-input"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={row.creditAmount}
                          onChange={(e) =>
                            handleAttributeChange(
                              index,
                              "creditAmount",
                              e.target.value,
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
              className="btn btn-outline-primary add-row-btn"
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
            {initialData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
export default AddQuestionModal;
