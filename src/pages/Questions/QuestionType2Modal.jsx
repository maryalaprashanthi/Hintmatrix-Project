import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";

import CourseService from "../../services/CourseService";
import SubjectService from "../../services/SubjectService";
import ChapterService from "../../services/ChapterService";
import TopicService from "../../services/TopicService";
import QuestionTypeService from "../../services/QuestionTypeService";
import QuestionService from "../../services/QuestionService";
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

const normalizeQuestionAttributes = (attributes) =>
  attributes.map((attribute) => ({
    ...attribute,
    transaction: attribute.transaction ?? attribute.attributeId ?? "",
    amount: attribute.amount ?? attribute.amount1 ?? attribute.amount2 ?? "",
    amount1: attribute.amount1 ?? attribute.amount ?? "",
    amount2: attribute.amount2 ?? attribute.amount2Value ?? "",
  }));

const parseOptionalNumber = (value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined ||
    value === "null"
  ) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getEffectiveAmount = (...values) => {
  for (const value of values) {
    if (
      value !== "" &&
      value !== null &&
      value !== undefined &&
      value !== "null"
    ) {
      return value;
    }
  }

  return null;
};

const getResponseArray = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  return [];
};

function QuestionType2Modal({
  show,
  onClose,
  onSave,
  questionData,
  initialCourseId,
  initialSubjectId,
  initialChapterId,
  initialTopicId,
}) {
  const [courseId, setCourseId] = useState(initialCourseId || null);
  const [subjectId, setSubjectId] = useState(initialSubjectId || null);
  const [chapterId, setChapterId] = useState(initialChapterId || null);
  const [topicId, setTopicId] = useState(initialTopicId || null);
  const [questionTypeId, setQuestionTypeId] = useState(null);
  const [questionText, setQuestionText] = useState("");

  const [courseOptions, setCourseOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);
  const [questionTypeOptions, setQuestionTypeOptions] = useState([]);
  const [allSubjectOptions, setAllSubjectOptions] = useState([]);
  const [allChapterOptions, setAllChapterOptions] = useState([]);
  const [allTopicOptions, setAllTopicOptions] = useState([]);

  const [headerOptions, setHeaderOptions] = useState([]);
  const [attributeOptions, setAttributeOptions] = useState([]);
  const transactionOptions = attributeOptions;

  const emptyRow = () => ({
    transaction: "",
    amount: "",
    amount1: "",
    amount2: "",
  });

  const [questionAttributes, setQuestionAttributes] = useState([emptyRow()]);
  console.log("Transaction Options:", transactionOptions);

  /* =========================================================
     LOAD INITIAL DATA
  ========================================================= */

  useEffect(() => {
    loadCourses();
    loadSubjects();
    loadTopics();
    loadChapters();
    loadQuestionTypes();
    loadHeaders();
    loadAttributes();
  }, []);

  /* =========================================================
     CASCADE: course -> subject -> chapter -> topic
  ========================================================= */

  useEffect(() => {
    if (courseId) {
      setSubjectOptions(
        allSubjectOptions.filter(
          (option) => String(option.courseId) === String(courseId),
        ),
      );
    } else {
      setSubjectOptions([]);
    }
  }, [courseId, allSubjectOptions]);

  useEffect(() => {
    if (subjectId) {
      setChapterOptions(
        allChapterOptions.filter(
          (option) => String(option.subjectId) === String(subjectId),
        ),
      );
    } else if (courseId) {
      setChapterOptions(
        allChapterOptions.filter(
          (option) => String(option.courseId) === String(courseId),
        ),
      );
    } else {
      setChapterOptions([]);
    }
  }, [courseId, subjectId, allChapterOptions]);

  useEffect(() => {
    if (chapterId) {
      setTopicOptions(
        allTopicOptions.filter(
          (option) => String(option.chapterId) === String(chapterId),
        ),
      );
    } else {
      setTopicOptions([]);
    }
  }, [chapterId, allTopicOptions]);

  /* =========================================================
     EDIT / RESET FORM
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    if (questionData) {
      setQuestionText(questionData.questionText || "");

      /*
       * courseId, subjectId, chapterId and topicId are stored
       * as IDs in state.
       */
      setCourseId(questionData.courseId ?? questionData.course_id ?? null);

      setSubjectId(questionData.subjectId ?? questionData.subject_id ?? null);

      setChapterId(questionData.chapterId ?? questionData.chapter_id ?? null);

      setTopicId(questionData.topicId ?? questionData.topic_id ?? null);
      setQuestionTypeId(
        questionData.questionTypeId ?? questionData.question_type_id ?? null,
      );

      const loadQuestionAttributes = async () => {
        try {
          const response = await QuestionService.getQuestionById(
            questionData.questionId,
          );
          const loadedQuestion = response.data || questionData;
          if (cancelled) return;

          setQuestionText(loadedQuestion.questionText || "");
          setQuestionTypeId(
            loadedQuestion.questionTypeId ??
              loadedQuestion.question_type_id ??
              null,
          );
          setQuestionAttributes(
            loadedQuestion.questionAttributes?.length > 0
              ? normalizeQuestionAttributes(loadedQuestion.questionAttributes)
              : [emptyRow()],
          );
        } catch (error) {
          console.error("Failed to load question attributes:", error);
          if (!cancelled) {
            setQuestionAttributes(
              questionData.questionAttributes?.length > 0
                ? normalizeQuestionAttributes(questionData.questionAttributes)
                : [emptyRow()],
            );
          }
        }
      };

      if (questionData.questionId) {
        loadQuestionAttributes();
      } else {
        setQuestionAttributes(
          questionData.questionAttributes?.length > 0
            ? normalizeQuestionAttributes(questionData.questionAttributes)
            : [emptyRow()],
        );
      }
    } else {
      setCourseId(initialCourseId || null);
      setSubjectId(initialSubjectId || null);
      setChapterId(initialChapterId || null);
      setTopicId(initialTopicId || null);
      setQuestionTypeId(null);
      setQuestionText("");
      setQuestionAttributes([emptyRow()]);
    }

    return () => {
      cancelled = true;
    };
  }, [
    questionData,
    initialCourseId,
    initialSubjectId,
    initialChapterId,
    initialTopicId,
  ]);

  /* =========================================================
     COURSES
  ========================================================= */

  const loadCourses = async () => {
    try {
      const response = await CourseService.getAllCourses();
      const data = getResponseArray(response);

      setCourseOptions(
        data.map((item) => ({
          value: item.course_id ?? item.courseId ?? item.id,
          label: item.course_name ?? item.courseName ?? item.name ?? "",
        })),
      );
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  /* =========================================================
     SUBJECTS
  ========================================================= */

  const loadSubjects = async () => {
    try {
      const response = await SubjectService.getAll();
      const data = getResponseArray(response);

      setAllSubjectOptions(
        data.map((item) => ({
          value: item.subject_id ?? item.subjectId ?? item.id,
          label: item.subject_name ?? item.subjectName ?? item.name ?? "",
          courseId: item.course_id ?? item.courseId,
        })),
      );
    } catch (error) {
      console.error("Error loading subjects:", error);
      setSubjectOptions([]);
    }
  };

  /* =========================================================
     TOPICS
  ========================================================= */

  const loadTopics = async () => {
    try {
      const response = await TopicService.getAll();

      const data = getResponseArray(response);

      const options = data.map((item) => ({
        value: item.topic_id ?? item.topicId ?? item.id,
        label: item.topic_name ?? item.topicName ?? item.name ?? "",
        chapterId: item.chapter_id ?? item.chapterId,
        subjectId: item.subject_id ?? item.subjectId,
      }));

      setAllTopicOptions(options);
    } catch (error) {
      console.error("Error loading topics:", error);
      setTopicOptions([]);
    }
  };

  /* =========================================================
     CHAPTERS
  ========================================================= */

  const loadChapters = async () => {
    try {
      const response = await ChapterService.getAll();

      console.log("CHAPTER API RESPONSE:", response);
      console.log("CHAPTER DATA:", response?.data);

      const data = getResponseArray(response);

      console.log("CHAPTER ARRAY:", data);

      const options = data.map((item) => ({
        value: item.chapter_id ?? item.chapterId ?? item.id,
        label: item.chapter_name ?? item.chapterName ?? item.name ?? "",
        courseId:
          item.course_id ??
          item.courseId ??
          item.course?.course_id ??
          item.course?.courseId ??
          item.course?.id,
        subjectId:
          item.subject_id ??
          item.subjectId ??
          item.subject?.subject_id ??
          item.subject?.subjectId ??
          item.subject?.id,
      }));

      console.log("CHAPTER OPTIONS:", options);

      setAllChapterOptions(options);
    } catch (error) {
      console.error("Error loading chapters:", error);
      setChapterOptions([]);
    }
  };

  const loadQuestionTypes = async () => {
    try {
      const response = await QuestionTypeService.getAll();
      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      setQuestionTypeOptions(
        data.map((item) => ({
          value: item.questionTypeId ?? item.question_type_id ?? item.id,
          label: item.name ?? item.type ?? item.questionType ?? "",
        })),
      );
    } catch (error) {
      console.error("Error loading question types:", error);
    }
  };
  /* =========================================================
     TABLE HEADERS
  ========================================================= */

  const loadHeaders = async () => {
    try {
      const response = await TableHeaderService.getAll();

      setHeaderOptions(
        response.data.map((item) => ({
          value: item.headerId ?? item.header_id ?? item.id,
          label: item.name,
        })),
      );
    } catch (error) {
      console.error("Error loading headers:", error);
    }
  };

  /* =========================================================
     TABLE ATTRIBUTES
  ========================================================= */

  const loadAttributes = async () => {
    try {
      const response = await TableAttributeService.getRuleAttributes();

      console.log("TABLE ATTRIBUTE RESPONSE:", response);
      console.log("TABLE ATTRIBUTE DATA:", response.data);

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      console.log("TABLE ATTRIBUTE ARRAY:", data);

      const options = data.map((item) => ({
        value: item.attributeId ?? item.attribute_id ?? item.id,
        label: item.name ?? item.attributeName ?? item.attribute_name ?? "",
        amount1: item.amount1 ?? item.amount ?? "",
        amount2: item.amount2 ?? item.amount2Value ?? item.amount ?? "",
      }));

      console.log("TABLE ATTRIBUTE OPTIONS:", options);

      setAttributeOptions(options);
    } catch (error) {
      console.error("Error loading attributes:", error);
    }
  };
  /* =========================================================
     ATTRIBUTE CHANGE
  ========================================================= */

  const handleAttributeChange = (index, field, value) => {
    const updated = [...questionAttributes];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setQuestionAttributes(updated);
  };

  const handleAttributeSelection = (index, selected) => {
    const updated = [...questionAttributes];

    updated[index] = {
      ...updated[index],
      transaction: selected ? selected.value : "",
      attributeId: selected ? selected.value : "",
      amount: selected ? (selected.amount ?? selected.amount1 ?? "") : "",
      amount1: selected ? (selected.amount1 ?? selected.amount ?? "") : "",
      amount2: selected
        ? (selected.amount2 ?? selected.amount2Value ?? selected.amount ?? "")
        : "",
    };

    setQuestionAttributes(updated);
  };

  /* =========================================================
     ADD ROW
  ========================================================= */

  const handleAddRow = () => {
    setQuestionAttributes([...questionAttributes, emptyRow()]);
  };

  /* =========================================================
     DELETE ROW
  ========================================================= */

  const handleDeleteRow = (index) => {
    if (questionAttributes.length === 1) {
      return;
    }

    const updated = questionAttributes.filter((_, i) => i !== index);

    setQuestionAttributes(updated);
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setCourseId(null);
    setSubjectId(null);
    setChapterId(null);
    setTopicId(null);
    setQuestionTypeId(null);
    setQuestionText("");

    setQuestionAttributes([emptyRow()]);
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const handleClose = () => {
    resetForm();

    if (onClose) {
      onClose();
    }
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
    if (
      !courseId ||
      !subjectId ||
      !chapterId ||
      !topicId ||
      !questionTypeId ||
      !questionText.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (
      questionAttributes.some(
        (row) => row.transaction === "" || row.transaction == null,
      )
    ) {
      alert("Please select a transaction for every attribute row.");
      return;
    }

    const payload = {
      courseId: Number(courseId),
      subjectId: Number(subjectId),
      chapterId: Number(chapterId),
      topicId: Number(topicId),
      questionTypeId: Number(questionTypeId),
      questionText: questionText.trim(),

      questionAttributes: questionAttributes.map((row) => {
        const amountValue = getEffectiveAmount(row.amount, row.amount1);
        const amount2Value = getEffectiveAmount(row.amount2);

        return {
          headerId: row.headerId || 1,
          attributeId: row.attributeId || Number(row.transaction),

          transaction: row.transaction || null,
          amount: parseOptionalNumber(amountValue),
          amount2: parseOptionalNumber(amount2Value),

          note: row.note ?? null,
        };
      }),
    };

    console.log("Question Type 2 Payload:", payload);

    try {
      if (onSave) {
        await onSave(payload);
      }

      handleClose();
    } catch (error) {
      console.error("Error saving Question Type 2:", error);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  if (!show) {
    return null;
  }

  return createPortal(
    <div className="qt2-modal-overlay">
      <div className="qt2-table-name-modal">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="qt2-modal-header">
          <div>
            <h2>
              {questionData ? "Edit Question Type 2" : "Add Question Type 2"}
            </h2>

            <p>
              {questionData
                ? "Update Question Type 2 details."
                : "Create a new Question Type 2."}
            </p>
          </div>

          <button type="button" className="qt2-close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="qt2-modal-body">
          {/* =================================================
              QUESTION DETAILS
          ================================================= */}

          <div className="qt2-form-card">
            <h3 className="qt2-section-title">Question Details</h3>

            <div className="qt2-form-grid">
              {/* COURSE */}

              <div className="qt2-form-group">
                <label>
                  Course Name <span>*</span>
                </label>

                <div className="qt2-input-box qt2-course-select-box">
                  <FaBook className="qt2-input-icon" />

                  <Select
                    className="qt2-react-select-container"
                    classNamePrefix="qt2-react-select"
                    options={courseOptions}
                    value={
                      courseOptions.find(
                        (option) => String(option.value) === String(courseId),
                      ) || null
                    }
                    placeholder="Select Course"
                    isDisabled
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 99999,
                      }),
                    }}
                  />
                </div>
              </div>

              {/* SUBJECT */}

              <div className="qt2-form-group">
                <label>
                  Subject <span>*</span>
                </label>

                <div className="qt2-input-box">
                  <FaLayerGroup className="qt2-input-icon" />

                  <Select
                    className="qt2-react-select-container"
                    classNamePrefix="qt2-react-select"
                    options={subjectOptions}
                    value={
                      subjectOptions.find(
                        (option) => String(option.value) === String(subjectId),
                      ) || null
                    }
                    placeholder="Select Subject"
                    isDisabled
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 99999,
                      }),
                    }}
                  />
                </div>
              </div>

              {/* CHAPTER */}

              <div className="qt2-form-group">
                <label>
                  Chapter Name <span>*</span>
                </label>

                <div className="qt2-input-box">
                  <FaLayerGroup className="qt2-input-icon" />

                  <Select
                    className="qt2-react-select-container"
                    classNamePrefix="qt2-react-select"
                    options={chapterOptions}
                    value={
                      chapterOptions.find(
                        (option) => String(option.value) === String(chapterId),
                      ) || null
                    }
                    placeholder="Select Chapter"
                    isDisabled
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 99999,
                      }),
                    }}
                  />
                </div>
              </div>

              {/* TOPIC */}

              <div className="qt2-form-group">
                <label>
                  Topic <span>*</span>
                </label>

                <div className="qt2-input-box">
                  <FaList className="qt2-input-icon" />

                  <Select
                    className="qt2-react-select-container"
                    classNamePrefix="qt2-react-select"
                    options={topicOptions}
                    value={
                      topicOptions.find(
                        (option) => String(option.value) === String(topicId),
                      ) || null
                    }
                    onChange={(selected) => {
                      setTopicId(selected ? selected.value : null);
                    }}
                    placeholder="Select Topic"
                    isDisabled={!chapterId}
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
                </div>
              </div>

              {/* QUESTION TYPE */}

              <div className="qt2-form-group">
                <label>
                  Question Type <span>*</span>
                </label>

                <div className="qt2-input-box">
                  <FaList className="qt2-input-icon" />

                  <Select
                    className="qt2-react-select-container"
                    classNamePrefix="qt2-react-select"
                    options={questionTypeOptions}
                    value={
                      questionTypeOptions.find(
                        (option) =>
                          String(option.value) === String(questionTypeId),
                      ) || null
                    }
                    onChange={(selected) => {
                      setQuestionTypeId(selected ? selected.value : null);
                    }}
                    placeholder="Select Question Type"
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
                </div>
              </div>
            </div>

            {/* QUESTION TEXT */}

            <div className="qt2-form-group mt-4">
              <label>
                Question Text <span>*</span>
              </label>

              <div className="qt2-textarea-box">
                <FaFileAlt className="qt2-input-icon" />

                <textarea
                  placeholder="Enter Question Text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              QUESTION ATTRIBUTES
          ================================================= */}

          <div className="qt2-form-card qt2-question-attributes-card">
            <h3 className="qt2-section-title">Question Attributes</h3>

            <div className="qt2-question-table">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Amount 1</th>
                    <th>Amount 2</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {questionAttributes.map((row, index) => (
                    <tr key={index}>
                      {/* TRANSACTION */}

                      <td>
                        <div className="qt2-question-attribute-cell">
                          <Select
                            className="qt2-react-select-container"
                            classNamePrefix="qt2-transaction-select"
                            options={transactionOptions}
                            value={
                              transactionOptions.find(
                                (option) =>
                                  String(option.value) ===
                                  String(row.transaction ?? row.attributeId),
                              ) || null
                            }
                            onChange={(selected) =>
                              handleAttributeSelection(index, selected)
                            }
                            placeholder="Search Transaction..."
                            isSearchable={true}
                            isClearable={true}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                          />
                        </div>
                      </td>

                      {/* AMOUNT 1*/}

                      <td>
                        <div className="qt2-question-attribute-cell">
                          <input
                            type="number"
                            placeholder="0"
                            value={row.amount1 ?? ""}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "amount1",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </td>

                      {/* AMOUNT 2 */}

                      <td>
                        <div className="qt2-question-attribute-cell">
                          <input
                            type="number"
                            placeholder="0"
                            value={row.amount2 ?? ""}
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

                      {/* DELETE */}

                      <td className="text-center">
                        <button
                          type="button"
                          className="qt2-delete-btn btn btn-outline-danger"
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

            {/* ADD ROW */}

            <button
              type="button"
              className="qt2-add-row-btn btn btn-outline-primary mt-3"
              onClick={handleAddRow}
            >
              <FaPlus className="me-2" />
              Add Row
            </button>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="qt2-modal-footer">
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
