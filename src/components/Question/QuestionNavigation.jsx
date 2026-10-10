const QuestionNavigation = ({
  questionNumber = 1,
  totalQuestions = 1,
  onPrevious,
  onNext,
}) => {
  const currentQuestion = Number(questionNumber) || 1;
  const total = Number(totalQuestions) || 1;

  const canGoPrevious = typeof onPrevious === "function" && currentQuestion > 1;

  const canGoNext = typeof onNext === "function" && currentQuestion < total;

  return (
    <div className="matching-nav-row matching-nav-bottom">
      <div className="matching-nav-left">
        <button
          type="button"
          className="matching-prev-btn"
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          ← Previous
        </button>
      </div>

      <div className="matching-nav-center">
        Question {currentQuestion} of {total}
      </div>

      <div className="matching-nav-right">
        <button
          type="button"
          className="matching-next-btn"
          onClick={onNext}
          disabled={!canGoNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default QuestionNavigation;
