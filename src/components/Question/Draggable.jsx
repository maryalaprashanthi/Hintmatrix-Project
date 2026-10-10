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

const DragHandle = memo(function DragHandle({ id, type, solved, status, name, amount, busy, selected, onSelect, onTouchEnd }) {
  const { ref } = useDraggable({
    id,
    type,
    disabled: solved || Boolean(busy),
  });
  const amountText = amount == null || amount === "" || !Number.isFinite(Number(amount))
    ? "Amount unavailable" : `₹${Number(amount).toLocaleString("en-IN")}`;
  return (
    <button
      ref={solved || busy ? undefined : ref}
      type="button"
      className={`drag-btn${selected ? " drag-btn-selected" : ""}`}
      disabled={solved || Boolean(busy)}
      aria-disabled={solved || Boolean(busy)}
      aria-pressed={onSelect ? Boolean(selected) : undefined}
      onClick={onSelect}
      onTouchEnd={onTouchEnd}
    >
      <span className="drag-btn-content">
        <span>{name}</span>
        <span className="fw-semibold">
          {amountText}
        </span>
      </span>

      <span className="drag-status-icon" aria-label={solved ? "Solved" : status === "wrong" ? "Incorrect answer" : "Drag to place"}>
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

// Keep store subscriptions in the ordinary question adapter. Controlled
// question views provide busy state without subscribing to that store.
const StoreDragHandle = memo(function StoreDragHandle(props) {
  const busyOperation = useQuestionStore((state) => state.busyOperation);
  return <DragHandle {...props} busy={Boolean(busyOperation)} />;
});

const WrongActionsMenu = memo(function WrongActionsMenu({
  allHints,
  handleHint,
  handleAutoFill,
  isAutoFilling,
  autoFillError,
  busy,
}) {
  return (
    <Popover.Body>
      <OverlayTrigger
        trigger="click"
        placement="right"
        rootClose
        container={typeof document === "undefined" ? undefined : document.body}
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
        <button type="button" className="action-menu-item" onClick={handleHint} disabled={Boolean(busy)}>
          <span className="action-icon hint-icon">💡</span>
          <span>
            <strong>Hint</strong>
            <small>Get a helpful clue</small>
          </span>
        </button>
      </OverlayTrigger>

      <button type="button" className="action-menu-item" onClick={handleAutoFill} disabled={Boolean(busy)}>
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

const StoreWrongActionsMenu = memo(function StoreWrongActionsMenu(props) {
  const busyOperation = useQuestionStore((state) => state.busyOperation);
  return <WrongActionsMenu {...props} busy={Boolean(busyOperation)} />;
});

function DraggableTile({ id, type, name, note, amount, solved, status, wrongAttempts = 0, busy, selected, hints = [],
  autoFilling, actionError, onSelect, onHint, onAutoFill, Handle = DragHandle, ActionsMenu = WrongActionsMenu }) {
  const [showActions, setShowActions] = useState(false);
  useEffect(() => {
    if (!solved && status === "wrong") {
      setShowActions(true);
    } else if (solved || (status === "pending" && wrongAttempts === 0)) {
      setShowActions(false);
    }
  }, [solved, status, wrongAttempts]);
  const dragButton = (
    <Handle
      id={id}
      type={type}
      solved={solved}
      status={status}
      name={name}
      amount={amount}
      busy={busy}
      selected={selected}
      onSelect={onSelect}
      onTouchEnd={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect?.();
        setShowActions(true);
      }}
    />
  );

  return <div className={`drag-item ${solved ? "drag-item-solved" : status === "wrong" ? "drag-item-wrong" : ""}`}>
    {!solved && status === "wrong" ? <OverlayTrigger key={id} trigger="click" show={showActions} onToggle={setShowActions}
      placement="auto" rootClose container={typeof document === "undefined" ? undefined : document.body}
      overlay={<Popover className="question-actions-popover"><ActionsMenu allHints={hints} handleHint={onHint}
        handleAutoFill={onAutoFill} isAutoFilling={autoFilling} autoFillError={actionError} busy={busy} /></Popover>}>
      <span className="drag-action-anchor">{dragButton}</span>
    </OverlayTrigger> : dragButton}
    {note && <p className="drag-note small text-muted">{note}</p>}
  </div>;
}

function OrdinaryDraggable({ id, type, status = "pending" }) {
  const { questionId } = useParams();
  const [autoFillError, setAutoFillError] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const myQuestion = useQuestionStore((state) => state.questions.find((q) => q.id == id));
  const setHintUsed = useQuestionStore((state) => state.setHintUsed);
  const moveQuestion = useQuestionStore((state) => state.moveQuestion);
  const setActualAnswers = useQuestionStore((state) => state.setActualAnswers);
  const setTotalAnswers = useQuestionStore((state) => state.setTotalAnswers);
  const setHints = useQuestionStore((state) => state.setHints);
  const setCurrentScore = useQuestionStore((state) => state.setCurrentScore);
  const showActions = useQuestionStore((state) => String(state.errorPopoverId) === String(id));
  const toggleErrorPopover = useQuestionStore((state) => state.toggleErrorPopover);
  const solved = status === "solved";
  const dragButton = (
    <StoreDragHandle
      id={id}
      type={type}
      solved={solved}
      status={status}
      name={myQuestion.name}
      amount={myQuestion.amount}
      onSelect={status === "wrong" ? () => toggleErrorPopover(id) : undefined}
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
      data-error-popover-row={id}
      className={`drag-item ${solved ? "drag-item-solved" : status === "wrong" ? "drag-item-wrong" : ""}`}
    >
      <OverlayTrigger
        trigger={[]}
        show={showActions && status === "wrong"}
        placement="auto"
        rootClose
        container={typeof document === "undefined" ? undefined : document.body}
        overlay={
          <Popover className="question-actions-popover">
            <StoreWrongActionsMenu
              allHints={myQuestion.hints}
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
    </div>
  );
}

function Draggable(props) {
  if (!props.row) return <OrdinaryDraggable {...props} />;
  const { row, sourceId = row.id, amount = row.amount, solved = false, status = "pending", onSelect, onHint, onAutoFill } = props;
  return <DraggableTile {...props} id={sourceId} name={row.name} note={row.note} amount={amount} solved={solved}
    status={solved ? "solved" : status} onSelect={onSelect ? () => onSelect(row.id, amount) : undefined}
    onHint={onHint ? () => onHint(row.id) : undefined} onAutoFill={onAutoFill ? () => onAutoFill(row.id) : undefined} />;
}

export default memo(Draggable);
