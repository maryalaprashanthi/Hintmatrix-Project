import { useEffect, useMemo, useState } from "react";

import QuestionAnswerService from "../../services/QuestionAnswerService";

import "./FillInBlankQuestionView.css";

import "./MatchingQuestionView.css";

const blankPattern =
  /(__+|\[\[blank(?:\s*\d+)?\]\]|\{\{blank(?:\s*\d+)?\}\})/gi;

const acceptedAnswersFromBlank = (blank = {}) => {
  const value =
    blank.acceptedAnswers ??
    blank.acceptedAnswer ??
    blank.acceptedAnswerList ??
    blank.correctAnswer ??
    blank.correctAnswers ??
    blank.answer ??
    blank.answers ??
    blank.answerText ??
    blank.expectedAnswer ??
    blank.expectedAnswers ??
    blank.correctOption ??
    blank.options ??
    blank.value ??
    "";

  return (Array.isArray(value) ? value : String(value).split(","))
    .map((answer) => {
      if (answer && typeof answer === "object") {
        return (
          answer.answer ??
          answer.answerText ??
          answer.text ??
          answer.value ??
          ""
        );
      }

      return String(answer).trim();
    })
    .map((answer) => String(answer).trim())
    .filter(Boolean);
};

/*
 * Backend response:
 *
 * {
 *   questionId: 42,
 *   questionText: "Java is a _____ language.",
 *   answers: [
 *     {
 *       answerId: 1,
 *       answerText: "programming",
 *       displayOrder: 1
 *     }
 *   ]
 * }
 *
 * Convert the backend answers into the format already
 * expected by the existing component.
 */
