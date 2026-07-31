/* eslint-disable react/prop-types */
import Draggable from "./Draggable";
import Droppable from "./Droppable";
import useQuestionStore from "./questionStore";

const QuestionTable = () => {
  const {
    questions,
    tradingDataDebit,
    tradingDataCredit,
    profitDataDebit,
    profitDataCredit,
    balanceDataLiabilities,
    balanceDataAssets,
  } = useQuestionStore();

  // Assumes each question has a `type` of "debit" | "credit".
  // Adjust the filter keys if your store uses different values.
  const debitBalances = questions.filter((q) => q.type === "debit");
  const creditBalances = questions.filter((q) => q.type === "credit");

  const debitTotal = debitBalances.reduce(
    (sum, q) => sum + Number(q.amount || 0),
    0,
  );
  const creditTotal = creditBalances.reduce(
    (sum, q) => sum + Number(q.amount || 0),
    0,
  );

  return (
    <div className="row g-4 align-items-start px-3 px-lg-4 py-4">
      {/* LEFT: Trial Balance draggable list */}
      <div className="col-12 col-lg-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Trial Balance</h5>
            <span className="badge rounded-pill bg-light text-primary border px-3 py-2">
              {questions.length}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted fw-semibold small text-uppercase">
              Debit Balances
            </span>
            <span className="fw-bold small">
              ₹{debitTotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="d-flex flex-column gap-2 mb-4">
            {debitBalances.map((obj) => (
              <Draggable id={obj.id} key={obj.id} type={obj.type}>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>{obj.name}</span>
                  <span className="fw-semibold">
                    ₹{Number(obj.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </Draggable>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted fw-semibold small text-uppercase">
              Credit Balances
            </span>
            <span className="fw-bold small">
              ₹{creditTotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="d-flex flex-column gap-2">
            {creditBalances.map((obj) => (
              <Draggable id={obj.id} key={obj.id} type={obj.type}>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>{obj.name}</span>
                  <span className="fw-semibold">
                    ₹{Number(obj.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </Draggable>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Trading Account / P&L / Balance Sheet drop zones */}
      <div className="col-12 col-lg-9">
        {/* Trading Account */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
          <h5 className="fw-bold mb-3">Trading Account</h5>
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
        </div>

        {/* Profit & Loss Account */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
          <h5 className="fw-bold mb-3">Profit &amp; Loss Account</h5>
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
        </div>

        {/* Balance Sheet */}
        <div className="card border-0 shadow-sm rounded-4 p-3">
          <h5 className="fw-bold mb-3">Balance Sheet</h5>
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
              <div className="text-success fw-semibold small mb-2">Assets</div>
              <Droppable id="balance-assets" data={balanceDataAssets} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionTable;
