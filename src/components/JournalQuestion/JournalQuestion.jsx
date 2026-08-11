import React from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { OverlayTrigger, Popover } from "react-bootstrap";
import "./JournalQuestion.css";

const JournalQuestion = ({ answeredData, setAnsweredData }) => {
  // DO NOT CHANGE THESE AMOUNTS
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

    if (!neededData) return;

    let text;

    if (type === "Debit") {
      text = `${table}..........Dr`;
    } else {
      text = `To ${table}`;
    }

    if (!(id in answeredData)) {
      setAnsweredData((prev) => ({
        ...prev,
        [id]: [
          {
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

      return;
    }

    const txnData = answeredData[id];

    const duplicateEntry = txnData.find(
      (txn) => txn.particulars === text
    );

    if (duplicateEntry) {
      return;
    }

    let updatedTxnData;

    if (type === "Debit") {
      updatedTxnData = [
        {
          date: "",
          particulars: text,
          lf: "",
          debit: neededData.amount1,
          credit: "",
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
          debit: "",
          credit: neededData.amount1,
        },
        ...txnData.slice(-1),
      ];
    }

    setAnsweredData((prev) => ({
      ...prev,
      [id]: updatedTxnData,
    }));
  };

  return (
    <div className="transaction-details-card">
      {/* LEFT CARD HEADING */}
      <div className="transaction-details-title">
        Transaction Details
      </div>

      {/* TABLE */}
      <div className="transaction-details-table-wrapper">
        <Table bordered hover className="journal-table">
          <thead>
            <tr>
              <th className="transaction-column">
                Transaction
              </th>

              <th className="amount-column">
                Amount (₹)
              </th>

              <th className="amount-column">
                Amount (₹)
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <OverlayTrigger
  key={item.id}
  trigger="click"
  placement="bottom"
  rootClose
  container={() => document.body}
  popperConfig={{
    strategy: "fixed",
    modifiers: [
      {
        name: "flip",
        enabled: true,
        options: {
          fallbackPlacements: ["top"],
          boundary: "viewport",
          rootBoundary: "viewport",
          padding: 12,
        },
      },
      {
        name: "preventOverflow",
        enabled: true,
        options: {
          boundary: "viewport",
          rootBoundary: "viewport",
          padding: 12,
          altAxis: true,
        },
      },
    ],
  }}
  overlay={
    <Popover
      id={`popover-${item.id}`}
      className="journal-popover"
    >
                    {/* POPUP HEADER */}
                    <Popover.Header
                      as="div"
                      className="journal-popover-header"
                    >
                      <span className="popover-title">
                        Transaction of {item.question} is ₹
                        {item.amount1}
                        {item.amount2
                          ? `/${item.amount2}`
                          : ""}
                      </span>

                      {/* CLOSE ICON */}
                      <button
                        type="button"
                        className="popover-close"
                        aria-label="Close"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          document.body.click();
                        }}
                      >
                        ×
                      </button>
                    </Popover.Header>

                    {/* POPUP BODY */}
                    <Popover.Body className="journal-popover-body">
                      {item.tables.map((table) => (
                        <div
                          className="account-row"
                          key={table}
                        >
                          {/* ACCOUNT */}
                          <div className="account-name">
                            {table}
                          </div>

                          {/* DEBIT */}
                          <Button
                            type="button"
                            className="def transaction-btn"
                            onClick={(e) => {
                              e.stopPropagation();

                              handleAdd(
                                item.id,
                                "Debit",
                                table
                              );
                            }}
                          >
                            Debit
                          </Button>

                          {/* CREDIT */}
                          <Button
                            type="button"
                            className="def transaction-btn"
                            onClick={(e) => {
                              e.stopPropagation();

                              handleAdd(
                                item.id,
                                "Credit",
                                table
                              );
                            }}
                          >
                            Credit
                          </Button>
                        </div>
                      ))}
                    </Popover.Body>
                  </Popover>
                }
              >
                <tr>
                  <td className="transaction-cell">
                    {item.question}
                  </td>

                  <td className="amount-cell">
                    {item.amount1 || "-"}
                  </td>

                  <td className="amount-cell">
                    {item.amount2 || "-"}
                  </td>
                </tr>
              </OverlayTrigger>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default JournalQuestion;