import { OverlayTrigger, Popover, Table } from "react-bootstrap";
import "./DropdownQuestion.css";
import Select from "react-select";
import { useState } from "react";

const DropdownQuestion = ({ answeredData, setAnsweredData }) => {
  const data = [
    {
      id: "1",
      question: "Ravi takes stock",
      amount1: "1000",
      amount2: "",
    },
    {
      id: "2",
      question: "Charan purchased goods",
      amount1: "5000",
      amount2: "",
    },
    {
      id: "3",
      question: "Ravi sold goods",
      amount1: "2000",
      amount2: "",
    },
    {
      id: "4",
      question: "Charan sold goods",
      amount1: "3000",
      amount2: "",
    },
    {
      id: "5",
      question: "Ravi paid rent",
      amount1: "1000",
      amount2: "",
    },
  ];

  // did not use these
  const [credit, setCredit] = useState(null);
  const [debit, setDebit] = useState(null);

  const tables = ["Sales A/C", "Ravi A/C", "Amar A/C", "Kiran A/C"];

  const optionsCreditData = tables.map((t, idx) => ({
    label: `To ${t}`,
    value: idx,
  }));

  const optionsDebitData = tables.map((t, idx) => ({
    label: `${t} ... Dr`,
    value: idx,
  }));

  const handleAdd = (id, type, text) => {
    if (text === "") return;
    const neededData = data.find((obj) => obj.id === id);
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

  // useEffect(() => {
  //   console.log("New data is :", answeredData);
  // }, [answeredData]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <Table bordered className="align-middle mb-0 dropdown-table">
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
                        className="dropdown-popover"
                      >
                        <Popover.Header as="h3">
                          Transaction of <strong>{item.question}</strong> is ₹
                          {item.amount1}
                          {item.amount2 ? `/${item.amount2}` : ""}
                        </Popover.Header>
                        <Popover.Body>
                          {/* className="dropdown-grid" */}
                          <div style={{ width: "400px" }}>
                            {/* className="grid-container" */}
                            <div>
                              <div>
                                {/* <Button
                                    onClick={() =>
                                      handleAdd(item.id, "Debit", table)
                                    }
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
                                    style={{
                                      width: "80px",
                                      marginRight: "5px",
                                    }}
                                  >
                                    Credit
                                  </Button> */}
                                <div className="mb-4">
                                  <Select
                                    options={optionsDebitData}
                                    placeholder="Select Debit A/C"
                                    value={debit}
                                    closeMenuOnSelect={false}
                                    menuPortalTarget={document.body}
                                    styles={{
                                      menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                      }),
                                    }}
                                    onChange={(selected) => {
                                      // if (!selected) return;
                                      handleAdd(
                                        item.id,
                                        "Debit",
                                        selected?.label ?? "",
                                      );
                                    }}
                                    isSearchable
                                  />
                                </div>

                                <Select
                                  options={optionsCreditData}
                                  placeholder="Select Credit A/C"
                                  value={credit}
                                  closeMenuOnSelect={false}
                                  menuPortalTarget={document.body}
                                  styles={{
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  }}
                                  onChange={(selected) => {
                                    // if (!selected) return;
                                    handleAdd(
                                      item.id,
                                      "Credit",
                                      selected?.label ?? "",
                                    );
                                  }}
                                  isSearchable
                                />
                              </div>
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

export default DropdownQuestion;
