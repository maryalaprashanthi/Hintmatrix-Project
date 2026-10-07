/* eslint-disable react/prop-types */
import { useDraggable } from "@dnd-kit/react";
import { useEffect, useState } from "react";
import "./Draggable.css";
import { VscError } from "react-icons/vsc";
import { OverlayTrigger, Popover } from "react-bootstrap";
import useQuestionStore, { getRuleAnswers } from "./questionStore";
import { normalizeFinalAccountTarget } from "./SampleData";
import RuleEngineService from "../../services/RuleEngineService";
import { useParams } from "react-router-dom";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import { getCurrentUserId } from "../../utils/user";

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="#10b981" />
    <path
      d="M8 12.5l2.5 2.5 5.5-6"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PendingIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="#fff"
      stroke="#f59e0b"
      strokeWidth="3"
    />
  </svg>
);

export default function Draggable({
  id,
  children,
  type,
  status = "pending",
  wrongAttempts = 0,
}) {
  const { questionId } = useParams();
  const [showActions, setShowActions] = useState(false);
  const [autoFillError, setAutoFillError] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const busyOperation = useQuestionStore((state) => state.busyOperation);

  useEffect(() => {
    if (status === "wrong") {
      setShowActions(true);
    } else if (status === "pending" && wrongAttempts === 0) {
      setShowActions(false);
    }
  }, [status, wrongAttempts]);

  const solved = status === "solved";
  console.log("My status is ", status);
  const { ref } = useDraggable({
    id,
    type,
    disabled: solved || Boolean(busyOperation),
  });
  {
    /* <CheckIcon /> */
    // <PendingIcon />
  }
  const { questions, setHintUsed, moveQuestion, setActualAnswers,
    setTotalAnswers, setHints, setCurrentScore } = useQuestionStore();
  const myQuestion = questions.find((q) => q.id == id);
  const allHints = myQuestion.hints;
  const dragButton = (
    <button
      ref={solved || busyOperation ? undefined : ref}
      type="button"
      className="drag-btn"
      disabled={solved || Boolean(busyOperation)}
      aria-disabled={solved || Boolean(busyOperation)}
      onTouchEnd={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setShowActions(true);
      }}
    >
      <span className="drag-btn-content">{children}</span>

      <span className="drag-status-icon">
        {solved ? (
          <CheckIcon />
        ) : status === "wrong" ? (
          <VscError id="icons-styling-wrong" />
        ) : (
          <PendingIcon />
        )}
      </span>
    </button>
  );

  const handleHint = () => {
    if (useQuestionStore.getState().busyOperation) return;
    console.log("Hint was clicked");
    setHintUsed(id);
  };

  // const handleTryAgain = () => {
  //   console.log("Try again was clicked");
  //   // call answer events with attributeId to remove the correct answers on this id.
  // };

  const handleAutoFill = async () => {
    const operation = useQuestionStore.getState().beginOperation(questionId, "autofill");
    if (!operation) return;
    setIsAutoFilling(true);
    setAutoFillError("");
    try {
      let state = useQuestionStore.getState();
      let myQuestion = state.questions.find((row) => String(row.id) === String(id));
      if (!myQuestion || myQuestion.status === "solved") return;
      const response = await RuleEngineService.getAttributeAnswers(myQuestion.attributeId);
      if (!useQuestionStore.getState().isOperationCurrent(operation)) return;
      state = useQuestionStore.getState();
      myQuestion = state.questions.find((row) => String(row.id) === String(id));
      if (!myQuestion) return;
      const actualAnswers = getRuleAnswers(response, state.question.chapterId, myQuestion)
        .map((answer) => ({ ...answer, answer: normalizeFinalAccountTarget(answer.answer) }));
      setActualAnswers(id, actualAnswers);
      setTotalAnswers(id, actualAnswers.length);
      setHints(id, actualAnswers.map((answer) => answer.information).filter(Boolean));
      const answeredConditionIds = myQuestion.answered.map(
        (a) => a.conditionId,
      );
      const unansweredAnswers = actualAnswers.filter(
        (a) => !answeredConditionIds.includes(a.conditionId),
      );
      if (!unansweredAnswers.length) return;

      const firstAnswer = unansweredAnswers[0];
      await QuestionAnswerService.processAnswerEvent({
        finalAccounts: true,
        userId: getCurrentUserId(),
        questionId,
        attributeId: myQuestion.attributeId,
        questionAttributeId: myQuestion.questionAttributeId,
        tableNameId: firstAnswer.tableNameId,
        headerId: firstAnswer.headerId,
        amount: firstAnswer.amount,
        conditionId: firstAnswer.conditionId,
        arithmetic: firstAnswer.answer.split("-").pop(),
        answerPosition: firstAnswer.conditionId,
        eventType: "AUTOFILL",
        isCorrect: true,
        description: "Auto filled configured final-account placements.",
        userAnswer: "Auto filled configured final-account placements.",
      });

      if (!useQuestionStore.getState().isOperationCurrent(operation)) return;
      // The backend commits all remaining placements and autofill markers in
      // the event transaction, so the browser only updates its local table.
      for (const answer of unansweredAnswers) {
        moveQuestion(id, answer.answer, answer.conditionId, answer.pairAttributeId, answer.amount);
      }
      try {
        await setCurrentScore(getCurrentUserId());
      } catch (scoreError) {
        console.error("Unable to refresh score:", scoreError);
      }
    } catch (error) {
      console.error("I got this error: ", error);
      setAutoFillError(error.response?.data?.message ?? error.message ?? "Unable to auto fill this account.");
    } finally {
      useQuestionStore.getState().endOperation(operation);
      setIsAutoFilling(false);
    }
  };

  return (
    <div
      className={`drag-item ${status == "solved" ? "drag-item-solved" : status == "wrong" ? "drag-item-wrong" : ""}`}
    >
      <>
        {status == "wrong" ? (
          <OverlayTrigger
            key={id}
            trigger="click"
            show={showActions}
            onToggle={setShowActions}
            placement="auto"
            rootClose
            container={document.body}
            overlay={
              <Popover className="question-actions-popover">
                <Popover.Body>
                  <OverlayTrigger
                    trigger="click"
                    placement="right"
                    rootClose
                    container={document.body}
                    overlay={
                      <Popover className="hint-popover">
                        <Popover.Header as="div">💡 Hint</Popover.Header>
                        <Popover.Body>
                          {allHints.map((h, idx) => (
                            <div key={idx}>
                              {h}
                              <hr />
                            </div>
                          ))}
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <button className="action-menu-item" onClick={handleHint} disabled={Boolean(busyOperation)}>
                      <span className="action-icon hint-icon">💡</span>
                      <span>
                        <strong>Hint</strong>
                        <small>Get a helpful clue</small>
                      </span>
                    </button>
                  </OverlayTrigger>

                  {/* <button className="action-menu-item" onClick={handleTryAgain}>
                    <span className="action-icon retry-icon">↻</span>
                    <span>
                      <strong>Try Again</strong>
                      <small>Reset your answer</small>
                    </span>
                  </button> */}

                  <button className="action-menu-item" onClick={handleAutoFill} disabled={Boolean(busyOperation)}>
                    <span className="action-icon autofill-icon">✦</span>
                    <span>
                        <strong>{isAutoFilling ? "Filling…" : "Auto Fill"}</strong>
                      <small>Fill this automatically</small>
                    </span>
                  </button>
                  {autoFillError && <div className="text-danger small" role="alert">{autoFillError}</div>}
                </Popover.Body>
              </Popover>
            }
          >
            <span className="drag-action-anchor">{dragButton}</span>
          </OverlayTrigger>
        ) : (
          dragButton
        )}
      </>
    </div>
  );
}
