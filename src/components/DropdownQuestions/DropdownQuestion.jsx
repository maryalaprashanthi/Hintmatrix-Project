import { OverlayTrigger, Popover, Table } from "react-bootstrap";
import "./DropdownQuestion.css";
import Select from "react-select";
import { useState } from "react";
import QuestionAnswerService from "../../services/QuestionAnswerService";

const DropdownQuestion = ({
  data,
  questionTables,
  questionId,
  answeredData,
  setAnsweredData,
}) => {
  // Hardcoded for now
  const userId = 1;

  // Keep Debit/Credit selection separately for every attribute
  const [selections, setSelections] = useState({});

  /*
   * Find the Rule Engine condition that matches:
   * selected table + selected Debit/Credit side
   */
  const findMatchingCondition = (rule, tableId, type) => {
    if (!rule) {
      return null;
    }

    const conditions = [
      {
        position: 1,
        condition: rule.condition1,
      },
      {
        position: 2,
        condition: rule.condition2,
      },
      {
        position: 3,
        condition: rule.condition3,
      },
      {
        position: 4,
        condition: rule.condition4,
      },
    ];

    return (
      conditions.find(({ condition }) => {
        if (!condition) {
          return false;
        }

        if (condition.tableId == null) {
          return false;
        }

        // Debit = Debit Particulars
        // Credit = Credit Particulars
        const expectedHeader =
          type === "Debit" ? "Debit Particulars" : "Credit Particulars";

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
  const handleAdd = (id, type, selectedOption, isCorrect) => {
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

    const rule = item.rule;

    const tableId = selected.value;

    /*
     * Find whether selected table + Debit/Credit
     * matches one of the Rule Engine conditions.
     */
    const matchingCondition = findMatchingCondition(rule, tableId, type);

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

        answerPosition: matchingCondition.position,

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
        /*
         * BOTH APIs are started together
         */
        const [questionAnswerResponse, answerEventResponse] = await Promise.all(
          [
            QuestionAnswerService.saveAnswer(questionAnswerData),

            QuestionAnswerService.processAnswerEvent(answerEventData),
          ],
        );

        console.log("QuestionAnswer API Response:", questionAnswerResponse);

        console.log("AnswerEvent API Response:", answerEventResponse);

        /*
         * Update UI after successful API calls
         */
        handleAdd(item.questionAttributeId, type, selected, true);

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
    const selectedOptionIndex = questionTables.findIndex(
      (table) => String(table.id) === String(tableId),
    );

    const answerEventData = {
      userId: userId,

      questionId: questionId,

      attributeId: item.attributeId,

      answerPosition: selectedOptionIndex >= 0 ? selectedOptionIndex + 1 : null,

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
      handleAdd(item.questionAttributeId, type, selected, false);

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

              return (
                <OverlayTrigger
                  key={item.questionAttributeId}
                  trigger="click"
                  placement="bottom"
                  rootClose
                  container={document.body}
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
                                isSearchable
                              />
                            </div>
                          </div>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <tr key={item.questionAttributeId}>
                    <td>{item.attributeName}</td>

                    <td className="text-end">{item.amount || "-"}</td>

                    <td className="text-end">{item.amount2 || "-"}</td>
                  </tr>
                </OverlayTrigger>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default DropdownQuestion;
