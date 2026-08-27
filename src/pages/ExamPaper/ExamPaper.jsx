import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { FiHelpCircle, FiSave } from "react-icons/fi";
import Select from "react-select";
import "./ExamPaper.css";
import QuestionSelection from "./QuestionSelection";

const ExamPaper = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const [passPercentage, setPassPercentage] = useState(35);
  const [examName, setExamName] = useState("");
  const [college, setCollege] = useState(null);
  const [branch, setBranch] = useState(null);
  const [course, setCourse] = useState(null);
  const [section, setSection] = useState(null);
  const [chapters, setChapters] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const collegeOptions = [
    { value: "college-1", label: "ABC College" },
    { value: "college-2", label: "XYZ College" },
  ];

  const branchOptions = [
    { value: "branch-1", label: "Commerce" },
    { value: "branch-2", label: "Science" },
    { value: "branch-3", label: "Arts" },
  ];

  const courseOptions = [
    { value: "bcom", label: "B.Com" },
    { value: "ca-foundation", label: "CA Foundation" },
    { value: "cbse", label: "CBSE Class 11" },
    { value: "junior-accountancy", label: "Junior Accountancy" },
  ];

  const sectionOptions = [
    { value: "section-a", label: "Section A" },
    { value: "section-b", label: "Section B" },
    { value: "section-c", label: "Section C" },
  ];

  const chapterOptions = [
    { value: "trial-balance", label: "Trial Balance" },
    { value: "final-accounts", label: "Prepare Final Accounts" },
    { value: "depreciation", label: "Depreciation" },
    { value: "partnership", label: "Partnership Accounts" },
    { value: "bills", label: "Bills of Exchange" },
  ];

  const handleNext = () => {
    if (!examName.trim()) {
      alert("Please enter Exam Name.");
      return;
    }

    if (!college) {
      alert("Please select College.");
      return;
    }

    if (!course) {
      alert("Please select Course.");
      return;
    }

    if (chapters.length === 0) {
      alert("Please select at least one Chapter.");
      return;
    }

    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSave = () => {
    const payload = {
      examName,
      college: college?.value || null,
      branch: branch?.value || null,
      course: course?.value || null,
      section: section?.value || null,
      chapters: chapters.map((item) => item.value),
      startDate,
      startTime,
      endDate,
      endTime,
      passPercentage,
    };

    console.log("Exam Paper:", payload);
    alert("Exam Paper saved successfully.");
  };

  const handleQuestionsAdded = (questions) => {
    console.log("Selected Questions:", questions);
    alert(`${questions.length} questions added to the exam.`);
  };

  if (currentStep === 2) {
    return (
      <QuestionSelection onNext={handleQuestionsAdded} onBack={handleBack} />
    );
  }

  return (
    <div className="exam-paper-page">
      <Card className="exam-paper-main-card">
        <Card.Header className="exam-paper-card-header">
          <h2>Exam Paper</h2>

          <button
            className="exam-paper-help-btn"
            type="button"
            aria-label="Need help"
          >
            <FiHelpCircle />
          </button>
        </Card.Header>

        <Card.Body className="exam-paper-card-body">
          <div className="exam-paper-stepper">
            <div className="exam-paper-step exam-paper-step-active">
              <div className="exam-paper-step-circle">1</div>
              <div className="exam-paper-step-label">Create Exam Paper</div>
            </div>

            <div className="exam-paper-step-line">
              <div className="exam-paper-step-line-active"></div>
            </div>

            <div className="exam-paper-step">
              <div className="exam-paper-step-circle">2</div>
              <div className="exam-paper-step-label">Select Questions</div>
            </div>
          </div>

          <Card className="exam-paper-form-card">
            <Card.Body>
              <h3 className="exam-paper-form-title">
                Enter the details to create a new exam paper
              </h3>

              <div className="exam-paper-form-grid">
                <div className="exam-paper-form-column">
                  <Form.Group className="exam-paper-form-group">
                    <Form.Label>
                      Exam Name <span className="exam-paper-required">*</span>
                    </Form.Label>

                    <Form.Control
                      type="text"
                      placeholder="Enter exam name"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      className="exam-paper-input"
                    />
                  </Form.Group>

                  <Form.Group className="exam-paper-form-group">
                    <Form.Label>
                      College <span className="exam-paper-required">*</span>
                    </Form.Label>

                    <Select
                      options={collegeOptions}
                      value={college}
                      onChange={setCollege}
                      placeholder="Search and select college"
                      isSearchable
                      isClearable
                      classNamePrefix="exam-paper-select"
                    />
                  </Form.Group>

                  <Form.Group className="exam-paper-form-group">
                    <Form.Label>Branch</Form.Label>

                    <Select
                      options={branchOptions}
                      value={branch}
                      onChange={setBranch}
                      placeholder="Search and select branch"
                      isSearchable
                      isClearable
                      classNamePrefix="exam-paper-select"
                    />
                  </Form.Group>

                  <Form.Group className="exam-paper-form-group">
                    <Form.Label>
                      Course <span className="exam-paper-required">*</span>
                    </Form.Label>

                    <Select
                      options={courseOptions}
                      value={course}
                      onChange={setCourse}
                      placeholder="Search and select course"
                      isSearchable
                      isClearable
                      classNamePrefix="exam-paper-select"
                    />
                  </Form.Group>
                </div>

                <div className="exam-paper-form-column">
                  <Form.Group className="exam-paper-form-group">
                    <Form.Label>Section</Form.Label>

                    <Select
                      options={sectionOptions}
                      value={section}
                      onChange={setSection}
                      placeholder="Search and select section"
                      isSearchable
                      isClearable
                      classNamePrefix="exam-paper-select"
                    />
                  </Form.Group>

                  <Form.Group className="exam-paper-form-group">
                    <Form.Label>
                      Select Chapters{" "}
                      <span className="exam-paper-required">*</span>
                    </Form.Label>

                    <Select
                      options={chapterOptions}
                      value={chapters}
                      onChange={(selected) => setChapters(selected || [])}
                      placeholder="Search & select chapters..."
                      isSearchable
                      isMulti
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      classNamePrefix="exam-paper-select"
                    />
                  </Form.Group>

                  <div className="exam-paper-date-time-row">
                    <Form.Group className="exam-paper-form-group">
                      <Form.Label>Start Date</Form.Label>

                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="exam-paper-input"
                      />
                    </Form.Group>

                    <Form.Group className="exam-paper-form-group">
                      <Form.Label>Start Time</Form.Label>

                      <Form.Control
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="exam-paper-input"
                      />
                    </Form.Group>
                  </div>

                  <div className="exam-paper-date-time-row">
                    <Form.Group className="exam-paper-form-group">
                      <Form.Label>End Date</Form.Label>

                      <Form.Control
                        type="date"
                        min={startDate || undefined}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="exam-paper-input"
                      />
                    </Form.Group>

                    <Form.Group className="exam-paper-form-group">
                      <Form.Label>End Time</Form.Label>

                      <Form.Control
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="exam-paper-input"
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              <Form.Group className="exam-paper-form-group exam-paper-pass-group">
                <Form.Label>Select Pass Percentage</Form.Label>

                <div className="exam-paper-slider-container">
                  <div
                    className="exam-paper-percentage-bubble"
                    style={{ left: `${passPercentage}%` }}
                  >
                    {passPercentage}%
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={passPercentage}
                    onChange={(e) => setPassPercentage(Number(e.target.value))}
                    className="exam-paper-slider"
                    style={{
                      "--exam-paper-slider-value": `${passPercentage}%`,
                    }}
                  />

                  <div className="exam-paper-slider-labels">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </Form.Group>

              <div className="exam-paper-actions">
                <Button
                  type="button"
                  className="exam-paper-next-btn"
                  onClick={handleNext}
                >
                  Next
                </Button>

                <Button
                  type="button"
                  className="exam-paper-save-btn"
                  onClick={handleSave}
                >
                  <FiSave />
                  <span>Save and finish</span>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ExamPaper;
