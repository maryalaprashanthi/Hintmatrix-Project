/* eslint-disable react/prop-types */
import { useDraggable } from "@dnd-kit/react";
import "./Draggable.css";
import { VscError } from "react-icons/vsc";
import { OverlayTrigger, Popover } from "react-bootstrap";
import useQuestionStore from "./questionStore";
import RuleEngineService from "../../services/RuleEngineService";
import { useParams } from "react-router-dom";
import QuestionAnswerService from "../../services/QuestionAnswerService";

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

export default function Draggable({ id, children, type, status = "pending" }) {
  const { questionId } = useParams();
  const solved = status === "solved";
  console.log("My status is ", status);
  const { ref } = useDraggable({
    id,
    type,
    disabled: solved,
  });
  {
    /* <CheckIcon /> */
    // <PendingIcon />
  }
  const { questions, setHintUsed, moveQuestion } = useQuestionStore();
  const myQuestion = questions.find((q) => q.id == id);
  const allHints = myQuestion.hints;
  const dragButton = (
    <button
      ref={solved ? undefined : ref}
      type="button"
      className="drag-btn"
      disabled={solved}
      aria-disabled={solved}
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
    console.log("Hint was clicked");
    setHintUsed(id);
  };

  // const handleTryAgain = () => {
  //   console.log("Try again was clicked");
  //   // call answer events with attributeId to remove the correct answers on this id.
  // };

  const handleAutoFill = async () => {
    console.log("Autofill was clicked");

    try {
      const response = await RuleEngineService.getAttributeAnswers(id);
      const apiData = response?.[0];
      if (!apiData) return;

      const validTargets = [];
      const pairedId = apiData.pairAttributeId;
      for (let i = 1; i <= 4; i++) {
        const condition = apiData[`condition${i}`];
        if (!condition || condition.arithmetic == null) continue;

        validTargets.push({
          targetId: `${condition.tableName}-${condition.headerName}-${condition.arithmetic}`,
          conditionId: i,
        });
      }

      if (!validTargets.length) return;

      validTargets.forEach((obj) => {
        moveQuestion(id, obj.targetId, obj.conditionId, pairedId);
      });
      const post_body = {
        userId: 1,
        questionId: questionId,
        attributeId: id,
        arithmetic: "add",
        answerPosition: "1",
        eventType: "AUTOFILL",
        isCorrect: true,
        description: "empty",
        userAnswer: "empty",
      };

      // call question answer service for all answers that are in actual answers but not in answered with this body
      const answeredConditionIds = myQuestion.answered.map(
        (a) => a.conditionId,
      );
      const unansweredAnswers = myQuestion.actualAnswers.filter(
        (a) => !answeredConditionIds.includes(a.conditionId),
      );

      for (const answer of unansweredAnswers) {
        const questionBody = {
          userId: 1,
          questionId: questionId,
          tableNameId: answer.tableNameId,
          headerId: answer.headerId,
          attributeId: id,
          arithmetic: answer.answer.split("-").pop(),
          amount: myQuestion.amount,
          conditionId: answer.conditionId,
          pairAttributeId: answer.pairAttributeId,
          totalAnswers: myQuestion.totalAnswers,
        };

        console.log("Saving unanswered answer: ", questionBody);
        await QuestionAnswerService.saveAnswer(questionBody);
      }

      console.log(post_body);
      const response2 =
        await QuestionAnswerService.processAnswerEvent(post_body);
      console.log(response2);
    } catch (error) {
      console.error("I got this error: ", error);
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
            placement="bottom"
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
                    <button className="action-menu-item" onClick={handleHint}>
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

                  <button className="action-menu-item" onClick={handleAutoFill}>
                    <span className="action-icon autofill-icon">✦</span>
                    <span>
                      <strong>Auto Fill</strong>
                      <small>Fill this automatically</small>
                    </span>
                  </button>
                </Popover.Body>
              </Popover>
            }
          >
            {dragButton}
          </OverlayTrigger>
        ) : (
          dragButton
        )}
      </>
    </div>
  );
}
