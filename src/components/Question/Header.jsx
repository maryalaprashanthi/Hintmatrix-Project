import { Button, Container } from "react-bootstrap";
import {
  FaRedo,
  FaExclamationTriangle,
} from "react-icons/fa";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import useQuestionStore from "./questionStore";
import { useState } from "react";
import { getCurrentUserId } from "../../utils/user";

function Header({
  question: propQuestion,
  setAnsweredData,
  setCheckMistakes,
  actions,
  questionTypeLabel,
}) {
  const storeQuestion = useQuestionStore((state) => state.question);
  const resetFrontend = useQuestionStore((state) => state.resetFrontend);
  const busyOperation = useQuestionStore((state) => state.busyOperation);
  const [isResetting, setIsResetting] = useState(false);

  const question = propQuestion || storeQuestion;
  const usesDragStore = !propQuestion && !setAnsweredData;

  const openMistakes = async () => {
    try {
      if (!question) {
        alert("Question is not loaded.");
        return;
      }

      const userId = getCurrentUserId();

      await QuestionAnswerService.getMistakesByQuestionId(
        userId,
        question.questionId,
      );
      setCheckMistakes(true);
    } catch (error) {
      console.error("Failed to get mistakes:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  };

  const handleCheck = openMistakes;

  const handleReset = async () => {
    if (isResetting) return;
    const usesDragStore = !propQuestion && !setAnsweredData;
    const operation = usesDragStore
      ? useQuestionStore.getState().beginOperation(question?.questionId, "reset") : null;
    if (usesDragStore && !operation) return;
    setIsResetting(true);
    try {
      if (!question?.questionId) {
        return;
      }

      const userId = getCurrentUserId();
      const questionId = question.questionId;
      if (!userId) {
        alert("Please sign in before resetting your answers.");
        return;
      }

      // 1. Reset current QuestionAnswers
      await QuestionAnswerService.resetAnswersByUserAndQuestion(
        userId,
        questionId,
      );

      if (usesDragStore && !useQuestionStore.getState().isOperationCurrent(operation)) return;

      // Clear only current answers after the backend reset succeeds.
      if (setAnsweredData) {
        setAnsweredData({});
      } else {
        resetFrontend();
      }
      setCheckMistakes?.(false);
    } catch (error) {
      console.error("Reset failed:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
      alert("Unable to reset your answers. Please try again.");
    } finally {
      if (usesDragStore) useQuestionStore.getState().endOperation(operation);
      setIsResetting(false);
    }
  };

  return (
    <Container fluid className="py-3">
      <div className="d-flex justify-content-between align-items-center">
        {/* Left */}
        <div>
          {/* <div className="fw-bold fs-5">
            {question
              ? `Q${question.questionId}: ${question.questionText}`
              : "Loading..."}
          </div> */}
          <div className="fw-bold fs-5">
            {question ? question.questionText : "Loading..."}
          </div>

          <small className="text-muted">
            {question &&
              `${question.courseName} • ${question.subjectName} • ${question.chapterName} • ${question.topicName}`}
            {questionTypeLabel && ` • ${questionTypeLabel}`}
          </small>
        </div>

        {/* Right */}
        <div className="d-flex gap-2 flex-shrink-0">
          {actions ?? (
            <>
              <Button
                variant="light"
                size="sm"
                style={{
                  minWidth: "95px",
                  height: "35px",
                }}
                onClick={handleReset}
                disabled={isResetting || (usesDragStore && Boolean(busyOperation))}
              >
                <FaRedo className="me-1" />
                Reset
              </Button>

              <Button
                variant="warning"
                size="sm"
                style={{
                  minWidth: "95px",
                  height: "35px",
                }}
                onClick={handleCheck}
                disabled={usesDragStore && Boolean(busyOperation)}
              >
                <FaExclamationTriangle className="me-1" />
                Check
              </Button>

            </>
          )}
        </div>
      </div>
    </Container>
  );
}

export default Header;
