/* eslint-disable react/prop-types */
import { ChevronUp } from "lucide-react";
import {
  FINAL_ACCOUNT_TABLES,
  attributeLookup,
  formatAmount,
  groupByTableAndHeader,
} from "./readOnlyHelpers";

// The second header of every final-account table is the "credit" side
// (Credit Particulars / assets) and gets the green treatment; the first is
// always the "debit" side (Debit Particulars / liabilities side) in blue.
const isCreditHeader = (headerIndex) => headerIndex === 1;

// One header's worth of a final-account table: Particulars + two amount
// columns (add / less), exactly like the live ExamDroppable but with nothing
// to drag, drop, or remove - it only ever renders what was submitted.
const ReadOnlyLedgerSide = ({ label, rows, attributes, credit }) => {
  const addTotal = rows
    .filter((r) => r.arithmetic === "add")
    .reduce((sum, r) => sum + r.amount, 0);
  const subTotal = rows
    .filter((r) => r.arithmetic === "less")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className={`ro-side ${credit ? "ro-side--credit" : ""}`}>
      <div className="ro-side-label">{label}</div>
      <table className="ro-table">
        <thead>
          <tr>
            <th>Particulars</th>
            <th className="ro-amt">Amt (₹)</th>
            <th className="ro-amt">Amt (₹)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const attribute = attributes.get(String(row.attributeId));
            return (
              <tr
                key={`${row.attributeId}-${index}`}
                className={
                  row.status === "correct"
                    ? "ro-row--correct"
                    : row.status === "wrong"
                      ? "ro-row--wrong"
                      : ""
                }
              >
                <td>{attribute?.attributeName ?? "—"}</td>
                <td className="ro-amt">
                  {row.arithmetic === "add" ? formatAmount(row.amount) : ""}
                </td>
                <td className="ro-amt">
                  {row.arithmetic === "less"
                    ? `-${formatAmount(row.amount)}`
                    : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="ro-total-row">
            <td className="fw-bold">Total</td>
            <td className="ro-amt fw-bold">{formatAmount(addTotal)}</td>
            <td className="ro-amt fw-bold">
              {formatAmount(addTotal - subTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

// Read-only render of a DRAG_AND_DROP question: the trial balance that was
// given, plus the final-account tables exactly as the candidate left them.
const ReadOnlyDragDropAnswer = ({
  question,
  answers,
  onAttributeClick,
  selectedAttributeId,
}) => {
  const attributes = attributeLookup(question?.questionAttributes);
  const grouped = groupByTableAndHeader(answers);

  const debitBalances = (question?.questionAttributes || []).filter(
    (a) => a.headerName === "Debit Particulars",
  );
  const creditBalances = (question?.questionAttributes || []).filter(
    (a) => a.headerName !== "Debit Particulars",
  );

  const debitTotal = debitBalances.reduce(
    (sum, a) => sum + Number(a.amount || 0),
    0,
  );
  const creditTotal = creditBalances.reduce(
    (sum, a) => sum + Number(a.amount || 0),
    0,
  );

  return (
    <div className="ro-dragdrop">
      <div className="ro-trial-balance">
        <div className="ro-tb-head">
          <h3>Trial Balance</h3>
          <span className="ro-tb-count">
            {(question?.questionAttributes || []).length}
          </span>
        </div>

        <div className="ro-tb-section">
          <span>Debit Balances</span>
          <span>₹{formatAmount(debitTotal)}</span>
        </div>
        {debitBalances.map((item) => (
          <button
            type="button"
            className={`ro-tb-row ro-tb-row--clickable ${
              String(selectedAttributeId) === String(item.attributeId)
                ? "is-selected"
                : ""
            }`}
            key={item.attributeId}
            onClick={() => onAttributeClick?.(item.attributeId)}
          >
            <span>{item.attributeName}</span>
            <span>{formatAmount(item.amount)}</span>
          </button>
        ))}

        <div className="ro-tb-section">
          <span>Credit Balances</span>
          <span>₹{formatAmount(creditTotal)}</span>
        </div>
        {creditBalances.map((item) => (
          <button
            type="button"
            className={`ro-tb-row ro-tb-row--clickable ${
              String(selectedAttributeId) === String(item.attributeId)
                ? "is-selected"
                : ""
            }`}
            key={item.attributeId}
            onClick={() => onAttributeClick?.(item.attributeId)}
          >
            <span>{item.attributeName}</span>
            <span>{formatAmount(item.amount)}</span>
          </button>
        ))}
      </div>

      <div className="ro-accounts">
        {FINAL_ACCOUNT_TABLES.map((table) => (
          <div className="ro-account-card" key={table.name}>
            <div className="ro-account-card__head">
              <h3>{table.name}</h3>
              <ChevronUp
                size={18}
                className="ro-account-card__chevron"
                aria-hidden="true"
              />
            </div>
            <div className="ro-account-sides">
              {table.headers.map((header, headerIndex) => (
                <ReadOnlyLedgerSide
                  key={header}
                  label={header}
                  attributes={attributes}
                  credit={isCreditHeader(headerIndex)}
                  rows={grouped[table.name]?.[header] ?? []}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadOnlyDragDropAnswer;
