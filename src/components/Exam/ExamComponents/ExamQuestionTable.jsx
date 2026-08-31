/* eslint-disable react/prop-types */
import { Accordion } from "react-bootstrap";
import ExamDraggable from "./ExamDraggable";
import ExamDroppable from "./ExamDroppable";
import useExamQuestionStore from "./examQuestionStore";
import "../../Question/QuestionTable.css";
import { data } from "./SampleData";

const ExamQuestionTable = () => {
  const { questions } = useExamQuestionStore();

  const debitBalances = questions.filter((q) => q.type === "debit");
  const creditBalances = questions.filter((q) => q.type === "credit");

  const debitTotal = debitBalances.reduce(
    (sum, q) => sum + (q.status === "pending" ? Number(q.amount || 0) : 0),
    0,
  );
  const creditTotal = creditBalances.reduce(
    (sum, q) => sum + (q.status === "pending" ? Number(q.amount || 0) : 0),
    0,
  );

  const allTableNames = data.map((d) => d.name);

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
                  <ExamDraggable
                    id={obj.id}
                    key={obj.id}
                    type={obj.type}
                    status={obj.status}
                  >
                    <span>{obj.name}</span>
                    <span className="fw-semibold">
                      ₹{Number(obj.amount).toLocaleString("en-IN")}
                    </span>
                  </ExamDraggable>
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
                  <ExamDraggable
                    id={obj.id}
                    key={obj.id}
                    type={obj.type}
                    status={obj.status}
                  >
                    <span>{obj.name}</span>
                    <span className="fw-semibold">
                      ₹{Number(obj.amount).toLocaleString("en-IN")}
                    </span>
                  </ExamDraggable>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
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
                  <div className="col-12 col-md-6">
                    <div className="text-primary fw-semibold small mb-2">
                      {obj.headers[0]}
                    </div>
                    <ExamDroppable
                      id={`${obj.name}-${obj.headers[0]}`}
                      isCreditSide={false}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="text-success fw-semibold small mb-2">
                      {obj.headers[1]}
                    </div>
                    <ExamDroppable
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

export default ExamQuestionTable;
