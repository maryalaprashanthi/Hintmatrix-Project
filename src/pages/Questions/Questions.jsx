import "./Questions.css";

import { useNavigate } from "react-router-dom";

import {
  MdMenuBook,
  MdCategory,
  MdHelpOutline,
} from "react-icons/md";

export default function Questions() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Chapters",
      icon: <MdMenuBook />,
      description: "Manage all chapters",
      path: "/questions/chapters",
    },
    {
      title: "Question Categories",
      icon: <MdCategory />,
      description: "Manage question categories",
      path: "/questions/question-categories",
    },
    {
      title: "Questions",
      icon: <MdHelpOutline />,
      description: "Manage questions",
      path: "/questions/list",
    },
  ];

  return (
    <div className="questions-page">
      <div className="page-header">
        <h2>Questions Management</h2>
        <p>Select a module to continue.</p>
      </div>

      <div className="questions-grid">
        {cards.map((card) => (
          <div
            key={card.title}
            className="question-card"
            onClick={() => navigate(card.path)}
          >
            <div className="question-icon">
              {card.icon}
            </div>

            <h3>{card.title}</h3>

            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}