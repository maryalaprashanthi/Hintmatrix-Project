import { Card, Col, Row } from "react-bootstrap";
import { GoLaw } from "react-icons/go";
import { FaLongArrowAltUp } from "react-icons/fa";
import { FaLongArrowAltDown } from "react-icons/fa";
import StatCard from "./StatCard";
import { CiMemoPad } from "react-icons/ci";

function SummaryCards({ debit, credit, total, solved }) {
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
      title: "Difference",
      value: "₹0",
      color: "teritary",
      icon: <GoLaw />,
      subtext: "",
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
    <div className="my-4">
      <Row>
        {summary.map((item) => (
          <Col md={3} key={item.title}>
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
