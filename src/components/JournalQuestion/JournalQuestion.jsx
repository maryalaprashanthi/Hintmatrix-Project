import React, { useRef, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { Overlay, Popover } from "react-bootstrap";
import "./JournalQuestion.css";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import {
  getCorrectAnswerCount,
  getRequiredAnswerCount,
  isJournalAttributeSolved,
  getUnansweredRuleConditions,
} from "./journalAnswerStatus";

const JournalQuestion = ({
  data = [],
  answeredData,
  setAnsweredData,
  questionText,
  loadTotalScore,
}) => {
  const [helpRequest, setHelpRequest] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [openAttributeId, setOpenAttributeId] = useState(null);
  const attributeTargets = useRef({});

  const closeHelp = () => {
    setHelpRequest(null);
    setShowHint(false);
  };

  const getNextCondition = (item) =>
    getUnansweredRuleConditions(
      item.tables,
      answeredData[item.questionAttributeId] || [],
    )[0];

  const handleHint = async () => {
    const nextCondition = getNextCondition(helpRequest.item);

    setShowHint(true);

    if (!nextCondition) {
      return;
    }

    try {
      await QuestionAnswerService.processAnswerEvent({
        userId: 1,
        questionId: helpRequest.item.questionId,
        attributeId: helpRequest.item.attributeId,
        answerPosition: nextCondition.condition.position ?? null,
        arithmetic: nextCondition.condition.arithmetic,
        eventType: "HINT",
        isCorrect: null,
        hint: nextCondition.condition.information ?? null,
        description: "Hint requested",
        userAnswer: null,
      });
    } catch (error) {
      console.error("Failed to save hint event:", error);
    }
  };

  const handleAutofill = async () => {
    const item = helpRequest.item;

    const remainingConditions = getUnansweredRuleConditions(
      item.tables,
      answeredData[item.questionAttributeId] || [],
    );

    if (!remainingConditions.length) {
      closeHelp();
      return;
    }

    setIsAutofilling(true);

    try {
      const savedEntries = await Promise.all(
        remainingConditions.map(async ({ table, type, condition }) => {
          const particulars =
            type === "Debit" ? `${table.name}..........Dr` : `To ${table.name}`;

          const [answerResult, eventResult] = await Promise.all([
            QuestionAnswerService.saveAnswer({
              userId: 1,
              questionId: item.questionId,
              tableNameId: table.id,
              headerId: condition.headerId,
              attributeId: item.attributeId,
              arithmetic: condition.arithmetic,
              amount: item.amount,
            }),

            QuestionAnswerService.processAnswerEvent({
              userId: 1,
              questionId: item.questionId,
              attributeId: item.attributeId,
              answerPosition: condition.position ?? null,
              arithmetic: condition.arithmetic,
              eventType: "AUTOFILL",
              isCorrect: true,
              hint: null,
              description: `Autofilled ${particulars}`,
              userAnswer: particulars,
            }),
          ]);

          return {
            questionAttributeId: item.questionAttributeId,
            date: "",
            particulars,
            lf: "",
            debit: type === "Debit" ? item.amount : "",
            credit: type === "Credit" ? item.amount : "",
            valid: true,
            answerId: answerResult?.answerId || null,
            answerEventId: eventResult?.answerEventId || null,
            tableNameId: table.id,
            headerId: condition.headerId,
            attributeId: item.attributeId,
            arithmetic: condition.arithmetic,
          };
        }),
      );

      setAnsweredData((prev) => {
        const id = item.questionAttributeId;
        const existing = prev[id] || [];

        const beingRow = existing.find((entry) =>
          entry.particulars?.startsWith("(Being"),
        );

        const answerRows = existing.filter(
          (entry) =>
            !entry.particulars?.startsWith("(Being") && entry.valid === true,
        );

        const newEntries = savedEntries.filter(
          (entry) =>
            !answerRows.some(
              (existingEntry) =>
                String(existingEntry.tableNameId) ===
                  String(entry.tableNameId) &&
                String(existingEntry.headerId) === String(entry.headerId),
            ),
        );

        return {
          ...prev,
          [id]: [
            ...newEntries.filter((entry) => entry.debit),
            ...answerRows,
            ...newEntries.filter((entry) => entry.credit),
            beingRow || {
              date: "",
              particulars: `(Being ${item.attributeName})`,
              lf: "",
              debit: "",
              credit: "",
            },
          ],
        };
      });

      if (loadTotalScore) {
        await loadTotalScore();
      }

      closeHelp();
    } catch (error) {
      console.error("Failed to autofill journal answers:", error);
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleAdd = async (item, type, table) => {
    try {
      const id = item.questionAttributeId;

      const currentAnswers = answeredData[id] || [];

      const alreadySolved = isJournalAttributeSolved(item, currentAnswers);

      if (alreadySolved) {
        console.log("All rule-defined answers have been completed.");
        return;
      }

      console.log("========== JOURNAL SELECTION ==========");
      console.log("Question Attribute ID:", id);
      console.log("Attribute:", item.attributeName);
      console.log("Selected Table:", table);
      console.log("Selected Type:", type);

      const selectedCondition = type === "Debit" ? table.debit : table.credit;

      console.log("Selected Condition:", selectedCondition);

      const selectedHeaderId =
        selectedCondition?.headerId ?? (type === "Debit" ? 1 : 3);

      const selectedArithmetic = selectedCondition?.arithmetic ?? null;

      const text =
        type === "Debit" ? `${table.name}..........Dr` : `To ${table.name}`;

      console.log("Selected Header ID:", selectedHeaderId);
      console.log("Selected Arithmetic:", selectedArithmetic);
      console.log("User Answer:", text);

      const isCorrect = Boolean(selectedCondition);

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

      const eventResult =
        await QuestionAnswerService.processAnswerEvent(answerEventRequest);

      console.log("ANSWER EVENT RESPONSE:", eventResult);

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

      setOpenAttributeId(null);

      if (!isCorrect) {
        setHelpRequest({ item });
        setShowHint(false);
      } else {
        setHelpRequest(null);
        setShowHint(false);
      }
    } catch (error) {
      console.error("Failed to process answer event:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  };

  return (
    <div>
      <Table className="journal-table" bordered hover>
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

            const isSolved = isJournalAttributeSolved(item, existingAnswers);

            console.log(
              "SOLVED CHECK:",
              item.questionAttributeId,
              `${getCorrectAnswerCount(existingAnswers)}/${getRequiredAnswerCount(item.tables)}`,
            );

            return (
              <tr key={item.questionAttributeId}>
                <td>
                  <span
                    ref={(element) => {
                      attributeTargets.current[item.questionAttributeId] =
                        element;
                    }}
                    className="transaction-popup-trigger"
                    onClick={() => {
                      if (!isSolved) {
                        setOpenAttributeId((current) =>
                          current === item.questionAttributeId
                            ? null
                            : item.questionAttributeId,
                        );
                      }
                    }}
                    style={{
                      cursor: isSolved ? "not-allowed" : "pointer",
                      opacity: isSolved ? 0.6 : 1,
                    }}
                  >
                    {item.attributeName}
                  </span>
                  <Overlay
                    show={openAttributeId === item.questionAttributeId}
                    target={attributeTargets.current[item.questionAttributeId]}
                    placement="right-start"
                    rootClose
                    onHide={() => setOpenAttributeId(null)}
                    popperConfig={{
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [12, -8],
                          },
                        },
                        {
                          name: "preventOverflow",
                          options: {
                            boundary: "viewport",
                            padding: 10,
                          },
                        },
                        {
                          name: "flip",
                          options: {
                            fallbackPlacements: [
                              "left-start",
                              "bottom-start",
                              "top-start",
                            ],
                          },
                        },
                      ],
                    }}
                  >
                    <Popover
                      id={`popover-${item.questionAttributeId}`}
                      className="journal-popover"
                    >
                      <Popover.Header
                        as="div"
                        className="journal-popover-header"
                      >
                        <span className="popover-title">Transaction</span>

                        <button
                          type="button"
                          className="popover-close"
                          onClick={() => setOpenAttributeId(null)}
                          aria-label="Close"
                        >
                          ×
                        </button>
                      </Popover.Header>

                      <Popover.Body className="journal-popover-body">
                        <div className="popover-attribute-name">
                          <strong>{item.attributeName}</strong>
                        </div>

                        <div className="popover-amount">
                          Amount: ₹{item.amount || "-"}
                        </div>

                        <div className="popover-account-list">
                          {item.tables?.map((table) => (
                            <div key={table.id} className="account-row">
                              <strong className="account-name">
                                {table.name}
                              </strong>

                              <Button
                                onClick={() => handleAdd(item, "Debit", table)}
                                className="def transaction-btn"
                              >
                                Debit
                              </Button>

                              <Button
                                onClick={() => handleAdd(item, "Credit", table)}
                                className="def transaction-btn"
                              >
                                Credit
                              </Button>
                            </div>
                          ))}
                        </div>
                      </Popover.Body>
                    </Popover>
                  </Overlay>
                </td>

                <td>{item.amount || "-"}</td>

                <td>{item.amount2 || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Overlay
        show={Boolean(helpRequest)}
        target={
          helpRequest &&
          attributeTargets.current[helpRequest.item.questionAttributeId]
        }
        placement="right"
        container={document.body}
        popperConfig={{ strategy: "fixed" }}
        rootClose
        onHide={closeHelp}
      >
        {(props) => (
          <Popover {...props}>
            <Popover.Body>
              <div className="text-danger small fw-semibold mb-2">
                Incorrect answer
              </div>

              <div className="d-grid gap-2">
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={handleHint}
                >
                  💡 Hint
                </Button>

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleAutofill}
                  disabled={isAutofilling}
                >
                  ✦ {isAutofilling ? "Filling..." : "Autofill"}
                </Button>
              </div>

              {showHint && (
                <div className="alert alert-warning small mt-2 mb-0 p-2">
                  <strong>💡 Hint: </strong>

                  <span>
                    {getNextCondition(helpRequest?.item)?.condition
                      .information ||
                      "Review the remaining Debit and Credit entries for this transaction."}
                  </span>
                </div>
              )}
            </Popover.Body>
          </Popover>
        )}
      </Overlay>
    </div>
  );
};

export default JournalQuestion;
