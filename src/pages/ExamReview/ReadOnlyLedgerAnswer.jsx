/* eslint-disable react/prop-types */
import { attributeLookup, formatAmount } from "./readOnlyHelpers";

// Read-only render of a JOURNAL or DROPDOWN question: both submit the same
// { tableName, headerName, attributeId, amount } rows (see buildSubmission.js),
// so one ledger-style table covers both - Date / Particulars / L.F. / Debit /
// Credit, with a synthesised "(Being ...)" narration line per transaction.
// The left panel lists the transactions the question actually asked the
// candidate to record - the same data ExamJournalQuestion/ExamDropdownQuestion
// show while the paper is live - so review isn't just the answer with no
// question to compare it against.
const ReadOnlyLedgerAnswer = ({ question, answers }) => {
  const attributes = attributeLookup(question?.questionAttributes);
  const transactions = question?.questionAttributes || [];

  const byAttribute = new Map();
  (answers || []).forEach((answer) => {
    const data = answer?.answeredData;
    if (!data) return;
    const key = String(data.attributeId);
    const list = byAttribute.get(key) ?? [];
    list.push(data);
    byAttribute.set(key, list);
  });

  const rows = [];
  byAttribute.forEach((entries, attributeId) => {
    const attribute = attributes.get(attributeId);

    entries.forEach((entry) => {
      const isDebit = entry.headerName === "Debit Particulars";
      rows.push({
        particulars: isDebit
          ? `${entry.tableName}..........Dr`
          : `To ${entry.tableName}`,
        debit: isDebit ? formatAmount(entry.amount) : "",
        credit: !isDebit ? formatAmount(entry.amount) : "",
        status: entry.status,
      });
    });

    if (attribute) {
      rows.push({
        particulars: `(Being ${attribute.attributeName})`,
        debit: "",
        credit: "",
        narration: true,
      });
    }
  });

  return (
    <div className="ro-dragdrop">
      <div className="ro-trial-balance">
        <div className="ro-tb-head">
          <h3>Transactions</h3>
          <span className="ro-tb-count">{transactions.length}</span>
        </div>
        {transactions.map((item) => (
          <div className="ro-tb-row" key={item.questionAttributeId}>
            <span>{item.attributeName}</span>
            <span>{formatAmount(item.amount)}</span>
          </div>
        ))}
      </div>

      <table className="ro-table ro-ledger-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Particulars</th>
            <th className="ro-amt">L.F.</th>
            <th className="ro-amt">Debit (₹)</th>
            <th className="ro-amt">Credit (₹)</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="ro-empty">
                Not attempted.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={index}
                className={
                  row.narration
                    ? "ro-narration"
                    : row.status === "correct"
                      ? "ro-row--correct"
                      : row.status === "wrong"
                        ? "ro-row--wrong"
                        : ""
                }
              >
                <td>—</td>
                <td>{row.particulars}</td>
                <td className="ro-amt">—</td>
                <td className="ro-amt">{row.debit}</td>
                <td className="ro-amt">{row.credit}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReadOnlyLedgerAnswer;
