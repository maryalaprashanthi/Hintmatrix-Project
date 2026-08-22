import { Overlay, OverlayTrigger, Popover, Table } from "react-bootstrap";
import "./DropdownQuestion.css";
import Select from "react-select";
import { useRef, useState } from "react";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import {
  getUnansweredDropdownConditions,
  isDropdownAttributeSolved,
} from "./dropdownAnswerStatus";

const DropdownQuestion = ({
  data,
  questionTables,
  questionId,
  answeredData,
  setAnsweredData,
  loadTotalScore,
}) => {
  // Hardcoded for now
  const userId = 1;

  // Keep Debit/Credit selection separately for every attribute
  const [selections, setSelections] = useState({});

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
    getUnansweredDropdownConditions(
      item.ruleConditions || [],
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
        userId: userId,
        questionId: helpRequest.item.questionId,
        attributeId: helpRequest.item.attributeId,

        answerPosition: nextCondition.condition.position ?? null,

        arithmetic: nextCondition.condition.arithmetic ?? null,

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
    const requestedAttributeId = helpRequest?.item?.questionAttributeId;

    const item = data.find(
      (attribute) =>
        String(attribute.questionAttributeId) === String(requestedAttributeId),
    );

    if (!item) {
      console.error("Autofill attribute not found:", requestedAttributeId);
      return;
    }

    console.log("========== DROPDOWN AUTOFILL ==========");

    console.log("Autofill Attribute ID:", item.questionAttributeId);

    console.log("Autofill Attribute:", item.attributeName);

    console.log("Autofill Rule:", item.rule);

    console.log("Autofill Rule Conditions:", item.ruleConditions);

    const remainingConditions = getUnansweredDropdownConditions(
      item.ruleConditions || [],
      answeredData[item.questionAttributeId] || [],
    );

    console.log("Autofill Remaining Conditions:", remainingConditions);

    if (!remainingConditions.length) {
      closeHelp();
      return;
    }

    setIsAutofilling(true);

    try {
      const savedEntries = await Promise.all(
        remainingConditions.map(async ({ condition }) => {
          const isDebit = condition.headerName === "Debit Particulars";

          const particulars = isDebit
            ? `${condition.tableName} ... Dr`
            : `To ${condition.tableName}`;

          const [questionAnswerResult, answerEventResult] = await Promise.all([
            QuestionAnswerService.saveAnswer({
              userId: userId,
              questionId: item.questionId,
              tableNameId: condition.tableId,
              headerId: condition.headerId,
              attributeId: item.attributeId,
              arithmetic: condition.arithmetic,
              amount: item.amount,
            }),

            QuestionAnswerService.processAnswerEvent({
              userId: userId,
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

            debit: isDebit ? item.amount : "",

            credit: isDebit ? "" : item.amount,

            valid: true,

            answerId: questionAnswerResult?.answerId || null,

            answerEventId: answerEventResult?.answerEventId || null,

            tableNameId: condition.tableId,

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
            ...newEntries.filter(
              (entry) => entry.debit !== "" && entry.debit != null,
            ),

            ...answerRows,

            ...newEntries.filter(
              (entry) => entry.credit !== "" && entry.credit != null,
            ),

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
      console.error("Failed to autofill dropdown answers:", error);
    } finally {
      setIsAutofilling(false);
    }
  };

  /*
   * Find the Rule Engine condition that matches:
   * selected table + selected Debit/Credit side
   */
  const findMatchingCondition = (rule, tableId, type, ruleConditions = []) => {
    if (!rule && ruleConditions.length === 0) {
      return null;
    }

    const conditions =
      ruleConditions.length > 0
        ? ruleConditions.map((condition, index) => ({
            position: condition.position ?? index + 1,
            condition,
          }))
        : [
            {
              position: 1,
              condition: rule?.condition1,
            },
            {
              position: 2,
              condition: rule?.condition2,
            },
            {
              position: 3,
              condition: rule?.condition3,
            },
            {
              position: 4,
              condition: rule?.condition4,
            },
          ];

    const expectedHeader =
      type === "Debit" ? "Debit Particulars" : "Credit Particulars";

    return (
      conditions.find(({ condition }) => {
        if (!condition) {
          return false;
        }

        if (condition.tableId == null) {
          return false;
        }

        return (
          String(condition.tableId) === String(tableId) &&
          condition.headerName === expectedHeader
        );
      }) || null
    );
  };

  /*
   * CREATE / UPDATE UI DATA
   */
  const handleAdd = (
    id,
    type,
    selectedOption,
    isCorrect,
    matchingCondition = null,
  ) => {
    if (!selectedOption) {
      return;
    }

    const text = selectedOption.label;

    const neededData = data.find(
      (obj) => String(obj.questionAttributeId) === String(id),
    );

    if (!neededData) {
      return;
    }

    if (!(id in answeredData)) {
      setAnsweredData((prev) => ({
        ...prev,

        [id]: [
          {
            date: "",
            particulars: text,
            lf: "",
            debit: type === "Debit" ? neededData.amount : "",
            credit: type === "Credit" ? neededData.amount : "",
            valid: isCorrect,

            tableNameId: matchingCondition?.condition?.tableId ?? null,

            headerId: matchingCondition?.condition?.headerId ?? null,

            attributeId: neededData.attributeId,
          },
          {
            date: "",
            particulars: `(Being ${neededData.attributeName})`,
            lf: "",
            debit: "",
            credit: "",
          },
        ],
      }));
    } else {
      const txnData = answeredData[id];

      const duplicateEntry = txnData.find((txn) => txn.particulars === text);

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

      const newEntry = {
        date: "",
        particulars: text,
        lf: "",
        debit: type === "Debit" ? neededData.amount : "",
        credit: type === "Credit" ? neededData.amount : "",
        valid: isCorrect,

        tableNameId: matchingCondition?.condition?.tableId ?? null,

        headerId: matchingCondition?.condition?.headerId ?? null,

        attributeId: neededData.attributeId,
      };

      if (type === "Debit") {
        updatedTxnData = [newEntry, ...txnData];
      } else {
        updatedTxnData = [
          ...txnData.slice(0, -1),
          newEntry,
          ...txnData.slice(-1),
        ];
      }

      setAnsweredData((prev) => ({
        ...prev,
        [id]: updatedTxnData,
      }));
    }

    console.log("Answer added:", id, type, text, "Correct:", isCorrect);
  };

  /*
   * HANDLE DEBIT / CREDIT SELECTION
   */
  const handleSelection = async (item, type, selected) => {
    if (!selected) {
      return;
    }

    const isSolved = isDropdownAttributeSolved(
      item.ruleConditions || [],
      answeredData[item.questionAttributeId] || [],
    );

    if (isSolved) {
      return;
    }

    const rule = item.rule;

    const tableId = selected.value;

    /*
     * Find whether selected table + Debit/Credit
     * matches one of the Rule Engine conditions.
     */
    const matchingCondition = findMatchingCondition(
      rule,
      tableId,
      type,
      item.ruleConditions || [],
    );

    const isCorrect = matchingCondition !== null;

    console.log("-----------------------------------");

    console.log("Question ID:", questionId);
    console.log("Attribute ID:", item.attributeId);
    console.log("Attribute:", item.attributeName);
    console.log("Selected Type:", type);
    console.log("Selected Table:", selected.label);
    console.log("Selected Table ID:", tableId);
    console.log("Matching Condition:", matchingCondition);
    console.log("Is Correct:", isCorrect);

    /*
     * Save selected value in UI state
     */
    setSelections((prev) => ({
      ...prev,

      [`${item.questionAttributeId}-${type}`]: selected,
    }));

    /*
     * ------------------------------------------------
     * CORRECT ANSWER
     * QuestionAnswer API + AnswerEvent API
     * ------------------------------------------------
     */
    if (isCorrect) {
      const condition = matchingCondition.condition;

      setOpenAttributeId(null);

      const questionAnswerData = {
        userId: userId,

        questionId: questionId,

        tableNameId: condition.tableId,

        headerId: condition.headerId,

        attributeId: item.attributeId,

        arithmetic: condition.arithmetic,

        amount: item.amount,
      };

      const answerEventData = {
        userId: userId,

        questionId: questionId,

        attributeId: item.attributeId,

        answerPosition: null,

        arithmetic: condition.arithmetic,

        eventType: "ANSWER",

        isCorrect: true,

        hint: null,

        description: condition.information,

        userAnswer: selected.label,
      };

      console.log("QuestionAnswer Payload:", questionAnswerData);

      console.log("AnswerEvent Payload:", answerEventData);
      try {
        // 1. AnswerEvent first
        const answerEventResponse =
          await QuestionAnswerService.processAnswerEvent(answerEventData);

        console.log("AnswerEvent API Response:", answerEventResponse);

        // 2. QuestionAnswer only for correct answer
        const questionAnswerResponse =
          await QuestionAnswerService.saveAnswer(questionAnswerData);

        console.log("QuestionAnswer API Response:", questionAnswerResponse);

        // 3. Update UI
        handleAdd(
          item.questionAttributeId,
          type,
          selected,
          true,
          matchingCondition,
        );

        // 4. Refresh score
        if (loadTotalScore) {
          await loadTotalScore();
        }

        console.log("CORRECT ANSWER - both APIs completed");
      } catch (error) {
        console.error("Error saving correct answer:", error);
      }

      return;
    }

    /*
     * ------------------------------------------------
     * WRONG ANSWER
     * AnswerEvent API ONLY
     * ------------------------------------------------
     */

    /*
     * For a wrong answer there is no matching
     * Rule Engine condition, so we don't have
     * a matching arithmetic.
     *
     * We record the selected option and mark it false.
     */

    const answerEventData = {
      userId: userId,

      questionId: questionId,

      attributeId: item.attributeId,

      answerPosition: null,

      arithmetic: null,

      eventType: "ANSWER",

      isCorrect: false,

      hint: null,

      description: "Incorrect answer",

      userAnswer: selected.label,
    };

    console.log("Wrong AnswerEvent Payload:", answerEventData);

    try {
      /*
       * ONLY AnswerEvent API
       */
      const response =
        await QuestionAnswerService.processAnswerEvent(answerEventData);

      console.log("Wrong AnswerEvent API Response:", response);

      /*
       * Update UI after event is recorded
       */
      handleAdd(item.questionAttributeId, type, selected, false, null);

      if (loadTotalScore) {
        await loadTotalScore();
      }

      setHelpRequest({
        item,
      });

      setShowHint(false);

      console.log("WRONG ANSWER - only AnswerEvent API completed");
    } catch (error) {
      console.error("Error saving wrong answer:", error);
    }
  };

  return (
    <div className="dropdown-question-wrap">
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
            {data.map((item) => {
              const optionsCreditData = questionTables.map((table) => ({
                label: `To ${table.name}`,
                value: table.id,
              }));

              const optionsDebitData = questionTables.map((table) => ({
                label: `${table.name} ... Dr`,
                value: table.id,
              }));

              const debitValue =
                selections[`${item.questionAttributeId}-Debit`] || null;

              const creditValue =
                selections[`${item.questionAttributeId}-Credit`] || null;

              const isSolved = isDropdownAttributeSolved(
                item.ruleConditions || [],
                answeredData[item.questionAttributeId] || [],
              );

              const trigger = isSolved ? [] : "click";

              return (
                <OverlayTrigger
                  key={item.questionAttributeId}
                  trigger={trigger}
                  show={openAttributeId === item.questionAttributeId && !isSolved}
                  placement="bottom"
                  rootClose
                  container={document.body}
                  onToggle={(nextShow) => {
                    if (!nextShow) {
                      setOpenAttributeId(null);
                    }
                  }}
                  overlay={
                    <Popover
                      id={`popover-${item.questionAttributeId}`}
                      className="dropdown-popover"
                    >
                      <Popover.Header as="h3">
                        Transaction of <strong>{item.attributeName}</strong> is
                        ₹{item.amount}
                        {item.amount2 ? `/${item.amount2}` : ""}
                      </Popover.Header>

                      <Popover.Body>
                        <div
                          style={{
                            width: "400px",
                          }}
                        >
                          <div>
                            <div>
                              <div className="mb-4">
                                <Select
                                  options={optionsDebitData}
                                  placeholder="Select Debit A/C"
                                  value={debitValue}
                                  closeMenuOnSelect={false}
                                  menuPortalTarget={document.body}
                                  styles={{
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  }}
                                  onChange={(selected) => {
                                    handleSelection(item, "Debit", selected);
                                  }}
                                  isDisabled={isSolved}
                                  isSearchable
                                />
                              </div>

                              <Select
                                options={optionsCreditData}
                                placeholder="Select Credit A/C"
                                value={creditValue}
                                closeMenuOnSelect={false}
                                menuPortalTarget={document.body}
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                onChange={(selected) => {
                                  handleSelection(item, "Credit", selected);
                                }}
                                isDisabled={isSolved}
                                isSearchable
                              />
                            </div>
                          </div>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <tr
                    key={item.questionAttributeId}
                    ref={(element) => {
                      attributeTargets.current[item.questionAttributeId] =
                        element;
                    }}
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
                    <td>{item.attributeName}</td>

                    <td className="text-end">{item.amount ?? "-"}</td>

                    <td className="text-end">{item.amount2 ?? "-"}</td>
                  </tr>
                </OverlayTrigger>
              );
            })}
          </tbody>
        </Table>
      </div>
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
          <Popover
            {...props}
            id="dropdown-help-popover"
            className="dropdown-help-popover"
          >
            <Popover.Body>
              <div className="text-danger small fw-semibold mb-2">
                Incorrect answer
              </div>

              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-outline-warning btn-sm"
                  onClick={handleHint}
                >
                  💡 Hint
                </button>

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleAutofill}
                  disabled={isAutofilling}
                >
                  ✦ {isAutofilling ? "Filling..." : "Autofill"}
                </button>
              </div>

              {showHint && (
                <div className="alert alert-warning small mt-2 mb-0 p-2">
                  <strong>💡 Hint: </strong>
                  <span>
                    {getNextCondition(helpRequest.item)?.condition
                      ?.information ||
                      "Review the remaining Debit and Credit entries."}
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

export default DropdownQuestion;
