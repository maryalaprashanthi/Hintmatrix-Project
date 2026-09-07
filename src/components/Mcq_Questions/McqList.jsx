import { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaChevronDown, FaEdit, FaTrash } from "react-icons/fa";
import CourseService from "../../services/CourseService";
import SubjectService from "../../services/SubjectService";
import ChapterService from "../../services/ChapterService";
import TopicService from "../../services/TopicService";
import McqQuestionService from "../../services/McqQuestionService";
import QuestionTypeService from "../../services/QuestionTypeService";
import ConfirmDialog from "../Common/ConfirmDialog";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../Toast/useToast";
import "./McqList.css";

const idOf = (item, type) => item[`${type}Id`] ?? item[`${type}_id`] ?? item.id;
const nameOf = (item) =>
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

function McqList() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [openQuestion, setOpenQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    Promise.all([
      CourseService.getAllCourses(),
      SubjectService.getAll(),
      ChapterService.getAll(),
      TopicService.getAll(),
      QuestionTypeService.getAll(),
    ])
      .then(
        ([courseResponse, subjectResponse, chapterResponse, topicResponse, questionTypeResponse]) => {
          setCourses(
            Array.isArray(courseResponse.data) ? courseResponse.data : [],
          );
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
        },
      )
      .catch((requestError) => {
        console.error("Failed to load MCQ filters:", requestError);
        setError("Unable to load course, subject, chapter and topic filters.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (item) =>
          String(item.courseId ?? item.course_id) === String(courseId),
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

  useEffect(() => {
    if (!courseId || !subjectId || !chapterId || !topicId) {
      setQuestions([]);
      return;
    }

    setLoadingQuestions(true);
    setError("");
    setOpenQuestion(null);
    McqQuestionService.getByFilter(courseId, chapterId, topicId)
      .then((response) =>
        setQuestions(Array.isArray(response.data) ? response.data : []),
      )
      .catch((requestError) => {
        console.error("Failed to load MCQ questions:", requestError);
        setError("Unable to load questions for this topic.");
      })
      .finally(() => setLoadingQuestions(false));
  }, [courseId, subjectId, chapterId, topicId]);

  const del = useDeleteConfirm({
    entity: "question",
    deleteFn: async (question) => {
      await McqQuestionService.delete(question.questionId);
      setQuestions((current) =>
        current.filter((q) => q.questionId !== question.questionId),
      );
    },
  });

  const startEditing = (question) => {
    setOpenQuestion(question.questionId);
    setEditingQuestion({
      ...question,
      questionType: question.questionType || "SINGLE_CHOICE",
      options: (question.options || []).map((option, index) => ({
        ...option,
        optionOrder: option.optionOrder ?? index + 1,
        optionText: option.optionText || "",
        isCorrect: option.isCorrect === true || option.isCorrect === "true",
      })),
    });
  };

  const updateEditOption = (index, value) => {
    setEditingQuestion((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, optionText: value } : option,
      ),
    }));
  };

  const addEditOption = () => {
    setEditingQuestion((current) => ({
      ...current,
      options: [
        ...current.options,
        {
          optionOrder: current.options.length + 1,
          optionText: "",
          isCorrect: false,
        },
      ],
    }));
  };

  const removeEditOption = (index) => {
    setEditingQuestion((current) => {
      if (current.options.length <= 2) return current;
      return {
        ...current,
        options: current.options
          .filter((_, optionIndex) => optionIndex !== index)
          .map((option, optionIndex) => ({
            ...option,
            optionOrder: optionIndex + 1,
          })),
      };
    });
  };

  const selectEditCorrect = (index) => {
    setEditingQuestion((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => ({
        ...option,
        isCorrect:
          current.questionType === "MULTIPLE_CHOICE"
            ? optionIndex === index
              ? !option.isCorrect
              : option.isCorrect
            : optionIndex === index,
      })),
    }));
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editingQuestion?.questionText?.trim()) {
      setError("Question text is required.");
      return;
    }
    const correctOptionCount = editingQuestion.options.filter(
      (option) => option.isCorrect,
    ).length;
    if (
      editingQuestion.options.some((option) => !option.optionText.trim()) ||
      correctOptionCount === 0 ||
      (editingQuestion.questionType === "SINGLE_CHOICE" &&
        correctOptionCount !== 1)
    ) {
      setError(
        editingQuestion.questionType === "SINGLE_CHOICE"
          ? "Enter all options and select one correct answer."
          : "Enter all options and select at least one correct answer.",
      );
      return;
    }

    setSavingEdit(true);
    try {
      await McqQuestionService.update(editingQuestion.questionId, {
        courseId: Number(editingQuestion.courseId ?? courseId),
        chapterId: Number(editingQuestion.chapterId ?? chapterId),
        topicId: Number(editingQuestion.topicId ?? topicId),
        questionText: editingQuestion.questionText.trim(),
        questionTypeId: Number(editingQuestion.questionTypeId),
        marks: 1,
        options: editingQuestion.options.map((option, index) => ({
          ...(option.optionId ? { optionId: option.optionId } : {}),
          optionOrder: index + 1,
          optionText: option.optionText.trim(),
          isCorrect: option.isCorrect,
        })),
      });
      const refreshed = await McqQuestionService.getById(editingQuestion.questionId);
      const updatedQuestion = refreshed.data || editingQuestion;
      setQuestions((current) =>
        current.map((question) =>
          question.questionId === editingQuestion.questionId ? updatedQuestion : question,
        ),
      );
      setEditingQuestion(null);
      setError("");
      toast.success("Question updated.");
    } catch (requestError) {
      console.error("Failed to update MCQ question:", requestError);
      setError(requestError.response?.data?.message || "Question could not be updated.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <main className="mcq-list-page">
      <header className="mcq-list-header">
        <span className="eyebrow">QUESTION BANK</span>
        <h1>MCQ Questions</h1>
        <p>Manage questions by course, subject, chapter and topic.</p>
      </header>

      {error && <div className="mcq-list-message">{error}</div>}

      {loading ? (
        <div className="mcq-list-state">Loading filters...</div>
      ) : (
        <>
          <section className="mcq-list-filters">
            <label>
              Course
              <select
                value={courseId}
                onChange={(event) => {
                  setCourseId(event.target.value);
                  setSubjectId("");
                  setChapterId("");
                  setTopicId("");
                }}
              >
                <option value="">Select course</option>
                {courses.map((item) => (
                  <option key={idOf(item, "course")} value={idOf(item, "course")}>
                    {nameOf(item)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Subject
              <select
                value={subjectId}
                disabled={!courseId}
                onChange={(event) => {
                  setSubjectId(event.target.value);
                  setChapterId("");
                  setTopicId("");
                }}
              >
                <option value="">Select subject</option>
                {filteredSubjects.map((item) => (
                  <option key={idOf(item, "subject")} value={idOf(item, "subject")}>
                    {nameOf(item)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Chapter
              <select
                value={chapterId}
                disabled={!subjectId}
                onChange={(event) => {
                  setChapterId(event.target.value);
                  setTopicId("");
                }}
              >
                <option value="">Select chapter</option>
                {filteredChapters.map((item) => (
                  <option key={idOf(item, "chapter")} value={idOf(item, "chapter")}>
                    {nameOf(item)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Topic
              <select
                value={topicId}
                disabled={!chapterId}
                onChange={(event) => setTopicId(event.target.value)}
              >
                <option value="">Select topic</option>
                {filteredTopics.map((item) => (
                  <option key={idOf(item, "topic")} value={idOf(item, "topic")}>
                    {nameOf(item)}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {loadingQuestions && (
            <div className="mcq-list-state">Loading questions...</div>
          )}
          {!loadingQuestions && courseId && subjectId && chapterId && topicId &&
            questions.length === 0 && (
              <div className="mcq-list-state">
                No MCQ questions found for the selected topic.
              </div>
            )}

          <section className="mcq-question-list">
            {questions.map((question, index) => {
              const expanded = openQuestion === question.questionId;
              return (
                <article className={`mcq-question-card ${expanded ? "expanded" : ""}`} key={question.questionId}>
                  <button
                    type="button"
                    className="mcq-question-summary"
                    onClick={() =>
                      setOpenQuestion(expanded ? null : question.questionId)
                    }
                  >
                    <span className="question-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="question-summary-text">
                      <strong>{question.questionText}</strong>
                      <small>{question.marks ?? 1} mark &middot; {question.options?.length ?? 0} options</small>
                    </span>
                    <FaChevronDown className="question-chevron" />
                  </button>
                  {expanded && (
                    <div className="mcq-question-details">
                      {editingQuestion?.questionId === question.questionId ? (
                        <form className="mcq-edit-form" onSubmit={saveEdit}>
                          <label>Question
                            <textarea value={editingQuestion.questionText} onChange={(event) => setEditingQuestion((current) => ({ ...current, questionText: event.target.value }))} />
                          </label>
                          <label>Question Type
                            <select value={editingQuestion.questionTypeId} onChange={(event) => setEditingQuestion((current) => {
                              const selectedType = questionTypes.find(
                                (type) => String(idOf(type, "questionType")) === event.target.value,
                              );
                              const questionType = mcqTypeName(selectedType);
                              if (questionType === "SINGLE_CHOICE") {
                                let foundCorrect = false;
                                return {
                                  ...current,
                                  questionTypeId: Number(event.target.value),
                                  questionType,
                                  options: current.options.map((option) => {
                                    if (option.isCorrect && !foundCorrect) {
                                      foundCorrect = true;
                                      return option;
                                    }
                                    return { ...option, isCorrect: false };
                                  }),
                                };
                              }
                              return {
                                ...current,
                                questionTypeId: Number(event.target.value),
                                questionType,
                              };
                            })}>
                              {questionTypes.map((type) => {
                                const typeName = mcqTypeName(type);
                                return (
                                  <option key={idOf(type, "questionType")} value={idOf(type, "questionType")}>
                                    {typeName === "SINGLE_CHOICE" ? "Single Answer" : "Multiple Answers"}
                                  </option>
                                );
                              })}
                            </select>
                          </label>
                          <div className="mcq-edit-options">
                            {editingQuestion.options.map((option, optionIndex) => (
                              <div className="mcq-edit-option" key={option.optionId ?? option.optionOrder}>
                                <span>{String.fromCharCode(65 + optionIndex)}</span>
                                <input value={option.optionText} onChange={(event) => updateEditOption(optionIndex, event.target.value)} />
                                <input type={editingQuestion.questionType === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name={`edit-correct-${question.questionId}`} checked={option.isCorrect} onChange={() => selectEditCorrect(optionIndex)} />
                                <button type="button" className="mcq-edit-remove" onClick={() => removeEditOption(optionIndex)} disabled={editingQuestion.options.length <= 2}><FaTrash /></button>
                              </div>
                            ))}
                          </div>
                          <button type="button" className="mcq-edit-add" onClick={addEditOption}>+ Add Option</button>
                          <div className="mcq-edit-actions">
                            <button type="button" onClick={() => setEditingQuestion(null)}>Cancel</button>
                            <button type="submit" className="mcq-edit-save" disabled={savingEdit}>{savingEdit ? "Saving..." : "Save Changes"}</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="mcq-detail-options">
                            {(question.options || []).map((option, optionIndex) => (
                              <div className={option.isCorrect ? "detail-option correct" : "detail-option"} key={option.optionId ?? option.optionOrder}>
                                <span>{String.fromCharCode(65 + optionIndex)}</span>
                                <em>{option.optionText}</em>
                                {option.isCorrect && <FaCheckCircle aria-label="Correct answer" />}
                              </div>
                            ))}
                          </div>
                          <div className="mcq-question-actions">
                            <button type="button" className="mcq-edit-question" onClick={() => startEditing(question)}><FaEdit /> Edit Question</button>
                            <button type="button" className="mcq-delete-question" onClick={() => del.request(question)}><FaTrash /> Delete Question</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        </>
      )}

      <ConfirmDialog
        open={Boolean(del.pending)}
        title="Delete this question?"
        body={
          del.pending?.questionText
            ? `"${del.pending.questionText.slice(0, 120)}${
                del.pending.questionText.length > 120 ? "…" : ""
              }" will be removed from the question bank. This can't be undone.`
            : "This question will be removed from the question bank. This can't be undone."
        }
        confirmLabel="Delete question"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </main>
  );
}

export default McqList;
