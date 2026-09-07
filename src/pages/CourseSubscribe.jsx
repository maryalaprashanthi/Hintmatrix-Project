import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { FiBookOpen, FiCheckCircle, FiCreditCard, FiLock } from "react-icons/fi";

import CourseService from "../services/CourseService";
import SubscriptionService from "../services/SubscriptionService";
import "./CourseSubscribe.css";

const formatLimit = (value) =>
  value === null || value === undefined || value < 0 ? "Unlimited" : value;

const planType = (plan) =>
  plan.freeTrial || plan.type === "FREE_TRIAL" || plan.planType === "FREE_TRIAL"
    ? "FREE_TRIAL"
    : "PAID";

export default function CourseSubscribe() {
  const [courses, setCourses] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    CourseService.getAllCourses()
      .then((response) => {
        const loadedCourses = response.data || [];
        setCourses(loadedCourses);
        if (loadedCourses.length) {
          setSelectedCourseId(String(loadedCourses[0].courseId));
        }
      })
      .catch(() => {
        setMessage({ type: "danger", text: "Unable to load courses." });
      })
      .finally(() => setLoading(false));
    SubscriptionService.getMine()
      .then((response) => setSubscriptions(response.data || []))
      .catch(() => setSubscriptions([]));
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    SubscriptionService.getPlansForCourse(selectedCourseId)
      .then((response) => setPlans(response.data || []))
      .catch(() => {
        setPlans([]);
        setMessage({ type: "danger", text: "Unable to load plans for this course." });
      });
  }, [selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.courseId) === selectedCourseId),
    [courses, selectedCourseId],
  );

  const coursePlans = useMemo(() => plans.filter((plan) => plan.active !== false), [plans]);
  const activeSubscription = useMemo(
    () =>
      subscriptions.find(
        (subscription) =>
          subscription.active &&
          String(subscription.courseId) === selectedCourseId,
      ),
    [subscriptions, selectedCourseId],
  );

  const handleActivate = async (plan) => {
    setActivating(plan.id || plan.planId);
    setMessage(null);
    try {
      const response = await SubscriptionService.activate({
        planId: plan.id || plan.planId,
        courseId: selectedCourse.courseId,
      });
      setSubscriptions((current) => [
        ...current.filter(
          (subscription) =>
            String(subscription.courseId) !== String(selectedCourse.courseId),
        ),
        response.data,
      ]);
      const activatedCourse = selectedCourse.name || "the selected course";
      setMessage({
        type: "success",
        text: `${plan.name} is now active for ${activatedCourse}.`,
        subscription: response.data,
      });
    } catch (error) {
      const status = error.response?.status;
      const isAuthenticationRedirect =
        typeof error.response?.data === "string" &&
        error.response.data.includes("accounts.google.com");
      setMessage({
        type: "danger",
        text:
          status === 401 || status === 403 || isAuthenticationRedirect
            ? "Please log in as a STUDENT or GUEST to activate a subscription."
            : error.response?.data?.message || "Unable to activate this plan.",
      });
    } finally {
      setActivating(null);
    }
  };

  if (loading) {
    return <div className="subscription-loading"><Spinner animation="border" /></div>;
  }

  return (
    <Container fluid className="course-subscribe-page">
      <div className="course-subscribe-heading">
        <div>
          <p className="eyebrow">COURSE ACCESS</p>
          <h1>Choose your course subscription</h1>
          <p>Select an existing course first. Plans only grant access to that course.</p>
        </div>
        <FiCreditCard className="subscription-heading-icon" />
      </div>

      {message && (
        <Alert variant={message.type} role="status">
          {message.text}
          {message.type === "success" && message.subscription?.expiresAt && (
            <div>Valid until: {new Date(message.subscription.expiresAt).toLocaleDateString()}</div>
          )}

          {activeSubscription && (
            <Alert variant="success" className="active-subscription-alert">
              <strong>Active subscription: {activeSubscription.planName}</strong>
              <span>Course access is enabled for {selectedCourse?.name}.</span>
              {activeSubscription.expiresAt && (
                <span>
                  Valid until: {new Date(activeSubscription.expiresAt).toLocaleDateString()}
                </span>
              )}
            </Alert>
          )}
        </Alert>
      )}

      <Card className="course-selector-card">
        <Card.Body>
          <label htmlFor="subscription-course">Course</label>
          <select
            id="subscription-course"
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
          >
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.name}
              </option>
            ))}
          </select>
        </Card.Body>
      </Card>

      <Row className="subscription-plan-grid">
        {coursePlans.map((plan) => {
          const id = plan.id || plan.planId;
          const isTrial = planType(plan) === "FREE_TRIAL";
          return (
            <Col key={id} xs={12} md={6} xl={3}>
              <Card className={`customer-plan-card ${isTrial ? "trial-plan" : ""}`}>
                <Card.Body>
                  <div className="plan-card-icon"><FiBookOpen /></div>
                  <h2>{plan.name}</h2>
                  <p className="plan-description">{plan.description || "Course learning access"}</p>
                  <div className="plan-price">
                    {Number(plan.price || 0) === 0 ? "Free" : `₹${plan.price}`}
                    <small> / {plan.durationDays || plan.duration || 30} days</small>
                  </div>
                  <ul className="plan-entitlements">
                    <li><FiCheckCircle /> {formatLimit(plan.practiceQuestionLimit || plan.practiceLimit)} practice questions</li>
                    <li>
                      {plan.mockTestEnabled === false ? <FiLock /> : <FiCheckCircle />}
                      {plan.mockTestEnabled === false ? " Mock tests not included" : ` ${formatLimit(plan.mockTestLimit)} mock tests`}
                    </li>
                    <li>
                      {plan.examEnabled === false ? <FiLock /> : <FiCheckCircle />}
                      {plan.examEnabled === false ? " Exams not included" : ` ${formatLimit(plan.examAttemptLimit || plan.examLimit)} exam attempts`}
                    </li>
                  </ul>
                  <Button
                    className="subscribe-plan-btn"
                    disabled={activating === id || !selectedCourse || activeSubscription?.planId === id}
                    onClick={() => handleActivate(plan)}
                  >
                    {activeSubscription?.planId === id
                      ? "Currently active"
                      : activating === id
                        ? "Activating..."
                        : isTrial
                          ? "Start free trial"
                          : "Subscribe"}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {!coursePlans.length && (
        <Alert variant="info">No active plans are available for this course yet.</Alert>
      )}
    </Container>
  );
}
