import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiBookOpen,
  FiTag,
  FiList,
  FiCheckCircle,
  FiInfo,
  FiArrowRight,
} from "react-icons/fi";

import QuestionService from "../../services/QuestionService";

import ChapterService from "../../services/ChapterService";

import "./QuestionSelection.css";

const QuestionSelection = ({ courseId, chapterIds = [], onNext, onBack }) => {
  // STATE

  const [activeTab, setActiveTab] = useState("all");

  const [search, setSearch] = useState("");

  const [selectedChapter, setSelectedChapter] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");

  const [selectedType, setSelectedType] = useState("");

  const [questions, setQuestions] = useState([]);

  const [chapters, setChapters] = useState([]);

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [loadingChapters, setLoadingChapters] = useState(false);

  // LOAD QUESTIONS

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);

      const response = await QuestionService.getAll();

      const data = Array.isArray(response.data) ? response.data : [];

      setQuestions(data);
    } catch (error) {
      console.error("Failed to load questions:", error);

      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // LOAD CHAPTERS

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      setLoadingChapters(true);

      const response = await ChapterService.getAll();

      const data = Array.isArray(response.data) ? response.data : [];

      setChapters(data);
    } catch (error) {
      console.error("Failed to load chapters:", error);

      setChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  };

  // CHAPTER OPTIONS

  // Only chapters selected in Step 1 are shown.

  const availableChapters = useMemo(() => {
    // If no chapter IDs were supplied, use all chapters.
    if (!chapterIds || chapterIds.length === 0) {
      return chapters;
    }

    return chapters.filter((chapter) =>
      chapterIds.some((id) => String(id) === String(chapter.chapterId)),
    );
  }, [chapters, chapterIds]);

  // QUESTION TYPES

  // questionTypeId,questionType

  const questionTypes = useMemo(() => {
    const typeMap = new Map();

    questions.forEach((question) => {
      if (
        question.questionTypeId !== null &&
        question.questionTypeId !== undefined &&
        question.questionType
      ) {
        typeMap.set(String(question.questionTypeId), {
          id: question.questionTypeId,
          name: question.questionType,
        });
      }
    });

    return Array.from(typeMap.values());
  }, [questions]);

  // FILTER QUESTIONS

  const filteredQuestions = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return questions.filter((question) => {
      // Active question

      if (question.activeRow === false) {
        return false;
      }

      // COURSE FILTER

      if (courseId !== undefined && courseId !== null && courseId !== "") {
        if (String(question.courseId) !== String(courseId)) {
          return false;
        }
      }

      // CHAPTER FILTER

      if (chapterIds && chapterIds.length > 0) {
        const belongsToSelectedChapter = chapterIds.some(
          (id) => String(id) === String(question.chapterId),
        );

        if (!belongsToSelectedChapter) {
          return false;
        }
      }

      // SEARCH

      if (searchText) {
        const questionText = question.questionText?.toLowerCase() || "";

        const chapterName = question.chapterName?.toLowerCase() || "";

        const typeName = question.questionType?.toLowerCase() || "";

        const matchesSearch =
          questionText.includes(searchText) ||
          chapterName.includes(searchText) ||
          typeName.includes(searchText);

        if (!matchesSearch) {
          return false;
        }
      }

      // CHAPTER DROPDOWN FILTER

      if (selectedChapter) {
        if (String(question.chapterId) !== String(selectedChapter)) {
          return false;
        }
      }

      // QUESTION TYPE FILTER

      if (selectedType) {
        if (String(question.questionTypeId) !== String(selectedType)) {
          return false;
        }
      }

      return true;
    });
  }, [questions, courseId, chapterIds, search, selectedChapter, selectedType]);

  // VISIBLE QUESTIONS

  // "All Questions" -> filtered questions

  // "Selected Questions" -> only selected questions

  const visibleQuestions =
    activeTab === "all"
      ? filteredQuestions
      : filteredQuestions.filter((question) =>
          selectedQuestions.includes(question.questionId),
        );

  // SELECT / UNSELECT QUESTION

  const toggleQuestion = (questionId) => {
    setSelectedQuestions((previous) => {
      if (previous.includes(questionId)) {
        return previous.filter((id) => id !== questionId);
      }

      return [...previous, questionId];
    });
  };

  // SELECT ALL

  // Selects all currently visible filtered questions.

  const toggleSelectAll = () => {
    const visibleIds = filteredQuestions.map((question) => question.questionId);

    if (visibleIds.length === 0) {
      return;
    }

    const allSelected = visibleIds.every((id) =>
      selectedQuestions.includes(id),
    );

    if (allSelected) {
      // Remove visible questions from selection
      setSelectedQuestions((previous) =>
        previous.filter((id) => !visibleIds.includes(id)),
      );
    } else {
      // Add visible questions
      setSelectedQuestions((previous) => [
        ...new Set([...previous, ...visibleIds]),
      ]);
    }
  };

  // CHECK SELECT ALL STATUS

  const isAllSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((question) =>
      selectedQuestions.includes(question.questionId),
    );

  // NEXT / ADD TO EXAM

  const handleNext = () => {
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question.");
      return;
    }

    const selected = questions.filter((question) =>
      selectedQuestions.includes(question.questionId),
    );

    if (onNext) {
      onNext(selected);
    }
  };

  // CLEAR FILTERS

  const clearFilters = () => {
    setSearch("");
    setSelectedChapter("");

    setSelectedType("");
  };

  // RENDER

  return (
    <div className="question-selection-page">
      {/*  HEADER */}

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

      {/*     CARD */}

      <div className="question-selection-card">
        {/*  FILTERS  */}

        <div className="qs-filter-row">
          {/* SEARCH */}

          <div className="qs-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search questions by name or chapter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* CHAPTER */}

          <div className="qs-select-wrapper">
            <FiBookOpen />

            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              disabled={loadingChapters}
            >
              <option value="">
                {loadingChapters ? "Loading Chapters..." : "All Chapters"}
              </option>

              {availableChapters.map((chapter) => (
                <option key={chapter.chapterId} value={chapter.chapterId}>
                  {chapter.name || chapter.chapterName}
                </option>
              ))}
            </select>
          </div>

          {/* QUESTION TYPE */}

          <div className="qs-select-wrapper">
            <FiTag />

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>

              {questionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/*     CLEAR FILTER  */}

        {(search || selectedChapter || selectedType) && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <button
              type="button"
              onClick={clearFilters}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* 
            TABS
        */}

        <div className="qs-tabs-row">
          <div className="qs-tabs">
            {/* ALL QUESTIONS */}

            <button
              type="button"
              className={`qs-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <FiList />
              All Questions
              <span className="qs-count blue">{filteredQuestions.length}</span>
            </button>

            {/* SELECTED QUESTIONS */}

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

          {/* SELECT ALL */}

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

        {/* 
            TABLE
       */}

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
              </tr>
            </thead>

            <tbody>
              {/* LOADING */}

              {loadingQuestions ? (
                <tr>
                  <td colSpan="5" className="qs-empty">
                    Loading questions...
                  </td>
                </tr>
              ) : visibleQuestions.length > 0 ? (
                visibleQuestions.map((question) => {
                  const selected = selectedQuestions.includes(
                    question.questionId,
                  );

                  return (
                    <tr
                      key={question.questionId}
                      className={selected ? "selected-row" : ""}
                      onClick={() => toggleQuestion(question.questionId)}
                    >
                      {/* CHECKBOX */}

                      <td className="check-column">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleQuestion(question.questionId)}
                          onClick={(event) => event.stopPropagation()}
                        />

                        <span className="custom-checkbox"></span>
                      </td>

                      {/* QUESTION */}

                      <td className="question-name">
                        {question.questionText || "No question text"}
                      </td>

                      {/* CHAPTER */}

                      <td>
                        <span className="chapter-badge">
                          <FiBookOpen />

                          {question.chapterName || "N/A"}
                        </span>
                      </td>

                      {/* TYPE */}

                      <td>
                        <span
                          className={`type-badge ${
                            String(question.questionType)
                              .toLowerCase()
                              .includes("practical")
                              ? "practical"
                              : "theory"
                          }`}
                        >
                          {question.questionType || "N/A"}
                        </span>
                      </td>
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

        {/* 
            FOOTER
        */}

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
            {/* BACK */}

            <button type="button" className="qs-back-btn" onClick={onBack}>
              Back
            </button>

            {/* NEXT */}

            <button
              type="button"
              className="qs-add-btn"
              onClick={handleNext}
              disabled={selectedQuestions.length === 0}
            >
              Add To Exam ({selectedQuestions.length}
              )
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelection;
