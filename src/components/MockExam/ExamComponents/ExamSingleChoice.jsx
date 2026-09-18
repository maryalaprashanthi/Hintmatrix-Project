/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import useExamSessionStore from "./examSessionStore";

// Exam version of the practice McqQuestionView, trimmed to a single-choice
// picker: no immediate correctness feedback (this is a live exam), and the
// selection is kept in examSessionStore like every other exam question type
// so it survives navigating away and back. Unlike Journal/Dropdown, there's
// no sample-paper case with a missing question object, so this only ever
// caches the paper's own question - it never fetches one itself.
const ExamSingleChoice = ({ id, question: sourceQuestion }) => {
  const { questionId: paramsQuestionId } = useParams();
  const questionId = id ?? paramsQuestionId;

  const entry = useExamSessionStore((state) => state.byQuestionId[questionId]);
  const setQuestionData = useExamSessionStore((state) => state.setQuestionData);
  const setAnsweredData = useExamSessionStore((state) => state.setAnsweredData);

  const question = entry?.question ?? null;
  const selected = entry?.answeredData?.selected ?? [];

  useEffect(() => {
    if (questionId && sourceQuestion && !entry?.question) {
      setQuestionData(questionId, { question: sourceQuestion });
    }
  }, [questionId, sourceQuestion, entry?.question, setQuestionData]);

  if (!question) {
    return <div>Loading...</div>;
  }

  const options = [...(question.options || [])].sort(
    (a, b) => a.optionOrder - b.optionOrder,
  );

  const handleSelect = (optionId) => {
    setAnsweredData(questionId, { selected: [optionId] });
  };

  return (
    <div>
      <p className="text-muted">Select one correct answer</p>
      {options.map((option, index) => (
        <Form.Check
          key={option.optionId}
          className="border rounded p-3 ps-5 mb-3"
          id={`exam-mcq-${questionId}-${option.optionId}`}
          type="radio"
          name={`exam-mcq-${questionId}`}
          label={`${String.fromCharCode(65 + index)}. ${option.optionText}`}
          checked={selected.includes(option.optionId)}
          onChange={() => handleSelect(option.optionId)}
        />
      ))}
    </div>
  );
};

export default ExamSingleChoice;
