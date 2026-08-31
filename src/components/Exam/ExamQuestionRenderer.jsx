import ExamDropdownPage from "./ExamComponents/ExamDropdownPage";
import ExamJournalPage from "./ExamComponents/ExamJournalPage";
import ExamQuestionPage from "./ExamComponents/ExamQuestionPage";

const ExamQuestionRenderer = ({ questionId }) => {
  switch (questionId) {
    case 2:
      return <ExamDropdownPage id={questionId} />;
    case 3:
      return <ExamJournalPage id={questionId} />;
    case 4:
      return <ExamQuestionPage id={questionId} />;
    default:
      return <p role="alert">Unsupported exam question.</p>;
  }
};

export default ExamQuestionRenderer;
