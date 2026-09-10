import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { FaPaperPlane, FaRedo } from "react-icons/fa";
import Header from "./Header";
import SummaryCards from "./SummaryCards";
import McqQuestionService from "../../services/McqQuestionService";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import QuestionService from "../../services/QuestionService";
import useQuestionStore from "./questionStore";
import "./McqQuestionView.css";

export default function McqQuestionView({ questionId, questionType }) {
  const navigate = useNavigate();
  const metadata = useQuestionStore((state) => state.question);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [nextQuestionId, setNextQuestionId] = useState(null);
  const [previousQuestionId, setPreviousQuestionId] = useState(null);
  const multiple = questionType.endsWith("MULTIPLE_CHOICE");

  useEffect(() => {
    let active = true;
    McqQuestionService.getById(questionId)
      .then(({ data }) => { if (active) setQuestion(data); })
      .catch(() => { if (active) setError("Unable to load this MCQ. Please reopen the question."); });
    return () => { active = false; };
  }, [questionId]);

  useEffect(() => {
    let active = true;
    QuestionAnswerService.getOverallMarks(1)
      .then((score) => { if (active) setTotalScore(Number(score) || 0); })
      .catch((err) => console.error("Failed to load total score:", err));
    return () => { active = false; };
  }, [questionId, result]);

  useEffect(() => {
    if (!question?.courseId || !question?.chapterId || !question?.topicId) return;
    let active = true;
    QuestionService.getQuestionsByMapping(question.courseId, question.chapterId, question.topicId)
      .then(({ data }) => {
        const questions = data.filter((item) => item.activeRow !== false);
        const index = questions.findIndex((item) => String(item.questionId) === String(questionId));
        if (active) {
          setNextQuestionId(index >= 0 ? questions[index + 1]?.questionId ?? null : null);
          setPreviousQuestionId(index > 0 ? questions[index - 1].questionId : null);
        }
      })
      .catch((err) => console.error("Failed to load next question:", err));
    return () => { active = false; };
  }, [question, questionId]);

  const submit = async () => {
    if (!selected.length || busy || result) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await McqQuestionService.submit(1, {
        questionId: question.questionId,
        selectedOptionIds: selected,
      });
      const saved = data.results?.[0];
      if (!saved) throw new Error("No answer confirmation was returned.");
      setResult(saved);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save your answer.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setError("");
    try {
      await QuestionAnswerService.resetAnswersByUserAndQuestion(1, question.questionId);
      await QuestionAnswerService.resetAnswerEventsByUserAndQuestion(1, question.questionId);
      setSelected([]);
      setResult(null);
    } catch {
      setError("Unable to reset the answer. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!question) return <div>{error || "Loading question..."}</div>;
  const options = [...(question.options || [])].sort((a, b) => a.optionOrder - b.optionOrder);
  const correct = result?.status === "CORRECT";
  const correctOptionIds = new Set((result?.correctOptionIds || []).map(String));

  return (
    <div>
      <Header question={{ ...metadata, ...question }} actions={<>
        <Button variant="light" size="sm" onClick={reset} disabled={busy}>
          <FaRedo className="me-1" /> Reset
        </Button>
        <Button variant="primary" size="sm" onClick={submit} disabled={busy || !selected.length || !!result}>
          <FaPaperPlane className="me-1" /> {busy ? "Please wait..." : result ? "Answer Saved" : "Submit Answer"}
        </Button>
      </>} />
      <SummaryCards debit={0} credit={0} total={1} solved={correct ? 1 : 0} totalScore={totalScore} />
      {error && <Alert variant="danger">{error}</Alert>}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Answer options</Card.Title>
          <p className="text-muted">{multiple ? "Select all correct answers" : "Select one correct answer"}</p>
          {options.map((option, index) => {
            const isCorrectOption = !!result && correctOptionIds.has(String(option.optionId));
            const isWrongSelection = !!result && selected.includes(option.optionId) && !isCorrectOption;
            return (
            <Form.Check key={option.optionId} id={`mcq-${questionId}-${option.optionId}`}
              className={`mcq-answer-option border rounded p-3 ps-5 mb-3${isCorrectOption ? " mcq-answer-correct" : isWrongSelection ? " mcq-answer-incorrect" : ""}`}
              type={multiple ? "checkbox" : "radio"} name={`mcq-${questionId}`}
              label={`${String.fromCharCode(65 + index)}. ${option.optionText}`}
              checked={selected.includes(option.optionId)} disabled={busy || !!result}
              onChange={() => setSelected((previous) => multiple
                ? previous.includes(option.optionId) ? previous.filter((id) => id !== option.optionId) : [...previous, option.optionId]
                : [option.optionId])} />
          ); })}
          {result && <Alert variant={correct ? "success" : "danger"}>
            {correct ? "Correct answer." : "You attempted an incorrect answer."}
            {!correct && <div>Correct answer: {options.filter((option) => correctOptionIds.has(String(option.optionId))).map((option) => option.optionText).join(", ")}</div>}
          </Alert>}
        </Card.Body>
      </Card>
      <div className="d-flex justify-content-between mt-3">
        <Button variant="primary" disabled={busy || previousQuestionId == null}
          onClick={() => navigate(`/questions/${previousQuestionId}`)}>
          ← Previous
        </Button>
        <Button variant="primary" disabled={busy || nextQuestionId == null}
          onClick={() => navigate(`/questions/${nextQuestionId}`)}>
          Next →
        </Button>
      </div>
    </div>
  );
}
