import React, { useRef, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { Overlay, Popover } from "react-bootstrap";
import "../../JournalQuestion/JournalQuestion.css";
import { useOverlayContainer } from "../ExamShell/useOverlayContainer";
import { useRuleTables } from "./useRuleTables";

// The account list inside an open transaction. The popover mounts this only
// while it is open, so the rule engine call happens when the student opens
// the transaction, not when the question loads.
const JournalAccounts = ({ item, chapterId, onAdd }) => {
  const { status, tables, retry } = useRuleTables([item.attributeId], chapterId);

  if (status === "loading") {
    return <p className="text-muted small mb-0" role="status">Loading accounts…</p>;
  }
  if (status === "error") {
    return (
      <p className="small mb-0" role="alert">
        The accounts did not load.{" "}
        <Button size="sm" variant="link" className="p-0 align-baseline" onClick={retry}>
          Try again
        </Button>
      </p>
    );
  }
  if (tables.length === 0) {
    return <p className="text-muted small mb-0">No accounts are set up for this transaction.</p>;
  }
  return tables.map((table) => (
    <div key={table.id} className="account-row">
      <strong className="account-name">{table.name}</strong>

      <Button onClick={() => onAdd(item, "Debit", table)} className="def transaction-btn">
        Debit
      </Button>

      <Button onClick={() => onAdd(item, "Credit", table)} className="def transaction-btn">
        Credit
      </Button>
    </div>
  ));
};

// Exam version of JournalQuestion: any account the user picks for Debit or
// Credit is accepted and shown, there is no rule-matching / correct-incorrect
// check, and no hint or autofill affordance. A transaction is never locked -
// some transactions legitimately need more than one Debit/Credit line, so
// the popover stays reachable and duplicate entries are removed via
// ExamJournalSolution instead of the row auto-disabling itself.
const ExamJournalQuestion = ({ data = [], chapterId, answeredData, setAnsweredData }) => {
  const [openAttributeId, setOpenAttributeId] = useState(null);
  const attributeTargets = useRef({});
  // Must follow the fullscreen element, or the popover renders outside the
  // painted subtree once the exam starts.
  const overlayContainer = useOverlayContainer();

  const handleAdd = (item, type, table) => {
    const id = item.questionAttributeId;
    const text =
      type === "Debit" ? `${table.name}..........Dr` : `To ${table.name}`;

    const existing = (answeredData[id] || []).filter(
      (entry) => !entry.particulars?.startsWith("(Being"),
    );

    const duplicate = existing.some(
      (entry) => entry.particulars === text && entry.tableNameId === table.id,
    );

    if (duplicate) {
      return;
    }

    const newEntry = {
      questionAttributeId: id,
      date: "",
      particulars: text,
      lf: "",
      debit: type === "Debit" ? item.amount : "",
      credit: type === "Credit" ? item.amount : "",
      tableNameId: table.id,
    };

    const updatedRows =
      type === "Debit" ? [newEntry, ...existing] : [...existing, newEntry];

    const beingRow = {
      date: "",
      particulars: `(Being ${item.attributeName})`,
      lf: "",
      debit: "",
      credit: "",
    };

    setAnsweredData((prev) => ({
      ...prev,
      [id]: [...updatedRows, beingRow],
    }));
  };

  return (
    <div>
      <Table className="journal-table" bordered hover>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Amount (₹)</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.questionAttributeId}>
              <td>
                <span
                  ref={(element) => {
                    attributeTargets.current[item.questionAttributeId] =
                      element;
                  }}
                  className="transaction-popup-trigger"
                  onClick={() => {
                    setOpenAttributeId((current) =>
                      current === item.questionAttributeId
                        ? null
                        : item.questionAttributeId,
                    );
                  }}
                >
                  {item.attributeName}
                </span>
                <Overlay
                  show={openAttributeId === item.questionAttributeId}
                  target={attributeTargets.current[item.questionAttributeId]}
                  placement="right-start"
                  container={overlayContainer}
                  rootClose
                  onHide={() => setOpenAttributeId(null)}
                  popperConfig={{
                    strategy: "fixed",
                    modifiers: [
                      { name: "offset", options: { offset: [12, -8] } },
                      {
                        name: "preventOverflow",
                        options: { boundary: "viewport", padding: 10 },
                      },
                      {
                        name: "flip",
                        options: {
                          fallbackPlacements: [
                            "left-start",
                            "bottom-start",
                            "top-start",
                          ],
                        },
                      },
                    ],
                  }}
                >
                  <Popover
                    id={`popover-${item.questionAttributeId}`}
                    className="journal-popover"
                  >
                    <Popover.Header as="div" className="journal-popover-header">
                      <span className="popover-title">Transaction</span>
                      <button
                        type="button"
                        className="popover-close"
                        onClick={() => setOpenAttributeId(null)}
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </Popover.Header>

                    <Popover.Body className="journal-popover-body">
                      <div className="popover-attribute-name">
                        <strong>{item.attributeName}</strong>
                      </div>

                      <div className="popover-amount">
                        Amount: ₹{item.amount || "-"}
                      </div>

                      <div className="popover-account-list">
                        <JournalAccounts item={item} chapterId={chapterId} onAdd={handleAdd} />
                      </div>
                    </Popover.Body>
                  </Popover>
                </Overlay>
              </td>

              <td>{item.amount || "-"}</td>
              <td>{item.amount2 || "-"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ExamJournalQuestion;
