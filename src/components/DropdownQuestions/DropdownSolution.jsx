import React from "react";
import { Table } from "react-bootstrap";

import "./DropdownSolution.css";

const DropdownSolution = ({ answeredData }) => {
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
                      return (
                        <tr
                          key={`${id}-${index}`}
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
