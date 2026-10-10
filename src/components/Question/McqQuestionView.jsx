import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { FaBalanceScale, FaPaperPlane, FaRedo } from "react-icons/fa";
import Header from "./Header";
import StatCard from "./StatCard";
import McqQuestionService from "../../services/McqQuestionService";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import useQuestionStore from "./questionStore";
import { getCurrentUserId } from "../../utils/user";
import { restoreMcqAnswer } from "../../utils/questionAttemptState";
import "./McqQuestionView.css";
import "./FillInBlankQuestionView.css";

export default function McqQuestionView({ questionId, questionType, questionNumber = 1, displayQuestionNumber = questionNumber, totalQuestions = 1, onPrevious, onNext }) {
  const metadata = useQuestionStore((state) => state.question);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [totalScore, setTotalScore] = useState(null);
  const [scoreError, setScoreError] = useState("");
  const scoreRequest = useRef({ version: 0 });
  const multiple = questionType.endsWith("MULTIPLE_CHOICE");

  // Same persisted, user-wide earned marks used by drag-and-drop.
  const loadTotalScore = useCallback(async () => {
    const tracker = scoreRequest.current;
    const request = ++tracker.version;
    setScoreError("");
    try {
      const marks = await QuestionAnswerService.getOverallMarks(getCurrentUserId());
      if (request === tracker.version) setTotalScore(Number(marks) || 0);
    } catch {
      if (request === tracker.version) {
        setScoreError("Unable to refresh total score. Reopen the question to retry.");
      }
    }
  }, []);

  useEffect(() => {
    const tracker = scoreRequest.current;
    setTotalScore(null);
    if (questionId) void loadTotalScore();
    return () => { tracker.version++; };
  }, [questionId, loadTotalScore]);

  useEffect(() => {
    let active = true;
    setBusy(true);
    setError("");
    setQuestion(null);
    setSelected([]);
    setResult(null);
    Promise.all([
      McqQuestionService.getById(questionId),
      QuestionAnswerService.getAnswerEventsByQuestionId(
        getCurrentUserId(),
        questionId,
      ),
    ])
      .then(([{ data }, events]) => {
        if (!active) return;
        setQuestion(data);
        const restored = restoreMcqAnswer(events, data.options || [], multiple);
        if (restored) {
          setSelected(restored.selected);
          setResult(restored.result);
        }
      })
      .catch(() => {
        if (active)
          setError("Unable to load this MCQ. Please reopen the question.");
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [questionId, multiple]);

  const submit = async () => {
    if (!selected.length || busy || result) return;
    setBusy(true);
    setError("");
    try {
      console.log("This is data I am sending", {
        questionId: question.questionId,
        selectedOptionIds: selected,
      });
      const { data } = await McqQuestionService.submit(getCurrentUserId(), {
        questionId: question.questionId,
        selectedOptionIds: selected,
      });
      const saved = data.results?.[0];
      if (!saved) throw new Error("No answer confirmation was returned.");
      setResult(saved);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save your answer.",
      );
    } finally {
      await loadTotalScore();
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setError("");
    try {
      await QuestionAnswerService.resetAnswersByUserAndQuestion(
        getCurrentUserId(),
        question.questionId,
      );
      await QuestionAnswerService.resetAnswerEventsByUserAndQuestion(
        getCurrentUserId(),
        question.questionId,
      );
      setSelected([]);
      setResult(null);
    } catch {
      setError("Unable to reset the answer. Please try again.");
    } finally {
      await loadTotalScore();
      setBusy(false);
    }
  };

  if (!question) return <div>{error || "Loading question..."}</div>;
  const options = [...(question.options || [])].sort(
    (a, b) => a.optionOrder - b.optionOrder,
  );
  const correct = result?.status === "CORRECT";
  const correctOptionIds = new Set(
    (result?.correctOptionIds || []).map(String),
  );

  return (
    <div>
      <Header
        questionNumber={displayQuestionNumber}
        question={{ ...metadata, ...question }}
        questionTypeLabel={
          multiple ? "MCQ Multiple Choice" : "MCQ Single Choice"
        }
        actions={
          <>
            <Button variant="light" size="sm" onClick={reset} disabled={busy}>
              <FaRedo className="me-1" /> Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={submit}
              disabled={busy || !selected.length || !!result}
            >
              <FaPaperPlane className="me-1" />{" "}
              {busy
                ? "Please wait..."
                : result
                  ? "Answer Saved"
                  : "Submit Answer"}
            </Button>
          </>
        }
      />
      {error && <Alert variant="danger">{error}</Alert>}
      {scoreError && <Alert variant="warning">{scoreError}</Alert>}
      <div className="row mb-4">
        <div className="col-12 col-md-6 col-xl-3" role="status" aria-live="polite">
          <StatCard
            icon={<FaBalanceScale />}
            title="Total Score"
            amount={totalScore ?? "—"}
            subtitle="Total marks earned"
            color="teritary"
          />
        </div>
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Answer options</Card.Title>
          <p className="text-muted">
            {multiple
              ? "Select all correct answers"
              : "Select one correct answer"}
          </p>
          {options.map((option, index) => {
            const isCorrectOption =
              !!result && correctOptionIds.has(String(option.optionId));
            const isWrongSelection =
              !!result &&
              selected.includes(option.optionId) &&
              !isCorrectOption;
            return (
              <Form.Check
                key={option.optionId}
                id={`mcq-${questionId}-${option.optionId}`}
                className={`mcq-answer-option border rounded p-3 ps-5 mb-3${isCorrectOption ? " mcq-answer-correct" : isWrongSelection ? " mcq-answer-incorrect" : ""}`}
                type={multiple ? "checkbox" : "radio"}
                name={`mcq-${questionId}`}
                label={`${String.fromCharCode(65 + index)}. ${option.optionText}`}
                checked={selected.includes(option.optionId)}
                disabled={busy || !!result}
                onChange={() =>
                  setSelected((previous) =>
                    multiple
                      ? previous.includes(option.optionId)
                        ? previous.filter((id) => id !== option.optionId)
                        : [...previous, option.optionId]
                      : [option.optionId],
                  )
                }
              />
            );
          })}
          {result && (
            <Alert variant={correct ? "success" : "danger"}>
              {correct
                ? "Correct answer."
                : "You attempted an incorrect answer."}
              {!correct && (
                <div>
                  Correct answer:{" "}
                  {options
                    .filter((option) =>
                      correctOptionIds.has(String(option.optionId)),
                    )
                    .map((option) => option.optionText)
                    .join(", ")}
                </div>
              )}
            </Alert>
          )}
        </Card.Body>
      </Card>
      <div className="matching-nav-row matching-nav-bottom">
        <div className="matching-nav-left">
          <Button
            className="matching-prev-btn"
            disabled={busy || questionNumber <= 1 || typeof onPrevious !== "function"}
            onClick={onPrevious}
          >
            ← Previous 
          </Button>
        </div>

        <div className="matching-nav-right">
          <Button
            className="matching-next-btn"
            disabled={busy || questionNumber >= totalQuestions || typeof onNext !== "function"}
            onClick={onNext}
          >
            Next  →
          </Button>
        </div>
      </div>
    </div>
  );
}
