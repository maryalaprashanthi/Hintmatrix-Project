import React, { useState } from "react";
import { Card, Form, Button, ProgressBar } from "react-bootstrap";
import { FiHelpCircle, FiChevronDown, FiSave } from "react-icons/fi";
import "./ExamPaper.css";

const ExamPaper = () => {
  const [passPercentage, setPassPercentage] = useState(35);

  return (
    <div className="exam-paper-page">
      {/* Main Exam Paper Card */}
      <Card className="exam-paper-main-card">
        {/* Header */}
        <Card.Header className="exam-paper-card-header">
          <h2>Exam Paper</h2>

          <button className="exam-paper-help-btn" type="button">
            <FiHelpCircle />
          </button>
        </Card.Header>

        <Card.Body className="exam-paper-card-body">
          {/* Stepper */}
          <div className="exam-paper-stepper">
            {/* Step 1 */}
            <div className="exam-paper-step exam-paper-step-active">
              <div className="exam-paper-step-circle">1</div>

              <div className="exam-paper-step-label">Create Exam Paper</div>
            </div>

            {/* Line */}
            <div className="exam-paper-step-line">
              <div className="exam-paper-step-line-active"></div>
            </div>

            {/* Step 2 */}
            <div className="exam-paper-step">
              <div className="exam-paper-step-circle">2</div>

              <div className="exam-paper-step-label">Create Sections</div>
            </div>

            {/* Line */}
            <div className="exam-paper-step-line"></div>

            {/* Step 3 */}
            <div className="exam-paper-step">
              <div className="exam-paper-step-circle">3</div>

              <div className="exam-paper-step-label">Create Questions</div>
            </div>
          </div>

          {/* Form Card */}
          <Card className="exam-paper-form-card">
            <Card.Body>
              <h3 className="exam-paper-form-title">
                Enter the details to create a new exam paper
              </h3>

              {/* Exam Name */}
              <Form.Group className="exam-paper-form-group">
                <Form.Label>Exam Name</Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Enter exam name"
                  className="exam-paper-input"
                />
              </Form.Group>

              {/* Select Course */}
              <Form.Group className="exam-paper-form-group">
                <Form.Label>Select Course</Form.Label>

                <div className="exam-paper-select-wrapper">
                  <Form.Select className="exam-paper-input exam-paper-select">
                    <option value="">Choose course</option>
                    <option value="bcom">B.Com</option>
                    <option value="ca-foundation">CA Foundation</option>
                    <option value="cbse">CBSE Class 11</option>
                    <option value="junior-accountancy">
                      Junior Accountancy
                    </option>
                  </Form.Select>

                  <FiChevronDown className="exam-paper-select-icon" />
                </div>
              </Form.Group>

              {/* Course Code */}
              <Form.Group className="exam-paper-form-group">
                <Form.Label>Enter Course Code</Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Enter course code"
                  className="exam-paper-input"
                />
              </Form.Group>

              {/* Pass Percentage */}
              <Form.Group className="exam-paper-form-group exam-paper-pass-group">
                <Form.Label>Select Pass Percentage</Form.Label>

                <div className="exam-paper-slider-container">
                  {/* Percentage Bubble */}
                  <div
                    className="exam-paper-percentage-bubble"
                    style={{
                      left: `${passPercentage}%`,
                    }}
                  >
                    {passPercentage}%
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={passPercentage}
                    onChange={(e) => setPassPercentage(Number(e.target.value))}
                    className="exam-paper-slider"
                  />

                  {/* Slider Labels */}
                  <div className="exam-paper-slider-labels">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </Form.Group>

              {/* Buttons */}
              <div className="exam-paper-actions">
                <Button type="button" className="exam-paper-next-btn">
                  Next
                </Button>

                <Button type="button" className="exam-paper-save-btn">
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
