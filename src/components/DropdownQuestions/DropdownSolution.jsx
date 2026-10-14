import React from "react";
import { Table } from "react-bootstrap";
import useAnswerRowScroll from "../../hooks/useAnswerRowScroll";

import "./DropdownSolution.css";

const DropdownSolution = ({ answeredData, answerScrollTarget, expanded, onToggleView }) => {
  const answerRows = useAnswerRowScroll(answeredData, answerScrollTarget);

  return (
    <div className="dropdown-wrap">
      <div className="dropdown-card" style={{ overflow: "visible" }}>
        <Table bordered className="align-middle mb-0 dropdown-table" style={{ overflow: "visible" }}>
          <thead>
            <tr>
              {["Date", "Particulars", "L.F.", "Debit Amount (₹)", "Credit Amount (₹)"].map((label, index) => (
                <th key={label} scope="col" className={index === 2 ? "center" : index > 2 ? "num" : undefined}
                  style={{ position: "sticky", top: 0, zIndex: 2, width: ["14%", "32%", "6%", "24%", "24%"][index] }}>
                  {index === 1 && onToggleView ? <div className="d-flex align-items-center justify-content-center gap-2">
                    <span>{label}</span>
                    <button type="button"
                      style={{ border: 0, background: "transparent", color: "inherit", padding: "0 4px", lineHeight: 1, fontSize: "18px", cursor: "pointer" }}
                      aria-expanded={expanded} aria-controls="dropdown-answer-table"
                      aria-label={expanded ? "Collapse dropdown answers" : "Expand dropdown answers"}
                      onClick={onToggleView}><span aria-hidden="true">{expanded ? "⌄" : "⌃"}</span></button>
                  </div> : label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {answeredData &&
              Object.keys(answeredData).map((id) => {
                const txnData = answeredData[id];
                return (
                  <React.Fragment key={id}>
                    {txnData.map((item, index) => {
                      return (
                        <tr
                          key={`${id}-${index}`}
                          ref={(element) => {
                            if (element) answerRows.current[`${id}-${index}`] = element;
                            else delete answerRows.current[`${id}-${index}`];
                          }}
                          className={
                            item.valid === true
                              ? "answer-correct"
                              : item.valid === false
                                ? "answer-wrong"
                                : ""
                          }
                        >
                          <td className="center">{item.date}</td>
                          <td>{item.particulars}</td>
                          <td className="center">{item.lf}</td>
                          <td className="num">{item.debit}</td>
                          <td className="num">{item.credit}</td>
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
export default DropdownSolution;
