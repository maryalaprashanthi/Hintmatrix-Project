/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import useExamSessionStore from "./examSessionStore";

// Same as ExamSingleChoice, but a student can toggle any number of options.
// There's no sample-paper case with a missing question object here, so this
// only ever caches the paper's own question - it never fetches one itself.
const ExamMultipleChoice = ({ id, question: sourceQuestion }) => {
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

  const toggleOption = (optionId) => {
    setAnsweredData(questionId, (prev) => {
      const current = prev?.selected ?? [];
      const next = current.includes(optionId)
        ? current.filter((value) => value !== optionId)
        : [...current, optionId];

      return { ...prev, selected: next };
    });
  };

  return (
    <div>
      <p className="text-muted">Select all correct answers</p>
      {options.map((option, index) => (
        <Form.Check
          key={option.optionId}
          className="border rounded p-3 ps-5 mb-3"
          id={`exam-mcq-${questionId}-${option.optionId}`}
          type="checkbox"
          name={`exam-mcq-${questionId}`}
          label={`${String.fromCharCode(65 + index)}. ${option.optionText}`}
          checked={selected.includes(option.optionId)}
          onChange={() => toggleOption(option.optionId)}
        />
      ))}
    </div>
  );
};

export default ExamMultipleChoice;
