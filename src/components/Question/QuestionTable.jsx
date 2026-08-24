/* eslint-disable react/prop-types */
import { Accordion } from "react-bootstrap";
import Draggable from "./Draggable";
import Droppable from "./Droppable";
import useQuestionStore from "./questionStore";
import "./QuestionTable.css";
import Header from "./Header";
import SummaryCards from "./SummaryCards";
import { data } from "./SampleData";
import { useParams } from "react-router-dom";
import MistakesModal from "./MistakesModal";
import { useState } from "react";

// Ensure you import Bootstrap CSS somewhere in your app (like index.js or App.js)
// import 'bootstrap/dist/css/bootstrap.min.css';
const QuestionTable = () => {
  const [checkMistakes, setCheckMistakes] = useState(false);

  const { questions, score, resetFrontend } = useQuestionStore();

  const { questionId } = useParams();

  // Functions to handle opening and closing the modal

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

  const allTableNames = data.map((d) => d.name);
  // console.log("These are all table names I got ", allTableNames);

  let pendingQ = questions.filter((q) => q.status === "solved");
  let solvedQ = pendingQ.length;
  // onCheck={handleCheckValidation}
  if (checkMistakes) {
    console.log("I got rendered check mistakes");
    return (
      <MistakesModal
        questionId={questionId}
        setCheckMistakes={setCheckMistakes}
        checkMistakes={checkMistakes}
      />
    );
  }
  return (
    <div className="row g-4 align-items-start">
      <div>
        <Header
          handleReset={resetFrontend}
          setCheckMistakes={setCheckMistakes}
        />

        <SummaryCards
          debit={debitTotal}
          credit={creditTotal}
          total={totalQ}
          solved={solvedQ}
          totalScore={score}
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

      {/* Accordion event key arrives as following add all names */}

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
                  <div className="col-12 col-md-6">
                    <div className="text-primary fw-semibold small mb-2">
                      {obj.headers[0]}
                    </div>
                    <Droppable
                      id={`${obj.name}-${obj.headers[0]}`}
                      isCreditSide={false}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="text-success fw-semibold small mb-2">
                      {obj.headers[1]}
                    </div>
                    <Droppable
                      id={`${obj.name}-${obj.headers[1]}`}
                      isCreditSide={true}
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

export default QuestionTable;
