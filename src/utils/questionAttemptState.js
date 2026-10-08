// Restore submitted practice answers, not exam answers or locally guessed results.
export const currentAnswerEvents = (events = []) =>
  [...events].filter((event) => event.activeRow !== false)
    .sort((a, b) => Number(a.answerEventId) - Number(b.answerEventId));

export const restoreBlankAnswers = (events, count) => {
  const answers = Array(count).fill("");
  const saved = {};
  for (const event of currentAnswerEvents(events)) {
    const index = Number(event.answerPosition) - 1;
    if (event.eventType !== "ANSWER" || event.arithmetic !== "FILL_IN_THE_BLANK" ||
        !Number.isInteger(index) || index < 0 || index >= count) continue;
    answers[index] = event.userAnswer ?? "";
    saved[index] = event;
  }
  return { answers, saved, submitted: Object.keys(saved).length === count,
    score: Object.values(saved).filter((event) => event.isCorrect === true).length };
};

export const restoreMatchingAnswers = (events, pairs) => {
  const answers = {};
  const saved = {};
  const validIds = new Set(pairs.map((pair) => String(pair.pairId)));
  for (const event of currentAnswerEvents(events)) {
    if (event.eventType !== "ANSWER" || event.arithmetic !== "MATCH") continue;
    // Older events lacked the source pair ID; never guess it from answer text.
    const match = String(event.description ?? "").match(/\| matchIds=(\[\d+,\d+\])$/);
    if (!match) continue;
    const [source, target] = JSON.parse(match[1]);
    if (!validIds.has(String(source)) || !validIds.has(String(target))) continue;
    answers[source] = target;
    saved[source] = event;
  }
  return { answers, saved, submitted: pairs.length > 0 && Object.keys(saved).length === pairs.length,
    score: Object.values(saved).filter((event) => event.isCorrect === true).length };
};

export const restoreMcqAnswer = (events, options, multiple) => {
  const event = currentAnswerEvents(events).filter((item) => item.eventType === "MCQ_ANSWER").pop();
  if (!event) return null;
  const match = String(event.description ?? "").match(/selectedOptionIds=(\[[\d,\s]+\])$/);
  const ids = match ? JSON.parse(match[1]) :
    !multiple && event.optionId != null ? [event.optionId] : null;
  if (!ids?.length) return null; // Legacy multiple-choice events did not retain all IDs.
  const selected = ids.map((id) => options.find((option) => String(option.optionId) === String(id))?.optionId);
  if (selected.some((id) => id == null)) return null;
  return { selected, result: { status: event.isCorrect ? "CORRECT" : "WRONG",
    correctOptionIds: options.filter((option) => option.isCorrect === true).map((option) => option.optionId) } };
};
