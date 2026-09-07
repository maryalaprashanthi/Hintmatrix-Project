import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { FaArrowLeft, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
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
      setMessage({ type: "danger", text: "Unable to load subscription master data." });
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
      courseIds: plan.courseIds || plan.courses?.map((course) => course.courseId) || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.courseIds.length) {
      setMessage({ type: "danger", text: "Select at least one existing course for this plan." });
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
      setMessage({ type: "danger", text: error.response?.data?.message || "Unable to save plan." });
    }
  };

  const handleDelete = async (plan) => {
    const id = plan.id || plan.planId;
    if (!window.confirm(
      `Deactivate ${plan.name}? This will immediately deactivate all active user subscriptions using this plan.`,
    )) return;
    try {
      await SubscriptionService.deletePlan(id);
      setMessage({
        type: "success",
        text: "Subscription plan and all active user subscriptions using it were deactivated.",
      });
      await loadData();
    } catch {
      setMessage({ type: "danger", text: "Unable to deactivate plan." });
    }
  };

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const courseNamesForPlan = (plan) =>
    (plan.courseIds || [])
      .map((courseId) => courses.find((course) => String(course.courseId) === String(courseId))?.name)
      .filter(Boolean);

  return (
    <div className="subscription-plans-page">
      <div className="subscription-plans-header">
        <div className="subscription-plans-title">
          <button type="button" className="back-btn" onClick={() => navigate("/subscriptions")}>
            <FaArrowLeft />
          </button>
          <div>
            <h2>Subscription Plans</h2>
            <p>Configure course-level access and learning entitlements.</p>
          </div>
        </div>
        <button type="button" className="add-subscription-btn" onClick={openCreate}>
          <FaPlus /> Add plan
        </button>
      </div>

      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div className="subscription-plan-admin-grid">
        {plans.map((plan) => {
          const id = plan.id || plan.planId;
          return (
            <div className="subscription-admin-card" key={id}>
              <div className="subscription-admin-card-heading">
                <div>
                  <h3>{plan.name}</h3>
                  <span>{plan.type || "PAID"} · ₹{plan.price} · {plan.durationDays || plan.duration} days</span>
                </div>
                <span className={`plan-status ${plan.active === false ? "inactive" : ""}`}>
                  {plan.active === false ? "Inactive" : "Active"}
                </span>
              </div>
              <p>{plan.description || "Course-level learning plan"}</p>
              <div className="subscription-admin-entitlements">
                <span>{plan.practiceQuestionLimit ?? plan.practiceLimit ?? "Unlimited"} questions</span>
                <span>{plan.mockTestEnabled === false ? "No mock tests" : `${plan.mockTestLimit ?? "Unlimited"} mock tests`}</span>
                <span>{plan.examEnabled === false ? "No exams" : `${plan.examAttemptLimit ?? "Unlimited"} exam attempts`}</span>
              </div>
              <div className="subscription-admin-courses">
                <strong>Mapped courses</strong>
                <span>{courseNamesForPlan(plan).join(", ") || "No courses assigned"}</span>
              </div>
              <div className="subscription-admin-actions">
                <Button variant="outline-primary" onClick={() => openEdit(plan)}><FaEdit /> Edit</Button>
                <Button variant="outline-danger" onClick={() => handleDelete(plan)}><FaTrash /> Deactivate</Button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editingId ? "Edit plan" : "Create plan"}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </Form.Group>
            <div className="row">
              <Form.Group className="col-6 mb-3"><Form.Label>Type</Form.Label><Form.Select value={form.type} onChange={(event) => updateField("type", event.target.value)}><option value="FREE_TRIAL">Free Trial</option><option value="PAID">Paid</option></Form.Select></Form.Group>
              <Form.Group className="col-6 mb-3"><Form.Label>Price</Form.Label><Form.Control type="number" min="0" value={form.price} onChange={(event) => updateField("price", event.target.value)} /></Form.Group>
              <Form.Group className="col-6 mb-3"><Form.Label>Duration (days)</Form.Label><Form.Control type="number" min="1" value={form.durationDays} onChange={(event) => updateField("durationDays", event.target.value)} /></Form.Group>
              <Form.Group className="col-6 mb-3"><Form.Label>Question limit</Form.Label><Form.Control type="number" min="-1" value={form.practiceQuestionLimit} onChange={(event) => updateField("practiceQuestionLimit", event.target.value)} /></Form.Group>
            </div>
            <Form.Check className="mb-2" label="Include mock tests" checked={form.mockTestEnabled} onChange={(event) => updateField("mockTestEnabled", event.target.checked)} />
            {form.mockTestEnabled && <Form.Control className="mb-3" type="number" min="-1" placeholder="Mock test limit (-1 for unlimited)" value={form.mockTestLimit} onChange={(event) => updateField("mockTestLimit", event.target.value)} />}
            <Form.Check className="mb-2" label="Include exams" checked={form.examEnabled} onChange={(event) => updateField("examEnabled", event.target.checked)} />
            {form.examEnabled && <Form.Control className="mb-3" type="number" min="-1" placeholder="Exam attempt limit (-1 for unlimited)" value={form.examAttemptLimit} onChange={(event) => updateField("examAttemptLimit", event.target.value)} />}
            <Form.Label>Courses included in this plan</Form.Label>
            <div className="plan-course-mapping">
              {courses.map((course) => (
                <Form.Check
                  key={course.courseId}
                  type="checkbox"
                  label={`${course.name} (Course ID: ${course.courseId})`}
                  checked={form.courseIds.map(String).includes(String(course.courseId))}
                  onChange={(event) =>
                    updateField(
                      "courseIds",
                      event.target.checked
                        ? [...form.courseIds, course.courseId]
                        : form.courseIds.filter((id) => String(id) !== String(course.courseId)),
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
          <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit">Save plan</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
