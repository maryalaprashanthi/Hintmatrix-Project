import React from "react";
import { Table } from "react-bootstrap";
import useAnswerRowScroll from "../../hooks/useAnswerRowScroll";
import "./JournalSolution.css";

const JournalSolution = ({ answeredData, answerScrollTarget, expanded, onToggleView }) => {
  const answerRows = useAnswerRowScroll(answeredData, answerScrollTarget);
  const answeredIds = Object.keys(answeredData ?? {}).filter((id) => answeredData[id]?.length);
  return (
    <Table className="journal-solution-table" style={{ overflow: "visible" }}>
      <thead>
        <tr>
          {["Date", "Particulars", "L.F.", "Debit Amount (₹)", "Credit Amount (₹)"].map((label, index) => (
            <th key={label} scope="col" style={{ position: "sticky", top: 0, zIndex: 2,
              width: ["14%", "32%", "6%", "24%", "24%"][index] }}>
              {index === 1 && onToggleView ? <div className="d-flex align-items-center justify-content-center gap-2">
                <span>{label}</span>
                <button type="button"
                  style={{ border: 0, background: "transparent", color: "inherit", padding: "0 4px", lineHeight: 1, fontSize: "18px", cursor: "pointer" }}
                  aria-expanded={expanded} aria-controls="journal-answer-table"
                  aria-label={expanded ? "Collapse journal answers" : "Expand journal answers"}
                  onClick={onToggleView}><span aria-hidden="true">{expanded ? "⌄" : "⌃"}</span></button>
              </div> : label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {answeredData &&
          answeredIds.map((id) => {
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
                      ref={(element) => {
                        if (element) answerRows.current[`${id}-${index}`] = element;
                        else delete answerRows.current[`${id}-${index}`];
                      }}
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
