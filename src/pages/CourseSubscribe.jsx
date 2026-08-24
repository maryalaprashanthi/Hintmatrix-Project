import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

import {
  FiBookmark,
  FiGift,
  FiBookOpen,
  FiGrid,
  FiEdit3,
  FiShield,
  FiShoppingCart,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiAward,
  FiClock,
  FiFileText,
} from "react-icons/fi";

import "./CourseSubscribe.css";

const CourseSubscribe = () => {
  const courses = [
    {
      title: "Combo Pack",
      description: (
        <>
          Complete course bundle
          <br />
          for all major chapters
        </>
      ),
      price: "₹149.00/-",
      validity: "366 Days",
      icon: <FiGift />,
      color: "purple",
    },
    {
      title: "Ch: Final Accounts without Adjustments",
      description: (
        <>
          Detailed questions and solutions
          <br />
          without adjustments
        </>
      ),
      price: "₹49.00/-",
      validity: "30 Days",
      icon: <FiBookOpen />,
      color: "green",
    },
    {
      title: "Ch: Final Accounts with Adjustments",
      description: (
        <>
          Detailed questions and solutions
          <br />
          with adjustments
        </>
      ),
      price: "₹49.00/-",
      validity: "30 Days",
      icon: <FiGrid />,
      color: "orange",
    },
    {
      title: "Ch: Journal Entries for Jr.Inter, Class11, CA-Foundation & B.com",
      description: (
        <>
          Comprehensive journal entries
          <br />
          practice questions
        </>
      ),
      price: "₹49.00/-",
      validity: "30 Days",
      icon: <FiEdit3 />,
      color: "blue",
    },
    {
      title: "Ch: Rectification of Errors - Jr.Inter, Class11, CA-Found&.com",
      description: (
        <>
          Error correction and rectification
          <br />
          practice questions
        </>
      ),
      price: "₹49.00/-",
      validity: "30 Days",
      icon: <FiShield />,
      color: "pink",
    },
  ];

  return (
    <div className="course-page">
      {/* Main Blue Container */}
      <Container className="course-main-container">
        {/* Header */}
        <div className="course-header">
          <FiBookmark className="header-bookmark" />
          <span>Jr. Inter</span>
        </div>

        {/* White Content Area */}
        <div className="course-content">
          {/* Course Cards */}
          <div className="course-list">
            {courses.map((course, index) => (
              <Card
                className={`course-card course-${course.color}`}
                key={index}
              >
                <Card.Body>
                  <Row className="align-items-center">
                    {/* Icon */}
                    <Col xs={12} md={2} className="course-icon-column">
                      <div className="course-icon-box">{course.icon}</div>
                    </Col>

                    {/* Course Information */}
                    <Col xs={12} md={4} className="course-info">
                      <h5>{course.title}</h5>

                      <p>{course.description}</p>
                    </Col>

                    {/* Price */}
                    <Col xs={12} md={2} className="course-price-column">
                      <div className="course-divider"></div>

                      <div className="course-price">{course.price}</div>
                    </Col>

                    {/* Validity */}
                    <Col xs={12} md={2} className="course-validity-column">
                      <div className="course-divider"></div>

                      <div className="validity-wrapper">
                        <div className="calendar-circle">
                          <FiCalendar />
                        </div>

                        <div className="validity-text">
                          <span>Validity</span>
                          <strong>{course.validity}</strong>
                        </div>
                      </div>
                    </Col>

                    {/* Buy Button */}
                    <Col xs={12} md={2} className="buy-column">
                      <Button className="buy-btn">
                        <FiShoppingCart />
                        <span>Buy Now</span>
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>

          {/* Free Trial Section */}
          <Card className="free-trial-card">
            <Card.Body>
              <Row className="align-items-center">
                {/* Trophy */}
                <Col md={2} className="trial-left-image">
                  <div className="trophy-circle">
                    <div className="confetti confetti-1"></div>
                    <div className="confetti confetti-2"></div>
                    <div className="confetti confetti-3"></div>

                    <FiAward className="trophy-icon" />
                  </div>
                </Col>

                {/* Trial Content */}
                <Col md={6} className="trial-content">
                  <h4>Jr.Inter - Journal entries Free trial</h4>

                  <div className="trial-point">
                    <FiCheckCircle />
                    <span>Free Trial valid for 7 days from signup</span>
                  </div>

                  <div className="trial-point">
                    <FiCheckCircle />
                    <span>
                      Students can practice 2 questions in each category
                    </span>
                  </div>

                  <Button className="free-trial-btn">
                    Free Trial
                    <FiChevronRight />
                  </Button>
                </Col>

                {/* Clipboard Illustration */}
                <Col md={4} className="trial-right-image">
                  <div className="clipboard-illustration">
                    <div className="clipboard-top">
                      <FiFileText />
                    </div>

                    <div className="clipboard-body">
                      <div className="clip-line">
                        <FiCheckCircle />
                        <span></span>
                      </div>

                      <div className="clip-line">
                        <FiCheckCircle />
                        <span></span>
                      </div>

                      <div className="clip-line">
                        <FiCheckCircle />
                        <span></span>
                      </div>

                      <div className="clip-line">
                        <FiCheckCircle />
                        <span></span>
                      </div>
                    </div>

                    <div className="clock-icon">
                      <FiClock />
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Core Facilities */}
          <Card className="facilities-card">
            <Card.Body>
              <Row className="align-items-center">
                {/* Facilities Content */}
                <Col md={9}>
                  <h4 className="facilities-title">Core Facilities</h4>

                  <div className="facility-list">
                    <div className="facility-item">
                      <FiCheckCircle />
                      <span>
                        Full access to all questions in both Jr. Inter and Sr.
                        Inter
                      </span>
                    </div>

                    <div className="facility-item">
                      <FiCheckCircle />
                      <span>
                        Enjoy hassle-free practice of descriptive questions with
                        hint and audit options
                      </span>
                    </div>

                    <div className="facility-item">
                      <FiCheckCircle />
                      <span>All questions can be practiced multiple times</span>
                    </div>

                    <div className="facility-item">
                      <FiCheckCircle />
                      <span>Mark sheet provides stepwise marks</span>
                    </div>

                    <div className="facility-item">
                      <FiCheckCircle />
                      <span>
                        Review of mistakes can be done by using check your
                        mistakes
                      </span>
                    </div>
                  </div>
                </Col>

                {/* Award Illustration */}
                <Col md={3} className="facility-image">
                  <div className="facility-illustration">
                    <div className="facility-clipboard">
                      <div className="facility-clip-top"></div>

                      <div className="facility-check">
                        <FiCheckCircle />
                        <span></span>
                      </div>

                      <div className="facility-check">
                        <FiCheckCircle />
                        <span></span>
                      </div>

                      <div className="facility-check">
                        <FiCheckCircle />
                        <span></span>
                      </div>

                      <div className="facility-check">
                        <FiCheckCircle />
                        <span></span>
                      </div>
                    </div>

                    <div className="facility-pencil">
                      <FiEdit3 />
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default CourseSubscribe;
