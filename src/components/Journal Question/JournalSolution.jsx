import React from "react";

const JournalSolution = ({ answeredData }) => {
  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover align-middle mb-0">
              <thead className="table-dark text-center">
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
                        {txnData.map((item, index) => (
                          <tr key={`${id}-${index}`}>
                            <td className="text-center">{item.date}</td>
                            <td>{item.particulars}</td>
                            <td className="text-center">{item.lf}</td>
                            <td className="text-end">{item.debit}</td>
                            <td className="text-end">{item.credit}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan="5">&nbsp;</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalSolution;
