import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import QuestionAnswerService from "../../services/QuestionAnswerService";
import { getCurrentUserId } from "../../utils/user";
import { restoreBlankAnswers } from "../../utils/questionAttemptState";

import "./FillInBlankQuestionView.css";
import "./MatchingQuestionView.css";

const blankPattern =
  /(__+|\[\[blank(?:\s*\d+)?\]\]|\{\{blank(?:\s*\d+)?\}\})/gi;

const normalizeAnswerValues = (value) => {
  if (value == null) return [];

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

const getBackendBlanks = (questionRecord) => {
  if (Array.isArray(questionRecord?.blanks) && questionRecord.blanks.length) {
    return [...questionRecord.blanks]
      .sort(
        (first, second) => (first.blankNumber ?? 0) - (second.blankNumber ?? 0),
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
          correctAnswer: blank.correctAnswer ?? acceptedAnswers[0] ?? "",
          answerOptions: [],
        };
      });
  }

  if (Array.isArray(questionRecord?.answers) && questionRecord.answers.length) {
    const backendAnswers = [...questionRecord.answers].sort(
      (first, second) => (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
    );

    const rawQuestionText = String(questionRecord.questionText ?? "");
    const detectedBlankCount = [...rawQuestionText.matchAll(blankPattern)]
      .length;

    const hasCorrectFlag = backendAnswers.some((answer) =>
      Object.prototype.hasOwnProperty.call(answer, "isCorrect"),
    );

    const hasBlankNumbers = backendAnswers.every(
      (answer) => answer.blankNumber != null,
    );

    if (hasCorrectFlag && hasBlankNumbers) {
      const grouped = new Map();

      backendAnswers.forEach((answer) => {
        const key = Number(answer.blankNumber);

        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(answer);
      });

      return [...grouped.keys()]
        .sort((first, second) => first - second)
        .map((blankNumber, index) => {
          const group = grouped.get(blankNumber);

          const options = group
            .map((answer) => String(answer.answerText ?? "").trim())
            .filter(Boolean);

          const correctOptions = group
            .filter((answer) => answer.isCorrect === true)
            .map((answer) => String(answer.answerText ?? "").trim())
            .filter(Boolean);

          return {
            answerId: group[0].answerId ?? index + 1,
            answerText: correctOptions[0] ?? "",
            displayOrder: index + 1,
            acceptedAnswers: [...new Set(correctOptions)],
            correctAnswer: correctOptions[0] ?? "",
            answerOptions: [...new Set(options)],
          };
        });
    }

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
          acceptedAnswers: [...new Set(correctOptions)],
          correctAnswer: correctOptions[0] ?? "",
          answerOptions: [...new Set(allOptions)],
        },
      ];
    }

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
  displayQuestionNumber = questionNumber,
  totalQuestions = 1,
  questions = [],
  completedQuestions = {},
  onCompleted,
  onQuestionSelect,
  onPrevious,
  onNext,
}) => {
  const questionRecord = question?.question ?? question?.data ?? question ?? {};
  const blanks = getBackendBlanks(questionRecord);

  const parts = useMemo(() => {
    const rawText = String(questionRecord.questionText ?? "");

    if (!rawText) return [""];

    const matches = [...rawText.matchAll(blankPattern)];

    if (!matches.length) return [rawText];

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
  const [totalScore, setTotalScore] = useState(null);
  const [scoreError, setScoreError] = useState("");
  const scoreRequest = useRef({ version: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [restoredReady, setRestoredReady] = useState(false);
  const savedAnswers = useRef({});
  const [draggedAnswer, setDraggedAnswer] = useState("");
  const [displayOptions, setDisplayOptions] = useState([]);
  const shuffledOptionsKey = useRef(null);

  // Same overall earned-marks endpoint used by drag/drop and journal views.
  const loadTotalScore = useCallback(async () => {
    const tracker = scoreRequest.current;
    const request = ++tracker.version;
    setScoreError("");
    try {
      const marks = await QuestionAnswerService.getOverallMarks(getCurrentUserId());
      if (request === tracker.version) setTotalScore(Number(marks) || 0);
    } catch {
      if (request === tracker.version) {
        setScoreError("Unable to refresh total score. Reopen the question to retry.");
      }
    }
  }, []);

  useEffect(() => {
    const tracker = scoreRequest.current;
    setTotalScore(null);
    if (questionRecord.questionId) void loadTotalScore();
    return () => { tracker.version++; };
  }, [questionRecord.questionId, loadTotalScore]);

  useEffect(() => {
    setAnswers(Array.from({ length: blankCount }, () => ""));
    setSubmitted(false);
    setDraggedAnswer("");
  }, [questionRecord.questionId, blankCount]);

  useEffect(() => {
    if (!questionRecord.questionId) return undefined;

    let active = true;

    setSaving(true);
    setRestoredReady(false);
    setError("");
    savedAnswers.current = {};

    QuestionAnswerService.getAnswerEventsByQuestionId(
      getCurrentUserId(),
      questionRecord.questionId,
    )
      .then((events) => {
        if (!active) return;

        const restored = restoreBlankAnswers(events, blankCount);

        savedAnswers.current = restored.saved;
        setAnswers(restored.answers);
        setSubmitted(restored.submitted);
        setRestoredReady(true);

        if (restored.submitted) {
          onCompleted?.(questionRecord.questionId, restored.score);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            "Unable to restore your saved answers. Please reopen the question.",
          );
        }
      })
      .finally(() => {
        if (active) setSaving(false);
      });

    return () => {
      active = false;
    };
  }, [questionRecord.questionId, blankCount]);

  const answerOptions = useMemo(() => {
    const options = blanks.flatMap((blank) => [
      ...acceptedAnswersFromBlank(blank),
      ...(blank.answerOptions ?? []),
    ]);

    return [
      ...new Set(
        options.map((answer) => String(answer).trim()).filter(Boolean),
      ),
    ];
  }, [blanks]);

  const answerOptionsKey = JSON.stringify(answerOptions);

  useEffect(() => {
    const key = `${questionRecord.questionId}:${answerOptionsKey}`;

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

  const getAcceptedAnswers = (index) => acceptedAnswersFromBlank(blanks[index]);

  const isOptionUsed = (option) =>
    answers.some(
      (answer) =>
        String(answer).trim().toLowerCase() ===
        String(option).trim().toLowerCase(),
    );

  const handlePreviousQuestion = () => {
    if (typeof onPrevious === "function") {
      onPrevious();
      return;
    }

    if (questionNumber > 1 && typeof onQuestionSelect === "function") {
      onQuestionSelect(questionNumber - 2);
    }
  };

  const handleNextQuestion = () => {
    if (typeof onNext === "function") {
      onNext();
      return;
    }

    if (
      questionNumber < totalQuestions &&
      typeof onQuestionSelect === "function"
    ) {
      onQuestionSelect(questionNumber);
    }
  };

  const submit = async () => {
    if (saving || submitted || !restoredReady) return;

    const enteredAnswers = Array.from({ length: blankCount }, (_, index) =>
      String(answers[index] ?? "").trim(),
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
          savedAnswers.current[index] =
            await QuestionAnswerService.processAnswerEvent({
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

        if (isCorrect) correct += 1;
      }

      setSubmitted(true);
      onCompleted?.(questionRecord.questionId, correct);
    } catch (submitError) {
      setError(
        "Unable to save all blanks. Your saved answers are retained; please try again.",
      );

      console.error("Failed to save fill-in-the-blanks answer:", submitError);
    } finally {
      await loadTotalScore();
      setSaving(false);
    }
  };

  const reset = async () => {
    if (saving || !restoredReady) return;

    setSaving(true);
    setError("");

    try {
      await QuestionAnswerService.resetAnswerEventsByUserAndQuestion(
        getCurrentUserId(),
        questionRecord.questionId,
      );

      savedAnswers.current = {};
      setAnswers(Array.from({ length: blankCount }, () => ""));
      setSubmitted(false);
      await loadTotalScore();
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

    const alreadyUsedInAnotherBlank = answers.some(
      (answer, answerIndex) =>
        answerIndex !== index &&
        String(answer).trim().toLowerCase() ===
          String(value).trim().toLowerCase(),
    );

    if (alreadyUsedInAnotherBlank) {
      setDraggedAnswer("");
      return;
    }

    updateAnswer(index, value);
    setDraggedAnswer("");
  };

  const isAnswerCorrect = (index) => {
    const acceptedAnswers = getAcceptedAnswers(index);

    return acceptedAnswers.some(
      (answer) =>
        String(answer).trim().toLowerCase() ===
        String(answers[index] ?? "")
          .trim()
          .toLowerCase(),
    );
  };

  const getSlotStateClass = (index) => {
    if (!submitted) return "";
    if (!answers[index]) return "is-empty";

    return isAnswerCorrect(index) ? "is-answered" : "is-wrong";
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
        className={`fill-blank-drop-slot ${getSlotStateClass(currentIndex)}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleDrop(currentIndex, event)}
      >
        {answers[currentIndex] || `Drop answer ${currentIndex + 1}`}
      </div>
    );
  });

  if (parts.length === 1) {
    Array.from({ length: blankCount }).forEach((_, fallbackIndex) => {
      questionContent.push(
        <div
          key={`blank-fallback-${fallbackIndex}`}
          className={`fill-blank-drop-slot ${getSlotStateClass(fallbackIndex)}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(fallbackIndex, event)}
        >
          {answers[fallbackIndex] || `Drop answer ${fallbackIndex + 1}`}
        </div>,
      );
    });
  }

  return (
    <main className="fill-blank-page">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {scoreError && <div className="alert alert-warning" role="alert">{scoreError}</div>}
      <header className="matching-practice-header">
        <div>
          <div className="matching-eyebrow">STUDENT PRACTICE</div>
          <h1 className="matching-practice-title">Fill in the Blanks</h1>
          <p className="matching-practice-subtitle">
            Complete each blank with the correct answer.
          </p>
        </div>

        <div className="matching-stat-cards">
          <div className="matching-stat-card matching-score-card" role="status" aria-live="polite">
            <span>TOTAL SCORE</span>
            <strong>{totalScore ?? "—"}</strong>
          </div>
        </div>
      </header>

      <div className="matching-practice-layout">
        <section className="matching-question-content fill-blank-question-card">
          <div className="matching-question-heading fill-blank-heading">
            <span>Fill in the blanks:</span>

            <div className="matching-heading-actions">
              <span className="matching-mark-badge">
                {questionRecord.marks ?? blankCount} Marks
              </span>

              <button
                type="button"
                className="matching-reset-btn"
                onClick={reset}
                disabled={saving || !restoredReady}
              >
                ↻ {submitted ? "Try Again" : "Reset"}
              </button>

              {!submitted && (
                <button
                  type="button"
                  className="matching-next-btn"
                  onClick={submit}
                  disabled={saving || !restoredReady}
                >
                  {saving ? "Saving..." : "Submit Answer"}
                </button>
              )}
            </div>
          </div>

          <div className="fill-blank-question">Q{displayQuestionNumber}. {questionContent}</div>

          <div className="fill-blank-answer-bank">
            <strong>Drag the correct answers into the blanks</strong>

            <div className="fill-blank-answer-options">
              {displayOptions.map((option) => {
                const used = isOptionUsed(option);

                return (
                  <button
                    type="button"
                    key={option}
                    draggable={!submitted && !saving && !used}
                    disabled={submitted || saving || used}
                    className={`fill-blank-answer-option ${
                      draggedAnswer === option ? "dragging" : ""
                    } ${used ? "option-used" : ""}`}
                    onDragStart={(event) => {
                      if (used || submitted || saving) {
                        event.preventDefault();
                        return;
                      }

                      setDraggedAnswer(option);
                      event.dataTransfer.setData("text/plain", option);
                    }}
                    onDragEnd={() => setDraggedAnswer("")}
                  >
                    ⋮⋮ {option}
                  </button>
                );
              })}
            </div>
          </div>

          {submitted && (
            <div className="fill-blank-results">
              <h2 className="fill-blank-review-title">Answer Review</h2>

              <div className="fill-blank-review-list">
                {Array.from({ length: blankCount }, (_, index) => {
                  const correct = isAnswerCorrect(index);
                  const correctAnswer = getAcceptedAnswers(index)[0];

                  return (
                    <div
                      className={`fill-blank-review-row ${
                        correct ? "correct" : "incorrect"
                      }`}
                      key={index}
                    >
                      <strong>Blank {index + 1}</strong>
                      <span>{answers[index] || "Not answered"}</span>
                      <span>
                        {correct
                          ? "✓ Correct"
                          : `✕ Correct: ${correctAnswer || "-"}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="matching-nav-row matching-nav-bottom">
            <div className="matching-nav-left">
              {questionNumber > 1 && (
                <button
                  type="button"
                  className="matching-prev-btn"
                  onClick={handlePreviousQuestion}
                  disabled={saving}
                >
                  ← Previous
                </button>
              )}
            </div>

            <div className="matching-nav-right">
              {questionNumber < totalQuestions && (
                <button
                  type="button"
                  className="matching-next-btn"
                  onClick={handleNextQuestion}
                  disabled={saving}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default FillInBlankQuestionView;
