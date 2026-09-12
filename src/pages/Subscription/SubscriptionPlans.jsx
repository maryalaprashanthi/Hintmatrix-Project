import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import {
  FaArrowLeft,
  FaCheck,
  FaClock,
  FaCrown,
  FaEdit,
  FaPlus,
  FaRupeeSign,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CourseService from "../../services/CourseService";
import SubscriptionService from "../../services/SubscriptionService";
import "./SubscriptionPlans.css";

const initialForm = {
  name: "",
  description: "",
  type: "PAID",
  price: 0,
  durationDays: 30,
  practiceQuestionLimit: 100,
  mockTestEnabled: false,
  mockTestLimit: 0,
  examEnabled: false,
  examAttemptLimit: 0,
  courseIds: [],
};

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    try {
      const [planResponse, courseResponse] = await Promise.all([
        SubscriptionService.getPlans(),
        CourseService.getAllCourses(),
      ]);
      setPlans(planResponse.data || []);
      setCourses(courseResponse.data || []);
    } catch {
      setMessage({
        type: "danger",
        text: "Unable to load subscription master data.",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan.id || plan.planId);
    setForm({
      ...initialForm,
      ...plan,
      courseIds:
        plan.courseIds || plan.courses?.map((course) => course.courseId) || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.courseIds.length) {
      setMessage({
        type: "danger",
        text: "Select at least one existing course for this plan.",
      });
      return;
    }

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        practiceQuestionLimit: Number(form.practiceQuestionLimit),
        mockTestLimit: Number(form.mockTestLimit),
        examAttemptLimit: Number(form.examAttemptLimit),
      };

      if (editingId) {
        await SubscriptionService.updatePlan(editingId, payload);
      } else {
        await SubscriptionService.createPlan(payload);
      }

      setShowModal(false);
      setMessage({ type: "success", text: "Subscription plan saved." });
      await loadData();
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Unable to save plan.",
      });
    }
  };

  const handleDelete = async (plan) => {
    const id = plan.id || plan.planId;

    if (
      !window.confirm(
        `Deactivate ${plan.name}? This will immediately deactivate all active user subscriptions using this plan.`,
      )
    ) {
      return;
    }

    try {
      await SubscriptionService.deletePlan(id);
      setMessage({
        type: "success",
        text: "Subscription plan and all active user subscriptions using it were deactivated.",
      });
      await loadData();
    } catch {
      setMessage({
        type: "danger",
        text: "Unable to deactivate plan.",
      });
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const courseNamesForPlan = (plan) =>
    (plan.courseIds || [])
      .map(
        (courseId) =>
          courses.find((course) => String(course.courseId) === String(courseId))
            ?.name,
      )
      .filter(Boolean);

  const getPlanType = (plan) => {
    const name = String(plan.name || "").toLowerCase();

    if (name.includes("free")) return "free";
    if (name.includes("basic")) return "basic";
    if (name.includes("standard")) return "standard";
    if (name.includes("premium")) return "premium";
    return "custom";
  };

  const getPlanIcon = (type) => {
    if (type === "free") return <FaCrown />;
    if (type === "basic") return <FaUsers />;
    if (type === "standard") return <FaRupeeSign />;
    if (type === "premium") return <FaClock />;
    return <FaUsers />;
  };

  const activePlans = plans.filter((plan) => plan.active !== false).length;
  const inactivePlans = plans.filter((plan) => plan.active === false).length;
  const planValue = plans.reduce(
    (total, plan) => total + Number(plan.price || 0),
    0,
  );

  return (
    <div className="subscription-plans-page">
      <section className="subscription-hero">
        <div className="hero-content">
          <span>SUBSCRIPTION PLANS</span>
          <h1>Manage Your Learning Plans</h1>
          <p>
            Create, configure and manage subscription plans for your learners.
          </p>
        </div>

        <div className="hero-illustration">
          <div className="hero-crown">
            <FaCrown />
          </div>
          <div className="hero-card">
            <i />
            <i />
            <i />
          </div>
          <b />
          <em />
        </div>

        <div className="hero-quote">
          <strong>“</strong>
          <p>
            The best learning
            <br />
            happens with the
            <br />
            right plan.
          </p>
          <span />
        </div>

        <button className="hero-add-btn" onClick={openCreate}>
          <FaPlus /> Add plan
        </button>
      </section>

      {message && (
        <Alert
          variant={message.type}
          dismissible
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <div className="subscription-stats">
        <div className="stat-card blue">
          <div className="stat-icon">
            <FaCrown />
          </div>
          <span className="stat-arrow">›</span>
          <label>Total Plans</label>
          <strong>{plans.length}</strong>
          <small>↗ {plans.length} plans available</small>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <span className="stat-arrow">›</span>
          <label>Active Plans</label>
          <strong>{activePlans}</strong>
          <small>↗ Currently active</small>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <FaRupeeSign />
          </div>
          <span className="stat-arrow">›</span>
          <label>Plan Value</label>
          <strong>₹ {planValue.toLocaleString("en-IN")}</strong>
          <small>↗ Combined plan pricing</small>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <FaClock />
          </div>
          <span className="stat-arrow">›</span>
          <label>Inactive Plans</label>
          <strong>{inactivePlans}</strong>
          <small>↘ Currently inactive</small>
        </div>
      </div>

      <div className="subscription-plan-grid">
        {plans.map((plan) => {
          const id = plan.id || plan.planId;
          const type = getPlanType(plan);
          const courseNames = courseNamesForPlan(plan);

          return (
            <div className={`plan-card ${type}`} key={id}>
              <div className="plan-header">
                <div className="plan-title">
                  <div className="plan-icon">{getPlanIcon(type)}</div>
                  <div>
                    <h3>{plan.name}</h3>
                    <span>
                      {plan.type || "PAID"} · ₹ {plan.price ?? 0} /{" "}
                      {plan.durationDays || plan.duration || 30} days
                    </span>
                  </div>
                </div>

                <span
                  className={`plan-status ${
                    plan.active === false ? "inactive" : ""
                  }`}
                >
                  {plan.active === false ? "Inactive" : "Active"}
                </span>
              </div>

              <p className="plan-description">
                {plan.description || "Course-level learning plan"}
              </p>

              <div className="plan-features">
                <span>
                  <FaCheck />
                  {plan.practiceQuestionLimit ??
                    plan.practiceLimit ??
                    "Unlimited"}{" "}
                  questions
                </span>
                <span>
                  <FaCheck />
                  {plan.mockTestEnabled === false
                    ? "No mock tests"
                    : `${plan.mockTestLimit ?? "Unlimited"} mock tests`}
                </span>
                <span>
                  <FaCheck />
                  {plan.examEnabled === false
                    ? "No exams"
                    : `${plan.examAttemptLimit ?? "Unlimited"} exam attempts`}
                </span>
              </div>

              <div className="mapped-courses">
                <strong>MAPPED COURSES</strong>
                <span>
                  {courseNames.length
                    ? courseNames.join(", ")
                    : "No courses assigned"}
                </span>
              </div>

              <div className="plan-actions">
                <Button
                  onClick={() => openEdit(plan)}
                  variant="outline-primary"
                >
                  <FaEdit /> Edit
                </Button>

                {plan.active === false ? (
                  <Button
                    className="activate-btn"
                    onClick={() => openEdit(plan)}
                  >
                    <FaCheck /> Activate
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleDelete(plan)}
                    variant="outline-danger"
                  >
                    <FaTrash /> Deactivate
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit plan" : "Create plan"}</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
              />
            </Form.Group>

            <div className="row">
              <Form.Group className="col-6 mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={form.type}
                  onChange={(event) => updateField("type", event.target.value)}
                >
                  <option value="FREE_TRIAL">Free Trial</option>
                  <option value="PAID">Paid</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="col-6 mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                />
              </Form.Group>

              <Form.Group className="col-6 mb-3">
                <Form.Label>Duration (days)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={form.durationDays}
                  onChange={(event) =>
                    updateField("durationDays", event.target.value)
                  }
                />
              </Form.Group>

              <Form.Group className="col-6 mb-3">
                <Form.Label>Question limit</Form.Label>
                <Form.Control
                  type="number"
                  min="-1"
                  value={form.practiceQuestionLimit}
                  onChange={(event) =>
                    updateField("practiceQuestionLimit", event.target.value)
                  }
                />
              </Form.Group>
            </div>

            <Form.Check
              className="mb-2"
              label="Include mock tests"
              checked={form.mockTestEnabled}
              onChange={(event) =>
                updateField("mockTestEnabled", event.target.checked)
              }
            />

            {form.mockTestEnabled && (
              <Form.Control
                className="mb-3"
                type="number"
                min="-1"
                placeholder="Mock test limit (-1 for unlimited)"
                value={form.mockTestLimit}
                onChange={(event) =>
                  updateField("mockTestLimit", event.target.value)
                }
              />
            )}

            <Form.Check
              className="mb-2"
              label="Include exams"
              checked={form.examEnabled}
              onChange={(event) =>
                updateField("examEnabled", event.target.checked)
              }
            />

            {form.examEnabled && (
              <Form.Control
                className="mb-3"
                type="number"
                min="-1"
                placeholder="Exam attempt limit (-1 for unlimited)"
                value={form.examAttemptLimit}
                onChange={(event) =>
                  updateField("examAttemptLimit", event.target.value)
                }
              />
            )}

            <Form.Label>Courses included in this plan</Form.Label>

            <div className="plan-course-mapping">
              {courses.map((course) => (
                <Form.Check
                  key={course.courseId}
                  type="checkbox"
                  label={`${course.name} (Course ID: ${course.courseId})`}
                  checked={form.courseIds
                    .map(String)
                    .includes(String(course.courseId))}
                  onChange={(event) =>
                    updateField(
                      "courseIds",
                      event.target.checked
                        ? [...form.courseIds, course.courseId]
                        : form.courseIds.filter(
                            (id) => String(id) !== String(course.courseId),
                          ),
                    )
                  }
                />
              ))}
            </div>

            {!form.courseIds.length && (
              <Form.Text className="text-danger">
                Select at least one course before saving this plan.
              </Form.Text>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save plan</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
