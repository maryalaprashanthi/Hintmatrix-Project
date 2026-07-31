/* eslint-disable react/prop-types */
import { Accordion } from "react-bootstrap";
import Draggable from "./Draggable";
import Droppable from "./Droppable";
import useQuestionStore from "./questionStore";
import "./QuestionTable.css";
import Header from "./Header";
import SummaryCards from "./SummaryCards";

const QuestionTable = () => {
  const {
    questions,
    tradingDataDebit,
    tradingDataCredit,
    profitDataDebit,
    profitDataCredit,
    balanceDataAssets,
    balanceDataLiabilities,
  } = useQuestionStore();

  const totalQ = questions.length;

  const debitBalances = questions.filter((q) => q.type === "debit");
  const creditBalances = questions.filter((q) => q.type === "credit");

  const debitTotal = debitBalances.reduce(
    (sum, q) => sum + (q.status == "pending" ? Number(q.amount || 0) : 0),
    0,
  );
  const creditTotal = creditBalances.reduce(
    (sum, q) => sum + (q.status == "pending" ? Number(q.amount || 0) : 0),
    0,
  );

  let pendingQ = questions.filter((q) => q.status === "solved");
  let solvedQ = pendingQ.length;

  return (
    <div className="row g-4 align-items-start px-3 px-lg-4 py-4">
      <div>
        <Header />
        <SummaryCards
          debit={debitTotal}
          credit={creditTotal}
          total={totalQ}
          solved={solvedQ}
        />
      </div>
      {/* LEFT: Trial Balance accordion */}
      <div className="col-12 col-lg-3">
        <div className="card border-0 shadow-sm rounded-4 p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Trial Balance</h5>
            <span className="badge rounded-pill bg-light text-primary border px-3 py-2">
              {questions.length}
            </span>
          </div>

          <Accordion defaultActiveKey={["debit", "credit"]} alwaysOpen>
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
                {debitBalances.map((obj) => (
                  <Draggable
                    id={obj.id}
                    key={obj.id}
                    type={obj.type}
                    status={obj.status}
                  >
                    <span>{obj.name}</span>
                    <span className="fw-semibold">
                      ₹{Number(obj.amount).toLocaleString("en-IN")}
                    </span>
                  </Draggable>
                ))}
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
                {creditBalances.map((obj) => (
                  <Draggable
                    id={obj.id}
                    key={obj.id}
                    type={obj.type}
                    status={obj.status}
                  >
                    <span>{obj.name}</span>
                    <span className="fw-semibold">
                      ₹{Number(obj.amount).toLocaleString("en-IN")}
                    </span>
                  </Draggable>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>

      {/* RIGHT: Accounts accordion */}
      <div className="col-12 col-lg-9">
        <Accordion defaultActiveKey={["trading", "pnl", "balance"]} alwaysOpen>
          <Accordion.Item eventKey="trading" className="acc-item mb-4">
            <Accordion.Header>
              <span className="acc-icon icon-badge-purple">📘</span>
              <span className="acc-title">Trading Account</span>
            </Accordion.Header>
            <Accordion.Body>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="text-primary fw-semibold small mb-2">
                    Dr. (Debit)
                  </div>
                  <Droppable id="trading-dr" data={tradingDataDebit} />
                </div>
                <div className="col-12 col-md-6">
                  <div className="text-success fw-semibold small mb-2">
                    Cr. (Credit)
                  </div>
                  <Droppable id="trading-cr" data={tradingDataCredit} />
                </div>
              </div>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="pnl" className="acc-item mb-4">
            <Accordion.Header>
              <span className="acc-icon icon-badge-pink">💰</span>
              <span className="acc-title">Profit &amp; Loss Account</span>
            </Accordion.Header>
            <Accordion.Body>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="text-primary fw-semibold small mb-2">
                    Dr. (Expenses &amp; Losses)
                  </div>
                  <Droppable id="pnl-dr" data={profitDataDebit} />
                </div>
                <div className="col-12 col-md-6">
                  <div className="text-success fw-semibold small mb-2">
                    Cr. (Incomes &amp; Gains)
                  </div>
                  <Droppable id="pnl-cr" data={profitDataCredit} />
                </div>
              </div>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="balance" className="acc-item">
            <Accordion.Header>
              <span className="acc-icon icon-badge-indigo">🏦</span>
              <span className="acc-title">Balance Sheet</span>
            </Accordion.Header>
            <Accordion.Body>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="text-primary fw-semibold small mb-2">
                    Liabilities
                  </div>
                  <Droppable
                    id="balance-liabilities"
                    data={balanceDataLiabilities}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <div className="text-success fw-semibold small mb-2">
                    Assets
                  </div>
                  <Droppable id="balance-assets" data={balanceDataAssets} />
                </div>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
};

export default QuestionTable;
