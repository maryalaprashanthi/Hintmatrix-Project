import { Button, Container } from "react-bootstrap";
import {
  FaRedo,
  FaSave,
  FaPaperPlane,
  FaExclamationTriangle,
} from "react-icons/fa";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import useQuestionStore from "./questionStore";
import QuestionService from "../../services/QuestionService";
import { data } from "./SampleData";
import { useParams } from "react-router-dom";

function Header({ question: propQuestion, answeredData, setAnsweredData }) {
  const {
    question: storeQuestion,
    setQuestions,
    setTableData,
    setCheckMistakes,
    showCheckMistakes,
  } = useQuestionStore();
  const { questionId } = useParams();

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

      const userId = 1;

      const mistakes = await QuestionAnswerService.getMistakesByQuestionId(
        userId,
        question.questionId,
      );

      console.log("Mistakes:", mistakes);

      // if (!mistakes || mistakes.length === 0) {
      //   alert("No mistakes found.");
      //   return;
      // }

      // console.log("User mistakes:", mistakes);
      setCheckMistakes(true);
    } catch (error) {
      console.error("Failed to get mistakes:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await QuestionService.getQuestionById(questionId);

      let allStrings = data.flatMap((obj) =>
        obj.headers.map((header) => `${obj.name}-${header}`),
      );
      // console.log("All strings are ", allStrings);
      setQuestions([response.data]);
      setTableData(allStrings);
    } catch (error) {
      console.error("Failed to load question:", error);
    }
  };

  const handleReset = async () => {
    try {
      console.log("========== RESET QUESTION ==========");

      if (!question) {
        console.log("Question is not loaded.");
        return;
      }

      const userId = 1;
      const questionId = question.questionId;

      console.log("User ID:", userId);
      console.log("Question ID:", questionId);

      // 1. Reset current QuestionAnswers
      const questionAnswerResult =
        await QuestionAnswerService.resetAnswersByUserAndQuestion(
          userId,
          questionId,
        );

      console.log("QUESTION ANSWER RESET RESPONSE:", questionAnswerResult);

      // 2. Reset AnswerEvents/history for current cycle
      const answerEventResult =
        await QuestionAnswerService.resetAnswerEventsByUserAndQuestion(
          userId,
          questionId,
        );

      console.log("ANSWER EVENT RESET RESPONSE:", answerEventResult);

      // 3. Clear current frontend answers
      if (setAnsweredData) {
        setAnsweredData({});
        // loadQuestions(); // Reload questions after reset
      }
      useQuestionStore.setState({
        questions: [],
        droppableData: {},
      });

      await loadQuestions();

      console.log("Frontend answered data cleared.");
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
