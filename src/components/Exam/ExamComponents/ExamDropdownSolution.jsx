import React from "react";
import { Table } from "react-bootstrap";

import "../../DropdownQuestions/DropdownSolution.css";
import "./placedRowRemove.css";

// Exam version of DropdownSolution: every placed line can be taken back out.
// Removing a line also clears the matching select in the question popover and
// unlocks the transaction, because the selects read from this same data.
const ExamDropdownSolution = ({ answeredData, onRemove }) => {
  return (
    <div className="dropdown-wrap">
      <div className="dropdown-card">
        <Table bordered className="align-middle mb-0 dropdown-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Particulars</th>
              <th className="center">L.F.</th>
              <th className="num">Debit Amount (₹)</th>
              <th className="num">Credit Amount (₹)</th>
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
                          <td className="center">{item.date}</td>
                          <td>{item.particulars}</td>
                          <td className="center">{item.lf}</td>
                          <td className="num">{item.debit}</td>
                          <td className="num amount-cell-with-remove">
                            {item.credit}
                            {!isBeingRow && onRemove && (
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
                    <tr className="spacer-row">
                      <td colSpan="5"></td>
                    </tr>
                  </React.Fragment>
                );
              })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};
export default ExamDropdownSolution;
