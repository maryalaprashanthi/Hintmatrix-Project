/* eslint-disable react/prop-types */
import ExamDropdownPage from "./ExamComponents/ExamDropdownPage";
import ExamJournalPage from "./ExamComponents/ExamJournalPage";
import ExamQuestionPage from "./ExamComponents/ExamQuestionPage";

// The API paper (/exams/:examId) hands each question object straight through,
// so the type comes off the payload. The sample paper (/exam-mine) has no
// object here, so it still falls back to matching the known question ids.
const ExamQuestionRenderer = ({ questionId, question }) => {
  const questionType = question?.questionType;

  if (questionType === "JOURNAL") {
    return <ExamJournalPage id={questionId} question={question} />;
  }

  if (questionType === "DROPDOWN") {
    return <ExamDropdownPage id={questionId} question={question} />;
  }

  if (questionType) {
    return <ExamQuestionPage id={questionId} question={question} />;
  }

  switch (questionId) {
    case 2:
      return <ExamDropdownPage id={questionId} />;
    case 3:
      return <ExamJournalPage id={questionId} />;
    case 4:
      return <ExamQuestionPage id={questionId} />;
    default:
      return <p role="alert">This question type isn&rsquo;t supported yet.</p>;
  }
};

export default ExamQuestionRenderer;
