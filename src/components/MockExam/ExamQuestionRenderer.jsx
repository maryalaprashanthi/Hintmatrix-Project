/* eslint-disable react/prop-types */
import ExamDropdownPage from "./ExamComponents/ExamDropdownPage";
import ExamJournalPage from "./ExamComponents/ExamJournalPage";
import ExamQuestionPage from "./ExamComponents/ExamQuestionPage";
import { questionTypeOf } from "./ExamComponents/questionTypeOf";
import ExamMultipleChoice from "./ExamComponents/ExamMultipleChoice";
import ExamSingleChoice from "./ExamComponents/ExamSingleChoice";
import ExamMatching from "../Exam/ExamComponents/ExamMatching";
import ExamFillBlank from "../Exam/ExamComponents/ExamFillBlank";
import DragAndDropWithAdj from "../Question/DragAndDropWithAdj";
import examStore from "./ExamComponents/examQuestionStore";
import sessionStore from "./ExamComponents/examSessionStore";

// The API paper (/exams/:examId) hands each question object straight through,
// so the type comes off the payload. The sample paper (/exam-mine) has no
// object here, so it still falls back to matching the known question ids.
const ExamQuestionRenderer = ({ questionId, question }) => {
  const questionType = questionTypeOf(question);
  if (questionType === "DRAG_AND_DROP_WITH_ADJ") {
    return (
      <DragAndDropWithAdj
        key={questionId}
        question={question}
        examStore={examStore}
        sessionStore={sessionStore}
      />
    );
  }

  if (questionType === "JOURNAL") {
    return <ExamJournalPage id={questionId} question={question} />;
  }

  if (questionType === "DROPDOWN") {
    return <ExamDropdownPage id={questionId} question={question} />;
  }

  if (questionType === "DRAG_AND_DROP") {
    return <ExamQuestionPage id={questionId} question={question} />;
  }

  if (questionType === "MULTIPLE_CHOICE") {
    return <ExamMultipleChoice id={questionId} question={question} />;
  }

  // Shared with the exam; the mock exam keeps answers in its own store.
  if (questionType === "MATCHING") {
    return (
      <ExamMatching
        id={questionId}
        question={question}
        sessionStore={sessionStore}
      />
    );
  }

  if (questionType === "FILL_IN_THE_BLANK") {
    return (
      <ExamFillBlank
        id={questionId}
        question={question}
        sessionStore={sessionStore}
      />
    );
  }

  if (questionType === "SINGLE_CHOICE") {
    return <ExamSingleChoice id={questionId} question={question} />;
  }

  if (question) {
    console.warn("[ExamQuestionRenderer] unrecognised question type", {
      raw: question?.questionType,
      normalized: questionType,
      questionId,
    });
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
