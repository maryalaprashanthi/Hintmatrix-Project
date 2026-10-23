import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import QuestionService from "../../services/QuestionService";
import SubscriptionService from "../../services/SubscriptionService";

const questionIdOf = (question) => question.questionId ?? question.id;

function groupByHierarchy(questions) {
  const subjects = new Map();
  questions.forEach((question) => {
    const subjectName = question.subjectName || "Unassigned subject";
    const chapterName = question.chapterName || "Unassigned chapter";
    const topicName = question.topicName || "Unassigned topic";
    if (!subjects.has(subjectName)) subjects.set(subjectName, new Map());
    const chapters = subjects.get(subjectName);
    if (!chapters.has(chapterName)) chapters.set(chapterName, new Map());
    const topics = chapters.get(chapterName);
    if (!topics.has(topicName)) topics.set(topicName, []);
    topics.get(topicName).push(question);
  });
  return subjects;
}

export default function PlanQuestionAccessModal({ show, onHide, plan, course }) {
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [questionLimit, setQuestionLimit] = useState(0);
  const [allCourseQuestions, setAllCourseQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!show || !plan || !course) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([
      QuestionService.getAll(),
      SubscriptionService.getPlanQuestionAssignments(plan.planId ?? plan.id, course.courseId),
    ]).then(([questionResponse, accessResponse]) => {
      if (cancelled) return;
      const available = (questionResponse.data || []).filter(
        (question) => String(question.courseId) === String(course.courseId) && question.activeRow !== false,
      );
      const access = accessResponse.data || {};
      setQuestions(available);
      setQuestionLimit(access.questionLimit ?? plan.practiceQuestionLimit ?? 0);
      setAllCourseQuestions(Boolean(access.allCourseQuestions));
      setSelectedIds((access.questionIds || []).map(String));
    }).catch((requestError) => {
      if (!cancelled) setError(requestError.response?.data?.message || "Unable to load this course's questions.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [show, plan, course]);

  const hierarchy = useMemo(() => groupByHierarchy(questions), [questions]);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleQuestion = (id) => setSelectedIds((current) => {
    const key = String(id);
    return current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
  });

  const toggleGroup = (items) => {
    const ids = items.map(questionIdOf).map(String);
    const everySelected = ids.every((id) => selected.has(id));
    setSelectedIds((current) => everySelected
      ? current.filter((id) => !ids.includes(id))
      : [...new Set([...current, ...ids])]);
  };

  const handleSave = async () => {
    const limit = allCourseQuestions ? -1 : Number(questionLimit);
    if (!allCourseQuestions && limit >= 0 && selectedIds.length > limit) {
      setError(`Select no more than ${limit} questions for this plan.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await SubscriptionService.setPlanQuestionAssignments(plan.planId ?? plan.id, course.courseId, {
        questionLimit: limit,
        allCourseQuestions,
        questionIds: allCourseQuestions ? [] : selectedIds.map(Number),
      });
      setSaved(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save the question assignments.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Question access · {plan?.name} · {course?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="plan-question-access-intro">
          Select existing questions from this course. Student access follows the same subject, chapter, and topic hierarchy.
        </p>
        {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
        {saved && <Alert variant="success" onClose={() => setSaved(false)} dismissible>Question access saved for this plan and course.</Alert>}
        <div className="plan-question-access-controls">
          <Form.Group>
            <Form.Label>Maximum selected questions (−1 means no cap)</Form.Label>
            <Form.Control
              type="number"
              min="-1"
              disabled={allCourseQuestions}
              value={allCourseQuestions ? -1 : questionLimit}
              onChange={(event) => setQuestionLimit(event.target.value)}
            />
          </Form.Group>
          <Form.Check
            type="switch"
            label={`Include all ${questions.length} current and future course questions`}
            checked={allCourseQuestions}
            onChange={(event) => setAllCourseQuestions(event.target.checked)}
          />
          <strong>{allCourseQuestions ? questions.length : selectedIds.length} / {allCourseQuestions ? questions.length : questionLimit === -1 ? "∞" : questionLimit} selected</strong>
        </div>
        {loading ? <div className="plan-question-access-loading"><Spinner animation="border" /> Loading questions…</div> : (
          <div className="plan-question-hierarchy">
            {!questions.length && <Alert variant="info">No active questions are available in this course.</Alert>}
            {[...hierarchy.entries()].map(([subject, chapters]) => (
              <details key={subject} open>
                <summary>{subject}</summary>
                {[...chapters.entries()].map(([chapter, topics]) => (
                  <details key={chapter} className="plan-question-chapter" open>
                    <summary>{chapter}</summary>
                    {[...topics.entries()].map(([topic, topicQuestions]) => (
                      <section className="plan-question-topic" key={topic}>
                        <header>
                          <strong>{topic}</strong>
                          <Button size="sm" variant="outline-primary" onClick={() => toggleGroup(topicQuestions)}>
                            {topicQuestions.every((question) => selected.has(String(questionIdOf(question)))) ? "Clear topic" : `Select topic (${topicQuestions.length})`}
                          </Button>
                        </header>
                        {topicQuestions.map((question) => {
                          const id = questionIdOf(question);
                          return <Form.Check key={id} type="checkbox" checked={selected.has(String(id))}
                            disabled={allCourseQuestions}
                            label={<><span>Q{id}</span> {question.questionText}</>}
                            onChange={() => toggleQuestion(id)} />;
                        })}
                      </section>
                    ))}
                  </details>
                ))}
              </details>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>Close</Button>
        <Button onClick={handleSave} disabled={loading || saving || !course || (!allCourseQuestions && questionLimit >= 0 && selectedIds.length > Number(questionLimit))}>
          {saving ? "Saving…" : "Save question access"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
