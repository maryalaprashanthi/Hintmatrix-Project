import React from "react";
import { Table } from "react-bootstrap";

import "./JournalSolution.css";

const JournalSolution = ({ answeredData }) => {
  // Sample data so the component renders something matching the reference image
  // when no answeredData prop is supplied.

  return (
    <div className="journal-wrap">
      <div className="journal-card">
        <Table bordered className="align-middle mb-0 journal-table">
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
                        <tr key={`${id}-${index}`}>
                          <td className="center">{item.date}</td>
                          <td>{item.particulars}</td>
                          <td className="center">{item.lf}</td>
                          <td className="num">{item.debit}</td>
                          <td className="num">{item.credit}</td>
                        </tr>
                      );
                    })}
                    <tr className="j-row">
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

export default JournalSolution;
