import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

import "./JournalQuestion.css";

const JournalQuestion = ({ answeredData, setAnsweredData }) => {
  const [hoverId, setHoverId] = useState(null);

  const data = [
    {
      id: "1",
      question: "Ravi takes stock",
      amount1: "1000",
      amount2: "",
      tables: ["Ravi A/C", "Suspense A/C", "Demo A/C"],
    },
    {
      id: "2",
      question: "Charan purchased goods",
      amount1: "5000",
      amount2: "",
      tables: ["Charan A/C", "Suspense A/C"],
    },
    {
      id: "3",
      question: "Ravi sold goods",
      amount1: "2000",
      amount2: "",
      tables: ["Suspense A/C", "Ravi A/C"],
    },
    {
      id: "4",
      question: "Charan sold goods",
      amount1: "3000",
      amount2: "",
      tables: ["Suspense A/C", "Charan A/C"],
    },
    {
      id: "5",
      question: "Ravi paid rent",
      amount1: "1000",
      amount2: "",
      tables: ["Rent A/C", "Ravi A/C"],
    },
  ];

  const handleAdd = (id, type, table) => {
    const neededData = data.find((obj) => obj.id === id);
    let text;
    if (type === "Debit") {
      text = `${table}..........Dr`;
    } else {
      text = `To ${table}`;
    }
    if (!(id in answeredData)) {
      // Key does NOT exist
      setAnsweredData((prev) => ({
        ...prev,
        [id]: [
          {
            // add aditional properties table and type to represent uniqueness of transaction
            date: "",
            particulars: text,
            lf: "",
            debit: type === "Debit" ? neededData.amount1 : "",
            credit: type === "Credit" ? neededData.amount1 : "",
          },
          {
            date: "",
            particulars: `(Being ${neededData.question})`,
            lf: "",
            debit: "",
            credit: "",
          },
        ],
      }));
    } else {
      // Key EXISTS
      let txnData = answeredData[id];
      let duplicateEntry = txnData.find((txn) => txn.particulars === text);
      if (duplicateEntry) {
        console.log(
          "Duplicate entry found for id:",
          id,
          "and particulars:",
          text,
        );
        return;
      }
      let updatedTxnData;
      if (type === "Debit") {
        updatedTxnData = [
          {
            date: "",
            particulars: text,
            lf: "",
            debit: type === "Debit" ? neededData.amount1 : "",
            credit: type === "Credit" ? neededData.amount1 : "",
          },
          ...txnData,
        ];
      } else {
        updatedTxnData = [
          ...txnData.slice(0, -1),
          {
            date: "",
            particulars: text,
            lf: "",
            debit: type === "Debit" ? neededData.amount1 : "",
            credit: type === "Credit" ? neededData.amount1 : "",
          },
          ...txnData.slice(-1),
        ];
      }
      setAnsweredData((prev) => ({ ...prev, [id]: updatedTxnData }));
    }
  };

  useEffect(() => {
    console.log("New data is :", answeredData);
  }, [answeredData]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <Table striped bordered hover className="align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Transaction</th>
                  <th className="text-end">Amount (₹)</th>
                  <th className="text-end">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <>
                    <tr
                      key={item.id}
                      onMouseEnter={() => setHoverId(item.id)}
                      className={hoverId === item.id ? "table-primary" : ""}
                    >
                      <td>{item.question}</td>
                      <td className="text-end">{item.amount1 || "-"}</td>
                      <td className="text-end">{item.amount2 || "-"}</td>
                    </tr>
                    {hoverId === item.id && (
                      <tr
                        className="table-info"
                        onMouseLeave={() => setHoverId(null)}
                      >
                        <td colSpan={3}>
                          {/* <strong>Tables:</strong> {item.tables.join(", ")} */}
                          <div className="grid-container">
                            {item.tables.map((table, index) => (
                              <div key={index} className="item">
                                {table}
                                <Button
                                  onClick={() =>
                                    handleAdd(item.id, "Debit", table)
                                  }
                                >
                                  Debit
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleAdd(item.id, "Credit", table)
                                  }
                                >
                                  Credit
                                </Button>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalQuestion;
