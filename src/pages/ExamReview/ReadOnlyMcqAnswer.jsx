/* eslint-disable react/prop-types */
// Read-only render of a SINGLE_CHOICE or MULTIPLE_CHOICE question: shows the
// paper's own options (question.options - never carries isCorrect, that only
// ever comes from the review response's correctOptionIds) with the
// candidate's selection marked and the correct option highlighted, mirroring
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

          return (
            <div
              key={option.optionId}
              className={`ro-mcq-option${
                isCorrect ? " ro-mcq-option--correct" : ""
              }${isSelected && !isCorrect ? " ro-mcq-option--incorrect" : ""}`}
            >
              <span className="ro-mcq-option__marker" aria-hidden="true">
                {isSelected ? "●" : "○"}
              </span>
              <span className="ro-mcq-option__text">
                {String.fromCharCode(65 + index)}. {option.optionText}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ReadOnlyMcqAnswer;
