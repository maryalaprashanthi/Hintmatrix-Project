import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaSave, FaTrash } from "react-icons/fa";
import Select from "react-select";
import ChapterService from "../../services/ChapterService";
import CourseService from "../../services/CourseService";
import McqQuestionService from "../../services/McqQuestionService";
import QuestionService from "../../services/QuestionService";
import QuestionTypeService from "../../services/QuestionTypeService";
import SubjectService from "../../services/SubjectService";
import TableAttributeService from "../../services/TableAttributeService";
import TopicService from "../../services/TopicService";
import "./CreateAllQuestions.css";

const emptyMcqOptions = () =>
  ["A", "B", "C", "D"].map((label, index) => ({
    label,
    optionOrder: index + 1,
    optionText: "",
    isCorrect: false,
  }));

const emptyAttributeRow = () => ({ attributeId: "", amount: "", amount2: "" });
const emptyLedgerRow = () => ({
  debitAttributeId: "",
  debitAmount: "",
  creditAttributeId: "",
  creditAmount: "",
});

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
    attribute:
      item?.name ?? item?.attributeName ?? item?.attribute_name,
  };
  return labels[type] ?? item?.name ?? "";
};

const normalizeType = (value = "") => {
  const normalized = String(value).trim().toUpperCase().replace(/[\s-]+/g, "_");
  return normalized === "DRAGANDDROP" ? "DRAG_AND_DROP" : normalized;
};

const isMcqType = (type) =>
  type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";

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
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
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

  const [drafts, setDrafts] = useState([]);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formError, setFormError] = useState("");

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
        ]);
        setCourses(Array.isArray(responses[0].data) ? responses[0].data : []);
        setSubjects(Array.isArray(responses[1].data) ? responses[1].data : []);
        setChapters(Array.isArray(responses[2].data) ? responses[2].data : []);
        setTopics(Array.isArray(responses[3].data) ? responses[3].data : []);
        setQuestionTypes(Array.isArray(responses[4].data) ? responses[4].data : []);
        setTableAttributes(Array.isArray(responses[5].data) ? responses[5].data : []);
      } catch (error) {
        console.error("Failed to load question creation data:", error);
        setMessage({ type: "error", text: "Unable to load question form data." });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredSubjects = useMemo(
    () => subjects.filter((item) => String(item.courseId ?? item.course_id) === String(courseId)),
    [subjects, courseId],
  );
  const filteredChapters = useMemo(
    () => chapters.filter((item) => String(item.subjectId ?? item.subject_id) === String(subjectId)),
    [chapters, subjectId],
  );
  const filteredTopics = useMemo(
    () => topics.filter((item) => String(item.chapterId ?? item.chapter_id) === String(chapterId)),
    [topics, chapterId],
  );

  const selectedQuestionType = questionTypes.find(
    (item) => String(idOf(item, "questionType")) === String(questionTypeId),
  );
  const selectedType = normalizeType(labelOf(selectedQuestionType, "questionType"));

  const selectedNames = {
    course: labelOf(courses.find((item) => String(idOf(item, "course")) === String(courseId)), "course"),
    subject: labelOf(subjects.find((item) => String(idOf(item, "subject")) === String(subjectId)), "subject"),
    chapter: labelOf(chapters.find((item) => String(idOf(item, "chapter")) === String(chapterId)), "chapter"),
    topic: labelOf(topics.find((item) => String(idOf(item, "topic")) === String(topicId)), "topic"),
  };

  const updateMcqOption = (index, field, value) => {
    setMcqOptions((current) =>
      current.map((option, optionIndex) => {
        if (field === "isCorrect") {
          if (selectedType === "MULTIPLE_CHOICE") {
            return optionIndex === index ? { ...option, isCorrect: !option.isCorrect } : option;
          }
          return { ...option, isCorrect: optionIndex === index };
        }
        return optionIndex === index ? { ...option, [field]: value } : option;
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
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    );
  };

  const removeRow = (setter, index) => {
    setter((current) => current.length <= 1 ? current : current.filter((_, rowIndex) => rowIndex !== index));
  };

  const clearQuestionFields = () => {
    setQuestionText("");
    setMarks("1");
    setMcqOptions(emptyMcqOptions());
    setAttributeRows([emptyAttributeRow()]);
    setLedgerRows([emptyLedgerRow()]);
    setEditingDraftId(null);
    setFormError("");
  };

  const buildPayload = () => {
    const common = {
      courseId: Number(courseId),
      chapterId: Number(chapterId),
      topicId: Number(topicId),
      questionTypeId: Number(questionTypeId),
      questionText: questionText.trim(),
    };

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

    const questionAttributes = selectedType === "DRAG_AND_DROP"
      ? ledgerRows.flatMap((row) => {
          const attributes = [];
          if (row.debitAttributeId) {
            attributes.push({
              headerId: 1,
              attributeId: Number(row.debitAttributeId),
              transaction: "Debit",
              amount: parseOptionalNumber(row.debitAmount),
              amount2: null,
            });
          }
          if (row.creditAttributeId) {
            attributes.push({
              headerId: 3,
              attributeId: Number(row.creditAttributeId),
              transaction: "Credit",
              amount: parseOptionalNumber(row.creditAmount),
              amount2: null,
            });
          }
          return attributes;
        })
      : attributeRows.map((row) => ({
          headerId: 1,
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
    if (!courseId || !subjectId || !chapterId || !topicId) errors.push("Complete the hierarchy fields.");
    if (!questionTypeId) errors.push("Select a question type.");
    if (!questionText.trim()) errors.push("Enter the question text.");

    if (isMcqType(selectedType)) {
      if (!marks || Number(marks) <= 0) errors.push("Marks must be greater than zero.");
      if (mcqOptions.some((option) => !option.optionText.trim())) errors.push("Enter every option.");
      const correctCount = mcqOptions.filter((option) => option.isCorrect).length;
      if (selectedType === "SINGLE_CHOICE" && correctCount !== 1) errors.push("Select exactly one correct answer.");
      if (selectedType === "MULTIPLE_CHOICE" && correctCount < 1) errors.push("Select at least one correct answer.");
    } else if (selectedType === "DRAG_AND_DROP") {
      if (!ledgerRows.some((row) => row.debitAttributeId || row.creditAttributeId)) {
        errors.push("Add at least one debit or credit attribute.");
      }
    } else if (attributeRows.some((row) => !row.attributeId)) {
      errors.push("Select a transaction for every row.");
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
    if (!validate()) return;

    const draft = {
      id: editingDraftId ?? `${Date.now()}-${Math.random()}`,
      type: selectedType,
      typeLabel: typeLabel(selectedType),
      hierarchy: { ...selectedNames },
      payload: buildPayload(),
      snapshot: {
        courseId, subjectId, chapterId, topicId, questionTypeId,
        questionText, marks, mcqOptions, attributeRows, ledgerRows,
      },
    };

    setDrafts((current) =>
      editingDraftId
        ? current.map((item) => item.id === editingDraftId ? draft : item)
        : [...current, draft],
    );
    setMessage({ type: "success", text: editingDraftId ? "Preview updated." : "Question added to preview." });
    clearQuestionFields();
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
    setEditingDraftId(draft.id);
    setFormError("");
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitDrafts = async () => {
    if (!drafts.length) return;
    setSubmitting(true);
    const failed = [];
    let savedCount = 0;

    for (const draft of drafts) {
      try {
        if (isMcqType(draft.type)) {
          await McqQuestionService.create(draft.payload);
        } else {
          await QuestionService.create(draft.payload);
        }
        savedCount += 1;
      } catch (error) {
        console.error("Failed to submit question draft:", error);
        failed.push(draft);
      }
    }

    setDrafts(failed);
    setMessage({
      type: failed.length ? "error" : "success",
      text: failed.length
        ? `${savedCount} saved; ${failed.length} failed and remain in preview.`
        : `${savedCount} question${savedCount === 1 ? "" : "s"} submitted successfully.`,
    });
    setSubmitting(false);
  };

  const renderAttributeSelect = (value, onChange) => (
    searchableSelect({
      items: tableAttributes,
      type: "attribute",
      value,
      onChange,
      placeholder: "Search transaction",
    })
  );

  return (
    <main className="all-question-create">
      <header className="aq-header">
        <span>QUESTION BANK</span>
        <h1>Create Questions</h1>
        <p>Create any question type, preview the batch, then submit it once.</p>
      </header>

      {message.text && <div className={`aq-message ${message.type}`}>{message.text}</div>}

      {loading ? <div className="aq-state">Loading question form…</div> : (
        <form onSubmit={addToPreview}>
          <section className="aq-card">
            <div className="aq-section-heading"><span>01</span><div><h2>Question details</h2><p>Choose where the question belongs and how it behaves.</p></div></div>
            <div className="aq-grid aq-grid-six">
              <label>Course *{searchableSelect({ items: courses, type: "course", value: courseId, placeholder: "Search course", onChange: (value) => { setCourseId(value); setSubjectId(""); setChapterId(""); setTopicId(""); } })}</label>
              <label>Subject *{searchableSelect({ items: filteredSubjects, type: "subject", value: subjectId, placeholder: "Search subject", disabled: !courseId, onChange: (value) => { setSubjectId(value); setChapterId(""); setTopicId(""); } })}</label>
              <label>Chapter *{searchableSelect({ items: filteredChapters, type: "chapter", value: chapterId, placeholder: "Search chapter", disabled: !subjectId, onChange: (value) => { setChapterId(value); setTopicId(""); } })}</label>
              <label>Topic *{searchableSelect({ items: filteredTopics, type: "topic", value: topicId, placeholder: "Search topic", disabled: !chapterId, onChange: setTopicId })}</label>
              <label>Question type *{searchableSelect({ items: questionTypes, type: "questionType", value: questionTypeId, placeholder: "Search question type", getLabel: (item) => typeLabel(normalizeType(labelOf(item, "questionType"))), onChange: (value) => { setQuestionTypeId(value); setMcqOptions(emptyMcqOptions()); setAttributeRows([emptyAttributeRow()]); setLedgerRows([emptyLedgerRow()]); } })}</label>
              {isMcqType(selectedType) && <label>Marks *<input type="number" min="0.25" step="0.25" value={marks} onChange={(event) => setMarks(event.target.value)} /></label>}
            </div>
            <label className="aq-question-text">Question text *<textarea maxLength={500} value={questionText} onChange={(event) => setQuestionText(event.target.value)} placeholder="Enter the question" /><small>{questionText.length} / 500</small></label>
          </section>

          {isMcqType(selectedType) && (
            <section className="aq-card">
              <div className="aq-section-heading"><span>02</span><div><h2>Answer options</h2><p>{selectedType === "SINGLE_CHOICE" ? "Choose one correct answer." : "Choose every correct answer."}</p></div><button type="button" className="aq-secondary" onClick={addMcqOption}><FaPlus /> Add option</button></div>
              <div className="aq-option-list">{mcqOptions.map((option, index) => <div className={`aq-option ${option.isCorrect ? "correct" : ""}`} key={option.optionOrder}><b>{option.label}</b><input value={option.optionText} onChange={(event) => updateMcqOption(index, "optionText", event.target.value)} placeholder={`Option ${option.label}`} /><input aria-label={`Mark option ${option.label} correct`} type={selectedType === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name="correct-option" checked={option.isCorrect} onChange={() => updateMcqOption(index, "isCorrect", true)} /><button type="button" onClick={() => removeMcqOption(index)} disabled={mcqOptions.length <= 2}><FaTrash /></button></div>)}</div>
            </section>
          )}

          {selectedType === "DRAG_AND_DROP" && (
            <section className="aq-card">
              <div className="aq-section-heading"><span>02</span><div><h2>Debit and credit attributes</h2><p>Build the pairs used by the drag-and-drop question.</p></div><button type="button" className="aq-secondary" onClick={() => setLedgerRows((current) => [...current, emptyLedgerRow()])}><FaPlus /> Add row</button></div>
              <div className="aq-table-wrap"><table><thead><tr><th>Debit</th><th>Debit amount</th><th>Credit</th><th>Credit amount</th><th /></tr></thead><tbody>{ledgerRows.map((row, index) => <tr key={index}><td>{renderAttributeSelect(row.debitAttributeId, (value) => updateRow(setLedgerRows, index, "debitAttributeId", value))}</td><td><input type="number" value={row.debitAmount} onChange={(event) => updateRow(setLedgerRows, index, "debitAmount", event.target.value)} /></td><td>{renderAttributeSelect(row.creditAttributeId, (value) => updateRow(setLedgerRows, index, "creditAttributeId", value))}</td><td><input type="number" value={row.creditAmount} onChange={(event) => updateRow(setLedgerRows, index, "creditAmount", event.target.value)} /></td><td><button type="button" onClick={() => removeRow(setLedgerRows, index)} disabled={ledgerRows.length <= 1}><FaTrash /></button></td></tr>)}</tbody></table></div>
            </section>
          )}

          {selectedType && !isMcqType(selectedType) && selectedType !== "DRAG_AND_DROP" && (
            <section className="aq-card">
              <div className="aq-section-heading"><span>02</span><div><h2>Question attributes</h2><p>Configure the transactions and amounts for this {typeLabel(selectedType).toLowerCase()} question.</p></div><button type="button" className="aq-secondary" onClick={() => setAttributeRows((current) => [...current, emptyAttributeRow()])}><FaPlus /> Add row</button></div>
              <div className="aq-table-wrap"><table><thead><tr><th>Transaction</th><th>Amount 1</th><th>Amount 2</th><th /></tr></thead><tbody>{attributeRows.map((row, index) => <tr key={index}><td>{renderAttributeSelect(row.attributeId, (value) => updateRow(setAttributeRows, index, "attributeId", value))}</td><td><input type="number" value={row.amount} onChange={(event) => updateRow(setAttributeRows, index, "amount", event.target.value)} /></td><td><input type="number" value={row.amount2} onChange={(event) => updateRow(setAttributeRows, index, "amount2", event.target.value)} /></td><td><button type="button" onClick={() => removeRow(setAttributeRows, index)} disabled={attributeRows.length <= 1}><FaTrash /></button></td></tr>)}</tbody></table></div>
            </section>
          )}

          {formError && <div className="aq-form-error" role="alert">{formError}</div>}
          <div className="aq-editor-actions"><button type="button" className="aq-clear" onClick={clearQuestionFields}>Clear question</button><button type="submit" className="aq-primary"><FaPlus /> {editingDraftId ? "Update preview" : "Add to preview"}</button></div>
        </form>
      )}

      <section className="aq-preview">
        <div className="aq-preview-heading"><div><span>FINAL REVIEW</span><h2>Question preview</h2><p>Nothing is saved until you submit this batch.</p></div><strong>{drafts.length} draft{drafts.length === 1 ? "" : "s"}</strong></div>
        {drafts.length === 0 ? <div className="aq-empty">Your question previews will appear here.</div> : <div className="aq-drafts">{drafts.map((draft, index) => <article key={draft.id}><div className="aq-draft-top"><span>{String(index + 1).padStart(2, "0")} · {draft.typeLabel}</span><div><button type="button" onClick={() => editDraft(draft)}><FaEdit /> Edit</button><button type="button" onClick={() => setDrafts((current) => current.filter((item) => item.id !== draft.id))}><FaTrash /> Remove</button></div></div><h3>{draft.payload.questionText}</h3><p>{draft.hierarchy.course} / {draft.hierarchy.subject} / {draft.hierarchy.chapter} / {draft.hierarchy.topic}</p>{isMcqType(draft.type) ? <ul>{draft.payload.options.map((option) => <li className={option.isCorrect ? "correct" : ""} key={option.optionOrder}>{String.fromCharCode(64 + option.optionOrder)}. {option.optionText}{option.isCorrect ? " ✓" : ""}</li>)}</ul> : <small>{draft.payload.questionAttributes.length} configured attribute{draft.payload.questionAttributes.length === 1 ? "" : "s"}</small>}</article>)}</div>}
        <button type="button" className="aq-submit" disabled={!drafts.length || submitting} onClick={submitDrafts} title={!drafts.length ? "Add at least one question to preview first" : "Submit all previewed questions"}><FaSave /> {submitting ? "Submitting…" : drafts.length ? `Submit ${drafts.length} question${drafts.length === 1 ? "" : "s"}` : "Submit questions"}</button>
        {!drafts.length && <p className="aq-submit-help">Add a completed question to preview to enable submission.</p>}
      </section>
    </main>
  );
}

export default CreateAllQuestions;
