/* eslint-disable react/prop-types */
import { Accordion } from "react-bootstrap";
import { useMemo } from "react";
import ExamDraggable from "./ExamDraggable";
import ExamDroppable from "./ExamDroppable";
import useExamQuestionStore, { placementCount } from "./examQuestionStore";
import "../../Question/QuestionTable.css";
import { data } from "./SampleData";
import { calculateFinalAccounts } from "../../Question/SampleData";

const EMPTY_PLACEMENTS = {};

const ExamQuestionTable = () => {
  // Read this question's own slice - see examQuestionStore for why it's keyed.
  const questions =
    useExamQuestionStore(
      (state) => state.byQuestionId[state.activeQuestionId]?.questions,
    ) || [];
  const droppableData = useExamQuestionStore((state) =>
    state.byQuestionId[state.activeQuestionId]?.droppableData) || EMPTY_PLACEMENTS;
  const setAmountSelection = useExamQuestionStore((state) => state.setAmountSelection);
  const finalAccounts = useMemo(() => calculateFinalAccounts(droppableData), [droppableData]);
  const rowCount = (table) => Math.max(...table.headers.map((header) =>
    (droppableData[`${table.name}-${header}`]?.length ?? 0) +
    finalAccounts.accounts[table.name][header].rows.length));

  const debitBalances = questions.filter((q) => q.type === "debit");
  const creditBalances = questions.filter((q) => q.type === "credit");
  const adjustments = questions.filter((q) => q.type === "adjustment");

  const debitTotal = debitBalances.reduce(
    (sum, q) => sum + Number(q.amount || 0),
    0,
  );
  const creditTotal = creditBalances.reduce(
    (sum, q) => sum + Number(q.amount || 0),
    0,
  );

  const allTableNames = data.map((d) => d.name);
  const trialBalanceRow = (obj) => (
    <div key={obj.id}>
      <ExamDraggable
        id={obj.id}
        type={obj.type}
        status={obj.status}
        placedCount={placementCount(droppableData, obj.id)}
        maxDrops={obj.maxDrops}
      >
        <span>{obj.name}</span>
        <span className="fw-semibold">
          ₹{Number(obj[obj.amountSelection] ?? obj.amount).toLocaleString("en-IN")}
        </span>
      </ExamDraggable>
      {obj.amount2 != null && (
        <select
          className="form-select form-select-sm mb-2"
          aria-label={`Amount to place for ${obj.name}`}
          value={obj.amountSelection}
          onChange={(event) => setAmountSelection(obj.id, event.target.value)}
        >
          <option value="amount">Amount 1: ₹{obj.amount.toLocaleString("en-IN")}</option>
          <option value="amount2">Amount 2: ₹{obj.amount2.toLocaleString("en-IN")}</option>
        </select>
      )}
    </div>
  );

  return (
    <div className="row g-4 align-items-start">
      {/* LEFT: Trial Balance accordion */}
      <div className="col-12 col-lg-3">
        <div className="card border-0 shadow-sm rounded-4 p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Trial Balance</h5>
            <span className="badge rounded-pill bg-light text-primary border px-3 py-2">
              {questions.length}
            </span>
          </div>
          <p className="small text-muted">
            Drag an item to each account it affects. Edit its placed amount for adjustments.
          </p>

          <Accordion defaultActiveKey={["debit", "credit", "adjustments"]} alwaysOpen>
            <Accordion.Item
              eventKey="debit"
              className="tb-accordion-item theme-debit"
            >
              <Accordion.Header>
                <span className="tb-accordion-title">Debit Balances</span>
                <span className="tb-accordion-amount">
                  ₹{debitTotal.toLocaleString("en-IN")}
                </span>
              </Accordion.Header>
              <Accordion.Body>
                {debitBalances.map(trialBalanceRow)}
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item
              eventKey="credit"
              className="tb-accordion-item theme-credit"
            >
              <Accordion.Header>
                <span className="tb-accordion-title">Credit Balances</span>
                <span className="tb-accordion-amount">
                  ₹{creditTotal.toLocaleString("en-IN")}
                </span>
              </Accordion.Header>
              <Accordion.Body>
                {creditBalances.map(trialBalanceRow)}
              </Accordion.Body>
            </Accordion.Item>
            {adjustments.length > 0 && (
              <Accordion.Item eventKey="adjustments" className="tb-accordion-item">
                <Accordion.Header>Additional Adjustments</Accordion.Header>
                <Accordion.Body>{adjustments.map(trialBalanceRow)}</Accordion.Body>
              </Accordion.Item>
            )}
          </Accordion>
          <div className="small border-top mt-3 pt-3" aria-live="polite">
            <div className="d-flex justify-content-between mb-2">
              <span>Gross {finalAccounts.grossResult < 0 ? "Loss" : "Profit"}</span>
              <strong>₹{Math.abs(finalAccounts.grossResult).toLocaleString("en-IN")}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Net {finalAccounts.netResult < 0 ? "Loss" : "Profit"}</span>
              <strong>₹{Math.abs(finalAccounts.netResult).toLocaleString("en-IN")}</strong>
            </div>
            {finalAccounts.hasBalanceSheet && (
              <div className={finalAccounts.balanced ? "text-success" : "text-danger"}>
                {finalAccounts.balanced ? "Balance Sheet balances" :
                  `Balance Sheet difference: ₹${finalAccounts.balanceDifference.toLocaleString("en-IN")}`}
              </div>
            )}
            <div className="text-muted mt-2">Calculated from your current placements.</div>
            {finalAccounts.warnings.map((warning) => <div key={warning} className="text-danger">{warning}</div>)}
          </div>
        </div>
      </div>

      {/* RIGHT: Accounts accordion */}
      <div className="col-12 col-lg-9">
        <Accordion defaultActiveKey={allTableNames} alwaysOpen>
          {data.map((obj, idx) => (
            <Accordion.Item
              eventKey={obj.name}
              className="acc-item mb-4"
              key={idx}
            >
              <Accordion.Header>
                <span className="acc-title">{obj.name}</span>
              </Accordion.Header>
              <Accordion.Body>
                <div className="row g-3">
                  <div className="col-12 col-md-6 exam-account-side">
                    <div className="text-primary fw-semibold small mb-2">
                      {obj.headers[0]}
                    </div>
                    <ExamDroppable
                      id={`${obj.name}-${obj.headers[0]}`}
                      isCreditSide={false}
                      matchRowCount={rowCount(obj)}
                      derivedRows={finalAccounts.accounts[obj.name][obj.headers[0]].rows}
                      calculatedTotal={finalAccounts.accounts[obj.name][obj.headers[0]].total}
                    />
                  </div>
                  <div className="col-12 col-md-6 exam-account-side">
                    <div className="text-success fw-semibold small mb-2">
                      {obj.headers[1]}
                    </div>
                    <ExamDroppable
                      id={`${obj.name}-${obj.headers[1]}`}
                      isCreditSide={true}
                      matchRowCount={rowCount(obj)}
                      derivedRows={finalAccounts.accounts[obj.name][obj.headers[1]].rows}
                      calculatedTotal={finalAccounts.accounts[obj.name][obj.headers[1]].total}
                    />
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default ExamQuestionTable;
