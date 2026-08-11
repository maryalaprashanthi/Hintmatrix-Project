import React from "react";
import { Table } from "react-bootstrap";
import "./JournalSolution.css";

const JournalSolution = ({ answeredData }) => {
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

                  // Normalize backend value
                  const isValid = item.valid === true || item.valid === "true";

                  const isInvalid =
                    item.valid === false || item.valid === "false";

                  let rowClass = "";

                  if (!isBeingRow) {
                    if (isValid) {
                      rowClass = "answer-correct";
                    } else if (isInvalid) {
                      rowClass = "answer-wrong";
                    }
                  }

                  console.log(
                    "RESTORED ROW:",
                    item.particulars,
                    "valid:",
                    item.valid,
                    "type:",
                    typeof item.valid,
                    "class:",
                    rowClass,
                  );

                  return (
                    <tr
                      key={`${id}-${index}`}
                      className={rowClass}
                      data-valid={String(item.valid)}
                    >
                      <td>{item.date}</td>
                      <td>{item.particulars}</td>
                      <td>{item.lf}</td>
                      <td>{item.debit}</td>
                      <td>{item.credit}</td>
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

export default JournalSolution;
