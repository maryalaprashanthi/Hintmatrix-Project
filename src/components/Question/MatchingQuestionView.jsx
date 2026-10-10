import { useCallback, useEffect, useRef, useState } from "react";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import useQuestionStore from "./questionStore";
import { getCurrentUserId } from "../../utils/user";
import { restoreMatchingAnswers } from "../../utils/questionAttemptState";
import "./MatchingQuestionView.css";

const MatchingQuestionView = ({
  question,
  questionNumber = 1,
  displayQuestionNumber = questionNumber,
  totalQuestions = 20,
  onCompleted,
  onNext,
  onPrevious,
}) => {
  const { setCurrentScore } = useQuestionStore();

  // =========================================================
  // STATE
  // =========================================================

  const [pairs, setPairs] = useState([]);

  // Column B (answers) is shown in shuffled order
  const [shuffledColumnB, setShuffledColumnB] = useState([]);

  // Column A pairId (question) -> Column B pairId (answer)
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Question (Column A item) currently being dragged
  const [draggedQuestion, setDraggedQuestion] = useState(null);

  // Answer (Column B item) currently hovered while dragging
  const [dropTargetAnswerId, setDropTargetAnswerId] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(null);
  const [scoreError, setScoreError] = useState("");
  const scoreRequest = useRef({ version: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [restoredReady, setRestoredReady] = useState(false);
  const savedAnswers = useRef({});

  // Overall earned marks use the same backend endpoint as journal/dropdown.
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
    if (question?.questionId) void loadTotalScore();
    return () => { tracker.version++; };
  }, [question?.questionId, loadTotalScore]);

  // =========================================================
  // SHUFFLE
  // =========================================================

  const shuffleArray = (array) => {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));

      [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
    }

    return result;
  };

  // =========================================================
  // LOAD QUESTION
  // =========================================================

  useEffect(() => {
    if (!question || !Array.isArray(question.pairs)) {
      setPairs([]);
      setShuffledColumnB([]);
      setSelectedAnswers({});
      setSubmitted(false);
      setDraggedQuestion(null);
      setDropTargetAnswerId(null);
      setCurrentScore(0);
      return;
    }

    // Column A (questions) in display order
    const sortedPairs = [...question.pairs].sort(
      (a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0),
    );

    setPairs(sortedPairs);

    // Column B (answers) shuffled
    setShuffledColumnB(shuffleArray(sortedPairs));

    // Reset
    setSelectedAnswers({});
    setSubmitted(false);
    setDraggedQuestion(null);
    setDropTargetAnswerId(null);
    setCurrentScore(0);
  }, [question?.questionId, setCurrentScore]);

  // =========================================================
  // RESTORE SAVED ANSWERS
  // =========================================================

  useEffect(() => {
    if (!question?.questionId || !Array.isArray(question.pairs)) return;
    let active = true;
    setSaving(true);
    setRestoredReady(false);
    setError("");
    savedAnswers.current = {};
    QuestionAnswerService.getAnswerEventsByQuestionId(
      getCurrentUserId(),
      question.questionId,
    )
      .then((events) => {
        if (!active) return;
        const restored = restoreMatchingAnswers(events, question.pairs);
        savedAnswers.current = restored.saved;
        setSelectedAnswers(restored.answers);
        setCurrentScore(restored.score);
        setSubmitted(restored.submitted);
        setRestoredReady(true);
        if (restored.submitted)
          onCompleted?.(question.questionId, restored.score);
      })
      .catch(() => {
        if (active)
          setError(
            "Unable to restore your saved answers. Please reopen the question.",
          );
      })
      .finally(() => {
        if (active) setSaving(false);
      });
    return () => {
      active = false;
    };
  }, [question?.questionId, setCurrentScore]);

  // =========================================================
  // HELPERS
  // =========================================================

  // Answer (Column B item) assigned to a question (Column A item)
  const getSelectedAnswer = (questionPairId) => {
    const selectedId = selectedAnswers[questionPairId];

    if (selectedId === undefined || selectedId === null || selectedId === "") {
      return null;
    }

    return (
      pairs.find((pair) => Number(pair.pairId) === Number(selectedId)) ?? null
    );
  };

  // Is this question (Column A item) already matched to an answer?
  const isQuestionMatched = (questionPairId) => {
    const value = selectedAnswers[questionPairId];
    return value !== undefined && value !== null && value !== "";
  };

  // Which question (Column A item) is currently dropped on this answer?
  const getQuestionForAnswer = (answerPairId) =>
    pairs.find(
      (pair) =>
        isQuestionMatched(pair.pairId) &&
        Number(selectedAnswers[pair.pairId]) === Number(answerPairId),
    ) ?? null;

  // =========================================================
  // DRAG AND DROP
  // =========================================================

  // Drag starts from a question in Column A
  const handleDragStart = (event, pair) => {
    if (submitted || saving || !restoredReady) {
      event.preventDefault();
      return;
    }

    setDraggedQuestion(pair);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(pair.pairId));
  };

  const handleDragEnd = () => {
    setDraggedQuestion(null);
    setDropTargetAnswerId(null);
  };

  // Hovering over an answer in Column B
  const handleAnswerDragOver = (event, answerPairId) => {
    if (submitted || saving || !restoredReady) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dropTargetAnswerId !== answerPairId) {
      setDropTargetAnswerId(answerPairId);
    }
  };

  const handleAnswerDragLeave = (event, answerPairId) => {
    // Ignore leave events fired when moving over a child element
    if (event.currentTarget.contains(event.relatedTarget)) return;

    if (dropTargetAnswerId === answerPairId) {
      setDropTargetAnswerId(null);
    }
  };

  // Question dropped on an answer
  const handleDrop = (event, answerPairId) => {
    event.preventDefault();

    if (submitted || saving || !restoredReady) return;

    const raw = event.dataTransfer.getData("text/plain");
    if (!raw) return;

    const questionPairId = Number(raw);

    setSelectedAnswers((previous) => {
      const updated = {};

      // Free any other question already sitting on this answer
      Object.entries(previous).forEach(([qId, aId]) => {
        if (Number(aId) !== Number(answerPairId)) {
          updated[qId] = aId;
        }
      });

      // Assign the dragged question (this also moves it if matched elsewhere)
      updated[questionPairId] = Number(answerPairId);

      return updated;
    });

    setDraggedQuestion(null);
    setDropTargetAnswerId(null);
  };

  // =========================================================
  // REMOVE MATCH (by question id)
  // =========================================================

  const handleRemoveMatch = (questionPairId) => {
    if (submitted || saving || !restoredReady) return;

    setSelectedAnswers((previous) => {
      const updated = { ...previous };
      delete updated[questionPairId];
      return updated;
    });
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = async () => {
    if (saving || !restoredReady) return;
    setSaving(true);
    setError("");
    try {
      await QuestionAnswerService.resetAnswerEventsByUserAndQuestion(
        getCurrentUserId(),
        question.questionId,
      );
      savedAnswers.current = {};
      setSelectedAnswers({});
      setSubmitted(false);
      setDraggedQuestion(null);
      setDropTargetAnswerId(null);
      setCurrentScore(0);
      setShuffledColumnB(shuffleArray(pairs));
      await loadTotalScore();
    } catch {
      setError("Unable to reset your saved answers. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {
    if (pairs.length === 0 || saving || submitted || !restoredReady) {
      return;
    }

    // Every question in Column A must be matched
    const unanswered = pairs.some((pair) => !isQuestionMatched(pair.pairId));

    if (unanswered) {
      alert("Please match all Column A questions before submitting.");
      return;
    }

    setSaving(true);
    setError("");

    let correctCount = 0;

    try {
      for (const pair of pairs) {
        const selectedPairId = Number(selectedAnswers[pair.pairId]);

        const isCorrect = selectedPairId === Number(pair.pairId);

        if (isCorrect) {
          correctCount++;
        }

        const selectedPair = pairs.find(
          (item) => Number(item.pairId) === selectedPairId,
        );

        const answerEvent = {
          // Identify the source pair, including when the selected target is wrong.
          unitPosition: Number(pair.pairId),
          userId: getCurrentUserId(),
          questionId: question.questionId,
          attributeId: null,
          arithmetic: "MATCH",
          answerPosition: selectedPairId,
          eventType: "ANSWER",
          isCorrect: isCorrect,
          description: `Matching question: Column A "${pair.columnA}" was matched with Column B "${selectedPair?.columnB ?? ""}". | matchIds=${JSON.stringify([Number(pair.pairId), selectedPairId])}`,
          userAnswer: `Column A "${pair.columnA}" -> Column B "${selectedPair?.columnB ?? ""}"`,
        };

        const previous = savedAnswers.current[pair.pairId];
        const marker = `| matchIds=${JSON.stringify([Number(pair.pairId), selectedPairId])}`;
        if (!previous?.description?.endsWith(marker)) {
          savedAnswers.current[pair.pairId] =
            await QuestionAnswerService.processAnswerEvent(answerEvent);
        }
      }

      setCurrentScore(correctCount);
      setSubmitted(true);

      if (onCompleted) {
        onCompleted(question.questionId, correctCount);
      }
    } catch (err) {
      console.error("Error submitting matching question:", err);

      setError(
        "Unable to save all matches. Your saved matches are retained; please try again.",
      );
    } finally {
      // Also refresh after a partial save: committed answers may have earned marks.
      await loadTotalScore();
      setSaving(false);
    }
  };

  const handleTryAgain = handleReset;

  // =========================================================
  // NO QUESTION
  // =========================================================

  if (!question) {
    return (
      <div className="matching-empty">
        <div className="matching-empty-card">
          <h3>No question found.</h3>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO PAIRS
  // =========================================================

  if (pairs.length === 0) {
    return (
      <div className="matching-empty">
        <div className="matching-empty-card">
          <h3>Q{displayQuestionNumber}. {question.questionText}</h3>
          <p>No matching pairs found.</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="matching-page">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {scoreError && <div className="alert alert-warning" role="alert">{scoreError}</div>}

      {/* HEADER */}
      <div className="matching-practice-header">
        <div className="matching-header-left">
          <div className="matching-eyebrow">STUDENT PRACTICE</div>

          <h1 className="matching-practice-title">Match the Following</h1>

          <p className="matching-practice-subtitle">
            Match each question in Column A with the correct answer in Column B.
          </p>
        </div>

        <div className="matching-stat-cards">
          <div className="matching-stat-card matching-score-card" role="status" aria-live="polite">
            <span>TOTAL SCORE</span>
            <strong>{totalScore ?? "—"}</strong>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="matching-practice-layout">
        <main className="matching-question-content">
          {/* QUESTION HEADING */}
          <div className="matching-question-heading">
            {/* <span className="matching-question-number">
              Question {questionNumber} of {totalQuestions}
            </span> */}

            <div className="matching-heading-actions">
              <span className="matching-mark-badge">{pairs.length} Marks</span>

              {!submitted ? (
                <>
                  <button
                    type="button"
                    className="matching-reset-btn"
                    onClick={handleReset}
                    disabled={
                      saving ||
                      !restoredReady ||
                      Object.keys(selectedAnswers).length === 0
                    }
                  >
                    ↻ Reset
                  </button>

                  <button
                    type="button"
                    className="matching-next-btn matching-submit-btn"
                    onClick={handleSubmit}
                    disabled={saving || !restoredReady}
                  >
                    {saving ? "Saving..." : "Submit Answer"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="matching-reset-btn"
                  onClick={handleTryAgain}
                  disabled={saving || !restoredReady}
                >
                  ↻ Try Again
                </button>
              )}
            </div>
          </div>

          {/* QUESTION TEXT */}
          <div className="matching-question-title">Q{displayQuestionNumber}. {question.questionText}</div>

          {/* INSTRUCTION */}
          {/* <div className="matching-instruction">
            <span className="matching-instruction-icon">💡</span>

            <div>
              <strong>How to answer</strong>

              <p>
                Drag each question from Column A and drop it onto the matching
                answer in Column B.
              </p>
            </div>
          </div> */}

          {/* MATCHING COLUMNS
              Inline flexDirection/order force Column A to the LEFT and
              Column B to the RIGHT, overriding any reversing CSS. */}
          <div className="matching-columns" style={{ flexDirection: "row" }}>
            {/* =============================================
                COLUMN A  (QUESTIONS - DRAGGABLE)  -> LEFT
            ============================================= */}
            <div className="matching-column" style={{ order: 1 }}>
              <div className="matching-column-header column-a-header">
                <span className="header-icon">◇</span>
                <span>Column A</span>
                <small>Questions</small>
              </div>

              <div className="matching-column-body">
                {pairs.map((pair, index) => {
                  const matched = isQuestionMatched(pair.pairId);

                  const isDragging = draggedQuestion?.pairId === pair.pairId;

                  const isCorrect =
                    submitted &&
                    Number(selectedAnswers[pair.pairId]) ===
                      Number(pair.pairId);

                  const isWrong = submitted && !isCorrect;

                  return (
                    <div
                      key={pair.pairId}
                      draggable={!submitted && !saving && restoredReady}
                      onDragStart={(event) => handleDragStart(event, pair)}
                      onDragEnd={handleDragEnd}
                      className={`answer-card ${
                        matched && !submitted ? "answer-card-used" : ""
                      } ${isDragging ? "answer-card-dragging" : ""} ${
                        isCorrect ? "matching-row-correct" : ""
                      } ${isWrong ? "matching-row-wrong" : ""}`}
                    >
                      {!submitted && <span className="drag-dots">⋮⋮</span>}

                      <span className="answer-number">{index + 1}.</span>

                      <span className="answer-text">{pair.columnA}</span>

                      {!submitted && matched && (
                        <span className="answer-used-label">Matched</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =============================================
                COLUMN B  (ANSWERS - DROP TARGETS)  -> RIGHT
            ============================================= */}
            <div className="matching-column" style={{ order: 2 }}>
              <div className="matching-column-header column-b-header">
                <span className="header-icon">◇</span>
                <span>Column B</span>
                <small>Answers</small>
              </div>

              <div className="matching-column-body">
                {shuffledColumnB.map((option, index) => {
                  const matchedQuestion = getQuestionForAnswer(option.pairId);

                  const isOver = dropTargetAnswerId === option.pairId;

                  const isCorrect =
                    submitted &&
                    matchedQuestion &&
                    Number(matchedQuestion.pairId) === Number(option.pairId);

                  const isWrong = submitted && matchedQuestion && !isCorrect;

                  return (
                    <div
                      key={option.pairId}
                      className={`matching-row ${
                        isOver ? "matching-row-over" : ""
                      } ${isCorrect ? "matching-row-correct" : ""} ${
                        isWrong ? "matching-row-wrong" : ""
                      }`}
                      onDragOver={(event) =>
                        handleAnswerDragOver(event, option.pairId)
                      }
                      onDragLeave={(event) =>
                        handleAnswerDragLeave(event, option.pairId)
                      }
                      onDrop={(event) => handleDrop(event, option.pairId)}
                    >
                      <div className="column-a-item">
                        <span className="column-letter">
                          {String.fromCharCode(65 + index)}.
                        </span>

                        <span className="column-text">{option.columnB}</span>

                        {matchedQuestion ? (
                          <span className="column-a-match">
                            {matchedQuestion.columnA}

                            {!submitted && (
                              <button
                                type="button"
                                className="remove-match-btn"
                                onClick={() =>
                                  handleRemoveMatch(matchedQuestion.pairId)
                                }
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ) : (
                          !submitted && (
                            <span className="drop-placeholder">
                              Drop a question here
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTTOM QUESTION NAVIGATION */}
          <div className="matching-nav-row">
            <div className="matching-nav-left">
              {questionNumber > 1 && (
                <button
                  type="button"
                  className="matching-prev-btn"
                  onClick={onPrevious}
                >
                  ← Previous
                </button>
              )}
            </div>

            <div className="matching-nav-right">
              {questionNumber < totalQuestions && (
                <button
                  type="button"
                  className="matching-next-btn matching-nav-next-btn"
                  onClick={onNext}
                >
                  Next →
                </button>
              )}
            </div>
          </div>

          {/* ANSWER REVIEW */}
          {submitted && (
            <div className="answer-review">
              <div className="answer-review-title">Answer Review</div>

              {pairs.map((pair, index) => {
                const selectedPair = getSelectedAnswer(pair.pairId);

                const isCorrect =
                  Number(selectedAnswers[pair.pairId]) === Number(pair.pairId);

                return (
                  <div
                    key={pair.pairId}
                    className={isCorrect ? "review-correct" : "review-wrong"}
                  >
                    <strong>
                      {index + 1}. {pair.columnA}
                    </strong>

                    <span>→</span>

                    <span>{selectedPair?.columnB ?? "Not answered"}</span>

                    {isCorrect ? (
                      <span className="review-check">✓ Correct</span>
                    ) : (
                      <span className="review-cross">
                        ✗ Correct: {pair.columnB}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MatchingQuestionView;
