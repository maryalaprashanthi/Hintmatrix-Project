// Submission lines for the exam's word questions: match the following and
// fill in the blanks. The practice views (MatchingQuestionView,
// FillInBlankQuestionView) in exam mode keep only filled slots in
// examSessionStore:
//
//   MATCHING           { matches: [{ pairId, answerText }] }
//   FILL_IN_THE_BLANK  { filled:  [{ blankNumber, answerText }] }
//
// The paper sends no ids for the words (QuestionService.hideTextAnswers), so
// the answer is the word's text.

export const MATCH_KEY = "pairId";
export const BLANK_KEY = "blankNumber";

// Lines for POST /exams/{id}/submit and /mock-exams/{id}/submit.
export const wordAnswerLines = (entries = [], keyName) =>
  (entries || [])
    .filter(
      (entry) =>
        entry?.[keyName] != null && String(entry.answerText ?? "").trim(),
    )
    .map((entry) => ({
      answeredData: {
        [keyName]: Number(entry[keyName]),
        answerText: String(entry.answerText).trim(),
      },
    }));
