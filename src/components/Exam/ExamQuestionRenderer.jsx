import DropdownPage from "../DropdownQuestions/DropdownPage";
import JournalPage from "../JournalQuestion/JournalPage";
import QuestionPage from "../Question/QuestionPage";

const ExamQuestionRenderer = ({ questionId }) => {
  switch (questionId) {
    case 2:
      return <DropdownPage id={questionId} variant="exam" />;
    case 3:
      return <JournalPage id={questionId} variant="exam" />;
    case 4:
      return <QuestionPage id={questionId} variant="exam" />;
    default:
      return <p role="alert">Unsupported exam question.</p>;
  }
};

export default ExamQuestionRenderer;
