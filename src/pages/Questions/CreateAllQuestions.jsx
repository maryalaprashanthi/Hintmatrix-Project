import { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaExpand,
  FaFileAlt,
  FaListUl,
  FaPlus,
  FaSave,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import Select from "react-select";
import ChapterService from "../../services/ChapterService";
import CourseService from "../../services/CourseService";
import McqQuestionService from "../../services/McqQuestionService";
import MatchingQuestionService from "../../services/MatchingQuestionService";
import FillInBlankQuestionService from "../../services/FillInBlankQuestionService";
import QuestionService from "../../services/QuestionService";
import QuestionTypeService from "../../services/QuestionTypeService";
import SubjectService from "../../services/SubjectService";
import TableAttributeService from "../../services/TableAttributeService";
import TableHeaderService from "../../services/TableHeaderService";
import TopicService from "../../services/TopicService";
import "./CreateAllQuestions.css";

const emptyMcqOptions = () =>
  ["A", "B", "C", "D"].map((label, index) => ({
    label,
    optionOrder: index + 1,
    optionText: "",
    isCorrect: false,
  }));

const emptyAttributeRow = () => ({
  attributeId: "",
  amount: "",
  amount2: "",
});

const emptyLedgerRow = () => ({
  debitAttributeId: "",
  debitAmount: "",
  creditAttributeId: "",
  creditAmount: "",
});

const emptyMatchingPair = () => ({
  columnA: "",
  columnB: "",
});

const emptyMatchingPairs = () => Array.from({ length: 4 }, emptyMatchingPair);

const emptyBlank = (index) => ({
  label: `Blank ${index + 1}`,
  acceptedAnswers: "",
});

const emptyBlanks = () => [emptyBlank(0)];

const idOf = (item, type) =>
  item?.[`${type}Id`] ?? item?.[`${type}_id`] ?? item?.id;

const labelOf = (item, type) => {
  const labels = {
    course: item?.name ?? item?.courseName ?? item?.course_name,
    subject: item?.subjectName ?? item?.subject_name ?? item?.name,
    chapter: item?.name ?? item?.chapterName ?? item?.chapter_name,
    topic: item?.name ?? item?.topicName ?? item?.topic_name,
    questionType:
      item?.questionType ?? item?.question_type ?? item?.name ?? item?.type,
    attribute: item?.name ?? item?.attributeName ?? item?.attribute_name,
  };

  return labels[type] ?? item?.name ?? "";
};

const normalizeType = (value = "") => {
  let normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (normalized.startsWith("MCQ_")) {
    normalized = normalized.slice(4);
  }

  if (normalized.endsWith("_QUESTION")) {
    normalized = normalized.slice(0, -9);
  }

  const aliases = {
    DRAGANDDROP: "DRAG_AND_DROP",
    SINGLECHOICE: "SINGLE_CHOICE",
    MULTIPLECHOICE: "MULTIPLE_CHOICE",
  };

  return aliases[normalized] ?? normalized;
};

const isMcqType = (type) =>
  type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";

const isMatchingType = (type) =>
  type === "MATCHING" ||
  type === "MATCH_THE_FOLLOWING" ||
  type.includes("MATCHING") ||
  type.includes("MATCH_THE_FOLLOWING");

const isFillBlankType = (type) =>
  type === "FILL_IN_THE_BLANKS" ||
  type === "FILL_IN_BLANKS" ||
  type === "FILL_THE_BLANKS" ||
  (type.includes("FILL") && type.includes("BLANK"));

const parseOptionalNumber = (value) =>
  value === "" || value == null ? null : Number(value);

const typeLabel = (type) => {
  const labels = {
    DRAG_AND_DROP: "Drag and Drop",
    JOURNAL: "Journal",
    DROPDOWN: "Dropdown",
    SINGLE_CHOICE: "Single Choice",
    MULTIPLE_CHOICE: "Multiple Choice",
  };

  return labels[type] ?? type.replaceAll("_", " ");
};

function searchableSelect({
  items,
  type,
  value,
  onChange,
  placeholder,
  disabled = false,
  getLabel,
}) {
  const options = items.map((item) => ({
    value: String(idOf(item, type)),
    label: getLabel ? getLabel(item) : labelOf(item, type),
  }));

  return (
    <Select
      className="aq-search-select"
      classNamePrefix="aq-select"
      options={options}
      value={options.find((option) => option.value === String(value)) ?? null}
      onChange={(option) => onChange(option?.value ?? "")}
      placeholder={placeholder}
      isDisabled={disabled}
      isSearchable
      isClearable
      hideSelectedOptions={false}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      styles={{
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
      }}
    />
  );
}

function CreateAllQuestions() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [tableAttributes, setTableAttributes] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [questionTypeId, setQuestionTypeId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState("1");

  const [mcqOptions, setMcqOptions] = useState(emptyMcqOptions);

  const [attributeRows, setAttributeRows] = useState([emptyAttributeRow()]);

  const [ledgerRows, setLedgerRows] = useState([emptyLedgerRow()]);

  const [matchingPairs, setMatchingPairs] = useState(emptyMatchingPairs);

  const [blanks, setBlanks] = useState(emptyBlanks);

  const [drafts, setDrafts] = useState([]);
  const [editingDraftId, setEditingDraftId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [formError, setFormError] = useState("");
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  useEffect(() => {
    if (isPreviewFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isPreviewFullscreen]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const responses = await Promise.all([
          CourseService.getAllCourses(),
          SubjectService.getAll(),
          ChapterService.getAll(),
          TopicService.getAll(),
          QuestionTypeService.getAll(),
          TableAttributeService.getRuleAttributes(),
          TableHeaderService.getAll(),
        ]);

        setCourses(Array.isArray(responses[0].data) ? responses[0].data : []);

        setSubjects(Array.isArray(responses[1].data) ? responses[1].data : []);

        setChapters(Array.isArray(responses[2].data) ? responses[2].data : []);

        setTopics(Array.isArray(responses[3].data) ? responses[3].data : []);

        setQuestionTypes(
          Array.isArray(responses[4].data) ? responses[4].data : [],
        );

        setTableAttributes(
          Array.isArray(responses[5].data) ? responses[5].data : [],
        );

        setTableHeaders(
          Array.isArray(responses[6].data) ? responses[6].data : [],
        );
      } catch (error) {
        console.error("Failed to load question creation data:", error);

        setMessage({
          type: "error",
          text: "Unable to load question form data.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (item) => String(item.courseId ?? item.course_id) === String(courseId),
      ),
    [subjects, courseId],
  );

  const filteredChapters = useMemo(
    () =>
      chapters.filter(
        (item) =>
          String(item.subjectId ?? item.subject_id) === String(subjectId),
      ),
    [chapters, subjectId],
  );

  const filteredTopics = useMemo(
    () =>
      topics.filter(
        (item) =>
          String(item.chapterId ?? item.chapter_id) === String(chapterId),
      ),
    [topics, chapterId],
  );

  const selectedQuestionType = questionTypes.find(
    (item) => String(idOf(item, "questionType")) === String(questionTypeId),
  );

  const selectedType = normalizeType(
    labelOf(selectedQuestionType, "questionType"),
  );

  const selectedNames = {
    course: labelOf(
      courses.find((item) => String(idOf(item, "course")) === String(courseId)),
      "course",
    ),

    subject: labelOf(
      subjects.find(
        (item) => String(idOf(item, "subject")) === String(subjectId),
      ),
      "subject",
    ),

    chapter: labelOf(
      chapters.find(
        (item) => String(idOf(item, "chapter")) === String(chapterId),
      ),
      "chapter",
    ),

    topic: labelOf(
      topics.find((item) => String(idOf(item, "topic")) === String(topicId)),
      "topic",
    ),
  };

  const updateMcqOption = (index, field, value) => {
    setMcqOptions((current) =>
      current.map((option, optionIndex) => {
        if (field === "isCorrect") {
          if (selectedType === "MULTIPLE_CHOICE") {
            return optionIndex === index
              ? {
                  ...option,
                  isCorrect: !option.isCorrect,
                }
              : option;
          }

          return {
            ...option,
            isCorrect: optionIndex === index,
          };
        }

        return optionIndex === index
          ? {
              ...option,
              [field]: value,
            }
          : option;
      }),
    );
  };

  const addMcqOption = () => {
    setMcqOptions((current) => [
      ...current,
      {
        label: String.fromCharCode(65 + current.length),
        optionOrder: current.length + 1,
        optionText: "",
        isCorrect: false,
      },
    ]);
  };

  const removeMcqOption = (index) => {
    setMcqOptions((current) =>
      current.length <= 2
        ? current
        : current
            .filter((_, optionIndex) => optionIndex !== index)
            .map((option, optionIndex) => ({
              ...option,
              label: String.fromCharCode(65 + optionIndex),
              optionOrder: optionIndex + 1,
            })),
    );
  };

  const updateRow = (setter, index, field, value) => {
    setter((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const removeRow = (setter, index) => {
    setter((current) =>
      current.length <= 1
        ? current
        : current.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  const clearQuestionFields = () => {
    setCourseId("");
    setSubjectId("");
    setChapterId("");
    setTopicId("");
    setQuestionTypeId("");
    setQuestionText("");
    setMarks("1");

    setMcqOptions(emptyMcqOptions());
    setAttributeRows([emptyAttributeRow()]);
    setLedgerRows([emptyLedgerRow()]);
    setMatchingPairs(emptyMatchingPairs());
    setBlanks(emptyBlanks());

    setEditingDraftId(null);
    setFormError("");

    setMessage({
      type: "",
      text: "",
    });
  };

  const headerIdForAttribute = (attributeId) => {
    const attribute = tableAttributes.find(
      (item) => String(idOf(item, "attribute")) === String(attributeId),
    );

    const headerName =
      attribute?.tableHeaderName ?? attribute?.table_header_name;

    const header = tableHeaders.find(
      (item) =>
        String(item?.name ?? "")
          .trim()
          .toLowerCase() ===
        String(headerName ?? "")
          .trim()
          .toLowerCase(),
    );

    const headerId = idOf(header, "header");

    return headerId == null ? null : Number(headerId);
  };

  const buildPayload = () => {
    const common = {
      courseId: Number(courseId),
      chapterId: Number(chapterId),
      topicId: Number(topicId),
      questionTypeId: Number(questionTypeId),
      questionText: questionText.trim(),
    };

    if (isMatchingType(selectedType)) {
      return {
        ...common,
        subjectId: Number(subjectId),
        pairs: matchingPairs.map((pair, index) => ({
          columnA: pair.columnA.trim(),
          columnB: pair.columnB.trim(),
          displayOrder: index + 1,
        })),
      };
    }

    if (isFillBlankType(selectedType)) {
      let answerOrder = 0;

      const blankAnswers = blanks.flatMap((blank, blankIndex) =>
        blank.acceptedAnswers
          .split(",")
          .map((answer) => answer.trim())
          .filter(Boolean)
          .map((answer) => ({
            answerText: answer,
            displayOrder: ++answerOrder,
            blankNumber: blankIndex + 1,
          })),
      );

      return {
        ...common,
        subjectId: Number(subjectId),

        blanks: blanks.map((blank, index) => ({
          blankNumber: index + 1,
          acceptedAnswers: blank.acceptedAnswers
            .split(",")
            .map((answer) => answer.trim())
            .filter(Boolean),
        })),

        answers: blankAnswers,
      };
    }

    if (isMcqType(selectedType)) {
      return {
        ...common,
        marks: Number(marks),

        options: mcqOptions.map(({ optionOrder, optionText, isCorrect }) => ({
          optionOrder,
          optionText: optionText.trim(),
          isCorrect,
        })),
      };
    }

    const questionAttributes =
      selectedType === "DRAG_AND_DROP"
        ? ledgerRows.flatMap((row) => {
            const attributes = [];

            if (row.debitAttributeId) {
              attributes.push({
                headerId: headerIdForAttribute(row.debitAttributeId),
                attributeId: Number(row.debitAttributeId),
                transaction: "Debit",
                amount: parseOptionalNumber(row.debitAmount),
                amount2: null,
              });
            }

            if (row.creditAttributeId) {
              attributes.push({
                headerId: headerIdForAttribute(row.creditAttributeId),
                attributeId: Number(row.creditAttributeId),
                transaction: "Credit",
                amount: parseOptionalNumber(row.creditAmount),
                amount2: null,
              });
            }

            return attributes;
          })
        : attributeRows.map((row) => ({
            headerId: headerIdForAttribute(row.attributeId),
            attributeId: Number(row.attributeId),
            transaction: row.attributeId,
            amount: parseOptionalNumber(row.amount),
            amount2: parseOptionalNumber(row.amount2),
            note: null,
          }));

    return {
      ...common,
      subjectId: Number(subjectId),
      questionAttributes,
    };
  };

  const validate = () => {
    const errors = [];

    if (!courseId || !subjectId || !chapterId || !topicId) {
      errors.push("Complete the hierarchy fields.");
    }

    if (!questionTypeId) {
      errors.push("Select a question type.");
    }

    if (!questionText.trim()) {
      errors.push("Enter the question text.");
    }

    if (isMcqType(selectedType)) {
      if (!marks || Number(marks) <= 0) {
        errors.push("Marks must be greater than zero.");
      }

      if (mcqOptions.some((option) => !option.optionText.trim())) {
        errors.push("Enter every option.");
      }

      const correctCount = mcqOptions.filter(
        (option) => option.isCorrect,
      ).length;

      if (selectedType === "SINGLE_CHOICE" && correctCount !== 1) {
        errors.push("Select exactly one correct answer.");
      }

      if (selectedType === "MULTIPLE_CHOICE" && correctCount < 1) {
        errors.push("Select at least one correct answer.");
      }
    } else if (isMatchingType(selectedType)) {
      if (
        matchingPairs.some(
          (pair) => !pair.columnA.trim() || !pair.columnB.trim(),
        )
      ) {
        errors.push("Complete Column A and Column B for every pair.");
      }
    } else if (isFillBlankType(selectedType)) {
      if (blanks.some((blank) => !blank.acceptedAnswers.trim())) {
        errors.push("Add at least one accepted answer for every blank.");
      }
    } else if (selectedType === "DRAG_AND_DROP") {
      if (
        !ledgerRows.some((row) => row.debitAttributeId || row.creditAttributeId)
      ) {
        errors.push("Add at least one debit or credit attribute.");
      }

      if (
        ledgerRows.some(
          (row) =>
            (row.debitAttributeId &&
              !headerIdForAttribute(row.debitAttributeId)) ||
            (row.creditAttributeId &&
              !headerIdForAttribute(row.creditAttributeId)),
        )
      ) {
        errors.push("A selected transaction is not linked to a table header.");
      }
    } else if (attributeRows.some((row) => !row.attributeId)) {
      errors.push("Select a transaction for every row.");
    } else if (
      attributeRows.some((row) => !headerIdForAttribute(row.attributeId))
    ) {
      errors.push("A selected transaction is not linked to a table header.");
    }

    if (errors.length) {
      setFormError(errors.join(" "));
      return false;
    }

    setFormError("");
    return true;
  };

  const addToPreview = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const draft = {
      id: editingDraftId ?? `${Date.now()}-${Math.random()}`,

      type: selectedType,

      typeLabel: typeLabel(selectedType),

      hierarchy: {
        ...selectedNames,
      },

      payload: buildPayload(),

      snapshot: {
        courseId,
        subjectId,
        chapterId,
        topicId,
        questionTypeId,
        questionText,
        marks,
        mcqOptions,
        attributeRows,
        ledgerRows,
        matchingPairs,
        blanks,
      },
    };

    setDrafts((current) =>
      editingDraftId
        ? current.map((item) => (item.id === editingDraftId ? draft : item))
        : [...current, draft],
    );

    setMessage({
      type: "success",
      text: editingDraftId ? "Preview updated." : "Question added to preview.",
    });
    setEditingDraftId(null);
    setFormError("");
  };

  const editDraft = (draft) => {
    const snapshot = draft.snapshot;

    setCourseId(snapshot.courseId);
    setSubjectId(snapshot.subjectId);
    setChapterId(snapshot.chapterId);
    setTopicId(snapshot.topicId);
    setQuestionTypeId(snapshot.questionTypeId);
    setQuestionText(snapshot.questionText);
    setMarks(snapshot.marks);

    setMcqOptions(snapshot.mcqOptions);

    setAttributeRows(snapshot.attributeRows);

    setLedgerRows(snapshot.ledgerRows);

    setMatchingPairs(snapshot.matchingPairs ?? emptyMatchingPairs());

    setBlanks(snapshot.blanks ?? emptyBlanks());

    setEditingDraftId(draft.id);

    setFormError("");

    setMessage({
      type: "",
      text: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const submitDrafts = async () => {
    if (!drafts.length) {
      return;
    }

    setSubmitting(true);

    const failed = [];
    const failureMessages = [];
    let savedCount = 0;

    for (const draft of drafts) {
      try {
        if (isMcqType(draft.type)) {
          await McqQuestionService.create(draft.payload);
        } else if (isMatchingType(draft.type)) {
          await MatchingQuestionService.create(draft.payload);
        } else if (isFillBlankType(draft.type)) {
          await FillInBlankQuestionService.create(draft.payload);
        } else {
          await QuestionService.create(draft.payload);
        }

        savedCount += 1;
      } catch (error) {
        console.error("Failed to submit question draft:", error);

        failed.push(draft);

        const responseData = error?.response?.data;

        failureMessages.push(
          (typeof responseData === "string"
            ? responseData
            : responseData?.message) ||
            error?.message ||
            "Question could not be saved.",
        );
      }
    }

    setDrafts(failed);

    setMessage({
      type: failed.length ? "error" : "success",

      text: failed.length
        ? `${savedCount} saved; ${failed.length} failed and remain in preview. ${failureMessages[0]}`
        : `${savedCount} question${
            savedCount === 1 ? "" : "s"
          } submitted successfully.`,
    });

    setSubmitting(false);
  };

  const renderAttributeSelect = (value, onChange) =>
    searchableSelect({
      items: tableAttributes,
      type: "attribute",
      value,
      onChange,
      placeholder: "Search transaction",
    });

  return (
    <main className="all-question-create">
      {/* =====================================================
          HEADER
          ===================================================== */}
      <header className="aq-header">
        <button
          type="button"
          className="aq-back"
          onClick={() => window.history.back()}
        >
          ← Back to Questions
        </button>

        <div className="aq-header-left">
          <div className="aq-title-row">
            <div className="aq-title-content">
              <h1>Create Question</h1>
              <p>
                Add a new question to your question bank. Fill in the details
                below.
              </p>
            </div>

            <div className="aq-stepper" aria-label="Question creation steps">
              <div className="aq-step active">
                <b>1</b>
                <span>Details</span>
              </div>

              <i />

              <div
                className={`aq-step ${
                  isMcqType(selectedType) ? "active-soft" : ""
                }`}
              >
                <b>2</b>
                <span>Answers</span>
              </div>

              <i />

              <div className="aq-step">
                <b>3</b>
                <span>Review</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      {loading ? (
        <div className="aq-state">Loading question form…</div>
      ) : (
        <form onSubmit={addToPreview}>
          {/* Message is INSIDE form so it cannot create
              an extra outer grid row. */}
          {message.text && (
            <div className={`aq-message ${message.type}`}>{message.text}</div>
          )}

          {/* =================================================
              QUESTION DETAILS
              ================================================= */}
          <section className="aq-card">
            <div className="aq-section-heading">
              <span className="aq-section-icon">
                <FaFileAlt />
              </span>

              <div>
                <h2>Question details</h2>

                <p>Provide the basic information about the question.</p>
              </div>
            </div>

            <div className="aq-grid aq-grid-six">
              <label>
                <span className="aq-required-label">
                  Course <em>*</em>
                </span>

                {searchableSelect({
                  items: courses,
                  type: "course",
                  value: courseId,
                  placeholder: "Search course",

                  onChange: (value) => {
                    setCourseId(value);
                    setSubjectId("");
                    setChapterId("");
                    setTopicId("");
                  },
                })}
              </label>

              <label>
                <span className="aq-required-label">
                  Subject <em>*</em>
                </span>

                {searchableSelect({
                  items: filteredSubjects,
                  type: "subject",
                  value: subjectId,
                  placeholder: "Search subject",
                  disabled: !courseId,

                  onChange: (value) => {
                    setSubjectId(value);
                    setChapterId("");
                    setTopicId("");
                  },
                })}
              </label>

              <label>
                <span className="aq-required-label">
                  Chapter <em>*</em>
                </span>

                {searchableSelect({
                  items: filteredChapters,
                  type: "chapter",
                  value: chapterId,
                  placeholder: "Search chapter",
                  disabled: !subjectId,

                  onChange: (value) => {
                    setChapterId(value);
                    setTopicId("");
                  },
                })}
              </label>

              <label>
                <span className="aq-required-label">
                  Topic <em>*</em>
                </span>

                {searchableSelect({
                  items: filteredTopics,
                  type: "topic",
                  value: topicId,
                  placeholder: "Search topic",
                  disabled: !chapterId,
                  onChange: setTopicId,
                })}
              </label>

              <label>
                <span className="aq-required-label">
                  Question type <em>*</em>
                </span>

                {searchableSelect({
                  items: questionTypes,
                  type: "questionType",
                  value: questionTypeId,
                  placeholder: "Search question type",

                  getLabel: (item) =>
                    typeLabel(normalizeType(labelOf(item, "questionType"))),

                  onChange: (value) => {
                    setQuestionTypeId(value);

                    setMcqOptions(emptyMcqOptions());

                    setAttributeRows([emptyAttributeRow()]);

                    setLedgerRows([emptyLedgerRow()]);

                    setMatchingPairs(emptyMatchingPairs());

                    setBlanks(emptyBlanks());
                  },
                })}
              </label>

              {isMcqType(selectedType) && (
                <label>
                  <span className="aq-required-label">
                    Marks <em>*</em>
                  </span>

                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={marks}
                    onChange={(event) => setMarks(event.target.value)}
                  />
                </label>
              )}
            </div>

            <label className="aq-question-text">
              <span className="aq-required-label">
                Question text <em>*</em>
              </span>

              <div className="aq-editor">
                <div className="aq-editor-toolbar" aria-hidden="true">
                  <button type="button">B</button>

                  <button type="button">
                    <i>I</i>
                  </button>

                  <button type="button">
                    <u>U</u>
                  </button>

                  <button type="button">S</button>

                  <span />

                  <button type="button">≡</button>

                  <button type="button">☷</button>

                  <button type="button">☰</button>

                  <span />

                  <button type="button">↗</button>

                  <button type="button">▧</button>

                  <button type="button">&lt;/&gt;</button>
                </div>

                <textarea
                  maxLength={500}
                  value={questionText}
                  onChange={(event) => setQuestionText(event.target.value)}
                  placeholder="Enter the question"
                />
              </div>

              <small>{questionText.length} / 500</small>
            </label>
          </section>

          {/* =================================================
              MCQ
              ================================================= */}
          {isMcqType(selectedType) && (
            <section className="aq-card">
              <div className="aq-section-heading">
                <span className="aq-section-icon">
                  <FaListUl />
                </span>

                <div>
                  <h2>Answer options</h2>

                  <p>
                    {selectedType === "SINGLE_CHOICE"
                      ? "Choose one correct answer."
                      : "Choose every correct answer."}
                  </p>
                </div>

                <button
                  type="button"
                  className="aq-secondary"
                  onClick={addMcqOption}
                >
                  <FaPlus />
                  Add option
                </button>
              </div>

              <div className="aq-option-list">
                {mcqOptions.map((option, index) => (
                  <div
                    className={`aq-option ${option.isCorrect ? "correct" : ""}`}
                    key={option.optionOrder}
                  >
                    <b>{option.label}</b>

                    <input
                      value={option.optionText}
                      onChange={(event) =>
                        updateMcqOption(index, "optionText", event.target.value)
                      }
                      placeholder={`Option ${option.label}`}
                    />

                    <input
                      aria-label={`Mark option ${option.label} correct`}
                      type={
                        selectedType === "MULTIPLE_CHOICE"
                          ? "checkbox"
                          : "radio"
                      }
                      name="correct-option"
                      checked={option.isCorrect}
                      onChange={() => updateMcqOption(index, "isCorrect", true)}
                    />

                    <button
                      type="button"
                      onClick={() => removeMcqOption(index)}
                      disabled={mcqOptions.length <= 2}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* =================================================
              DRAG AND DROP
              ================================================= */}
          {selectedType === "DRAG_AND_DROP" && (
            <section className="aq-card">
              <div className="aq-section-heading">
                <span className="aq-section-icon">
                  <FaListUl />
                </span>

                <div>
                  <h2>Debit and credit attributes</h2>

                  <p>Build the pairs used by the drag-and-drop question.</p>
                </div>

                <button
                  type="button"
                  className="aq-secondary"
                  onClick={() =>
                    setLedgerRows((current) => [...current, emptyLedgerRow()])
                  }
                >
                  <FaPlus />
                  Add row
                </button>
              </div>

              <div className="aq-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Debit</th>
                      <th>Debit amount</th>
                      <th>Credit</th>
                      <th>Credit amount</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {ledgerRows.map((row, index) => (
                      <tr key={index}>
                        <td>
                          {renderAttributeSelect(
                            row.debitAttributeId,
                            (value) =>
                              updateRow(
                                setLedgerRows,
                                index,
                                "debitAttributeId",
                                value,
                              ),
                          )}
                        </td>

                        <td>
                          <input
                            type="number"
                            value={row.debitAmount}
                            onChange={(event) =>
                              updateRow(
                                setLedgerRows,
                                index,
                                "debitAmount",
                                event.target.value,
                              )
                            }
                          />
                        </td>

                        <td>
                          {renderAttributeSelect(
                            row.creditAttributeId,
                            (value) =>
                              updateRow(
                                setLedgerRows,
                                index,
                                "creditAttributeId",
                                value,
                              ),
                          )}
                        </td>

                        <td>
                          <input
                            type="number"
                            value={row.creditAmount}
                            onChange={(event) =>
                              updateRow(
                                setLedgerRows,
                                index,
                                "creditAmount",
                                event.target.value,
                              )
                            }
                          />
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => removeRow(setLedgerRows, index)}
                            disabled={ledgerRows.length <= 1}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =================================================
              MATCHING
              ================================================= */}
          {isMatchingType(selectedType) && (
            <section className="aq-card">
              <div className="aq-section-heading">
                <span className="aq-section-icon">
                  <FaListUl />
                </span>

                <div>
                  <h2>Match the following</h2>

                  <p>Create the pairs that belong together.</p>
                </div>

                <button
                  type="button"
                  className="aq-secondary"
                  onClick={() =>
                    setMatchingPairs((current) => [
                      ...current,
                      emptyMatchingPair(),
                    ])
                  }
                >
                  <FaPlus />
                  Add pair
                </button>
              </div>

              <div className="aq-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Column A</th>
                      <th>Column B</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {matchingPairs.map((pair, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            value={pair.columnA}
                            onChange={(event) =>
                              updateRow(
                                setMatchingPairs,
                                index,
                                "columnA",
                                event.target.value,
                              )
                            }
                            placeholder="Enter Column A"
                          />
                        </td>

                        <td>
                          <input
                            value={pair.columnB}
                            onChange={(event) =>
                              updateRow(
                                setMatchingPairs,
                                index,
                                "columnB",
                                event.target.value,
                              )
                            }
                            placeholder="Enter Column B"
                          />
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => removeRow(setMatchingPairs, index)}
                            disabled={matchingPairs.length <= 1}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =================================================
              FILL BLANK
              ================================================= */}
          {isFillBlankType(selectedType) && (
            <section className="aq-card">
              <div className="aq-section-heading">
                <span className="aq-section-icon">
                  <FaListUl />
                </span>

                <div>
                  <h2>Blank answers</h2>

                  <p>
                    Add accepted answers for each blank, separated by commas.
                  </p>
                </div>

                <button
                  type="button"
                  className="aq-secondary"
                  onClick={() =>
                    setBlanks((current) => [
                      ...current,
                      emptyBlank(current.length),
                    ])
                  }
                >
                  <FaPlus />
                  Add blank
                </button>
              </div>

              <div className="aq-fill-blank-list">
                {blanks.map((blank, index) => (
                  <div className="aq-fill-blank-row" key={index}>
                    <b>{blank.label}</b>

                    <input
                      value={blank.acceptedAnswers}
                      onChange={(event) =>
                        updateRow(
                          setBlanks,
                          index,
                          "acceptedAnswers",
                          event.target.value,
                        )
                      }
                      placeholder="Accepted answers, e.g. Java, java"
                    />

                    <button
                      type="button"
                      onClick={() => removeRow(setBlanks, index)}
                      disabled={blanks.length <= 1}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* =================================================
              GENERIC ATTRIBUTES
              ================================================= */}
          {selectedType &&
            !isMcqType(selectedType) &&
            selectedType !== "DRAG_AND_DROP" &&
            !isMatchingType(selectedType) &&
            !isFillBlankType(selectedType) && (
              <section className="aq-card">
                <div className="aq-section-heading">
                  <span className="aq-section-icon">
                    <FaListUl />
                  </span>

                  <div>
                    <h2>Question attributes</h2>

                    <p>
                      Configure the transactions and amounts for this{" "}
                      {typeLabel(selectedType).toLowerCase()} question.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="aq-secondary"
                    onClick={() =>
                      setAttributeRows((current) => [
                        ...current,
                        emptyAttributeRow(),
                      ])
                    }
                  >
                    <FaPlus />
                    Add row
                  </button>
                </div>

                <div className="aq-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Amount 1</th>
                        <th>Amount 2</th>
                        <th />
                      </tr>
                    </thead>

                    <tbody>
                      {attributeRows.map((row, index) => (
                        <tr key={index}>
                          <td>
                            {renderAttributeSelect(row.attributeId, (value) =>
                              updateRow(
                                setAttributeRows,
                                index,
                                "attributeId",
                                value,
                              ),
                            )}
                          </td>

                          <td>
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(event) =>
                                updateRow(
                                  setAttributeRows,
                                  index,
                                  "amount",
                                  event.target.value,
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              value={row.amount2}
                              onChange={(event) =>
                                updateRow(
                                  setAttributeRows,
                                  index,
                                  "amount2",
                                  event.target.value,
                                )
                              }
                            />
                          </td>

                          <td>
                            <button
                              type="button"
                              onClick={() => removeRow(setAttributeRows, index)}
                              disabled={attributeRows.length <= 1}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

          {/* =================================================
              FORM ERROR
              ================================================= */}
          {formError && (
            <div className="aq-form-error" role="alert">
              {formError}
            </div>
          )}

          {/* =================================================
              BOTTOM ACTIONS
              ================================================= */}
          <div className="aq-bottom-actions">
            <div className="aq-draft-status">
              <span className="aq-status-dot" />

              <div>
                <strong>Draft saved</strong>

                <small>
                  {drafts.length
                    ? `${drafts.length} question${
                        drafts.length === 1 ? "" : "s"
                      } ready`
                    : "Last saved just now"}
                </small>
              </div>
            </div>

            <div className="aq-bottom-buttons">
              <button
                type="button"
                className="aq-clear"
                onClick={clearQuestionFields}
              >
                Clear question
              </button>

              <button type="submit" className="aq-secondary">
                <FaPlus />

                {editingDraftId ? "Update preview" : "Save & Preview"}
              </button>

              <button
                type="button"
                className="aq-primary"
                disabled={!drafts.length || submitting}
                onClick={submitDrafts}
              >
                <FaSave />

                {submitting ? "Submitting…" : "Save Question"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =====================================================
          LIVE PREVIEW
          ===================================================== */}
      <section
        className={`aq-preview${
          isPreviewFullscreen ? " aq-preview-fullscreen" : ""
        }`}
      >
        <div className="aq-preview-heading">
          <div>
            <span>LIVE PREVIEW</span>

            <h2>How your question will appear in the exam.</h2>
          </div>

          {isPreviewFullscreen ? (
            <button
              type="button"
              className="aq-fullscreen"
              onClick={() => setIsPreviewFullscreen(false)}
            >
              <FaTimes />
              &nbsp; Close Preview
            </button>
          ) : (
            <button
              type="button"
              className="aq-fullscreen"
              onClick={() => setIsPreviewFullscreen(true)}
            >
              <FaExpand />
              &nbsp; View Fullscreen
            </button>
          )}
        </div>

        <div className="aq-live-card">
          <div className="aq-live-meta">
            <span>
              {selectedType ? typeLabel(selectedType) : "Question Type"}
            </span>

            {isMcqType(selectedType) && (
              <strong>
                {marks || 1} Mark
                {Number(marks) === 1 ? "" : "s"}
              </strong>
            )}
          </div>

          {questionText.trim() ||
          mcqOptions.some((option) => option.optionText.trim()) ? (
            <>
              <div className="aq-live-question">
                <b>Q1.</b>

                <p>
                  {questionText.trim() || "Your question will appear here."}
                </p>
              </div>

              {isMcqType(selectedType) && (
                <div className="aq-live-options">
                  {mcqOptions.map((option) => (
                    <div
                      className={`aq-live-option ${
                        option.isCorrect ? "correct" : ""
                      }`}
                      key={option.optionOrder}
                    >
                      <span className="aq-live-radio">
                        {option.isCorrect ? "✓" : ""}
                      </span>

                      <b>{option.label}.</b>

                      <span>
                        {option.optionText || `Option ${option.label}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {isMcqType(selectedType) &&
                mcqOptions.some((option) => option.isCorrect) && (
                  <div className="aq-correct-answer">
                    <strong>●&nbsp; Correct Answer</strong>

                    <span>
                      {mcqOptions
                        .filter((option) => option.isCorrect)
                        .map((option) => `Option ${option.label}`)
                        .join(", ")}
                    </span>
                  </div>
                )}
            </>
          ) : (
            <div className="aq-live-empty">
              Your question preview will appear here.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default CreateAllQuestions;
