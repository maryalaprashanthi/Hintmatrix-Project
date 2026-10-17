/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import MatchingQuestionView from "../../Question/MatchingQuestionView";
import useExamStore from "./examSessionStore";

// The practice match-the-following view in exam mode: the same drag and
// drop, with the answers kept in the exam store as { matches: [...] }. The
// mock exam passes its own store.
const ExamMatching = ({
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
    <MatchingQuestionView
      question={entry.question}
      exam={{
        answers: entry.answeredData?.matches ?? [],
        onChange: (matches) => setAnsweredData(questionId, { matches }),
      }}
    />
  );
};

export default ExamMatching;
