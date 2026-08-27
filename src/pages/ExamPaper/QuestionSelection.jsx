import React, { useMemo, useState } from "react";
import {
  FiSearch,
  FiBookOpen,
  FiTag,
  FiList,
  FiCheckCircle,
  FiInfo,
  FiArrowRight,
} from "react-icons/fi";
import "./QuestionSelection.css";

const QuestionSelection = ({ onNext, onBack }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [chapter, setChapter] = useState("All Chapters");
  const [type, setType] = useState("All Types");
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const questions = [
    {
      id: 1,
      question: "Rectification Entries: State Board Model",
      chapter: "Rectification of Errors For JrInter",
      type: "Theory",
      marks: 5,
    },
    {
      id: 2,
      question: "Transactions involves only Real Accounts",
      chapter: "Journal Basic Practice",
      type: "Theory",
      marks: 5,
    },
    {
      id: 3,
      question: "Prepare Trading Account from the following information",
      chapter: "Final Accounts Without Adjustments",
      type: "Practical",
      marks: 10,
    },
    {
      id: 4,
      question: "Prepare Trading Account two from the following information",
      chapter: "Final Accounts Without Adjustments",
      type: "Practical",
      marks: 10,
    },
    {
      id: 5,
      question: "Transactions involves only Real Accounts two",
      chapter: "Journal Basic Practice",
      type: "Theory",
      marks: 5,
    },
    {
      id: 6,
      question: "Prepare Profit and Loss Account from the given details",
      chapter: "Final Accounts Without Adjustments",
      type: "Practical",
      marks: 10,
    },
    {
      id: 7,
      question: "Pass journal entries for the following transactions",
      chapter: "Journal Basic Practice",
      type: "Practical",
      marks: 5,
    },
    {
      id: 8,
      question: "Correct the following accounting errors",
      chapter: "Rectification of Errors For JrInter",
      type: "Practical",
      marks: 5,
    },
  ];

  const chapters = [
    "All Chapters",
    ...new Set(questions.map((q) => q.chapter)),
  ];

  const types = ["All Types", "Theory", "Practical"];

  const filteredQuestions = useMemo(() => {
    const searchText = search.toLowerCase();

    return questions.filter((q) => {
      const matchesSearch =
        q.question.toLowerCase().includes(searchText) ||
        q.chapter.toLowerCase().includes(searchText);

      const matchesChapter =
        chapter === "All Chapters" || q.chapter === chapter;

      const matchesType = type === "All Types" || q.type === type;

      return matchesSearch && matchesChapter && matchesType;
    });
  }, [search, chapter, type]);

  const visibleQuestions =
    activeTab === "all"
      ? filteredQuestions
      : filteredQuestions.filter((q) => selectedQuestions.includes(q.id));

  const toggleQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredQuestions.map((q) => q.id);

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedQuestions.includes(id));

    if (allSelected) {
      setSelectedQuestions((prev) =>
        prev.filter((id) => !visibleIds.includes(id)),
      );
    } else {
      setSelectedQuestions((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const isAllSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((q) => selectedQuestions.includes(q.id));

  const handleNext = () => {
    const selected = questions.filter((q) => selectedQuestions.includes(q.id));

    if (onNext) {
      onNext(selected);
    }
  };

  return (
    <div className="question-selection-page">
      {/* HEADER */}
      <div className="question-selection-header">
        <div>
          <h2>Select Questions</h2>

          <p>Choose the questions you want to add to this exam</p>
        </div>

        <div className="question-selection-step">
          <span className="completed">✓ Create Exam Paper</span>

          <span className="arrow">→</span>

          <span className="active">② Select Questions</span>
        </div>
      </div>

      {/* CARD */}
      <div className="question-selection-card">
        {/* FILTERS */}
        <div className="qs-filter-row">
          <div className="qs-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search questions by name or chapter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="qs-select-wrapper">
            <FiBookOpen />

            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
            >
              {chapters.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="qs-select-wrapper">
            <FiTag />

            <select value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABS */}
        <div className="qs-tabs-row">
          <div className="qs-tabs">
            <button
              type="button"
              className={`qs-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <FiList />
              All Questions
              <span className="qs-count blue">{questions.length}</span>
            </button>

            <button
              type="button"
              className={`qs-tab ${activeTab === "selected" ? "active" : ""}`}
              onClick={() => setActiveTab("selected")}
            >
              <FiCheckCircle />
              Selected Questions
              <span
                className={`qs-count ${
                  selectedQuestions.length ? "blue" : "gray"
                }`}
              >
                {selectedQuestions.length}
              </span>
            </button>
          </div>

          <label className="qs-select-all">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
            />
            <span className="custom-checkbox"></span>
            Select All
          </label>
        </div>

        {/* TABLE */}
        <div className="qs-table-wrapper">
          <table className="qs-table">
            <thead>
              <tr>
                <th className="check-column">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />

                  <span className="custom-checkbox"></span>
                </th>

                <th>Question</th>
                <th>Chapter</th>
                <th>Type</th>
                <th>Marks</th>
              </tr>
            </thead>

            <tbody>
              {visibleQuestions.length > 0 ? (
                visibleQuestions.map((q) => {
                  const selected = selectedQuestions.includes(q.id);

                  return (
                    <tr
                      key={q.id}
                      className={selected ? "selected-row" : ""}
                      onClick={() => toggleQuestion(q.id)}
                    >
                      <td className="check-column">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleQuestion(q.id)}
                          onClick={(e) => e.stopPropagation()}
                        />

                        <span className="custom-checkbox"></span>
                      </td>

                      <td className="question-name">{q.question}</td>

                      <td>
                        <span className="chapter-badge">
                          <FiBookOpen />
                          {q.chapter}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`type-badge ${
                            q.type === "Practical" ? "practical" : "theory"
                          }`}
                        >
                          {q.type}
                        </span>
                      </td>

                      <td className="marks">{q.marks}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="qs-empty">
                    No questions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="qs-footer">
          <div className="qs-info-box">
            <div className="qs-info-icon">
              <FiInfo />
            </div>

            <div>
              <strong>{selectedQuestions.length} Questions Selected</strong>

              <span>Select questions to add to your exam</span>
            </div>
          </div>

          <div className="qs-footer-actions">
            <button type="button" className="qs-back-btn" onClick={onBack}>
              Back
            </button>

            <button
              type="button"
              className="qs-add-btn"
              onClick={handleNext}
              disabled={selectedQuestions.length === 0}
            >
              Add To Exam ({selectedQuestions.length})
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelection;
