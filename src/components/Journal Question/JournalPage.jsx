import JournalQuestion from "./JournalQuestion";
import JournalSolution from "./JournalSolution";
import { Col, Row } from "react-bootstrap";
import { useState } from "react";
import Header from "../Question/Header";
import SummaryCards from "../Question/SummaryCards";
const JournalPage = () => {
  const [answeredData, setAnsweredData] = useState({});
  return (
    <div>
      <Row>
        <Header />
      </Row>
      <Row>
        <SummaryCards />
      </Row>
      <Row>
        <Col>
          <JournalQuestion
            answeredData={answeredData}
            setAnsweredData={setAnsweredData}
          />
        </Col>
        <Col>
          <JournalSolution answeredData={answeredData} />
        </Col>
      </Row>
    </div>
  );
};

export default JournalPage;
