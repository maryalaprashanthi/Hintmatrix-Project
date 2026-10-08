import { useEffect, useMemo, useRef, useState } from "react";

import QuestionAnswerService from "../../services/QuestionAnswerService";
import { getCurrentUserId } from "../../utils/user";
import { restoreBlankAnswers } from "../../utils/questionAttemptState";

import "./FillInBlankQuestionView.css";

import "./MatchingQuestionView.css";

const blankPattern =
  /(__+|\[\[blank(?:\s*\d+)?\]\]|\{\{blank(?:\s*\d+)?\}\})/gi;

const normalizeAnswerValues = (value) => {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeAnswerValues(item));
  }

  if (typeof value === "object") {
    const extractedValue =
      value.answerText ??
      value.answer ??
      value.text ??
      value.value ??
      value.name ??
      "";

    return normalizeAnswerValues(extractedValue);
  }

  return String(value)
    .split(",")
    .map((answer) => String(answer).trim())
    .filter(Boolean);
};

const shuffleArray = (items) => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[randomIndex]] = [
      nextItems[randomIndex],
      nextItems[index],
    ];
  }

  return nextItems;
};

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

  return normalizeAnswerValues(value);
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
  if (
    Array.isArray(questionRecord?.blanks) &&
    questionRecord.blanks.length
  ) {
    return [...questionRecord.blanks]
      .sort(
        (first, second) =>
          (first.blankNumber ?? 0) - (second.blankNumber ?? 0),
      )
      .map((blank = {}, index) => {
        const acceptedAnswers = normalizeAnswerValues(
          blank.acceptedAnswers ??
            blank.acceptedAnswerList ??
            blank.answers ??
            blank.answer ??
            blank.answerText ??
            blank.correctAnswer ??
            blank.correctAnswers ??
            blank.expectedAnswers ??
            blank.options ??
            [],
        );

        return {
          answerId: blank.answerId ?? blank.id ?? index + 1,
          answerText: acceptedAnswers[0] ?? blank.correctAnswer ?? "",
          displayOrder: blank.displayOrder ?? index + 1,
          acceptedAnswers,
          correctAnswer:
            blank.correctAnswer ?? acceptedAnswers[0] ?? "",
          answerOptions: [],
        };
      });
  }

  if (
    Array.isArray(questionRecord?.answers) &&
    questionRecord.answers.length
  ) {
    const backendAnswers = [...questionRecord.answers].sort(
      (first, second) =>
        (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
    );

    /*
     * SINGLE-BLANK QUESTION
     *
     * If the question contains exactly one blank and the backend
     * provides isCorrect, all returned answers are options for
     * the SAME blank.
     *
     * Only isCorrect=true answers are accepted as correct.
     */
    const rawQuestionText = String(
      questionRecord.questionText ?? "",
    );

    const detectedBlankCount = [
      ...rawQuestionText.matchAll(blankPattern),
    ].length;

    const hasCorrectFlag = backendAnswers.some(
      (answer) =>
        Object.prototype.hasOwnProperty.call(answer, "isCorrect"),
    );

    if (detectedBlankCount === 1 && hasCorrectFlag) {
      const allOptions = backendAnswers
        .map((answer) => String(answer.answerText ?? "").trim())
        .filter(Boolean);

      const correctOptions = backendAnswers
        .filter((answer) => answer.isCorrect === true)
        .map((answer) => String(answer.answerText ?? "").trim())
        .filter(Boolean);

      return [
        {
          answerId: backendAnswers[0].answerId ?? 1,
          answerText: correctOptions[0] ?? "",
          displayOrder: 1,

          // ONLY the checked admin option is accepted.
          acceptedAnswers: [...new Set(correctOptions)],

          correctAnswer: correctOptions[0] ?? "",

          // ALL options are shown in the student answer bank.
          answerOptions: [...new Set(allOptions)],
        },
      ];
    }

    /*
     * EXISTING MULTIPLE-BLANK BEHAVIOR
     *
     * Keep the existing behavior unchanged.
     */
    return backendAnswers.map((answer, index) => {
      const acceptedAnswers = normalizeAnswerValues(
        answer.acceptedAnswers ??
          answer.acceptedAnswerList ??
          answer.answerText ??
          answer.answer ??
          answer.text ??
          answer.value ??
          answer,
      );

      return {
        answerId: answer.answerId ?? answer.id ?? index + 1,
        answerText: acceptedAnswers[0] ?? "",
        displayOrder: answer.displayOrder ?? index + 1,
        acceptedAnswers,
        correctAnswer: acceptedAnswers[0] ?? "",
        answerOptions: [],
      };
    });
  }

  return [];
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

  const parts = useMemo(() => {
    const rawText = String(questionRecord.questionText ?? "");

    if (!rawText) {
      return [""];
    }

    const matches = [...rawText.matchAll(blankPattern)];

    if (!matches.length) {
      return [rawText];
    }

    const result = [];
    let previousIndex = 0;

    matches.forEach((match) => {
      const matchIndex = match.index ?? 0;

      if (matchIndex > previousIndex) {
        result.push(rawText.slice(previousIndex, matchIndex));
      }

      result.push(match[0]);
      previousIndex = matchIndex + match[0].length;
    });

    if (previousIndex < rawText.length) {
      result.push(rawText.slice(previousIndex));
    }

    return result;
  }, [questionRecord.questionText]);

  const detectedBlankCount = parts.filter(
  (part, index) => index % 2 === 1,
).length;

const blankCount =
  detectedBlankCount > 0 ? detectedBlankCount : Math.max(blanks.length, 1);

  const [answers, setAnswers] = useState(() =>
    Array.from({ length: blankCount }, () => ""),
  );
  const [submitted, setSubmitted] = useState(false);

  const [score, setScore] = useState(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [restoredReady, setRestoredReady] = useState(false);
  const savedAnswers = useRef({});

  const [draggedAnswer, setDraggedAnswer] = useState("");

  const [displayOptions, setDisplayOptions] = useState([]);
  const shuffledOptionsKey = useRef(null);

  useEffect(() => {
    setAnswers(Array.from({ length: blankCount }, () => ""));
    setSubmitted(false);
    setScore(0);
    setDraggedAnswer("");
  }, [questionRecord.questionId, blankCount]);

  useEffect(() => {
    if (!questionRecord.questionId) return;
    let active = true;
    setSaving(true);
    setRestoredReady(false);
    setError("");
    savedAnswers.current = {};
    QuestionAnswerService.getAnswerEventsByQuestionId(getCurrentUserId(), questionRecord.questionId)
      .then((events) => {
        if (!active) return;
        const restored = restoreBlankAnswers(events, blankCount);
        savedAnswers.current = restored.saved;
        setAnswers(restored.answers);
        setSubmitted(restored.submitted);
        setScore(restored.score);
        setRestoredReady(true);
        if (restored.submitted) onCompleted?.(questionRecord.questionId, restored.score);
      })
      .catch(() => { if (active) setError("Unable to restore your saved answers. Please reopen the question."); })
      .finally(() => { if (active) setSaving(false); });
    return () => { active = false; };
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

  const answerOptionsKey = JSON.stringify(answerOptions);

  useEffect(() => {
    const key = `${questionRecord.questionId}:${answerOptionsKey}`;
    // Keep the same order during answering, resets and StrictMode effect replay.
    if (shuffledOptionsKey.current === key) return;
    shuffledOptionsKey.current = key;
    setDisplayOptions(shuffleArray(JSON.parse(answerOptionsKey)));
  }, [answerOptionsKey, questionRecord.questionId]);

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
    if (saving || submitted || !restoredReady) return;
    const enteredAnswers = Array.from(
      { length: blankCount },
      (_, index) => String(answers[index] ?? "").trim(),
    );

    setSaving(true);
    setError("");

    let correct = 0;

    try {
      for (let index = 0; index < blankCount; index += 1) {
        const acceptedAnswers = getAcceptedAnswers(index);

        const isCorrect = acceptedAnswers.some(
          (answer) =>
            String(answer).trim().toLowerCase() ===
            enteredAnswers[index].toLowerCase(),
        );

        if (savedAnswers.current[index]?.userAnswer !== enteredAnswers[index]) {
          savedAnswers.current[index] = await QuestionAnswerService.processAnswerEvent({
            userId: getCurrentUserId(),
            questionId: questionRecord.questionId,
            attributeId: null,
            arithmetic: "FILL_IN_THE_BLANK",
            answerPosition: index + 1,
            eventType: "ANSWER",
            isCorrect,
            description: `Blank ${index + 1} answer: ${enteredAnswers[index]}`,
            userAnswer: enteredAnswers[index],
          });
        }
        // Use the server's correctness result, including on a partial-save retry.
        if (savedAnswers.current[index].isCorrect === true) correct += 1;
      }

      setScore(correct);

      setSubmitted(true);

      onCompleted?.(questionRecord.questionId, correct);
    } catch (error) {
      setError("Unable to save all blanks. Your saved answers are retained; please try again.");
      console.error(
        "Failed to save fill-in-the-blanks answer:",
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (saving || !restoredReady) return;
    setSaving(true);
    setError("");
    try {
      await QuestionAnswerService.resetAnswerEventsByUserAndQuestion(getCurrentUserId(), questionRecord.questionId);
      savedAnswers.current = {};
      setAnswers(Array.from({ length: blankCount }, () => ""));
      setSubmitted(false);
      setScore(0);
      setDraggedAnswer("");
    } catch {
      setError("Unable to reset your saved answers. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = (index, event) => {
    event.preventDefault();

    const value = event.dataTransfer.getData("text/plain");

    if (!value || submitted || saving || !restoredReady) return;

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

  if (parts.length === 1 && blankCount > 1) {
    Array.from({ length: blankCount }).forEach((_, fallbackIndex) => {
      questionContent.push(
        <div
          key={`blank-fallback-${fallbackIndex}`}
          className={`fill-blank-drop-slot ${
            submitted
              ? answers[fallbackIndex]
                ? "is-answered"
                : "is-empty"
              : ""
          }`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(fallbackIndex, event)}
        >
          {answers[fallbackIndex] || `Drop answer ${fallbackIndex + 1}`}
        </div>,
      );
    });
  }

  if (parts.length === 1 && blankCount === 1) {
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
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
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
              {displayOptions.map((option) => (
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
              disabled={saving || !restoredReady}
            >
              ↻ {submitted ? "Try Again" : "Reset"}
            </button>

            {!submitted ? (
              <button
                type="button"
                className="matching-next-btn"
                onClick={submit}
                disabled={saving || !restoredReady}
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
      </div>
    </main>
  );
};

export default FillInBlankQuestionView;
