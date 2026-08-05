import React from "react";
import "./JournalSolution.css";
import { Table } from "react-bootstrap";

const isTotalRow = (particulars = "") =>
  particulars.toString().trim().toLowerCase().startsWith("total");

const JournalSolution = ({ answeredData }) => {
  // Sample data so the component renders something matching the reference image
  // when no answeredData prop is supplied.
  const sampleData = {
    1: [
      {
        date: "2024-04-01",
        particulars: "Stock",
        lf: "",
        debit: "15,000",
        credit: "",
      },
      {
        date: "",
        particulars: "Total",
        lf: "",
        debit: "15,000",
        credit: "",
      },
    ],
  };

  const data = answeredData || sampleData;

  return (
    <div className="journal-wrap">
      <div className="journal-card">
        <Table bordered hover className="align-middle mb-0 journal-table">
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
            {data &&
              Object.keys(data).map((id) => {
                const txnData = data[id];
                return (
                  <React.Fragment key={id}>
                    {txnData.map((item, index) => {
                      const total = isTotalRow(item.particulars);
                      return (
                        <tr
                          key={`${id}-${index}`}
                          className={total ? "total-row" : "data-row"}
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

export default JournalSolution;
