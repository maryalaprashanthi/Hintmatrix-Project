/* eslint-disable react/prop-types */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { Button } from "react-bootstrap";
import { FaRedo, FaExclamationTriangle } from "react-icons/fa";
import { data, calculateFinalAccounts, normalizeFinalAccountTarget } from "./SampleData";
import { getRuleAnswers } from "./questionStore";
import { adjustmentRows, adjustmentTableRows, matchAdjustmentEffect, placementKey, addAdjustmentExamPlacement } from "./adjustmentPlacement";
import QuestionTable from "./QuestionTable";
import QuestionNavigation from "./QuestionNavigation";
import Draggable from "./Draggable";
import { getQuestionAttributeSide } from "../../utils/questionAttributeSide";
import MistakesModal from "./MistakesModal";
import { getCurrentUserId } from "../../utils/user";
import RuleEngineService from "../../services/RuleEngineService";
import QuestionAnswerService from "../../services/QuestionAnswerService";

const emptyState = {};
const subscribeNothing = () => () => {};
const getEmptyState = () => emptyState;

// Owns adjustment state and validation; QuestionTable owns the shared UI.
// Exam adapters provide the existing paper stores so
// submission, reset and navigation continue to use the same API contract.
export default function DragAndDropWithAdj({
  question,
  examStore,
  sessionStore,
  questionNumber = 1,
  displayQuestionNumber = questionNumber,
  totalQuestions = 1,
  onPrevious,
  onNext,
}) {
  const questionId = question.questionId;
  const [effects, setEffects] = useState({});
  const [placements, setPlacements] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [checkMistakes, setCheckMistakes] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState({});
  const [usedHints, setUsedHints] = useState({});
  const [autoFilling, setAutoFilling] = useState(null);
  const [actionErrors, setActionErrors] = useState({});
  const lock = useRef(false);
  const generation = useRef(0);
  const rows = adjustmentRows(question);
  const exam = Boolean(examStore);
  const examState = useSyncExternalStore(examStore?.subscribe ?? subscribeNothing, examStore?.getState ?? getEmptyState);
  const sessionState = useSyncExternalStore(sessionStore?.subscribe ?? subscribeNothing, sessionStore?.getState ?? getEmptyState);
  const cached = examState.byQuestionId?.[questionId];
  const cachedType = sessionState.byQuestionId?.[questionId]?.questionType;

  useEffect(() => {
    const version = ++generation.current;
    setLoading(true); setFeedback(""); setPlacements([]); setSelected(null);
    lock.current = false; setBusy(false);
    setEffects({});
    setWrongAttempts({}); setUsedHints({}); setActionErrors({}); setAutoFilling(null);
    setAmounts(Object.fromEntries(adjustmentRows(question).map((row) => [row.id, row.amount ?? ""])));
    const load = async () => {
      const loaded = {};
      const errors = {};
      const rulesByAttribute = new Map();
      for (const row of adjustmentRows(question)) {
        if (row.id == null) throw new Error("This question is missing account row identities.");
        try {
          if (!rulesByAttribute.has(row.attributeId)) {
            rulesByAttribute.set(row.attributeId, await RuleEngineService.getAttributeAnswers(row.attributeId));
          }
          loaded[row.id] = getRuleAnswers(rulesByAttribute.get(row.attributeId), question.chapterId, row);
          const targets = data.flatMap((table) => table.headers.map((header) => `${table.name}-${header}`));
          if (loaded[row.id].some((effect) => !targets.includes(normalizeFinalAccountTarget(effect.answer).replace(/-(add|less)$/, "")))) {
            throw new Error("A rule refers to an unsupported Final Accounts statement or side.");
          }
        } catch (error) { delete loaded[row.id]; errors[row.id] = `${row.name}: ${error.message}`; }
      }
      if (version !== generation.current) return;
      setEffects(loaded);
      // Configuration diagnostics belong in the developer console, not the
      // student's statement layout. Missing rules never validate a placement.
      if (Object.keys(errors).length) console.warn("Adjustment rule configuration:", errors);
      if (exam) {
        const store = examStore.getState();
        store.setActiveQuestion(questionId);
        if (!store.byQuestionId[questionId] || !cachedType) {
          store.setQuestions(questionId, [question]);
          store.setTableData(data.flatMap((table) => table.headers.map((header) => `${table.name}-${header}`)));
          store.setDropLimits(questionId, Object.fromEntries(adjustmentRows(question).map((row) => [row.attributeId, loaded[row.id]?.length ?? null])));
        }
        sessionStore.getState().setQuestionType(questionId, "DRAG_AND_DROP_WITH_ADJ");
      } else {
        const saved = await QuestionAnswerService.getAnswersByUserAndQuestion(getCurrentUserId(), questionId);
        if (version !== generation.current) return;
        setPlacements(saved.map((entry) => {
          const row = adjustmentRows(question).find((item) => String(item.id) === String(entry.questionAttributeId));
          if (!row) throw new Error("A saved answer cannot be matched to its account row.");
          return { ...entry, id: row.id, name: row.name, key: placementKey(row.id, entry.conditionId),
            pairId: entry.pairAttributeId,
            target: normalizeFinalAccountTarget(`${entry.tableName}-${entry.headerName}-${entry.arithmetic}`),
            operation: String(entry.arithmetic).toLowerCase() === "subtract" ? "less" : String(entry.arithmetic).toLowerCase() };
        }));
        try {
          const currentScore = await QuestionAnswerService.getOverallMarks(getCurrentUserId());
          if (version === generation.current) setScore(currentScore);
        } catch { /* Saved answers remain usable when the score service is unavailable. */ }
      }
    };
    load().catch((error) => { if (version === generation.current) setFeedback(error.message); })
      .finally(() => { if (version === generation.current) setLoading(false); });
    // This ref is a request generation counter, not a DOM node.
    return () => { generation.current = version + 1; };
  // The parent keys this component by question identity. Reset invalidates the exam cache.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, cachedType]);

  const currentPlacements = exam ? Object.entries(cached?.droppableData ?? {}).flatMap(([key, entries]) =>
    entries.map((entry) => ({ ...entry, target: `${key}-${entry.operation}`, key: entry.placementId ?? `${entry.id}:${key}:${entry.operation}` }))) : placements;
  const tableRows = adjustmentTableRows(currentPlacements);
  const result = calculateFinalAccounts(tableRows);
  const complete = rows.length > 0 && rows.every((row) => effects[row.id]?.length ===
    currentPlacements.filter((entry) => String(entry.id) === String(row.id)).length);

  const place = async (rowId, target, selectedAmount) => {
    if (lock.current || loading) return;
    const row = rows.find((entry) => String(entry.id) === String(rowId));
    if (!row) return;
    if (!effects[row.id]) return;
    const amount = selectedAmount ?? amounts[row.id];
    if (amount === "" || !Number.isFinite(Number(amount)) || Number(amount) < 0) {
      setFeedback("Enter a valid amount before placing this effect."); return;
    }
    if (exam) {
      examStore.setState((state) => ({ byQuestionId: { ...state.byQuestionId,
        [questionId]: addAdjustmentExamPlacement(state.byQuestionId[questionId], row, target, amount,
          effects[row.id].length, effects[row.id][0]?.pairAttributeId) } }));
      setFeedback("Placement recorded. Submit the paper to receive your result."); return;
    }
    const effect = matchAdjustmentEffect(effects[row.id], placements, row.id, target, amount);
    const pending = effects[row.id].filter((item) => !placements.some((entry) => entry.key === placementKey(row.id, item.conditionId)));
    if (!pending.length) return;
    // Repeating a completed effect is a no-op, as in ordinary drag-and-drop.
    if (!effect && effects[row.id].some((item) =>
      normalizeFinalAccountTarget(item.answer) === target && Number(item.amount) === Number(amount) &&
      placements.some((entry) => entry.key === placementKey(row.id, item.conditionId)))) return;
    // A wrong second-amount drop must count against that effect's retry,
    // rather than silently consuming the first effect's attempt.
    const condition = effect ?? pending.find((item) => normalizeFinalAccountTarget(item.answer) === target)
      ?? pending.find((item) => Number(item.amount) === Number(amount)) ?? pending[0];
    const [tableName, headerName, arithmetic] = target.split("-");
    lock.current = true; setBusy(true);
    const version = generation.current;
    try {
      const event = await QuestionAnswerService.processAnswerEvent({
        finalAccounts: true, userId: getCurrentUserId(), questionId,
        questionAttributeId: row.id, attributeId: row.attributeId, amount: Number(amount),
        tableName, headerName, arithmetic, conditionId: condition.conditionId,
        answerPosition: condition.conditionId, eventType: effect && usedHints[row.id] ? "HINT" : "ANSWER", isCorrect: Boolean(effect),
        userAnswer: `${row.name}: ${amount}, ${target}`, description: `${row.name}: ${amount}, ${target}`,
      });
      if (version !== generation.current) return;
      // Use server-awarded marks immediately. Saving the placement or fetching
      // the overall total can fail after the scored event has already committed.
      const awardedMarks = Number(event.marks);
      if (Number.isFinite(awardedMarks)) setScore((previous) => Number(previous) + awardedMarks);
      if (!event.isCorrect || !effect) {
        if (version === generation.current) {
          setWrongAttempts((previous) => ({ ...previous, [row.id]: (previous[row.id] ?? 0) + 1 }));
          setFeedback("Check the statement, side, operation and amount for this effect.");
        }
        return;
      }
      await QuestionAnswerService.saveAnswer({ userId: getCurrentUserId(), questionId,
        questionAttributeId: row.id, attributeId: row.attributeId, tableNameId: effect.tableNameId,
        headerId: effect.headerId, arithmetic, amount: Number(amount), conditionId: effect.conditionId,
        pairAttributeId: effect.pairAttributeId, totalAnswers: effects[row.id].length });
      if (version !== generation.current) return;
      setPlacements((previous) => [...previous, { ...row, amount: Number(amount), operation: arithmetic,
        target, pairId: effect.pairAttributeId, conditionId: effect.conditionId, key: placementKey(row.id, effect.conditionId) }]);
      setWrongAttempts((previous) => ({ ...previous, [row.id]: 0 }));
      setActionErrors((previous) => ({ ...previous, [row.id]: "" }));
      setFeedback("Correct effect saved. Place each remaining effect.");
    } catch (error) {
      if (version === generation.current) setFeedback(error.response?.data?.message ?? error.message);
    } finally {
      if (version === generation.current) {
        try {
          const currentScore = await QuestionAnswerService.getOverallMarks(getCurrentUserId());
          if (version === generation.current) setScore(currentScore);
        } catch { /* Retain the marks already confirmed by the answer event. */ }
        if (version === generation.current) { lock.current = false; setBusy(false); }
      }
    }
  };

  // UI actions use this component's own state, never the ordinary drag store.
  const useHint = (rowId) => {
    if (lock.current || exam) return;
    setUsedHints((previous) => ({ ...previous, [rowId]: true }));
  };
  const autoFill = async (rowId) => {
    if (lock.current || loading || exam) return;
    const row = rows.find((entry) => String(entry.id) === String(rowId));
    if (!row) return;
    lock.current = true; setBusy(true); setAutoFilling(row.id);
    setActionErrors((previous) => ({ ...previous, [row.id]: "" }));
    const version = generation.current;
    try {
      const rules = await RuleEngineService.getAttributeAnswers(row.attributeId);
      let configured;
      try {
        configured = getRuleAnswers(rules, question.chapterId, row)
          .map((effect) => ({ ...effect, answer: normalizeFinalAccountTarget(effect.answer) }));
        const targets = data.flatMap((table) => table.headers.map((header) => `${table.name}-${header}`));
        if (configured.some((effect) => !targets.includes(effect.answer.replace(/-(add|less)$/, "")))) {
          throw new Error("A rule refers to an unsupported Final Accounts statement or side.");
        }
      } catch (error) {
        console.warn("Adjustment rule configuration:", row.name, error.message);
        return;
      }
      if (version !== generation.current) return;
      setEffects((previous) => ({ ...previous, [row.id]: configured }));
      for (const effect of configured) {
        if (placements.some((entry) => entry.key === placementKey(row.id, effect.conditionId))) continue;
        if (version !== generation.current) return;
        const arithmetic = effect.answer.split("-").pop();
        const body = { userId: getCurrentUserId(), questionId, questionAttributeId: row.id,
          attributeId: row.attributeId, tableNameId: effect.tableNameId, headerId: effect.headerId,
          amount: effect.amount, conditionId: effect.conditionId, arithmetic };
        // Record zero-credit assistance before saving the placement, as in the
        // ordinary draggable. A failed save must never award normal marks.
        await QuestionAnswerService.processAnswerEvent({ ...body, finalAccounts: true,
          answerPosition: effect.conditionId, eventType: "AUTOFILL", isCorrect: true,
          description: "Auto filled configured final-account placement.", userAnswer: "Auto filled configured final-account placement." });
        if (version !== generation.current) return;
        await QuestionAnswerService.saveAnswer({ ...body, pairAttributeId: effect.pairAttributeId, totalAnswers: configured.length });
        if (version !== generation.current) return;
        setPlacements((previous) => [...previous, { ...row, amount: effect.amount, operation: arithmetic,
          target: effect.answer, pairId: effect.pairAttributeId, conditionId: effect.conditionId, key: placementKey(row.id, effect.conditionId) }]);
        setWrongAttempts((previous) => ({ ...previous, [row.id]: 0 }));
      }
      setFeedback("Auto filled the remaining configured effects for this account.");
      try {
        const currentScore = await QuestionAnswerService.getOverallMarks(getCurrentUserId());
        if (version === generation.current) setScore(currentScore);
      } catch { /* A score refresh must not undo saved auto-filled effects. */ }
    } catch (error) {
      if (version === generation.current) {
        const message = error.response?.data?.message ?? error.message;
        setActionErrors((previous) => ({ ...previous, [row.id]: message })); setFeedback(message);
      }
    } finally { if (version === generation.current) { lock.current = false; setBusy(false); setAutoFilling(null); } }
  };
  const reset = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    const version = generation.current;
    try {
      await QuestionAnswerService.resetAnswersByUserAndQuestion(getCurrentUserId(), questionId);
      if (version !== generation.current) return;
      setPlacements([]); setSelected(null); setCheckMistakes(false);
      setWrongAttempts({}); setUsedHints({}); setActionErrors({});
      setAmounts(Object.fromEntries(rows.map((row) => [row.id, row.amount ?? ""])));
      setFeedback("Answers reset. Drag each balance and adjustment to its account.");
    } catch (error) {
      if (version === generation.current) setFeedback(error.response?.data?.message ?? error.message);
    } finally { if (version === generation.current) { lock.current = false; setBusy(false); } }
  };
  const remove = (entry) => {
    const store = examStore.getState();
    if (!entry.placementId) { store.setActiveQuestion(questionId); store.removeAnswer(entry.id, entry.target); return; }
    examStore.setState((state) => {
      const slice = state.byQuestionId[questionId];
      return { byQuestionId: { ...state.byQuestionId, [questionId]: { ...slice,
        droppableData: Object.fromEntries(Object.entries(slice.droppableData).map(([target, entries]) =>
          [target, entries.filter((item) => item.placementId !== entry.placementId)])) } } };
    });
  };

  if (loading) return <p role="status">Loading adjustment rules and saved answers…</p>;
  const count = (row) => currentPlacements.filter((entry) => String(entry.id) === String(row.id)).length;
  const solved = (row) => effects[row.id]?.length != null && effects[row.id].length === count(row);
  const balances = (side) => rows.filter((row) => getQuestionAttributeSide(row) === side);
  const total = (side) => balances(side).filter((row) => !solved(row))
    .reduce((sum, row) => sum + (Number.isFinite(Number(row.amount)) ? Number(row.amount) : 0), 0);
  const choices = rows.flatMap((row) => {
    const primary = { row, sourceId: row.id, amount: amounts[row.id] };
    return row.amount2 != null && Number(row.amount2) !== Number(primary.amount)
      ? [primary, { row, sourceId: `${row.id}:amount2`, amount: row.amount2 }] : [primary];
  });
  const renderSource = (row) => choices.filter((choice) => choice.row.id === row.id).map(({ sourceId, amount }) =>
    <Draggable key={sourceId} row={row} sourceId={sourceId} amount={amount} solved={solved(row)}
      status={wrongAttempts[row.id] ? "wrong" : "pending"} wrongAttempts={wrongAttempts[row.id] ?? 0}
      busy={busy} selected={selected?.rowId === row.id && Number(selected.amount) === Number(amount)}
      hints={(effects[row.id] ?? []).map((effect) => effect.information).filter(Boolean)}
      autoFilling={autoFilling === row.id} actionError={actionErrors[row.id]}
      onSelect={(rowId, selectedAmount) => setSelected({ rowId, amount: selectedAmount })} onHint={useHint} onAutoFill={autoFill} />);
  const headerActions = !exam ? <>
    <Button variant="light" size="sm" style={{ minWidth: "95px", height: "35px" }} onClick={reset} disabled={busy}><FaRedo className="me-1" />Reset</Button>
    <Button variant="warning" size="sm" style={{ minWidth: "95px", height: "35px" }} onClick={() => setCheckMistakes(true)} disabled={busy}><FaExclamationTriangle className="me-1" />Check</Button>
  </> : <span className="small text-muted">Submit the paper to receive your result.</span>;
  return <>
    <DragDropProvider onDragEnd={(event) => {
      if (event.canceled || event.operation.target?.id == null) return;
      const choice = choices.find((item) => item.sourceId === event.operation.source.id);
      if (choice) place(choice.row.id, event.operation.target.id, choice.amount);
    }}>
      <QuestionTable model={{ question, questionNumber: displayQuestionNumber, headerActions, debitBalances: balances("debit"), creditBalances: balances("credit"),
        debitTotal: total("debit"), creditTotal: total("credit"), total: rows.length, solved: rows.filter(solved).length, score,
        balanceCount: balances("debit").length + balances("credit").length,
        adjustments: rows.filter((row) => getQuestionAttributeSide(row) == null), renderSource,
        rowsByTarget: tableRows, finalAccounts: result, fullyPlaced: complete, busy, feedback,
        previewText: "Final Accounts preview — totals update as you place each balance and adjustment.",
        onPlaceSelected: (target) => place(selected?.rowId, target, selected?.amount), onRemove: exam ? remove : null,
        footer: typeof onPrevious === "function" || typeof onNext === "function"
          ? <QuestionNavigation questionNumber={questionNumber} totalQuestions={totalQuestions} onPrevious={onPrevious} onNext={onNext} />
          : null,
      }} />
    </DragDropProvider>
    {checkMistakes && <MistakesModal questionId={questionId} checkMistakes={checkMistakes} setCheckMistakes={setCheckMistakes} />}
  </>;
}
