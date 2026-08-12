import React from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { OverlayTrigger, Popover } from "react-bootstrap";
import "./JournalQuestion.css";
import QuestionAnswerService from "../../services/QuestionAnswerService";

const JournalQuestion = ({
  data = [],
  answeredData,
  setAnsweredData,
  questionText,
  loadTotalScore,
}) => {
  const handleAdd = async (item, type, table) => {
    try {
      const id = item.questionAttributeId;

      const currentAnswers = answeredData[id] || [];

      const alreadySolved = currentAnswers.some(
        (entry) => entry.valid === true,
      );

      if (alreadySolved) {
        console.log("Attribute already solved. Answer disabled.");
        return;
      }

      console.log("========== JOURNAL SELECTION ==========");
      console.log("Question Attribute ID:", id);
      console.log("Attribute:", item.attributeName);
      console.log("Selected Table:", table);
      console.log("Selected Type:", type);

      const selectedCondition = type === "Debit" ? table.debit : table.credit;

      console.log("Selected Condition:", selectedCondition);

      // Rule Engine tells us the correct option.
      // It does NOT control whether the user can see/select
      // Debit or Credit.

      const selectedHeaderId =
        selectedCondition?.headerId ?? (type === "Debit" ? 1 : 3);

      const selectedArithmetic = selectedCondition?.arithmetic ?? null;

      const text =
        type === "Debit" ? `${table.name}..........Dr` : `To ${table.name}`;

      console.log("Selected Header ID:", selectedHeaderId);
      console.log("Selected Arithmetic:", selectedArithmetic);
      console.log("User Answer:", text);

      const isCorrect = selectedCondition?.headerName === item.headerName;

      const existingAnswers = answeredData[id] || [];

      const duplicate = existingAnswers.some(
        (entry) =>
          entry.particulars === text &&
          entry.tableNameId === table.id &&
          entry.headerId === selectedHeaderId,
      );

      if (duplicate) {
        console.log("Duplicate selection ignored.");
        return;
      }

      // ===============================
      // 1. ANSWER EVENT REQUEST
      // ===============================
      const answerEventRequest = {
        userId: 1,
        questionId: item.questionId,
        attributeId: item.attributeId,
        arithmetic: selectedArithmetic,
        eventType: "ANSWER",
        isCorrect: isCorrect,
        hint: null,
        description: `User selected ${text}`,
        userAnswer: text,
      };

      console.log("ANSWER EVENT REQUEST:", answerEventRequest);

      // ===============================
      // 2. ALWAYS CALL ANSWER EVENT API
      // ===============================
      const eventResult =
        await QuestionAnswerService.processAnswerEvent(answerEventRequest);

      console.log("ANSWER EVENT RESPONSE:", eventResult);

      // ===============================
      // 3. ONLY IF CORRECT
      //    CALL QUESTION ANSWER API
      // ===============================
      let questionAnswerResult = null;

      if (isCorrect) {
        const questionAnswerRequest = {
          userId: 1,
          questionId: item.questionId,
          tableNameId: table.id,
          headerId: selectedHeaderId,
          attributeId: item.attributeId,
          arithmetic: selectedArithmetic,
          amount: item.amount,
        };

        console.log("QUESTION ANSWER REQUEST:", questionAnswerRequest);

        questionAnswerResult = await QuestionAnswerService.saveAnswer(
          questionAnswerRequest,
        );

        console.log("QUESTION ANSWER RESPONSE:", questionAnswerResult);
      }

      // ===============================
      // 4. UPDATE SCORE
      // ===============================
      if (loadTotalScore) {
        await loadTotalScore();
      }

      const newEntry = {
        questionAttributeId: item.questionAttributeId,

        date: "",
        particulars: text,
        lf: "",

        debit: type === "Debit" ? item.amount : "",
        credit: type === "Credit" ? item.amount : "",

        valid: isCorrect,
        answerId: questionAnswerResult?.answerId || null,
        answerEventId: eventResult?.answerEventId || null,

        tableNameId: table.id,
        headerId: selectedHeaderId,
        attributeId: item.attributeId,
        arithmetic: selectedArithmetic,
      };

      setAnsweredData((prev) => {
        const existing = prev[id] || [];

        const beingRow = existing.find((entry) =>
          entry.particulars?.startsWith("(Being"),
        );

        const answerRows = existing.filter(
          (entry) => !entry.particulars?.startsWith("(Being"),
        );

        let updatedRows;

        if (type === "Debit") {
          updatedRows = [newEntry, ...answerRows];
        } else {
          updatedRows = [...answerRows, newEntry];
        }

        const finalBeingRow = beingRow || {
          date: "",
          particulars: `(Being ${item.attributeName})`,
          lf: "",
          debit: "",
          credit: "",
        };

        return {
          ...prev,
          [id]: [...updatedRows, finalBeingRow],
        };
      });
    } catch (error) {
      console.error("Failed to process answer event:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  };

  return (
    <div>
      <Table bordered hover>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Amount (₹)</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => {
            const existingAnswers =
              answeredData[item.questionAttributeId] || [];

            const isSolved = existingAnswers.some(
              (entry) => entry.valid === true,
            );

            console.log(
              "SOLVED CHECK:",
              item.questionAttributeId,
              answeredData[item.questionAttributeId],
            );

            return (
              <tr key={item.questionAttributeId}>
                <td>
                  <OverlayTrigger
                    trigger={isSolved ? [] : "click"}
                    placement="bottom"
                    rootClose
                    container={document.body}
                    overlay={
                      <Popover
                        id={`popover-${item.questionAttributeId}`}
                        className="journal-popover"
                      >
                        <Popover.Header as="h3" className="popover-header">
                          Transaction
                        </Popover.Header>

                        <Popover.Body>
                          <div
                            style={{ width: "400px" }}
                            className="popover-body"
                          >
                            <div>
                              <strong>{item.attributeName}</strong>
                            </div>

                            <div style={{ marginTop: "10px" }}>
                              Amount: ₹{item.amount || "-"}
                            </div>

                            <div style={{ marginTop: "10px" }}>
                              {item.tables?.map((table) => (
                                <div
                                  key={table.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "10px",
                                  }}
                                >
                                  <strong>{table.name}</strong>

                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      gap: "8px",
                                    }}
                                  >
                                    <Button
                                      onClick={() =>
                                        handleAdd(item, "Debit", table)
                                      }
                                      className="def"
                                      style={{
                                        width: "80px",
                                      }}
                                    >
                                      Debit
                                    </Button>

                                    <Button
                                      onClick={() =>
                                        handleAdd(item, "Credit", table)
                                      }
                                      className="def"
                                      style={{
                                        width: "80px",
                                      }}
                                    >
                                      Credit
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <span
                      style={{
                        cursor: isSolved ? "not-allowed" : "pointer",
                        opacity: isSolved ? 0.6 : 1,
                      }}
                    >
                      {item.attributeName}
                    </span>
                  </OverlayTrigger>
                </td>

                <td>{item.amount || "-"}</td>

                <td>{item.amount2 || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default JournalQuestion;
