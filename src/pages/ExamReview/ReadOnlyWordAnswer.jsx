/* eslint-disable react/prop-types */
import { CircleCheck, CircleX } from "lucide-react";

// Read-only review of a MATCHING or FILL_IN_THE_BLANK question: one row for
// each column A item (or blank), with the candidate's answer, a ✓ or ✕, and
// the correct answer. The correct answers come only from the review response
// (correctMatches / correctBlanks), never from the paper.
const sameText = (a, b) =>
  String(a ?? "")
    .trim()
    .toLowerCase() ===
  String(b ?? "")
    .trim()
    .toLowerCase();

const matchingRows = (question, answers, correctMatches) =>
  [...(question?.pairs || [])]
    .sort((a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0))
    .map((pair) => {
      const given = answers.find(
        (line) => String(line.pairId) === String(pair.pairId),
      );
      const correct =
        correctMatches?.[pair.pairId] ?? correctMatches?.[String(pair.pairId)];
      return {
        key: pair.pairId,
        label: pair.columnA,
        given: given?.answerText ?? "",
        isCorrect:
          given?.status === "correct" ||
          (given != null && sameText(given.answerText, correct)),
        correctText: correct ?? "",
      };
    });

const blankRows = (question, answers, correctBlanks) => {
  const fromKeys = Object.keys(correctBlanks || {}).map(Number);
  const count = Math.max(Number(question?.blankCount) || 0, ...fromKeys, 0);
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const given = answers.find((line) => Number(line.blankNumber) === number);
    const accepted =
      correctBlanks?.[number] ?? correctBlanks?.[String(number)] ?? [];
    return {
      key: number,
      label: `Blank ${number}`,
      given: given?.answerText ?? "",
      isCorrect:
        given?.status === "correct" ||
        (given != null &&
          accepted.some((answer) => sameText(answer, given.answerText))),
      correctText: accepted.join(" / "),
    };
  });
};

const ReadOnlyWordAnswer = ({
  question,
  answers,
  questionType,
  correctMatches,
  correctBlanks,
}) => {
  const lines = (answers || []).map((answer) => answer?.answeredData || {});
  const rows =
    questionType === "MATCHING"
      ? matchingRows(question, lines, correctMatches)
      : blankRows(question, lines, correctBlanks);

  if (!lines.length) {
    return <p className="ro-empty">Not attempted.</p>;
  }

  return (
    <div className="ro-mcq">
      {rows.map((row) => {
        const answered = Boolean(row.given);
        return (
          <div
            key={row.key}
            className={`ro-mcq-option ${
              row.isCorrect
                ? "ro-mcq-option--correct"
                : "ro-mcq-option--incorrect"
            }`}
          >
            <span className="ro-mcq-option__marker" aria-hidden="true">
              {row.isCorrect ? (
                <CircleCheck size={18} />
              ) : (
                <CircleX size={18} />
              )}
            </span>
            <span className="ro-mcq-option__text">
              <strong>{row.label}</strong>
              {" → "}
              {answered ? row.given : <em>Not answered</em>}
              <span className="visually-hidden">
                {row.isCorrect ? " (correct)" : " (wrong)"}
              </span>
            </span>
            {!row.isCorrect && row.correctText && (
              <span className="ro-mcq-option__tag">
                Correct: {row.correctText}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReadOnlyWordAnswer;
