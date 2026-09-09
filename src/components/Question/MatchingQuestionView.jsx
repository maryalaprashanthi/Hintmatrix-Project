import React, { useEffect, useState } from "react";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import useQuestionStore from "./questionStore";
import "./MatchingQuestionView.css";

const MatchingQuestionView = ({
  question,
  questionNumber = 1,
  totalQuestions = 20,
  completedCount = 0,
  questions = [],
  completedQuestions = {},
  onCompleted,
  onQuestionSelect,
  onNext,
  onPrevious,
}) => {
  const { setCurrentScore } = useQuestionStore();

  // =========================================================
  // STATE
  // =========================================================

  const [pairs, setPairs] = useState([]);
  const [shuffledColumnB, setShuffledColumnB] = useState([]);

  // Column A pairId -> Column B pairId
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const [draggedAnswer, setDraggedAnswer] = useState(null);

  const [dropTargetPairId, setDropTargetPairId] = useState(null);

  const [submitted, setSubmitted] = useState(false);

  const [score, setScore] = useState(0);

  const [saving, setSaving] = useState(false);

  // =========================================================
  // SHUFFLE
  // =========================================================

  const shuffleArray = (array) => {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(
        Math.random() * (i + 1)
      );

      [result[i], result[randomIndex]] = [
        result[randomIndex],
        result[i],
      ];
    }

    return result;
  };

  // =========================================================
  // LOAD QUESTION
  // =========================================================

  useEffect(() => {
    if (!question) {
      setPairs([]);
      setShuffledColumnB([]);
      setSelectedAnswers({});
      setSubmitted(false);
      setScore(0);
      setDraggedAnswer(null);
      setCurrentScore(0);
      return;
    }

    if (!Array.isArray(question.pairs)) {
      setPairs([]);
      setShuffledColumnB([]);
      setSelectedAnswers({});
      setSubmitted(false);
      setScore(0);
      setDraggedAnswer(null);
      setCurrentScore(0);
      return;
    }

    // -------------------------------------------------------
    // Column A
    // -------------------------------------------------------

    const sortedPairs = [...question.pairs].sort(
      (a, b) =>
        Number(a.displayOrder ?? 0) -
        Number(b.displayOrder ?? 0)
    );

    setPairs(sortedPairs);

    // -------------------------------------------------------
    // Column B
    // -------------------------------------------------------

    setShuffledColumnB(
      shuffleArray(sortedPairs)
    );

    // -------------------------------------------------------
    // Reset
    // -------------------------------------------------------

    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setDraggedAnswer(null);
    setDropTargetPairId(null);

    setCurrentScore(0);
  }, [question?.questionId, setCurrentScore]);

  // =========================================================
  // GET SELECTED ANSWER
  // =========================================================

  const getSelectedAnswer = (pairId) => {
    const selectedId =
      selectedAnswers[pairId];

    if (
      selectedId === undefined ||
      selectedId === null ||
      selectedId === ""
    ) {
      return null;
    }

    return pairs.find(
      (pair) =>
        Number(pair.pairId) ===
        Number(selectedId)
    );
  };

  // =========================================================
  // CHECK WHETHER ANSWER IS USED
  // =========================================================

  const isAnswerUsed = (pairId) => {
    return Object.values(
      selectedAnswers
    ).some(
      (selectedId) =>
        Number(selectedId) ===
        Number(pairId)
    );
  };

  // =========================================================
  // DRAG START
  // =========================================================

  const handleDragStart = (
    event,
    pair
  ) => {
    if (submitted || saving) {
      return;
    }

    setDraggedAnswer(pair);

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      String(pair.pairId)
    );
  };

  // =========================================================
  // DRAG END
  // =========================================================

  const handleDragEnd = () => {
    setDraggedAnswer(null);
    setDropTargetPairId(null);
  };

  const handleQuestionDragOver = (event, pairId) => {
    if (submitted || saving) {
      return;
    }

    event.preventDefault();
    setDropTargetPairId(pairId);
    event.dataTransfer.dropEffect = "move";
  };

  // =========================================================
  // DRAG OVER
  // =========================================================

  const handleDragOver = (event) => {
    if (submitted || saving) {
      return;
    }

    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";
  };

  // =========================================================
  // DROP
  // =========================================================

  const handleDrop = (
    event,
    columnAPairId = dropTargetPairId
  ) => {
    event.preventDefault();

    if (submitted || saving) {
      return;
    }

    if (columnAPairId === null || columnAPairId === undefined) {
      return;
    }

    const pairIdFromDrag =
      event.dataTransfer.getData(
        "text/plain"
      );

    if (!pairIdFromDrag) {
      return;
    }

    const selectedPairId =
      Number(pairIdFromDrag);

    // -------------------------------------------------------
    // Prevent same Column B answer being used twice
    // -------------------------------------------------------

    const usedByAnotherRow =
      Object.entries(
        selectedAnswers
      ).some(
        ([
          currentPairId,
          currentSelectedId,
        ]) =>
          Number(currentPairId) !==
            Number(columnAPairId) &&
          Number(currentSelectedId) ===
            selectedPairId
      );

    if (usedByAnotherRow) {
      return;
    }

    // -------------------------------------------------------
    // Save match
    // -------------------------------------------------------

    setSelectedAnswers(
      (previous) => ({
        ...previous,
        [columnAPairId]:
          selectedPairId,
      })
    );

    setDraggedAnswer(null);
    setDropTargetPairId(null);
  };

  // =========================================================
  // REMOVE MATCH
  // =========================================================

  const handleRemoveMatch = (
    pairId
  ) => {
    if (submitted || saving) {
      return;
    }

    setSelectedAnswers(
      (previous) => {
        const updated = {
          ...previous,
        };

        delete updated[pairId];

        return updated;
      }
    );
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    if (submitted || saving) {
      return;
    }

    setSelectedAnswers({});
    setDraggedAnswer(null);
    setDropTargetPairId(null);
    setScore(0);

    setCurrentScore(0);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {
    if (pairs.length === 0) {
      return;
    }

    // -------------------------------------------------------
    // Check unanswered
    // -------------------------------------------------------

    const unanswered =
      pairs.some(
        (pair) =>
          selectedAnswers[
            pair.pairId
          ] === undefined ||
          selectedAnswers[
            pair.pairId
          ] === null ||
          selectedAnswers[
            pair.pairId
          ] === ""
      );

    if (unanswered) {
      alert(
        "Please match all Column A items before submitting."
      );

      return;
    }

    setSaving(true);

    let correctCount = 0;

    try {
      // -----------------------------------------------------
      // Check each pair
      // -----------------------------------------------------

      for (const pair of pairs) {
        const selectedPairId =
          Number(
            selectedAnswers[
              pair.pairId
            ]
          );

        const isCorrect =
          selectedPairId ===
          Number(pair.pairId);

        if (isCorrect) {
          correctCount++;
        }

        // ---------------------------------------------------
        // Find selected Column B
        // ---------------------------------------------------

        const selectedPair =
          pairs.find(
            (item) =>
              Number(
                item.pairId
              ) ===
              selectedPairId
          );

        // ---------------------------------------------------
        // Save answer event
        // ---------------------------------------------------

        const answerEvent = {
          userId: 1,

          questionId:
            question.questionId,

          attributeId: null,

          arithmetic: "MATCH",

          answerPosition:
            selectedPairId,

          eventType: "ANSWER",

          isCorrect: isCorrect,

          description:
            `Matching question: Column A "${pair.columnA}" was matched with Column B "${selectedPair?.columnB ?? ""}".`,

          userAnswer:
            `Column A "${pair.columnA}" -> Column B "${selectedPair?.columnB ?? ""}"`,
        };

        try {
          await QuestionAnswerService.processAnswerEvent(
            answerEvent
          );
        } catch (error) {
          console.error(
            "Failed to save matching answer:",
            error
          );
        }
      }

      // -----------------------------------------------------
      // Score
      // -----------------------------------------------------

      setScore(correctCount);

      setCurrentScore(
        correctCount
      );

      setSubmitted(true);

      // -----------------------------------------------------
      // Notify QuestionPage
      // -----------------------------------------------------

      if (onCompleted) {
        onCompleted(
          question.questionId,
          correctCount
        );
      }
    } catch (error) {
      console.error(
        "Error submitting matching question:",
        error
      );

      alert(
        "Something went wrong while submitting the answer."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // TRY AGAIN
  // =========================================================

  const handleTryAgain = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setDraggedAnswer(null);

    setCurrentScore(0);

    setShuffledColumnB(
      shuffleArray(pairs)
    );
  };

  // =========================================================
  // PROGRESS
  // =========================================================

  const remainingQuestionCount =
    Math.max(
      totalQuestions -
        completedCount,
      0
    );

  // =========================================================
  // NO QUESTION
  // =========================================================

  if (!question) {
    return (
      <div className="matching-empty">
        <div className="matching-empty-card">
          <h3>
            No question found.
          </h3>
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

          <h3>
            {question.questionText}
          </h3>

          <p>
            No matching pairs found.
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="matching-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="matching-practice-header">

        <div className="matching-header-left">

          <div className="matching-eyebrow">
            STUDENT PRACTICE
          </div>

          <h1 className="matching-practice-title">
            Match the Following
          </h1>

          <p className="matching-practice-subtitle">
            Match each item in Column A with
            the correct answer.
          </p>

        </div>

        {/* ===================================================
            STAT CARDS
        =================================================== */}

        <div className="matching-stat-cards">

          <div className="matching-stat-card matching-progress-card">

            <span>
              PROGRESS
            </span>

            <strong>
              {completedCount}/
              {totalQuestions}
            </strong>

            <small>
              {remainingQuestionCount} left
            </small>

          </div>

          <div className="matching-stat-card matching-score-card">

            <span>
              TOTAL SCORE
            </span>

            <strong>
              {score}
            </strong>

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="matching-practice-layout">

        {/* ===================================================
            MAIN QUESTION
        =================================================== */}

        <main className="matching-question-content">

          {/* =================================================
              QUESTION HEADING
          ================================================= */}

          <div className="matching-question-heading">

            <span>
              Question{" "}
              {questionNumber} of{" "}
              {totalQuestions}
            </span>

            <span className="matching-mark-badge">
              {pairs.length} Marks
            </span>

          </div>

          {/* =================================================
              QUESTION TEXT
          ================================================= */}

          <div className="matching-question-title">
            {question.questionText}
          </div>

          {/* =================================================
              INSTRUCTION
          ================================================= */}

          <div className="matching-instruction">

            <span className="matching-instruction-icon">
              💡
            </span>

            <div>

              <strong>
                How to answer
              </strong>

              <p>
                Drag each answer from Column B
                and drop it into the matching
                box in Column A.
              </p>

            </div>

          </div>

          {/* =================================================
              MATCHING COLUMNS
          ================================================= */}

          <div className="matching-columns">

            {/* =================================================
                COLUMN A
            ================================================= */}

            <div className="matching-column">

              <div className="matching-column-header column-a-header">

                <span className="header-icon">
                  ◇
                </span>

                <span>
                  Column A
                </span>

                <small>
                  Questions
                </small>

              </div>

              <div className="matching-column-body">

                {pairs.map(
                  (pair, index) => {

                    const selectedPair =
                      getSelectedAnswer(
                        pair.pairId
                      );

                    const selectedId =
                      selectedAnswers[
                        pair.pairId
                      ];

                    const isCorrect =
                      submitted &&
                      Number(
                        selectedId
                      ) ===
                        Number(
                          pair.pairId
                        );

                    const isWrong =
                      submitted &&
                      Number(
                        selectedId
                      ) !==
                        Number(
                          pair.pairId
                        );

                    return (
                      <div
                        key={
                          pair.pairId
                        }
                        className={`matching-row ${
                          submitted &&
                          isCorrect
                            ? "matching-row-correct"
                            : ""
                        } ${
                          submitted &&
                          isWrong
                            ? "matching-row-wrong"
                            : ""
                        }`}
                        onDragOver={(event) =>
                          handleQuestionDragOver(event, pair.pairId)
                        }
                        onDrop={(event) =>
                          handleDrop(event, pair.pairId)
                        }
                      >

                        {/* ---------------------------------
                            COLUMN A
                        --------------------------------- */}

                        <div className="column-a-item">

                          <span className="drag-dots">
                            ⋮⋮
                          </span>

                          <span className="column-letter">
                            {String.fromCharCode(
                              65 + index
                            )}
                            .
                          </span>

                          <span className="column-text">
                            {pair.columnA}
                          </span>

                          {selectedPair && (
                            <span className="column-a-match">
                              {selectedPair.columnB}
                              {!submitted && (
                                <button
                                  type="button"
                                  className="remove-match-btn"
                                  onClick={() =>
                                    handleRemoveMatch(pair.pairId)
                                  }
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          )}

                        </div>

                        {/* ---------------------------------
                            RESULT
                        --------------------------------- */}

                        {submitted && (
                          <div className="matching-row-result">

                            {isCorrect ? (
                              <span className="result-correct-text">
                                ✓ Correct
                              </span>
                            ) : (
                              <span className="result-wrong-text">
                                ✗ Correct answer:{" "}
                                {pair.columnB}
                              </span>
                            )}

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* =================================================
                COLUMN B
            ================================================= */}

            <div className="matching-column">

              <div className="matching-column-header column-b-header">

                <span className="header-icon">
                  ◇
                </span>

                <span>
                  Column B
                </span>

                <small>
                  Answers
                </small>

              </div>

              <div className="matching-column-body">

                <div
                  className={`drop-zone matching-drop-tray ${
                    dropTargetPairId !== null ? "drop-zone-active" : ""
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(event) => handleDrop(event)}
                >
                  <span className="drop-placeholder">
                    {dropTargetPairId !== null
                      ? "Drop answer here"
                      : "Drag an answer onto a question"}
                  </span>
                </div>

                {shuffledColumnB.map(
                  (option, index) => {

                    const used =
                      isAnswerUsed(
                        option.pairId
                      );

                    const isDragging =
                      draggedAnswer?.pairId ===
                      option.pairId;

                    return (
                      <div
                        key={
                          option.pairId
                        }
                        draggable={
                          !submitted &&
                          !saving &&
                          !used
                        }
                        onDragStart={(event) =>
                          handleDragStart(
                            event,
                            option
                          )
                        }
                        onDragEnd={
                          handleDragEnd
                        }
                        className={`answer-card ${
                          used
                            ? "answer-card-used"
                            : ""
                        } ${
                          isDragging
                            ? "answer-card-dragging"
                            : ""
                        }`}
                      >

                        <span className="drag-dots">
                          ⋮⋮
                        </span>

                        <span className="answer-number">
                          {index + 1}.
                        </span>

                        <span className="answer-text">
                          {option.columnB}
                        </span>

                        {used && (
                          <span className="answer-used-label">
                            Used
                          </span>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              RESULT
          ================================================= */}

          {submitted && (
            <div className="matching-result">

              <div className="result-title">
                Result
              </div>

              <div className="result-score">
                {score} / {pairs.length}
              </div>

              <div className="result-message">

                {score === pairs.length
                  ? "Excellent! All answers are correct."
                  : `You got ${score} out of ${pairs.length} correct.`}

              </div>

            </div>
          )}

          {/* =================================================
              ANSWER REVIEW
          ================================================= */}

          {submitted && (
            <div className="answer-review">

              <div className="answer-review-title">
                Answer Review
              </div>

              {pairs.map(
                (pair, index) => {

                  const selectedPair =
                    getSelectedAnswer(
                      pair.pairId
                    );

                  const isCorrect =
                    Number(
                      selectedAnswers[
                        pair.pairId
                      ]
                    ) ===
                    Number(
                      pair.pairId
                    );

                  return (
                    <div
                      key={
                        pair.pairId
                      }
                      className={
                        isCorrect
                          ? "review-correct"
                          : "review-wrong"
                      }
                    >

                      <strong>
                        {String.fromCharCode(
                          65 + index
                        )}
                        .{" "}
                        {pair.columnA}
                      </strong>

                      <span>
                        →
                      </span>

                      <span>
                        {selectedPair?.columnB ??
                          "Not answered"}
                      </span>

                      {isCorrect ? (
                        <span className="review-check">
                          ✓ Correct
                        </span>
                      ) : (
                        <span className="review-cross">
                          ✗ Correct:{" "}
                          {pair.columnB}
                        </span>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="matching-actions">

            {!submitted ? (
              <>

                <button
                  type="button"
                  className="matching-reset-btn"
                  onClick={
                    handleReset
                  }
                  disabled={
                    saving ||
                    Object.keys(
                      selectedAnswers
                    ).length === 0
                  }
                >
                  ↻ Reset
                </button>

                <button
                  type="button"
                  className="matching-next-btn"
                  onClick={
                    handleSubmit
                  }
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Submit Answer"}
                </button>

              </>
            ) : (
              <>

                <button
                  type="button"
                  className="matching-reset-btn"
                  onClick={
                    handleTryAgain
                  }
                >
                  ↻ Try Again
                </button>

                {questionNumber <
                  totalQuestions && (
                  <button
                    type="button"
                    className="matching-next-btn"
                    onClick={
                      onNext
                    }
                  >
                    Next Question →
                  </button>
                )}

              </>
            )}

          </div>

        </main>

        {/* ===================================================
            QUESTION NAVIGATOR
        =================================================== */}

        <aside className="matching-question-navigator">

          <h2>
            Question Navigator
          </h2>

          {/* =================================================
              LEGEND
          ================================================= */}

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

          {/* =================================================
              QUESTION NUMBERS
          ================================================= */}

          <div className="matching-question-numbers">

            {Array.from(
              {
                length:
                  totalQuestions,
              },
              (_, index) => {

                const number =
                  index + 1;

                const isCurrent =
                  number ===
                  questionNumber;

                const actualQuestion =
                  questions[index];

                const isAnswered =
                  Boolean(
                    actualQuestion &&
                      completedQuestions[
                        actualQuestion.questionId
                      ]
                  ) ||
                  (isCurrent && submitted);

                return (
                  <button
                    key={
                      number
                    }
                    type="button"
                    disabled={
                      !actualQuestion ||
                      !onQuestionSelect
                    }
                    onClick={() =>
                      onQuestionSelect(
                        index
                      )
                    }
                    className={`
                      ${
                        isCurrent
                          ? "current"
                          : ""
                      }
                      ${
                        isAnswered
                          ? "answered"
                          : ""
                      }
                    `}
                  >
                    {number}
                  </button>
                );
              }
            )}

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="matching-navigator-summary">

            <div>

              <strong>
                {completedCount}
              </strong>

              <span>
                Answered
              </span>

            </div>

            <div>

              <strong>
                {remainingQuestionCount}
              </strong>

              <span>
                Not Answered
              </span>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
};

export default MatchingQuestionView;