import { useState } from "react";
import CreateMcq from "./CreateMcq";
import McqPractice from "./McqPractice";
import "./McqQuestionsPage.css";

function McqQuestionsPage() {
  const [page, setPage] = useState("create");

  return (
    <div className="mcq-module">
      <div className="mcq-module-tabs">
        <button className={page === "create" ? "active" : ""} onClick={() => setPage("create")}>Create MCQ</button>
        <button className={page === "practice" ? "active" : ""} onClick={() => setPage("practice")}>Practice MCQ</button>
      </div>

      {page === "create" && <CreateMcq />}

      {page === "practice" && <McqPractice />}
    </div>
  );
}

export default McqQuestionsPage;