const getBackendBlanks = (questionRecord) => {
  if (!Array.isArray(questionRecord.answers)) {
    return [];
  }

  return [...questionRecord.answers]
    .sort(
      (first, second) =>
        (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
    )
    .map((answer) => ({
      answerId: answer.answerId,
      answerText: answer.answerText,
      displayOrder: answer.displayOrder,
      acceptedAnswers: [answer.answerText],
    }));
};

const FillInBlankQuestionView = ({
  question,
  questionNumber = 1,
  totalQuestions = 1,
  completedCount = 0,
  questions = [],
  completedQuestions = {},
  onCompleted,
  onQuestionSelect,
  onNext,
}) => {
  const questionRecord =
    question?.question ?? question?.data ?? question ?? {};

  const blanks = getBackendBlanks(questionRecord);

  const parts = useMemo(
    () =>
      String(questionRecord.questionText ?? "").split(blankPattern),
    [questionRecord.questionText],
  );

  const detectedBlankCount = Math.max(parts.length - 1, 0);

  const blankCount = Math.max(detectedBlankCount, 1);

  const [answers, setAnswers] = useState(() =>
    Array.from({ length: blankCount }, () => ""),
  );

  const [submitted, setSubmitted] = useState(false);

  const [score, setScore] = useState(0);

  const [saving, setSaving] = useState(false);

  const [draggedAnswer, setDraggedAnswer] = useState("");

  useEffect(() => {
    setAnswers(Array.from({ length: blankCount }, () => ""));
    setSubmitted(false);
    setScore(0);
    setDraggedAnswer("");
  }, [questionRecord.questionId, blankCount]);

  const answerOptions = useMemo(() => {
    const acceptedAnswers = blanks.flatMap(acceptedAnswersFromBlank);

    return [
      ...new Set(
        acceptedAnswers
          .map((answer) => String(answer).trim())
          .filter(Boolean),
      ),
    ];
  }, [blanks]);

  const updateAnswer = (index, value) => {
    setAnswers((current) => {
      const next = Array.from(
        { length: blankCount },
        (_, answerIndex) => current[answerIndex] ?? "",
      );

      next[index] = value;

      return next;
    });
  };

  const getAcceptedAnswers = (index) => {
    return acceptedAnswersFromBlank(blanks[index]);
  };

  const submit = async () => {
    const enteredAnswers = Array.from(
      { length: blankCount },
      (_, index) => String(answers[index] ?? "").trim(),
    );

    setSaving(true);

    let correct = 0;

    try {
      for (let index = 0; index < blankCount; index += 1) {
        const acceptedAnswers = getAcceptedAnswers(index);

        const isCorrect = acceptedAnswers.some(
          (answer) =>
            String(answer).trim().toLowerCase() ===
            enteredAnswers[index].toLowerCase(),
        );

        if (isCorrect) correct += 1;

        try {
          await QuestionAnswerService.processAnswerEvent({
            userId: 1,
            questionId: questionRecord.questionId,
            attributeId: null,
            arithmetic: "FILL_IN_THE_BLANK",
            answerPosition: index + 1,
            eventType: "ANSWER",
            isCorrect,
            description: `Blank ${index + 1} answer: ${enteredAnswers[index]}`,
            userAnswer: enteredAnswers[index],
          });
        } catch (answerError) {
          console.error(
            "Failed to save fill-in-the-blank answer:",
            answerError,
          );
        }
      }

      setScore(correct);

      setSubmitted(true);

      onCompleted?.(questionRecord.questionId, correct);
    } catch (error) {
      console.error(
        "Failed to save fill-in-the-blanks answer:",
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setAnswers(Array.from({ length: blankCount }, () => ""));
    setSubmitted(false);
    setScore(0);
    setDraggedAnswer("");
  };

  const handleDrop = (index, event) => {
    event.preventDefault();

    const value = event.dataTransfer.getData("text/plain");

    if (!value || submitted || saving) return;

    updateAnswer(index, value);

    setDraggedAnswer("");
  };

  const isAnswerCorrect = (index) => {
    const acceptedAnswers = getAcceptedAnswers(index);

    return acceptedAnswers.some(
      (answer) =>
        String(answer).trim().toLowerCase() ===
        String(answers[index] ?? "").trim().toLowerCase(),
    );
  };

  let blankIndex = 0;

  const questionContent = parts.map((part, index) => {
    if (index % 2 === 0) {
      return <span key={`text-${index}`}>{part}</span>;
    }

    const currentIndex = blankIndex;

    blankIndex += 1;

    return (
      <div
        key={`blank-${currentIndex}`}
        className={`fill-blank-drop-slot ${
          submitted
            ? answers[currentIndex]
              ? "is-answered"
              : "is-empty"
            : ""
        }`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleDrop(currentIndex, event)}
      >
        {answers[currentIndex] ||
          `Drop answer ${currentIndex + 1}`}
      </div>
    );
  });

  if (parts.length === 1) {
    questionContent.push(
      <div
        key="blank-fallback"
        className={`fill-blank-drop-slot ${
          submitted
            ? answers[0]
              ? "is-answered"
              : "is-empty"
            : ""
        }`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleDrop(0, event)}
      >
        {answers[0] || "Drop answer 1"}
      </div>,
    );
  }

  return (
    <main className="fill-blank-page">
      <header className="matching-practice-header">
        <div>
          <div className="matching-eyebrow">
            STUDENT PRACTICE
          </div>

          <h1 className="matching-practice-title">
            Fill in the Blanks
          </h1>

          <p className="matching-practice-subtitle">
            Complete each blank with the correct answer.
          </p>
        </div>

        <div className="matching-stat-cards">
          <div className="matching-stat-card matching-progress-card">
            <span>PROGRESS</span>

            <strong>
              {completedCount}/{totalQuestions}
            </strong>

            <small>
              {Math.max(totalQuestions - completedCount, 0)} left
            </small>
          </div>

          <div className="matching-stat-card matching-score-card">
            <span>TOTAL SCORE</span>

            <strong>{score}</strong>
          </div>
        </div>
      </header>

      <div className="matching-practice-layout">
        <main className="matching-question-content fill-blank-question-card">
          <div className="fill-blank-progress-heading">
            <span>
              Question {questionNumber} of {totalQuestions}
            </span>

            <span>
              {Math.round(
                (questionNumber /
                  Math.max(totalQuestions, 1)) *
                  100,
              )}
              %
            </span>
          </div>

          <div className="fill-blank-progress-track">
            <span
              style={{
                width: `${
                  (questionNumber /
                    Math.max(totalQuestions, 1)) *
                  100
                }%`,
              }}
            />
          </div>

          <div className="matching-question-heading">
            <span>Fill in the blanks:</span>

            <span className="matching-mark-badge">
              {questionRecord.marks ?? blankCount} Marks
            </span>
          </div>

          <div className="fill-blank-question">
            {questionContent}
          </div>

          <div className="fill-blank-answer-bank">
            <strong>
              Drag the correct answers into the blanks
            </strong>

            <div className="fill-blank-answer-options">
              {answerOptions.map((option) => (
                <button
                  type="button"
                  draggable={!submitted && !saving}
                  key={option}
                  className={`fill-blank-answer-option ${
                    draggedAnswer === option ? "dragging" : ""
                  }`}
                  onDragStart={(event) => {
                    setDraggedAnswer(option);

                    event.dataTransfer.setData(
                      "text/plain",
                      option,
                    );
                  }}
                  onDragEnd={() => setDraggedAnswer("")}
                >
                  ⋮⋮ {option}
                </button>
              ))}
            </div>
          </div>

          <div className="fill-blank-hint">
            <strong>💡 Hint</strong>

            <p>
              Think carefully about the context of each sentence.
            </p>
          </div>

          {submitted && (
            <div className="fill-blank-results">
              <div className="fill-blank-result fill-blank-result-summary">
                <h2>Result</h2>

                <strong>
                  {score} / {blankCount}
                </strong>

                <p>
                  You got {score} out of {blankCount} correct.
                </p>
              </div>

              <h2 className="fill-blank-review-title">
                Answer Review
              </h2>

              <div className="fill-blank-review-list">
                {Array.from(
                  { length: blankCount },
                  (_, index) => {
                    const correct = isAnswerCorrect(index);

                    const correctAnswer =
                      getAcceptedAnswers(index)[0];

                    return (
                      <div
                        className={`fill-blank-review-row ${
                          correct ? "correct" : "incorrect"
                        }`}
                        key={index}
                      >
                        <strong>
                          Blank {index + 1}
                        </strong>

                        <span>
                          {answers[index] || "Not answered"}
                        </span>

                        <span>
                          {correct
                            ? "✓ Correct"
                            : `✕ Correct: ${
                                correctAnswer || "-"
                              }`}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          <div className="matching-actions">
            <button
              type="button"
              className="matching-reset-btn"
              onClick={reset}
              disabled={saving}
            >
              ↻ {submitted ? "Try Again" : "Reset"}
            </button>

            {!submitted ? (
              <button
                type="button"
                className="matching-next-btn"
                onClick={submit}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save & Next"}
              </button>
            ) : (
              <button
                type="button"
                className="matching-next-btn"
                onClick={onNext}
              >
                Next Question →
              </button>
            )}
          </div>
        </main>

        <aside className="matching-question-navigator">
          <h2>Question Navigator</h2>

          <div className="matching-navigator-legend">
            <span>
              <i className="matching-legend-dot answered" />
              Answered
            </span>

            <span>
              <i className="matching-legend-dot current" />
              Current
            </span>

            <span>
              <i className="matching-legend-dot unanswered" />
              Not Answered
            </span>
          </div>

          <div className="matching-question-numbers">
            {Array.from(
              { length: totalQuestions },
              (_, index) => {
                const number = index + 1;

                const actualQuestion = questions[index];

                const answered =
                  Boolean(
                    actualQuestion &&
                      completedQuestions[
                        actualQuestion.questionId
                      ],
                  ) ||
                  (number === questionNumber && submitted);

                return (
                  <button
                    key={number}
                    type="button"
                    disabled={
                      !actualQuestion || !onQuestionSelect
                    }
                    onClick={() =>
                      onQuestionSelect(index)
                    }
                    className={`${number === questionNumber ? "current" : ""} ${
                      answered ? "answered" : ""
                    }`}
                  >
                    {number}
                  </button>
                );
              },
            )}
          </div>

          <div className="matching-navigator-summary">
            <div>
              <strong>{completedCount}</strong>
              <span>Answered</span>
            </div>

            <div>
              <strong>
                {Math.max(
                  totalQuestions - completedCount,
                  0,
                )}
              </strong>

              <span>Not Answered</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default FillInBlankQuestionView;