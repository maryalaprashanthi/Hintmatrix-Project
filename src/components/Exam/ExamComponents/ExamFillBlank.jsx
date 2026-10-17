/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import FillInBlankQuestionView from "../../Question/FillInBlankQuestionView";
import useExamStore from "./examSessionStore";

// The practice fill-in-the-blanks view in exam mode: the same drag and drop,
// with the answers kept in the exam store as { filled: [...] }. The mock
// exam passes its own store.
const ExamFillBlank = ({
  id,
  question: sourceQuestion,
  sessionStore = useExamStore,
}) => {
  const { questionId: paramsQuestionId } = useParams();
  const questionId = id ?? paramsQuestionId;

  const entry = sessionStore((state) => state.byQuestionId[questionId]);
  const setQuestionData = sessionStore((state) => state.setQuestionData);
  const setAnsweredData = sessionStore((state) => state.setAnsweredData);

  useEffect(() => {
    if (questionId && sourceQuestion && !entry?.question) {
      setQuestionData(questionId, { question: sourceQuestion });
    }
  }, [questionId, sourceQuestion, entry?.question, setQuestionData]);

  if (!entry?.question) {
    return <div>Loading...</div>;
  }

  return (
    <FillInBlankQuestionView
      question={entry.question}
      exam={{
        answers: entry.answeredData?.filled ?? [],
        onChange: (filled) => setAnsweredData(questionId, { filled }),
      }}
    />
  );
};

export default ExamFillBlank;
