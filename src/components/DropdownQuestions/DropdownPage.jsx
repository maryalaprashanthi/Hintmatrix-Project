import { useState } from "react";
import { Row, Col } from "react-bootstrap";
import Header from "../Question/Header";
import SummaryCards from "../Question/SummaryCards";
import DropdownQuestion from "./DropdownQuestion";
import DropdownSolution from "./DropdownSolution";

const DropdownPage = () => {
  const [answeredData, setAnsweredData] = useState({});

  return (
    <div>
      <Row>
        <Header />
      </Row>
      <Row>
        <SummaryCards total={20} solved={10} />
      </Row>
      <Row>
        <Col>
          <DropdownQuestion
            answeredData={answeredData}
            setAnsweredData={setAnsweredData}
          />
        </Col>
        <Col>
          <DropdownSolution answeredData={answeredData} />
        </Col>
      </Row>
    </div>
  );
};

export default DropdownPage;
