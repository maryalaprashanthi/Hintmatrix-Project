import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaClock,
  FaCrown,
  FaEdit,
  FaFileAlt,
  FaPlus,
  FaQuestionCircle,
  FaRupeeSign,
  FaSave,
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

      setMessage({
        type: "success",
        text: "Subscription plan saved.",
      });

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
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
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

  return (
    <div className="subscription-plans-page">
      {/* HERO */}

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

        <button type="button" className="hero-add-btn" onClick={openCreate}>
          <FaPlus />
          Add plan
        </button>
      </section>

      {/* MESSAGE */}

      {message && (
        <Alert
          variant={message.type}
          dismissible
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* PLAN CARDS */}

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
                  type="button"
                  onClick={() => openEdit(plan)}
                  variant="outline-primary"
                >
                  <FaEdit />
                  Edit
                </Button>

                {plan.active === false ? (
                  <Button
                    type="button"
                    className="activate-btn"
                    onClick={() => openEdit(plan)}
                  >
                    <FaCheck />
                    Activate
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleDelete(plan)}
                    variant="outline-danger"
                  >
                    <FaTrash />
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT PLAN MODAL */}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        dialogClassName="subscription-plan-modal"
        contentClassName="subscription-plan-modal-content"
      >
        <div className="subscription-plan-modal-header">
          <div className="subscription-plan-modal-title-wrap">
            <div className="subscription-plan-modal-icon">
              <FaCrown />
            </div>

            <div>
              <h2>{editingId ? "Edit plan" : "Create plan"}</h2>

              <p>
                Set up a new subscription plan with your preferred settings.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="subscription-plan-modal-close"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="subscription-plan-modal-body">
            {/* NAME */}

            <Form.Group className="subscription-plan-field">
              <Form.Label>
                Name <span>*</span>
              </Form.Label>

              <div className="subscription-plan-input-wrap">
                <FaFileAlt />

                <Form.Control
                  required
                  value={form.name}
                  placeholder="Enter plan name"
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </div>
            </Form.Group>

            {/* DESCRIPTION */}

            <Form.Group className="subscription-plan-field">
              <Form.Label>
                Description <span>*</span>
              </Form.Label>

              <div className="subscription-plan-textarea-wrap">
                <FaFileAlt />

                <Form.Control
                  as="textarea"
                  required
                  maxLength={500}
                  value={form.description}
                  placeholder="Enter plan description"
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                />

                <small>{form.description.length}/500</small>
              </div>
            </Form.Group>

            {/* TYPE + PRICE */}

            <div className="subscription-plan-two-column">
              <Form.Group className="subscription-plan-field">
                <Form.Label>
                  Type <span>*</span>
                </Form.Label>

                <div className="subscription-plan-input-wrap">
                  <FaCrown />

                  <Form.Select
                    value={form.type}
                    onChange={(event) =>
                      updateField("type", event.target.value)
                    }
                  >
                    <option value="FREE_TRIAL">Free Trial</option>
                    <option value="PAID">Paid</option>
                  </Form.Select>

                  <FaChevronDown className="subscription-plan-select-arrow" />
                </div>
              </Form.Group>

              <Form.Group className="subscription-plan-field">
                <Form.Label>
                  Price <span>*</span>
                </Form.Label>

                <div className="subscription-plan-input-wrap">
                  <FaRupeeSign />

                  <Form.Control
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    placeholder="Enter price"
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                  />
                </div>
              </Form.Group>
            </div>

            {/* DURATION + QUESTION LIMIT */}

            <div className="subscription-plan-two-column">
              <Form.Group className="subscription-plan-field">
                <Form.Label>
                  Duration (days) <span>*</span>
                </Form.Label>

                <div className="subscription-plan-input-wrap">
                  <FaCalendarAlt />

                  <Form.Control
                    required
                    type="number"
                    min="1"
                    value={form.durationDays}
                    onChange={(event) =>
                      updateField("durationDays", event.target.value)
                    }
                  />
                </div>
              </Form.Group>

              <Form.Group className="subscription-plan-field">
                <Form.Label>
                  Question limit <span>*</span>
                </Form.Label>

                <div className="subscription-plan-input-wrap">
                  <FaQuestionCircle />

                  <Form.Control
                    required
                    type="number"
                    min="-1"
                    value={form.practiceQuestionLimit}
                    onChange={(event) =>
                      updateField("practiceQuestionLimit", event.target.value)
                    }
                  />
                </div>
              </Form.Group>
            </div>

            {/* MOCK TEST + EXAM */}

            <div className="subscription-plan-options">
              <div className="subscription-plan-option">
                <Form.Check
                  type="checkbox"
                  checked={form.mockTestEnabled}
                  onChange={(event) =>
                    updateField("mockTestEnabled", event.target.checked)
                  }
                  label="Include mock tests"
                />

                <span>Allow users to take mock tests with this plan</span>

                {form.mockTestEnabled && (
                  <Form.Control
                    type="number"
                    min="-1"
                    placeholder="Mock test limit"
                    value={form.mockTestLimit}
                    onChange={(event) =>
                      updateField("mockTestLimit", event.target.value)
                    }
                  />
                )}
              </div>

              <div className="subscription-plan-option">
                <Form.Check
                  type="checkbox"
                  checked={form.examEnabled}
                  onChange={(event) =>
                    updateField("examEnabled", event.target.checked)
                  }
                  label="Include exams"
                />

                <span>Allow users to take exams with this plan</span>

                {form.examEnabled && (
                  <Form.Control
                    type="number"
                    min="-1"
                    placeholder="Exam attempt limit"
                    value={form.examAttemptLimit}
                    onChange={(event) =>
                      updateField("examAttemptLimit", event.target.value)
                    }
                  />
                )}
              </div>
            </div>

            {/* COURSES */}

            <Form.Label className="subscription-plan-courses-label">
              Courses included in this plan
            </Form.Label>

            <div className="subscription-plan-course-list">
              {courses.map((course) => {
                const selected = form.courseIds
                  .map(String)
                  .includes(String(course.courseId));

                return (
                  <label
                    key={course.courseId}
                    className={`subscription-plan-course ${
                      selected ? "selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
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

                    <span className="subscription-plan-course-check">
                      <FaCheck />
                    </span>

                    <FaBookOpen className="subscription-plan-course-icon" />

                    <span className="subscription-plan-course-name">
                      {course.name}
                      <small>(Course ID: {course.courseId})</small>
                    </span>

                    <FaChevronDown className="subscription-plan-course-arrow" />
                  </label>
                );
              })}
            </div>

            {!form.courseIds.length && (
              <Form.Text className="subscription-plan-course-error">
                Select at least one course before saving this plan.
              </Form.Text>
            )}
          </div>

          {/* FOOTER */}

          <div className="subscription-plan-modal-footer">
            <Button
              type="button"
              className="subscription-plan-cancel"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>

            <Button type="submit" className="subscription-plan-save">
              <FaSave />
              Save plan
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
