/* eslint-disable react/prop-types */
import { Accordion } from "react-bootstrap";
import { useDragDropMonitor } from "@dnd-kit/react";
import Draggable from "./Draggable";
import Droppable from "./Droppable";
import useQuestionStore from "./questionStore";
import "./QuestionTable.css";
import Header from "./Header";
import SummaryCards from "./SummaryCards";
import { calculateFinalAccounts, data } from "./SampleData";
import { useParams } from "react-router-dom";
import MistakesModal from "./MistakesModal";
import { useEffect, useRef, useState } from "react";

const HOVER_OPEN_DELAY_MS = 250;

const accountTableAt = (x, y) => {
  for (const element of document.elementsFromPoint(x, y)) {
    const table = element.closest("[data-account-table]");
    if (table) return table.dataset.accountTable;
  }
  return null;
};

// A shared view lets either question controller supply its own answer state,
// while all balances, adjustments and Final Accounts use the same components.
const QuestionLayout = ({
  question,
  questionNumber,
  headerActions,
  setCheckMistakes,
  debitBalances = [],
  creditBalances = [],
  answeredDebits,
  answeredCredits,
  debitTotal,
  creditTotal,
  total,
  solved,
  score,
  balanceCount = total,
  adjustments,
  renderSource,
  rowsByTarget = {},
  finalAccounts = calculateFinalAccounts(rowsByTarget),
  fullyPlaced,
  previewText = "Final Accounts preview — totals update as you place each balance.",
  busy = false,
  onPlaceSelected,
  onRemove,
  feedback,
  footer,
  className = "",
  closeStorePopover = false,
}) => {
  const rowCount = (table) => Math.max(...table.headers.map((header) =>
    (rowsByTarget[`${table.name}-${header}`]?.length ?? 0) +
    (finalAccounts.derivedRows[`${table.name}-${header}`]?.length ?? 0)));
  const [clickedTables, setClickedTables] = useState([]);
  const [hoverTable, setHoverTable] = useState(null);
  const hoveredTable = useRef(null);
  const hoverTimer = useRef(null);
  const openTables = hoverTable && !clickedTables.includes(hoverTable)
    ? [...clickedTables, hoverTable]
    : clickedTables;
  const hasAnsweredSection = answeredDebits !== undefined || answeredCredits !== undefined;

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  useEffect(() => {
    if (!closeStorePopover) return undefined;
    const insidePopover = (target) => target instanceof Element &&
      target.closest(".question-actions-popover, .hint-popover");
    const onOpenRow = (target) => {
      const row = target instanceof Element && target.closest("[data-error-popover-row]");
      const openId = useQuestionStore.getState().errorPopoverId;
      return Boolean(row) && openId != null && row.dataset.errorPopoverRow === String(openId);
    };
    const closeOnPress = (event) => {
      if (insidePopover(event.target) || onOpenRow(event.target)) return;
      useQuestionStore.getState().closeErrorPopover();
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") useQuestionStore.getState().closeErrorPopover();
    };
    document.addEventListener("pointerdown", closeOnPress, true);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPress, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeStorePopover]);

  const clearHover = () => {
    clearTimeout(hoverTimer.current);
    hoveredTable.current = null;
    setHoverTable(null);
  };

  useDragDropMonitor({
    onDragStart: clearHover,
    onDragMove(event) {
      const { x, y } = event.operation.position.current;
      const tableName = accountTableAt(x, y);
      if (tableName === hoveredTable.current) return;
      hoveredTable.current = tableName;
      clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(
        () => setHoverTable(tableName),
        HOVER_OPEN_DELAY_MS,
      );
    },
    onDragEnd: clearHover,
  });

  const handleTableClick = (keys) => {
    const nextOpen = keys ?? [];
    const opened = nextOpen.find((key) => !openTables.includes(key));
    const closed = openTables.find((key) => !nextOpen.includes(key));
    if (opened) setClickedTables((current) => [...current, opened]);
    if (closed) {
      setClickedTables((current) => current.filter((key) => key !== closed));
      if (closed === hoverTable) clearHover();
    }
  };

  return (
    <div className={`${className ? `${className} ` : ""}row g-4 align-items-start`}>
      <div>
        <Header question={question} questionNumber={questionNumber} actions={headerActions} setCheckMistakes={setCheckMistakes} />
        <SummaryCards debit={debitTotal} credit={creditTotal} total={total} solved={solved} totalScore={score} />
      </div>
      <div className="col-12 col-lg-3">
        <div className="card border-0 shadow-sm rounded-4 p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Trial Balance</h5>
            <span className="badge rounded-pill bg-light text-primary border px-3 py-2">{balanceCount}</span>
          </div>
          <Accordion defaultActiveKey={hasAnsweredSection ? ["debit", "credit", "answered"] : ["debit", "credit"]} alwaysOpen>
            {[
              { side: "debit", label: "Debit Balances", balances: debitBalances, amount: debitTotal },
              { side: "credit", label: "Credit Balances", balances: creditBalances, amount: creditTotal },
            ].map(({ side, label, balances, amount }) => (
              <Accordion.Item key={side} eventKey={side} className={`tb-accordion-item theme-${side}`}>
                <Accordion.Header>
                  <span className="tb-accordion-title">{label}</span>
                  <span className="tb-accordion-amount">₹{amount.toLocaleString("en-IN")}</span>
                </Accordion.Header>
                <Accordion.Body>{balances.map(renderSource)}</Accordion.Body>
              </Accordion.Item>
            ))}
            {hasAnsweredSection && (
              <Accordion.Item eventKey="answered" className="tb-accordion-item theme-answered">
                <Accordion.Header>
                  <span className="tb-accordion-title">Answered</span>
                  <span className="tb-accordion-amount">
                    {(answeredDebits?.length ?? 0) + (answeredCredits?.length ?? 0)}
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  {!answeredDebits?.length && !answeredCredits?.length && (
                    <p className="tb-answered-empty">Rows that you place correctly move here.</p>
                  )}
                  {answeredDebits?.length > 0 && (
                    <>
                      <div className="tb-answered-label">Debit</div>
                      {answeredDebits.map(renderSource)}
                    </>
                  )}
                  {answeredCredits?.length > 0 && (
                    <>
                      <div className="tb-answered-label">Credit</div>
                      {answeredCredits.map(renderSource)}
                    </>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            )}
          </Accordion>
        </div>
        {adjustments !== undefined && (
          <div className="card border-0 shadow-sm rounded-4 p-3 mt-3">
            <h5 className="fw-bold mb-3">Adjustments</h5>
            {adjustments.map(renderSource)}
          </div>
        )}
      </div>
      <div className="col-12 col-lg-9">
        <div className="alert alert-light border mb-3" role="status">
          {fullyPlaced ? "Final Accounts" : previewText}
          {finalAccounts.hasBalanceSheet && (
            <span className={`d-block mt-1 ${finalAccounts.balanced ? "text-success" : "text-danger"}`}>
              {finalAccounts.balanced
                ? "Balance Sheet balances."
                : `Balance Sheet difference: ₹${Math.abs(finalAccounts.balanceDifference).toLocaleString("en-IN")}`}
            </span>
          )}
          {finalAccounts.warnings.map((warning) => <span className="d-block text-warning" key={warning}>{warning}</span>)}
        </div>
        {feedback && <span className="visually-hidden" role="status" aria-live="polite">{feedback}</span>}
        <Accordion activeKey={openTables} onSelect={handleTableClick} alwaysOpen>
          {data.map((table) => (
            <Accordion.Item
              eventKey={table.name}
              className="acc-item mb-4"
              key={table.name}
              data-account-table={table.name}
            >
              <Accordion.Header><span className="acc-title">{table.name}</span></Accordion.Header>
              <Accordion.Body>
                <div className="row g-3">
                  {table.headers.map((header, index) => {
                    const id = `${table.name}-${header}`;
                    return (
                      <div className="col-12 col-md-6 account-side" key={id}>
                        <div className={`${index ? "text-success" : "text-primary"} fw-semibold small mb-2`}>
                          {header === "Debit Particulars" ? "Debit" : header === "Credit Particulars" ? "Credit" : header}
                        </div>
                        <Droppable id={id} rows={rowsByTarget[id] ?? []} derivedRows={finalAccounts.derivedRows[id]}
                          isCreditSide={index === 1} matchRowCount={rowCount(table)}
                          total={finalAccounts.accounts[table.name][header].total} busy={busy}
                          onPlaceSelected={onPlaceSelected} onRemove={onRemove} />
                      </div>
                    );
                  })}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
        {footer}
      </div>
    </div>
  );
};

const StoredQuestionTable = ({ questionNumber }) => {
  const [checkMistakes, setCheckMistakes] = useState(false);
  const questions = useQuestionStore((state) => state.questions);
  const score = useQuestionStore((state) => state.score);
  const droppableData = useQuestionStore((state) => state.droppableData);
  const { questionId } = useParams();
  const debitBalances = questions.filter((row) => row.type === "debit" && row.status !== "solved");
  const creditBalances = questions.filter((row) => row.type === "credit" && row.status !== "solved");
  const answeredDebits = questions.filter((row) => row.type === "debit" && row.status === "solved");
  const answeredCredits = questions.filter((row) => row.type === "credit" && row.status === "solved");
  const balanceTotal = (balances) => balances.reduce((sum, row) => sum +
    (row.status === "pending" || row.status === "wrong" ? Number(row.amount || 0) : 0), 0);

  if (checkMistakes) return <MistakesModal questionId={questionId} setCheckMistakes={setCheckMistakes} checkMistakes={checkMistakes} />;

  return <QuestionLayout questionNumber={questionNumber} setCheckMistakes={setCheckMistakes}
    debitBalances={debitBalances} creditBalances={creditBalances} answeredDebits={answeredDebits} answeredCredits={answeredCredits}
    debitTotal={balanceTotal(debitBalances)} creditTotal={balanceTotal(creditBalances)}
    total={questions.length} solved={answeredDebits.length + answeredCredits.length} score={score}
    rowsByTarget={droppableData} finalAccounts={calculateFinalAccounts(droppableData)}
    fullyPlaced={questions.length > 0 && questions.every((row) => row.status === "solved")}
    closeStorePopover
    renderSource={(row) => <Draggable id={row.id} key={row.id} type={row.type} status={row.status} wrongAttempts={row.wrongAttempts} />} />;
};

const QuestionTable = ({ model, questionNumber } = {}) => model
  ? <QuestionLayout {...model} />
  : <StoredQuestionTable questionNumber={questionNumber} />;

export default QuestionTable;
