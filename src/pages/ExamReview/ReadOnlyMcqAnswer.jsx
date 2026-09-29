/* eslint-disable react/prop-types */
import { Circle, CircleCheck, CircleX } from "lucide-react";

// Read-only render of a SINGLE_CHOICE or MULTIPLE_CHOICE question: shows the
// paper's own options (question.options - never carries isCorrect, that only
// ever comes from the review response's correctOptionIds) with the
// candidate's selection tagged and the correct option highlighted, mirroring
// the practice flow's own McqQuestionView once it has a result.
const ReadOnlyMcqAnswer = ({ question, answers, correctOptionIds }) => {
  const data = answers?.[0]?.answeredData || {};

  const selected = new Set(
    [data.selectedAnswerId, ...(data.selectedAnswerIds || [])]
      .filter((value) => value != null)
      .map(String),
  );

  const correct = new Set((correctOptionIds || []).map(String));

  const options = [...(question?.options || [])].sort(
    (a, b) => a.optionOrder - b.optionOrder,
  );

  return (
    <div className="ro-mcq">
      {options.length === 0 ? (
        <p className="ro-empty">Not attempted.</p>
      ) : (
        options.map((option, index) => {
          const id = String(option.optionId);
          const isSelected = selected.has(id);
          const isCorrect = correct.has(id);
          const isWrongPick = isSelected && !isCorrect;

          return (
            <div
              key={option.optionId}
              className={`ro-mcq-option${
                isCorrect ? " ro-mcq-option--correct" : ""
              }${isWrongPick ? " ro-mcq-option--incorrect" : ""}`}
            >
              <span className="ro-mcq-option__marker" aria-hidden="true">
                {isCorrect ? (
                  <CircleCheck size={18} />
                ) : isWrongPick ? (
                  <CircleX size={18} />
                ) : (
                  <Circle size={18} />
                )}
              </span>
              <span className="ro-mcq-option__text">
                {String.fromCharCode(65 + index)}. {option.optionText}
              </span>
              {isSelected && (
                <span className="ro-mcq-option__tag">Your answer</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ReadOnlyMcqAnswer;
