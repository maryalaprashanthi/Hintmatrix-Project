import { Button, Container } from "react-bootstrap";
import {
  FaRedo,
  FaSave,
  FaPaperPlane,
  FaExclamationTriangle,
} from "react-icons/fa";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import useQuestionStore from "./questionStore";

function Header({ question: propQuestion, answeredData, setAnsweredData }) {
  const { question: storeQuestion } = useQuestionStore();

  // Journal passes question directly.
  // Other question types use Zustand.
  const question = propQuestion || storeQuestion;

  console.log("Header Question:", question);
  console.log("Header Answered Data:", answeredData);

  const handleCheck = async () => {
    try {
      console.log("========== CHECK MISTAKES ==========");

      if (!question) {
        alert("Question is not loaded.");
        return;
      }

      const mistakes = await QuestionAnswerService.getMistakesByQuestionId(
        question.questionId,
      );

      console.log("Mistakes:", mistakes);

      if (!mistakes || mistakes.length === 0) {
        alert("No mistakes found.");
        return;
      }

      console.log("User mistakes:", mistakes);
    } catch (error) {
      console.error("Failed to get mistakes:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  };

  const handleReset = async () => {
    try {
      console.log("========== RESET QUESTION ==========");

      if (!question) {
        console.log("Question is not loaded.");
        return;
      }

      console.log("Question ID:", question.questionId);

      const result = await QuestionAnswerService.resetAnswersByQuestionId(
        question.questionId,
      );

      console.log("RESET RESPONSE:", result);

      // Clear the current answer rows from the UI
      if (setAnsweredData) {
        setAnsweredData({});
      }

      console.log("Answered data cleared.");
    } catch (error) {
      console.error("Reset failed:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  };

  return (
    <Container fluid className="py-3">
      <div className="d-flex justify-content-between align-items-center">
        {/* Left */}
        <div>
          <div className="fw-bold fs-5">
            {question
              ? `Q${question.questionId}: ${question.questionText}`
              : "Loading..."}
          </div>

          <small className="text-muted">
            {question &&
              `${question.courseName} • ${question.chapterName} • ${question.categoryName}`}
          </small>
        </div>

        {/* Right */}
        <div className="d-flex gap-2 flex-shrink-0">
          <Button
            variant="light"
            size="sm"
            style={{
              minWidth: "95px",
              height: "35px",
            }}
            onClick={handleReset}
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
          >
            <FaExclamationTriangle className="me-1" />
            Check
          </Button>

          <Button
            variant="success"
            size="sm"
            style={{
              minWidth: "95px",
              height: "35px",
            }}
          >
            <FaSave className="me-1" />
            Save
          </Button>

          <Button
            variant="primary"
            size="sm"
            style={{
              minWidth: "95px",
              height: "35px",
            }}
          >
            <FaPaperPlane className="me-1" />
            Submit
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default Header;
