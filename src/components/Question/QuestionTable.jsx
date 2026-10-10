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

// How long the pointer must rest on an account table, while it drags a row,
// before that table opens. Without this pause, a pointer that crosses a table
// on its way to another one makes the tables open and close rapidly.
const HOVER_OPEN_DELAY_MS = 250;

// Returns the name of the account table under the given screen point, or
// null. elementsFromPoint also returns the elements under the dragged row.
const accountTableAt = (x, y) => {
  for (const element of document.elementsFromPoint(x, y)) {
    const table = element.closest("[data-account-table]");
    if (table) return table.dataset.accountTable;
  }
  return null;
};

const renderDraggable = (obj) => (
  <Draggable
    id={obj.id}
    key={obj.id}
    type={obj.type}
    status={obj.status}
  />
);

// Ensure you import Bootstrap CSS somewhere in your app (like index.js or App.js)
// import 'bootstrap/dist/css/bootstrap.min.css';
const QuestionTable = () => {
  const [checkMistakes, setCheckMistakes] = useState(false);

  const questions = useQuestionStore((state) => state.questions);
  const score = useQuestionStore((state) => state.score);
  const droppableData = useQuestionStore((state) => state.droppableData);
  const finalAccounts = calculateFinalAccounts(droppableData);
  const fullyPlaced = questions.length > 0 && questions.every((row) => row.status === "solved");
  const rowCount = (table) => Math.max(...table.headers.map((header) =>
    (droppableData[`${table.name}-${header}`]?.length ?? 0) +
    (finalAccounts.derivedRows[`${table.name}-${header}`]?.length ?? 0)));

  const { questionId } = useParams();

  // Functions to handle opening and closing the modal

  const totalQ = questions.length;

  // A row that is fully placed moves out of its Debit or Credit list and
  // into Answered, so the lists hold only the rows that are still to do.
  const debitBalances = questions.filter((q) => q.type === "debit" && q.status !== "solved");
  const creditBalances = questions.filter((q) => q.type === "credit" && q.status !== "solved");
  const answeredDebits = questions.filter((q) => q.type === "debit" && q.status === "solved");
  const answeredCredits = questions.filter((q) => q.type === "credit" && q.status === "solved");
  const answeredCount = answeredDebits.length + answeredCredits.length;

  const debitTotal = debitBalances.reduce(
    (sum, q) =>
      sum +
      (q.status == "pending" || q.status == "wrong"
        ? Number(q.amount || 0)
        : 0),
    0,
  );
  const creditTotal = creditBalances.reduce(
    (sum, q) =>
      sum +
      (q.status == "pending" || q.status == "wrong"
        ? Number(q.amount || 0)
        : 0),
    0,
  );


  // The account tables are a controlled accordion. They start closed.
  // clickedTables holds the tables the user opened with a click. Only a
  // click closes them again. hoverTable is the one extra table that opens
  // while a dragged row rests on it. It closes when the pointer leaves it
  // or the drag ends.
  const [clickedTables, setClickedTables] = useState([]);
  const [hoverTable, setHoverTable] = useState(null);
  const hoveredTable = useRef(null);
  const hoverTimer = useRef(null);
  const openTables = hoverTable && !clickedTables.includes(hoverTable)
    ? [...clickedTables, hoverTable]
    : clickedTables;

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  // Close the wrong-answer popover when the user presses anywhere outside it,
  // for example on a row, a table or a header. The capture phase runs before
  // dnd-kit starts a drag. A drag does not fire a click, so a click listener
  // would miss it. Escape also closes the popover.
  useEffect(() => {
    const insidePopover = (target) =>
      target instanceof Element &&
      target.closest(".question-actions-popover, .hint-popover");
    // A press on the row that owns the open popover is left alone, so the
    // click that follows can toggle that popover closed.
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
  }, []);

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

  // A header click opens or closes one table. React-bootstrap passes the
  // new list of open keys. That list can also hold the hover table, so
  // compare it with openTables to find the one table the user toggled.
  const handleTableClick = (keys) => {
    const nextOpen = keys ?? [];
    const opened = nextOpen.find((key) => !openTables.includes(key));
    const closed = openTables.find((key) => !nextOpen.includes(key));
    if (opened) {
      setClickedTables((current) => [...current, opened]);
    }
    if (closed) {
      setClickedTables((current) => current.filter((key) => key !== closed));
      if (closed === hoverTable) clearHover();
    }
  };

  let pendingQ = questions.filter((q) => q.status === "solved");
  let solvedQ = pendingQ.length;
  // onCheck={handleCheckValidation}
  if (checkMistakes) {
    return (
      <MistakesModal
        questionId={questionId}
        setCheckMistakes={setCheckMistakes}
        checkMistakes={checkMistakes}
      />
    );
  }
  return (
    <div className="row g-4 align-items-start">
      <div>
        <Header
          setCheckMistakes={setCheckMistakes}
        />

        <SummaryCards
          debit={debitTotal}
          credit={creditTotal}
          total={totalQ}
          solved={solvedQ}
          totalScore={score}
        />
      </div>
      {/* LEFT: Trial Balance accordion */}
      <div className="col-12 col-lg-3">
        <div className="card border-0 shadow-sm rounded-4 p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Trial Balance</h5>
            <span className="badge rounded-pill bg-light text-primary border px-3 py-2">
              {questions.length}
            </span>
          </div>

          <Accordion defaultActiveKey={["debit", "credit", "answered"]} alwaysOpen>
            <Accordion.Item
              eventKey="debit"
              className="tb-accordion-item theme-debit"
            >
              <Accordion.Header>
                <span className="tb-accordion-title">Debit Balances</span>
                <span className="tb-accordion-amount">
                  ₹{debitTotal.toLocaleString("en-IN")}
                </span>
              </Accordion.Header>
              <Accordion.Body>
                {debitBalances.map(renderDraggable)}
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item
              eventKey="credit"
              className="tb-accordion-item theme-credit"
            >
              <Accordion.Header>
                <span className="tb-accordion-title">Credit Balances</span>
                <span className="tb-accordion-amount">
                  ₹{creditTotal.toLocaleString("en-IN")}
                </span>
              </Accordion.Header>
              <Accordion.Body>
                {creditBalances.map(renderDraggable)}
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item
              eventKey="answered"
              className="tb-accordion-item theme-answered"
            >
              <Accordion.Header>
                <span className="tb-accordion-title">Answered</span>
                <span className="tb-accordion-amount">{answeredCount}</span>
              </Accordion.Header>
              <Accordion.Body>
                {answeredCount === 0 && (
                  <p className="tb-answered-empty">
                    Rows that you place correctly move here.
                  </p>
                )}
                {answeredDebits.length > 0 && (
                  <>
                    <div className="tb-answered-label">Debit</div>
                    {answeredDebits.map(renderDraggable)}
                  </>
                )}
                {answeredCredits.length > 0 && (
                  <>
                    <div className="tb-answered-label">Credit</div>
                    {answeredCredits.map(renderDraggable)}
                  </>
                )}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>

      {/* Accordion event key arrives as following add all names */}

      {/* RIGHT: Accounts accordion */}
      <div className="col-12 col-lg-9">
        <div className="alert alert-light border mb-3" role="status">
          {fullyPlaced ? "Final Accounts" : "Final Accounts preview — totals update as you place each balance."}
          {finalAccounts.hasBalanceSheet && (
            <span className={`d-block mt-1 ${finalAccounts.balanced ? "text-success" : "text-danger"}`}>
              {finalAccounts.balanced
                ? "Balance Sheet balances."
                : `Balance Sheet difference: ₹${Math.abs(finalAccounts.balanceDifference).toLocaleString("en-IN")}`}
            </span>
          )}
          {finalAccounts.warnings.map((warning) => <span className="d-block text-warning" key={warning}>{warning}</span>)}
        </div>
        <Accordion
          activeKey={openTables}
          onSelect={handleTableClick}
          alwaysOpen
        >
          {data.map((obj, idx) => (
            <Accordion.Item
              eventKey={obj.name}
              className="acc-item mb-4"
              key={idx}
              data-account-table={obj.name}
            >
              <Accordion.Header>
                <span className="acc-title">{obj.name}</span>
              </Accordion.Header>
              <Accordion.Body>
                <div className="row g-3">
                  <div className="col-12 col-md-6 account-side">
                    <div className="text-primary fw-semibold small mb-2">
                      {obj.headers[0]}
                    </div>
                    <Droppable
                      id={`${obj.name}-${obj.headers[0]}`}
                      derivedRows={finalAccounts.derivedRows[`${obj.name}-${obj.headers[0]}`]}
                      isCreditSide={false}
                      matchRowCount={rowCount(obj)}
                    />
                  </div>
                  <div className="col-12 col-md-6 account-side">
                    <div className="text-success fw-semibold small mb-2">
                      {obj.headers[1]}
                    </div>
                    <Droppable
                      id={`${obj.name}-${obj.headers[1]}`}
                      derivedRows={finalAccounts.derivedRows[`${obj.name}-${obj.headers[1]}`]}
                      isCreditSide={true}
                      matchRowCount={rowCount(obj)}
                    />
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default QuestionTable;
