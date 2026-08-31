import React from "react";
import { Table } from "react-bootstrap";
import "./ExamJournalSolution.css";

const ExamJournalSolution = ({ answeredData, onRemove }) => {
  return (
    <Table className="journal-solution-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Particulars</th>
          <th>L.F.</th>
          <th>Debit Amount (₹)</th>
          <th>Credit Amount (₹)</th>
        </tr>
      </thead>

      <tbody>
        {answeredData &&
          Object.keys(answeredData).map((id) => {
            const txnData = answeredData[id];

            return (
              <React.Fragment key={id}>
                {txnData.map((item, index) => {
                  const isBeingRow = item.particulars?.startsWith("(Being");

                  return (
                    <tr
                      key={`${id}-${index}`}
                      className={isBeingRow ? "" : "placed-row"}
                    >
                      <td>{item.date}</td>
                      <td>{item.particulars}</td>
                      <td>{item.lf}</td>
                      <td>{item.debit}</td>
                      <td className="amount-cell-with-remove">
                        {item.credit}
                        {!isBeingRow && (
                          <button
                            type="button"
                            className="remove-row-btn"
                            aria-label={`Remove ${item.particulars}`}
                            onClick={() => onRemove(id, index)}
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
      </tbody>
    </Table>
  );
};

export default ExamJournalSolution;
