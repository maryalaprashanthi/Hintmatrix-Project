/* eslint-disable react/prop-types */
import { ChevronUp } from "lucide-react";
import {
  FINAL_ACCOUNT_TABLES,
  attributeLookup,
  formatAmount,
  groupByTableAndHeader,
  questionAttributeLookup,
} from "./readOnlyHelpers";
import { calculateFinalAccounts } from "../../components/Question/SampleData";

// The second header of every final-account table is the "credit" side
// (Credit Particulars / assets) and gets the green treatment; the first is
// always the "debit" side (Debit Particulars / liabilities side) in blue.
const isCreditHeader = (headerIndex) => headerIndex === 1;

// One header's worth of a final-account table: Particulars + two amount
// columns (add / less), exactly like the live ExamDroppable but with nothing
// to drag, drop, or remove - it only ever renders what was submitted.
const ReadOnlyLedgerSide = ({ label, rows, attributes, questionAttributes, credit, derivedRows, total }) => {
  const displayRows = [...rows, ...derivedRows.map((row) => ({ ...row, arithmetic: row.operation }))];
  const addTotal = displayRows
    .filter((r) => r.arithmetic === "add")
    .reduce((sum, r) => sum + r.amount, 0);
  const subTotal = displayRows
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
          {displayRows.map((row, index) => {
            const attribute = questionAttributes.get(String(row.questionAttributeId))
              ?? attributes.get(String(row.attributeId));
            return (
              <tr
                key={`${row.attributeId}-${index}`}
                className={
                  row.derived ? "ro-derived-row" : row.status === "correct"
                    ? "ro-row--correct"
                    : row.status === "wrong"
                      ? "ro-row--wrong"
                      : ""
                }
              >
                <td>{row.name ?? attribute?.attributeName ?? "—"}</td>
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
              {formatAmount(total ?? addTotal - subTotal)}
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
  const questionAttributes = questionAttributeLookup(question?.questionAttributes);
  const grouped = groupByTableAndHeader(answers);
  const droppableData = Object.fromEntries(Object.entries(grouped).flatMap(([table, headers]) =>
    Object.entries(headers).map(([header, rows]) => [`${table}-${header}`,
      rows.map((row) => ({ ...row, operation: row.arithmetic })),
    ]),
  ));
  const finalAccounts = calculateFinalAccounts(droppableData);

  const debitBalances = (question?.questionAttributes || []).filter(
    (a) => a.headerName === "Debit Particulars",
  );
  const creditBalances = (question?.questionAttributes || []).filter(
    (a) => a.headerName === "Credit Particulars",
  );
  const adjustments = (question?.questionAttributes || []).filter(
    (a) => !["Debit Particulars", "Credit Particulars"].includes(a.headerName),
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
            key={item.questionAttributeId ?? item.attributeId}
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
            key={item.questionAttributeId ?? item.attributeId}
            onClick={() => onAttributeClick?.(item.attributeId)}
          >
            <span>{item.attributeName}</span>
            <span>{formatAmount(item.amount)}</span>
          </button>
        ))}
        {adjustments.length > 0 && (
          <>
            <div className="ro-tb-section"><span>Additional Adjustments</span></div>
            {adjustments.map((item) => (
              <button type="button"
                className={`ro-tb-row ro-tb-row--clickable ${String(selectedAttributeId) === String(item.attributeId) ? "is-selected" : ""}`}
                key={item.questionAttributeId ?? item.attributeId}
                onClick={() => onAttributeClick?.(item.attributeId)}
              >
                <span>{item.attributeName}</span>
                <span>{formatAmount(item.amount)}</span>
              </button>
            ))}
          </>
        )}
      </div>

      <div className="ro-accounts">
        {finalAccounts.hasBalanceSheet && (
          <div className={finalAccounts.balanced ? "text-success" : "text-danger"}>
            {finalAccounts.balanced ? "Balance Sheet balances" :
              `Balance Sheet difference: ₹${formatAmount(finalAccounts.balanceDifference)}`}
          </div>
        )}
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
                  questionAttributes={questionAttributes}
                  credit={isCreditHeader(headerIndex)}
                  rows={grouped[table.name]?.[header] ?? []}
                  derivedRows={finalAccounts.accounts[table.name][header].rows}
                  total={finalAccounts.accounts[table.name][header].total}
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
