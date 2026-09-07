import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaSave, FaTrash } from "react-icons/fa";
import CourseService from "../../services/CourseService";
import SubjectService from "../../services/SubjectService";
import ChapterService from "../../services/ChapterService";
import TopicService from "../../services/TopicService";
import McqQuestionService from "../../services/McqQuestionService";
import QuestionTypeService from "../../services/QuestionTypeService";
import "./CreateMcq.css";

const emptyOptions = () =>
  ["A", "B", "C", "D"].map((label, index) => ({
    optionOrder: index + 1,
    optionText: "",
    isCorrect: false,
    label,
  }));

const itemId = (item, type) =>
  item[`${type}Id`] ?? item[`${type}_id`] ?? item.id;

const itemName = (item) =>
  item.name ??
  item.subjectName ??
  item.courseName ??
  item.chapterName ??
  item.topicName ??
  item.course_name ??
  item.subject_name ??
  item.chapter_name ??
  item.topic_name ??
  "";

const mcqTypeName = (item) =>
  String(item.questionType ?? item.question_type ?? "").toUpperCase();

function CreateMcq() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("SINGLE_CHOICE");
  const [options, setOptions] = useState(emptyOptions);
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingDraftIndex, setEditingDraftIndex] = useState(null);

  useEffect(() => {
    const loadHierarchy = async () => {
      setLoading(true);
      try {
        const [
          courseResponse,
          subjectResponse,
          chapterResponse,
          topicResponse,
          questionTypeResponse,
        ] = await Promise.all([
          CourseService.getAllCourses(),
          SubjectService.getAll(),
          ChapterService.getAll(),
          TopicService.getAll(),
          QuestionTypeService.getAll(),
        ]);
        setCourses(Array.isArray(courseResponse.data) ? courseResponse.data : []);
        setSubjects(
          Array.isArray(subjectResponse.data) ? subjectResponse.data : [],
        );
        setChapters(
          Array.isArray(chapterResponse.data) ? chapterResponse.data : [],
        );
        setTopics(
          Array.isArray(topicResponse.data) ? topicResponse.data : [],
        );
        setQuestionTypes(
          (Array.isArray(questionTypeResponse.data)
            ? questionTypeResponse.data
            : []
          ).filter((item) =>
            ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(mcqTypeName(item)),
          ),
        );
      } catch (error) {
        console.error("Failed to load MCQ hierarchy:", error);
        setMessage({ type: "error", text: "Unable to load course details." });
      } finally {
        setLoading(false);
      }
    };
    loadHierarchy();
  }, []);

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) =>
          String(subject.courseId ?? subject.course_id) === String(courseId),
      ),
    [subjects, courseId],
  );

  const filteredChapters = useMemo(
    () =>
      chapters.filter(
        (chapter) =>
          String(chapter.subjectId ?? chapter.subject_id) === String(subjectId),
      ),
    [chapters, subjectId],
  );

  const filteredTopics = useMemo(
    () =>
      topics.filter(
        (topic) =>
          String(topic.chapterId ?? topic.chapter_id) === String(chapterId),
      ),
    [topics, chapterId],
  );

  const updateOption = (index, value) => {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, optionText: value } : option,
      ),
    );
  };

  const selectCorrect = (index) => {
    setOptions((current) => {
      if (questionType === "MULTIPLE_CHOICE") {
        return current.map((option, optionIndex) =>
          optionIndex === index
            ? { ...option, isCorrect: !option.isCorrect }
            : option,
        );
      }

      return current.map((option, optionIndex) => ({
        ...option,
        isCorrect: optionIndex === index,
      }));
    });
  };

  const addOption = () => {
    setOptions((current) => [
      ...current,
      {
        optionOrder: current.length + 1,
        optionText: "",
        isCorrect: false,
        label: String.fromCharCode(65 + current.length),
      },
    ]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions((current) =>
      current
        .filter((_, optionIndex) => optionIndex !== index)
        .map((option, optionIndex) => ({
          ...option,
          optionOrder: optionIndex + 1,
          label: String.fromCharCode(65 + optionIndex),
        })),
    );
  };

  const resetQuestion = () => {
    setQuestionText("");
    setQuestionType("SINGLE_CHOICE");
    setOptions(emptyOptions());
    setEditingDraftIndex(null);
  };

  const validateQuestion = () => {
    setMessage({ type: "", text: "" });
    const errors = [];
    if (!courseId) errors.push("Course is required.");
    if (!subjectId) errors.push("Subject is required.");
    if (!chapterId) errors.push("Chapter is required.");
    if (!topicId) errors.push("Topic is required.");
    if (!questionText.trim()) errors.push("Question is required.");
    if (!questionTypes.some((item) => mcqTypeName(item) === questionType)) {
      errors.push("The selected MCQ question type is not configured.");
    }
    if (options.some((option) => !option.optionText.trim())) {
      errors.push("Every option must have text.");
    }
    const correctOptionCount = options.filter((option) => option.isCorrect).length;
    if (
      (questionType === "SINGLE_CHOICE" && correctOptionCount !== 1) ||
      (questionType === "MULTIPLE_CHOICE" && correctOptionCount < 1)
    ) {
      errors.push(
        questionType === "SINGLE_CHOICE"
          ? "Select exactly one correct option."
          : "Select at least one correct option.",
      );
    }
    if (errors.length) {
      setMessage({ type: "error", text: errors.join(" ") });
      return false;
    }
    return true;
  };

  // McqQuestionRequestDTO has no subjectId - subject is only a cascade helper
  // for narrowing the chapter list.
  const buildQuestion = () => ({
    courseId: Number(courseId),
    chapterId: Number(chapterId),
    topicId: Number(topicId),
    questionText: questionText.trim(),
    questionTypeId: Number(
      itemId(
        questionTypes.find((item) => mcqTypeName(item) === questionType),
        "questionType",
      ),
    ),
    questionType,
    marks: 1,
    options: options.map(({ optionOrder, optionText, isCorrect }) => ({
      optionOrder,
      optionText: optionText.trim(),
      isCorrect,
    })),
  });

  const handleAddToPreview = (event) => {
    event.preventDefault();
    if (!validateQuestion()) return;
    const question = buildQuestion();
    if (editingDraftIndex == null) {
      setDraftQuestions((current) => [...current, question]);
      setMessage({ type: "success", text: "Question added to preview." });
    } else {
      setDraftQuestions((current) =>
        current.map((draft, index) =>
          index === editingDraftIndex ? question : draft,
        ),
      );
      setMessage({ type: "success", text: "Question updated in preview." });
    }
    resetQuestion();
  };

  const handleDeleteDraft = (index) => {
    setDraftQuestions((current) =>
      current.filter((_, questionIndex) => questionIndex !== index),
    );
  };

  const handleEditDraft = (index) => {
    const draft = draftQuestions[index];
    // The draft carries no subjectId (it is not part of the payload); recover
    // it from the draft's chapter so the cascade re-populates.
    const draftChapter = chapters.find(
      (chapter) => String(itemId(chapter, "chapter")) === String(draft.chapterId),
    );
    setCourseId(String(draft.courseId));
    setSubjectId(
      String(draftChapter?.subjectId ?? draftChapter?.subject_id ?? ""),
    );
    setChapterId(String(draft.chapterId));
    setTopicId(String(draft.topicId ?? ""));
    setQuestionText(draft.questionText);
    setQuestionType(draft.questionType);
    setOptions(
      draft.options.map((option, optionIndex) => ({
        ...option,
        label: String.fromCharCode(65 + optionIndex),
      })),
    );
    setEditingDraftIndex(index);
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitQuestions = async () => {
    if (draftQuestions.length === 0) {
      setMessage({ type: "error", text: "Add at least one question to preview first." });
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        draftQuestions.map((draftQuestion) =>
          McqQuestionService.create(
            Object.fromEntries(
              Object.entries(draftQuestion).filter(
                ([key]) => key !== "questionType",
              ),
            ),
          ),
        ),
      );
      setMessage({ type: "success", text: `${draftQuestions.length} question(s) submitted successfully.` });
      setDraftQuestions([]);
    } catch (error) {
      console.error("Failed to submit MCQs:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to submit questions.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="create-mcq-container">
      <header className="mcq-header">
        <span className="eyebrow">QUESTION BANK</span>
        <h1>Create Question</h1>
        <p>Create and review questions before publishing them for practice.</p>
      </header>

      {message.text && <div className={`mcq-message ${message.type}`}>{message.text}</div>}
      {loading ? (
        <div className="mcq-state">Loading course details...</div>
      ) : (
        <form onSubmit={handleAddToPreview}>
          <section className="selection-row">
            <label className="selection-field">Course *
              <select value={courseId} onChange={(event) => {
                setCourseId(event.target.value);
                setSubjectId("");
                setChapterId("");
                setTopicId("");
              }}>
                <option value="">Select course</option>
                {courses.map((course) => <option key={itemId(course, "course")} value={itemId(course, "course")}>{itemName(course)}</option>)}
              </select>
            </label>
            <label className="selection-field">Subject *
              <select value={subjectId} disabled={!courseId} onChange={(event) => {
                setSubjectId(event.target.value);
                setChapterId("");
                setTopicId("");
              }}>
                <option value="">Select subject</option>
                {filteredSubjects.map((subject) => <option key={itemId(subject, "subject")} value={itemId(subject, "subject")}>{itemName(subject)}</option>)}
              </select>
            </label>
            <label className="selection-field">Chapter *
              <select value={chapterId} disabled={!subjectId} onChange={(event) => {
                setChapterId(event.target.value);
                setTopicId("");
              }}>
                <option value="">Select chapter</option>
                {filteredChapters.map((chapter) => <option key={itemId(chapter, "chapter")} value={itemId(chapter, "chapter")}>{itemName(chapter)}</option>)}
              </select>
            </label>
            <label className="selection-field">Topic *
              <select value={topicId} disabled={!chapterId} onChange={(event) => setTopicId(event.target.value)}>
                <option value="">Select topic</option>
                {filteredTopics.map((topic) => <option key={itemId(topic, "topic")} value={itemId(topic, "topic")}>{itemName(topic)}</option>)}
              </select>
            </label>
            <label className="selection-field">Question Type *
              <select value={questionType} onChange={(event) => {
                const nextType = event.target.value;
                setQuestionType(nextType);
                if (nextType === "SINGLE_CHOICE") {
                  setOptions((current) => {
                    let foundCorrect = false;
                    return current.map((option) => {
                      if (option.isCorrect && !foundCorrect) {
                        foundCorrect = true;
                        return option;
                      }
                      return { ...option, isCorrect: false };
                    });
                  });
                }
              }}>
                {questionTypes.map((type) => {
                  const typeName = mcqTypeName(type);
                  return (
                    <option key={itemId(type, "questionType")} value={typeName}>
                      {typeName === "SINGLE_CHOICE"
                        ? "Multiple Choice (Single Answer)"
                        : "Multiple Choice (Multiple Answer)"}
                    </option>
                  );
                })}
              </select>
            </label>
          </section>

          <section className="question-section">
            <label htmlFor="mcq-question">Question *</label>
            <textarea id="mcq-question" maxLength={500} value={questionText} onChange={(event) => setQuestionText(event.target.value)} placeholder="Enter your question" />
            <div className="character-count">{questionText.length} / 500</div>
          </section>

          <section className="mcq-card">
            <div className="answer-header">
              <div><h2>Answer Options</h2><p>Mark the correct answer.</p></div>
              <button type="button" className="add-option-btn" onClick={addOption}><FaPlus /> Add Option</button>
            </div>
            <div className="options-container">
              {options.map((option, index) => (
                <div className={`option-row ${option.isCorrect ? "correct-option" : ""}`} key={option.optionOrder}>
                  <div className={`option-label ${option.isCorrect ? "correct-label" : ""}`}>{option.label}</div>
                  <input type="text" value={option.optionText} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${option.label}`} />
                  <input type={questionType === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name={questionType === "MULTIPLE_CHOICE" ? `correctAnswer-${option.label}` : "correctAnswer"} checked={option.isCorrect} onChange={() => selectCorrect(index)} aria-label={`Mark option ${option.label} correct`} />
                  <span className={option.isCorrect ? "correct-text" : "incorrect-text"}>{option.isCorrect ? "Correct" : "Incorrect"}</span>
                  <button type="button" className="delete-option-btn" onClick={() => removeOption(index)} disabled={options.length <= 2}><FaTrash /></button>
                </div>
              ))}
            </div>
          </section>

          <footer className="mcq-footer">
            <button type="button" className="cancel-btn" onClick={resetQuestion}>Clear</button>
            <button type="submit" className="save-btn" disabled={saving}><FaPlus /> {editingDraftIndex == null ? "Add to Preview" : "Update Preview"}</button>
          </footer>
        </form>
      )}

      <section className="mcq-preview">
        <div className="preview-heading">
          <div>
            <h2>Question Preview</h2>
            <p>Review your questions before submitting them.</p>
          </div>
          <span className="preview-count">{draftQuestions.length} question{draftQuestions.length === 1 ? "" : "s"}</span>
        </div>
        {draftQuestions.length === 0 ? (
          <div className="preview-empty">No questions added yet.</div>
        ) : (
          <div className="preview-list">
            {draftQuestions.map((draftQuestion, index) => (
              <article className="preview-card" key={`${draftQuestion.questionText}-${index}`}>
                <div className="preview-card-top">
                  <span>Question {index + 1}</span>
                  <div className="preview-actions">
                    <button type="button" className="preview-edit" onClick={() => handleEditDraft(index)}><FaEdit /> Edit</button>
                    <button type="button" className="preview-delete" onClick={() => handleDeleteDraft(index)}><FaTrash /> Delete</button>
                  </div>
                </div>
                <h3>{draftQuestion.questionText}</h3>
                <div className="preview-options">
                  {draftQuestion.options.map((option) => (
                    <span className={option.isCorrect ? "preview-correct" : ""} key={option.optionOrder}>
                      {String.fromCharCode(64 + option.optionOrder)}. {option.optionText}
                    </span>
                  ))}
                </div>
                <small>{draftQuestion.marks} mark &middot; {draftQuestion.questionType === "SINGLE_CHOICE" ? "Single answer" : "Multiple answer"}</small>
              </article>
            ))}
          </div>
        )}
        <button type="button" className="submit-questions-btn" onClick={handleSubmitQuestions} disabled={saving || draftQuestions.length === 0}>
          <FaSave /> {saving ? "Submitting..." : `Submit ${draftQuestions.length || ""} Question${draftQuestions.length === 1 ? "" : "s"} for Practice`}
        </button>
      </section>
    </main>
  );
}

export default CreateMcq;
