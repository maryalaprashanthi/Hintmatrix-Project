import { useEffect, useMemo, useState } from "react";
import CourseService from "../../services/CourseService";
import ChapterService from "../../services/ChapterService";
import QuestionCategoryService from "../../services/QuestionCategoryService";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import McqQuestionService from "../../services/McqQuestionService";
import "./McqPractice.css";

const idOf = (item, type) => item[`${type}Id`] ?? item[`${type}_id`] ?? item.id;
const nameOf = (item) => item.name ?? item.course_name ?? item.chapter_name ?? item.category_name ?? "";
function McqPractice() {
  const userId = 1;
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [resettingPractice, setResettingPractice] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [report, setReport] = useState([]);

  const loadTotalScore = async () => {
    try {
      const score = await QuestionAnswerService.getOverallMarks(userId);
      setTotalScore(Number(score) || 0);
    } catch (requestError) {
      console.error("Failed to load total score:", requestError);
    }
  };

  useEffect(() => {
    void loadTotalScore();
  }, [userId]);

  useEffect(() => {
    Promise.all([CourseService.getAllCourses(), ChapterService.getAll(), QuestionCategoryService.getAll()])
      .then(([courseResponse, chapterResponse, categoryResponse]) => {
        setCourses(Array.isArray(courseResponse.data) ? courseResponse.data : []);
        setChapters(Array.isArray(chapterResponse.data) ? chapterResponse.data : []);
        setCategories(Array.isArray(categoryResponse.data) ? categoryResponse.data : []);
      })
      .catch((requestError) => {
        console.error("Failed to load MCQ filters:", requestError);
        setError("Unable to load course details.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredChapters = useMemo(() => chapters.filter((item) => String(item.courseId ?? item.course_id) === String(courseId)), [chapters, courseId]);
  const filteredCategories = useMemo(() => categories.filter((item) => String(item.chapterId ?? item.chapter_id) === String(chapterId)), [categories, chapterId]);

  useEffect(() => {
    if (!courseId || !chapterId || !categoryId) {
      setQuestions([]);
      return;
    }
    setLoadingQuestions(true);
    setError("");
    McqQuestionService.getByFilter(courseId, chapterId, categoryId)
      .then((response) => {
        const loadedQuestions = Array.isArray(response.data)
          ? response.data.map((question) => ({
              ...question,
              options: (question.options || []).map((option) => {
                const practiceOption = { ...option };
                delete practiceOption.isCorrect;
                return practiceOption;
              }),
            }))
          : [];
        setQuestions(loadedQuestions);
        setCurrentIndex(0);
        setAnswers({});
        setSubmitted(false);
        setReport([]);
      })
      .catch((requestError) => {
        console.error("Failed to load MCQs:", requestError);
        setError("Unable to load MCQs for this category.");
      })
      .finally(() => setLoadingQuestions(false));
  }, [courseId, chapterId, categoryId]);

  const submitPractice = async () => {
    if (savingAnswer || submitted || questions.length === 0) {
      return;
    }

    setSavingAnswer(true);
    setError("");
    try {
      const submissionAnswers = questions.map((question) => ({
        questionId: question.questionId,
        selectedOptionIds: Array.isArray(answers[question.questionId])
          ? answers[question.questionId].map(Number)
          : answers[question.questionId] == null
            ? []
            : [Number(answers[question.questionId])],
      }));
      const response = await McqQuestionService.submit(userId, submissionAnswers);
      const responseData = response.data || {};
      const optionText = (question, optionIds) =>
        (question?.options || [])
          .filter((option) =>
            (optionIds || []).some(
              (optionId) => String(optionId) === String(option.optionId),
            ),
          )
          .map((option) => option.optionText)
          .join(", ");
      const results = (responseData.results || []).map((result) => {
        const question = questions.find(
          (item) => String(item.questionId) === String(result.questionId),
        );
        return {
          question,
          selectedText: optionText(question, result.selectedOptionIds) || "Not answered",
          correctText: optionText(question, result.correctOptionIds),
          isCorrect: result.status === "CORRECT",
          status: result.status,
          marksAwarded: result.marksAwarded,
        };
      });
      setReport(results);
      setSubmitted(true);
      await loadTotalScore();
    } catch (requestError) {
      console.error("Failed to submit MCQ answers:", requestError);
      const responseMessage = requestError.response?.data?.message;
      setError(
        typeof responseMessage === "string"
          ? responseMessage
          : "Your answers could not be saved. Please try again.",
      );
    } finally {
      setSavingAnswer(false);
    }
  };

  const resetPractice = async () => {
    if (resettingPractice || !submitted) {
      return;
    }

    setResettingPractice(true);
    setError("");
    try {
      await Promise.all(
        questions.flatMap((question) => [
          QuestionAnswerService.resetAnswersByUserAndQuestion(
            userId,
            question.questionId,
          ),
          QuestionAnswerService.resetAnswerEventsByUserAndQuestion(
            userId,
            question.questionId,
          ),
        ]),
      );
      setAnswers({});
      setReport([]);
      setSubmitted(false);
      setCurrentIndex(0);
      await loadTotalScore();
    } catch (requestError) {
      console.error("Failed to reset MCQ practice:", requestError);
      setError("Your practice attempt could not be reset. Please try again.");
    } finally {
      setResettingPractice(false);
    }
  };

  const chooseAnswer = (questionId, optionId) => {
    const question = questions.find((item) => item.questionId === questionId);
    const isMultipleChoice = question?.questionType === "MULTIPLE_CHOICE";
    const normalizedOptionId = String(optionId);

    setAnswers((current) => {
      if (!isMultipleChoice) {
        return { ...current, [questionId]: normalizedOptionId };
      }

      const selectedOptions = Array.isArray(current[questionId])
        ? current[questionId]
        : [];
      const nextOptions = selectedOptions.some(
        (selectedOption) => String(selectedOption) === normalizedOptionId,
      )
        ? selectedOptions.filter(
            (selectedOption) => String(selectedOption) !== normalizedOptionId,
          )
        : [...selectedOptions, normalizedOptionId];

      return { ...current, [questionId]: nextOptions };
    });
    setSubmitted(false);
    setReport([]);
  };

  const answeredCount = Object.entries(answers).filter(
    ([questionId, selectedAnswer]) =>
      questions.some((question) => String(question.questionId) === questionId) &&
      (Array.isArray(selectedAnswer)
        ? selectedAnswer.length > 0
        : selectedAnswer != null),
  ).length;
  const currentQuestion = questions[currentIndex];

  return (
    <main className="mcq-practice-page">
      <header className="mcq-header">
        <div className="mcq-header-copy">
          <span className="eyebrow">STUDENT PRACTICE</span>
          <h1>Practice MCQs</h1>
          <p>Choose a practice set and answer the questions.</p>
        </div>
        {questions.length > 0 && (
          <div className="practice-summary" aria-label="Practice summary">
            <div className="practice-progress-card">
              <div className="summary-topline">
                <span>Progress</span>
                <strong>{answeredCount}/{questions.length}</strong>
              </div>
              <div className="progress-track" aria-hidden="true">
                <span
                  className="progress-fill"
                  style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
                />
              </div>
              <small>{Math.max(questions.length - answeredCount, 0)} left</small>
            </div>
            <div className="practice-score-card">
              <span>Total Score</span>
              <strong>{totalScore}</strong>
            </div>
          </div>
        )}
      </header>
      {error && <div className="mcq-message error">{error}</div>}
      {loading ? <div className="mcq-state">Loading course details...</div> : (
        <>
          <section className="practice-filters">
            <div className="filter-heading"><span className="filter-step">1</span><div><strong>Choose a practice set</strong></div></div>
            <label>Course<select value={courseId} onChange={(event) => { setCourseId(event.target.value); setChapterId(""); setCategoryId(""); }}><option value="">Select course</option>{courses.map((item) => <option key={idOf(item, "course")} value={idOf(item, "course")}>{nameOf(item)}</option>)}</select></label>
            <label>Chapter<select value={chapterId} disabled={!courseId} onChange={(event) => { setChapterId(event.target.value); setCategoryId(""); }}><option value="">Select chapter</option>{filteredChapters.map((item) => <option key={idOf(item, "chapter")} value={idOf(item, "chapter")}>{nameOf(item)}</option>)}</select></label>
            <label>Category<select value={categoryId} disabled={!chapterId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Select category</option>{filteredCategories.map((item) => <option key={idOf(item, "category")} value={idOf(item, "category")}>{nameOf(item)}</option>)}</select></label>
          </section>
          {loadingQuestions && <div className="mcq-state">Loading questions...</div>}
          {!loadingQuestions && courseId && chapterId && categoryId && questions.length === 0 && <div className="mcq-empty">No MCQ questions found for the selected category.</div>}
          {currentQuestion && <div className="practice-layout">
            <section className="practice-list">
              <article className="practice-card" key={currentQuestion.questionId}>
                <div className="practice-card-heading"><span>Question {currentIndex + 1} <b className="question-total">of {questions.length}</b></span><strong>{currentQuestion.marks ?? 1} Mark</strong></div>
                <div className="question-actions"><span>{currentQuestion.questionType === "MULTIPLE_CHOICE" ? "Select all correct answers" : "Select one correct answer"}</span></div>
                <h2>{currentQuestion.questionText}</h2>
                <div className="practice-options">
                  {(currentQuestion.options || []).map((option, optionIndex) => {
                    const optionId = option.optionId ?? option.optionOrder ?? optionIndex;
                    const selected = Array.isArray(answers[currentQuestion.questionId])
                      ? answers[currentQuestion.questionId].some(
                          (selectedOption) => String(selectedOption) === String(optionId),
                        )
                      : String(answers[currentQuestion.questionId]) === String(optionId);
                    const isMultipleChoice = currentQuestion.questionType === "MULTIPLE_CHOICE";
                    return <button type="button" className={`practice-option ${selected ? "selected" : ""}`} key={optionId} disabled={savingAnswer || submitted} onClick={() => chooseAnswer(currentQuestion.questionId, optionId)}><span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span className={`option-marker ${isMultipleChoice ? "multiple" : "single"}`} aria-hidden="true" /> <em>{option.optionText}</em>{selected && <b>Selected</b>}</button>;
                  })}
                </div>
              </article>
              <div className="practice-navigation">
                <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)}>Previous</button>
                <button type="button" className="save-btn" disabled={currentIndex === questions.length - 1 || submitted} onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}>Next <span>&rarr;</span></button>
              </div>
              {currentIndex === questions.length - 1 && !submitted && <button type="button" className="save-btn submit-test-btn" disabled={savingAnswer} onClick={submitPractice}>{savingAnswer ? "Submitting..." : "Submit Test"}</button>}
            </section>
            <aside className="question-navigator">
              <h3>Question Navigator</h3>
              <div className="navigator-legend"><span className="answered-dot" /> Answered <span className="current-dot" /> Current <span className="pending-dot" /> Not Answered</div>
              <div className="navigator-grid">
                {questions.map((question, index) => {
                  const answer = answers[question.questionId];
                  const isAnswered = Array.isArray(answer) ? answer.length > 0 : answer != null;
                  return <button type="button" key={question.questionId} className={`${index === currentIndex ? "current" : ""} ${isAnswered ? "answered" : ""}`} onClick={() => setCurrentIndex(index)}>{index + 1}</button>;
                })}
              </div>
              <div className="navigator-summary"><span><b>{answeredCount}</b> Answered</span><span><b>{questions.length - answeredCount}</b> Not Answered</span></div>
            </aside>
          </div>}
          {submitted && <section className="practice-report">
            <div className="report-heading"><div><h2>Practice Report</h2><p>Review your answers and the correct responses.</p></div><strong>{report.filter((item) => item.isCorrect).length} / {report.length}</strong></div>
            <div className="report-list">
              {report.map((item, index) => (
                <article className={`report-item ${item.status === "CORRECT" ? "correct" : item.status === "UNANSWERED" ? "unanswered" : "wrong"}`} key={item.question?.questionId ?? item.questionId ?? index}>
                  <div><span>Question {index + 1}</span><b>{item.status}</b></div>
                  <h3>{item.question?.questionText || "Question unavailable"}</h3>
                  <p><strong>Your answer:</strong> {item.selectedText}</p>
                  {item.status !== "CORRECT" && <p><strong>Correct answer:</strong> {item.correctText || "Unavailable"}</p>}
                </article>
              ))}
            </div>
            <button type="button" className="save-btn submit-test-btn" disabled={resettingPractice} onClick={resetPractice}>{resettingPractice ? "Resetting..." : "Reattempt Test"}</button>
          </section>}
        </>
      )}
    </main>
  );
}

export default McqPractice;
