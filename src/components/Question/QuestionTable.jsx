/* eslint-disable react/prop-types */
import { Accordion } from "react-bootstrap";
import Draggable from "./Draggable";
import Droppable from "./Droppable";
import useQuestionStore from "./questionStore";
import "./QuestionTable.css";
import Header from "./Header";
import SummaryCards from "./SummaryCards";
import { useState } from "react"; // Added react hook
import WrongAnswersModal from "./WrongAnswersModal";
import QuestionService from "../../services/QuestionService";

const QuestionTable = () => {
  const {
    questions,
    question,
    tradingDataDebit,
    tradingDataCredit,
    profitDataDebit,
    profitDataCredit,
    balanceDataAssets,
    balanceDataLiabilities,
  } = useQuestionStore();

  // Control popup visibility state and active errors array
  const [showModal, setShowModal] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  // --- 1. ERROR-ONLY VALIDATION ENGINE (SHOWS ONLY WRONG ANSWERS IN POPUP) ---
  const handleCheckValidation = () => {
    const activeErrors = [];
    const currentTime = new Date().toISOString();

    // Helper closure function to evaluate any container side for errors exclusively
    const evaluateContainerForErrors = (
      itemsArray,
      containerDescription,
      allowedItems,
    ) => {
      if (!itemsArray || !Array.isArray(itemsArray)) return;

      itemsArray.forEach((item) => {
        // If the item dropped here is NOT in the allowed items list, it is an error!
        if (!allowedItems.includes(item.name)) {
          activeErrors.push({
            created_at: currentTime,
            user_answer: item.name,
            action: `Misplaced in ${containerDescription}`,
            description: "Incorrect container routing",
            valid: false,
            result: "wrong",
            hint: `${item.name} is a direct manufacturing expense item. It belongs exclusively inside the Trading Account - Dr. (Debit) side.`,
          });
        }
      });
    };

    // Run evaluations across all active drop-zone containers
    // Opening Stock and Purchases belong exclusively inside Trading Debit (Dr.)
    evaluateContainerForErrors(
      tradingDataDebit,
      "Trading Account - Dr. (Debit)",
      ["Opening Stock", "Purchases"],
    );
    evaluateContainerForErrors(
      tradingDataCredit,
      "Trading Account - Cr. (Credit)",
      [],
    );
    evaluateContainerForErrors(
      profitDataDebit,
      "Profit & Loss Account - Dr. (Expenses)",
      [],
    );
    evaluateContainerForErrors(
      profitDataCredit,
      "Profit & Loss Account - Cr. (Incomes)",
      [],
    );
    evaluateContainerForErrors(balanceDataAssets, "Balance Sheet - Assets", []);
    evaluateContainerForErrors(
      balanceDataLiabilities,
      "Balance Sheet - Liabilities",
      [],
    );

    // ONLY open the modal if actual mistakes were collected
    if (activeErrors.length > 0) {
      setWrongAnswers(activeErrors); // Stores only the bad entries
      setShowModal(true); // Triggers the popup view panel
    } else {
      // Check if they placed them in the right spot or if workspace is completely empty
      const correctTradingCount = tradingDataDebit.filter(
        (item) => item.name === "Opening Stock" || item.name === "Purchases",
      ).length;

      if (correctTradingCount === 2) {
        alert(
          "🎉 Perfect! All items are placed in their precise accounting ledger targets.",
        );
      } else {
        alert(
          "⚠️ Your workspace has no wrong answers, but some items are still unplaced in the Trial Balance!",
        );
      }
    }
  };

  // --- 2. SUBMIT COMPLETED WORKSPACE SUMMARY ENGINE (SUBMIT BUTTON) ---
  const handleSubmitFinalWorkspace = async () => {
    const confirmSubmit = window.confirm(
      "Are you sure you want to final submit? This action will lock your answers for grading.",
    );
    if (!confirmSubmit) return;

    try {
      let correctPlacementsCount = 0;
      let incorrectPlacementsCount = 0;

      const checkContainer = (boxData, expectedSideType) => {
        if (!boxData || !Array.isArray(boxData)) return;
        boxData.forEach((item) => {
          if (item.type === expectedSideType) {
            correctPlacementsCount++;
          } else {
            incorrectPlacementsCount++;
          }
        });
      };

      checkContainer(tradingDataDebit, "debit");
      checkContainer(tradingDataCredit, "credit");
      checkContainer(profitDataDebit, "debit");
      checkContainer(profitDataCredit, "credit");
      checkContainer(balanceDataAssets, "debit");
      checkContainer(balanceDataLiabilities, "credit");

      const totalItemsAttempted =
        correctPlacementsCount + incorrectPlacementsCount;
      const finalScorePercentage =
        totalItemsAttempted > 0
          ? ((correctPlacementsCount / totalItemsAttempted) * 100).toFixed(1)
          : 0;

      const completionPayload = {
        questionId: question?.questionId || questions?.[0]?.id || 1,
        totalItemsAttempted,
        correctCount: correctPlacementsCount,
        wrongCount: incorrectPlacementsCount,
        finalGrade: `${finalScorePercentage}%`,
        submittedAt: new Date().toISOString(),
      };

      const targetId = question?.questionId || questions?.[0]?.id || 1;
      await QuestionService.submitFinalAnswers(targetId, completionPayload);

      alert(
        `🎉 Workspace submitted successfully!\nFinal Score: ${correctPlacementsCount} Correct, ${incorrectPlacementsCount} Wrong (${finalScorePercentage}%)`,
      );
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit workspace. Please check server status logs.");
    }
  };

  console.log("Questions from Store:", questions);

  const totalQ = questions.length;

  const debitBalances = questions.filter((q) => q.type === "debit");
  const creditBalances = questions.filter((q) => q.type === "credit");

  const debitTotal = debitBalances.reduce(
    (sum, q) =>
      sum +
      (q.status == "pending" || q.status == "wrong"
        ? Number(q.amount || 0)
        : 0),
    0,
  );
  const creditTotal = creditBalances.reduce(
    (sum, q) =>
      sum +
      (q.status == "pending" || q.status == "wrong"
        ? Number(q.amount || 0)
        : 0),
    0,
  );

  let pendingQ = questions.filter((q) => q.status === "solved");
  let solvedQ = pendingQ.length;

  return (
    <div className="row g-4 align-items-start">
      <div>
        <Header
          onCheck={handleCheckValidation}
          onSubmit={handleSubmitFinalWorkspace}
        />

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
      <WrongAnswersModal
        show={showModal}
        onClose={() => setShowModal(false)}
        incorrectEntries={wrongAnswers}
      />
    </div>
  );
};

export default QuestionTable;
