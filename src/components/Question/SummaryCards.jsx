import { Card, Col, Row } from "react-bootstrap";
import { GoLaw } from "react-icons/go";
import { FaLongArrowAltUp } from "react-icons/fa";
import { FaLongArrowAltDown } from "react-icons/fa";
import StatCard from "./StatCard";
import { CiMemoPad } from "react-icons/ci";

function SummaryCards({ debit, credit, total, solved, totalScore }) {
  const summary = [
    {
      title: "Debit",
      value: `₹${debit}`,
      color: "primary",
      icon: <FaLongArrowAltDown />,
      subtext: "Debits in trial balance",
    },
    {
      title: "Credit",
      value: `₹${credit}`,
      color: "secondary",
      icon: <FaLongArrowAltUp />,
      subtext: "Credits in trial balance",
    },
    {
      title: "Total Score",
      value: `${totalScore}`,
      color: "teritary",
      icon: <GoLaw />,
      subtext: "Total marks earned",
    },
    {
      title: "Progress",
      value: `${solved}/${total}`,
      color: "quadrary",
      icon: <CiMemoPad />,
      subtext: "Particulars Solved",
    },
  ];

  return (
    <div className="mt-2 mb-4">
      <Row className="g-3">
        {summary.map((item) => (
          <Col xs={12} sm={6} lg={3} key={item.title}>
            <StatCard
              icon={item.icon}
              title={item.title}
              amount={item.value}
              subtitle={item.subtext}
              color={item.color}
              solved={solved}
              total={total}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default SummaryCards;
