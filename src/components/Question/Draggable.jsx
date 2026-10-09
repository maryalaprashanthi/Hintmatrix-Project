/* eslint-disable react/prop-types */
import { useDraggable } from "@dnd-kit/react";
import { memo, useEffect, useState } from "react";
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

// Subscribes to the one store-wide busyOperation flag so the full Draggable
// body (hints, autofill, popovers, logging) doesn't have to re-run on every
// drop just to disable every other row's button while one row is mid-drop.
const DragHandle = memo(function DragHandle({ id, type, solved, status, name, amount, onTouchEnd }) {
  const busyOperation = useQuestionStore((state) => state.busyOperation);
  const { ref } = useDraggable({
    id,
    type,
    disabled: solved || Boolean(busyOperation),
  });
  return (
    <button
      ref={solved || busyOperation ? undefined : ref}
      type="button"
      className="drag-btn"
      disabled={solved || Boolean(busyOperation)}
      aria-disabled={solved || Boolean(busyOperation)}
      onTouchEnd={onTouchEnd}
    >
      <span className="drag-btn-content">
        <span>{name}</span>
        <span className="fw-semibold">
          ₹{Number(amount).toLocaleString("en-IN")}
        </span>
      </span>

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
});

// Same reasoning as DragHandle: only the wrong-answer popover's own action
// buttons need busyOperation, so only they subscribe to it.
const WrongActionsMenu = memo(function WrongActionsMenu({
  allHints,
  handleHint,
  handleAutoFill,
  isAutoFilling,
  autoFillError,
}) {
  const busyOperation = useQuestionStore((state) => state.busyOperation);
  return (
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

      <button className="action-menu-item" onClick={handleAutoFill} disabled={Boolean(busyOperation)}>
        <span className="action-icon autofill-icon">✦</span>
        <span>
          <strong>{isAutoFilling ? "Filling…" : "Auto Fill"}</strong>
          <small>Fill this automatically</small>
        </span>
      </button>
      {autoFillError && <div className="text-danger small" role="alert">{autoFillError}</div>}
    </Popover.Body>
  );
});

function Draggable({
  id,
  type,
  status = "pending",
  wrongAttempts = 0,
}) {
  const { questionId } = useParams();
  const [showActions, setShowActions] = useState(false);
  const [autoFillError, setAutoFillError] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  useEffect(() => {
    if (status === "wrong") {
      setShowActions(true);
    } else if (status === "pending" && wrongAttempts === 0) {
      setShowActions(false);
    }
  }, [status, wrongAttempts]);

  const solved = status === "solved";
  const myQuestion = useQuestionStore((state) => state.questions.find((q) => q.id == id));
  const setHintUsed = useQuestionStore((state) => state.setHintUsed);
  const moveQuestion = useQuestionStore((state) => state.moveQuestion);
  const setActualAnswers = useQuestionStore((state) => state.setActualAnswers);
  const setTotalAnswers = useQuestionStore((state) => state.setTotalAnswers);
  const setHints = useQuestionStore((state) => state.setHints);
  const setCurrentScore = useQuestionStore((state) => state.setCurrentScore);
  const allHints = myQuestion.hints;
  const dragButton = (
    <DragHandle
      id={id}
      type={type}
      solved={solved}
      status={status}
      name={myQuestion.name}
      amount={myQuestion.amount}
      onTouchEnd={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setShowActions(true);
      }}
    />
  );

  const handleHint = () => {
    if (useQuestionStore.getState().busyOperation) return;
    setHintUsed(id);
  };

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

      // Like journal auto-fill, persist both the answer and its zero-mark event.
      // Reopening restores questions_answers, not the event history. Save each
      // condition, including amount2 placements and repeated attribute rows.
      for (const answer of unansweredAnswers) {
        if (!useQuestionStore.getState().isOperationCurrent(operation)) return;
        const arithmetic = answer.answer.split("-").pop();
        const placement = {
          userId: getCurrentUserId(),
          questionId,
          attributeId: myQuestion.attributeId,
          questionAttributeId: myQuestion.questionAttributeId,
          tableNameId: answer.tableNameId,
          headerId: answer.headerId,
          amount: answer.amount,
          conditionId: answer.conditionId,
          arithmetic,
        };
        // Keep the AUTOFILL marker first so a failed placement save cannot
        // leave an automatically supplied answer eligible for normal marks.
        await QuestionAnswerService.processAnswerEvent({
          ...placement,
          finalAccounts: true,
          answerPosition: answer.conditionId,
          eventType: "AUTOFILL",
          isCorrect: true,
          description: "Auto filled configured final-account placement.",
          userAnswer: "Auto filled configured final-account placement.",
        });
        await QuestionAnswerService.saveAnswer({
          ...placement,
          pairAttributeId: answer.pairAttributeId,
          totalAnswers: actualAnswers.length,
        });
        if (!useQuestionStore.getState().isOperationCurrent(operation)) return;
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
                <WrongActionsMenu
                  allHints={allHints}
                  handleHint={handleHint}
                  handleAutoFill={handleAutoFill}
                  isAutoFilling={isAutoFilling}
                  autoFillError={autoFillError}
                />
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

export default memo(Draggable);
