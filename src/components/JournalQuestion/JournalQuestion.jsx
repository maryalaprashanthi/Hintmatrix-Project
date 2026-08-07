import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { OverlayTrigger, Popover } from "react-bootstrap";

import "./JournalQuestion.css";

const JournalQuestion = ({ answeredData, setAnsweredData }) => {
  const data = [
    {
      id: "1",
      question: "Ravi takes stock",
      amount1: "1000",
      amount2: "1000",
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

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <Table bordered className="align-middle mb-0 journal-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th className="text-end">Amount (₹)</th>
                  <th className="text-end">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <OverlayTrigger
                    key={item.id}
                    trigger="click"
                    placement="bottom"
                    rootClose
                    container={document.body}
                    overlay={
                      <Popover
                        id={`popover-${item.id}`}
                        className="journal-popover"
                      >
                        <Popover.Header as="h3" className="popover-header">
                          Transaction of <strong>{item.question}</strong> is ₹
                          {item.amount1}
                          {item.amount2 ? `/${item.amount2}` : ""}
                        </Popover.Header>
                        <Popover.Body>
                          {/* className="journal-grid" */}
                          <div
                            style={{ width: "400px" }}
                            className="popover-body"
                          >
                            {/* className="grid-container" */}
                            <div>
                              {item.tables.map((table, index) => (
                                // className="item"
                                <div key={index}>
                                  {table}
                                  <Button
                                    onClick={() =>
                                      handleAdd(item.id, "Debit", table)
                                    }
                                    className="def"
                                    style={{
                                      width: "80px",
                                      margin: "5px",
                                    }}
                                  >
                                    Debit
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleAdd(item.id, "Credit", table)
                                    }
                                    className="def"
                                    style={{
                                      width: "80px",
                                      marginRight: "5px",
                                    }}
                                  >
                                    Credit
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <tr key={item.id}>
                      <td>{item.question}</td>
                      <td className="text-end">{item.amount1 || "-"}</td>
                      <td className="text-end">{item.amount2 || "-"}</td>
                    </tr>
                  </OverlayTrigger>
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
