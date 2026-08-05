import JournalQuestion from "./JournalQuestion";
import JournalSolution from "./JournalSolution";
import { Col, Row } from "react-bootstrap";
import { useState } from "react";

const JournalPage = () => {
  const [answeredData, setAnsweredData] = useState({});
  return (
    <div>
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
