/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExamQuestionRenderer from "./ExamQuestionRenderer";
import ExamService from "../../services/ExamService";
import ExamTopBar from "./ExamShell/ExamTopBar";
import QuestionRail from "./ExamShell/QuestionRail";
import ExamStartScreen from "./ExamShell/ExamStartScreen";
import SubmitConfirmDialog from "./ExamShell/SubmitConfirmDialog";
import TimeUpDialog from "./ExamShell/TimeUpDialog";
import ExamResultDialog from "./ExamShell/ExamResultDialog";
import useExamSessionStore from "./ExamComponents/examSessionStore";
import useExamQuestionStore from "./ExamComponents/examQuestionStore";
import { buildSubmission } from "./ExamComponents/buildSubmission";
import { loadSampleQuestions } from "./sampleData";
import "./ExamShell/examTokens.css";
import styles from "./ExamPage.module.css";

const EXAM_MINUTES = 60;
const MAX_WARNINGS = 3;

const ResetIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);

const MarkIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M5 21V4h13l-2 4 2 4H5" />
  </svg>
);

// A question counts as answered once the candidate has put something into it.
// Journal and dropdown questions record that in examSessionStore; drag-and-drop
// placements live in examQuestionStore. Both are keyed by question id, so this
// reports correctly for every question, not just the one on screen.
const hasAnswer = (questionId, sessionById, examDragById) => {
  const answeredData = sessionById[questionId]?.answeredData;

  if (
    answeredData &&
    Object.values(answeredData).some((rows) => (rows ?? []).length > 0)
  ) {
    return true;
  }

  const droppableData = examDragById[questionId]?.droppableData;

  if (
    droppableData &&
    Object.values(droppableData).some((rows) => (rows ?? []).length > 0)
  ) {
    return true;
  }

  return false;
};

const ExamPage = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const shellRef = useRef(null);

  const [phase, setPhase] = useState("start");
  const [endReason, setEndReason] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [visited, setVisited] = useState(() => new Set());
  const [marked, setMarked] = useState(() => new Set());
  const [secondsLeft, setSecondsLeft] = useState(EXAM_MINUTES * 60);
  const [warnings, setWarnings] = useState(0);
  const [bannerMessage, setBannerMessage] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);

  // "idle" until the attempt ends; then the submit call to the API drives it
  // through "submitting" -> "done" / "error". Only used for a real paper
  // (an :examId); the sample paper never submits.
  const [submitState, setSubmitState] = useState("idle");
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const submitOnce = useRef(false);

  const sessionById = useExamSessionStore((state) => state.byQuestionId);
  const resetQuestion = useExamSessionStore((state) => state.resetQuestion);
  const clearSession = useExamSessionStore((state) => state.reset);
  const examDragById = useExamQuestionStore((state) => state.byQuestionId);
  const resetDragQuestion = useExamQuestionStore((state) => state.resetQuestion);
  const clearDragState = useExamQuestionStore((state) => state.reset);

  useEffect(() => {
    const load = async () => {
      try {
        // /exams/:examId loads the paper from the API; /exam-mine keeps the
        // built-in sample paper. The two share the same shell below.
        if (examId) {
          const response = await ExamService.getExamQuestions(examId);
          const apiQuestions = Array.isArray(response.data) ? response.data : [];

          if (apiQuestions.length === 0) {
            setError("This paper doesn't have any questions yet.");
          }

          setQuestions(
            apiQuestions.map((question) => ({
              id: question.questionId,
              question,
            })),
          );
        } else {
          setQuestions(await loadSampleQuestions());
        }
      } catch (loadError) {
        console.error("Failed to load exam questions:", loadError);
        setError("We couldn't load this paper. Refresh to try again.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [examId]);

  // --- countdown -----------------------------------------------------------
  useEffect(() => {
    if (phase !== "running") return undefined;

    const id = window.setInterval(
      () => setSecondsLeft((value) => Math.max(0, value - 1)),
      1000,
    );

    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "running" && secondsLeft === 0) endExam("time");
  }, [phase, secondsLeft]);

  // --- fullscreen and warnings ---------------------------------------------
  // The rule shown on the start screen: leaving fullscreen or switching away
  // costs a warning, and the third one submits the paper. This is the rule the
  // design assumed - swap it here if the real invigilation rule differs.
  useEffect(() => {
    const syncFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", syncFullscreen);
    syncFullscreen();

    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (phase !== "running") return undefined;

    const strike = (cause, consequence) => {
      setBannerMessage({ cause, consequence });
      setWarnings((count) => Math.min(MAX_WARNINGS, count + 1));
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        strike(
          "You left fullscreen.",
          "Two more warnings and the exam submits automatically.",
        );
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        strike(
          "You switched away from the exam.",
          "Two more warnings and the exam submits automatically.",
        );
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "running" && warnings >= MAX_WARNINGS) endExam("warnings");
  }, [phase, warnings]);

  // --- derived progress ----------------------------------------------------
  const answeredIds = useMemo(() => {
    const ids = new Set();

    questions.forEach(({ id }) => {
      if (hasAnswer(id, sessionById, examDragById)) ids.add(id);
    });

    return ids;
  }, [questions, sessionById, examDragById]);

  const railQuestions = questions.map(({ id }) => ({
    id,
    isAnswered: answeredIds.has(id),
    isMarked: marked.has(id),
  }));

  const activeQuestion = questions[activeIndex];
  const paper = questions[0]?.question;
  const isMarked = activeQuestion ? marked.has(activeQuestion.id) : false;

  // --- actions -------------------------------------------------------------
  // Fullscreen can be refused outright - a permissions policy, an embedded
  // context, an older browser - and some of those refusals throw synchronously
  // rather than rejecting. Starting the exam must never depend on it: the paper
  // still runs, the fullscreen rule simply never fires.
  const enterFullscreen = async () => {
    try {
      await shellRef.current?.requestFullscreen?.();
    } catch {
      /* stay windowed */
    }
  };

  const startExam = async () => {
    setPhase("running");
    if (questions[0]) setVisited(new Set([questions[0].id]));
    await enterFullscreen();
  };

  // Send the attempt for marking. Guarded so the auto-submit paths (time up,
  // third warning) plus a manual submit can't fire it twice; a failure clears
  // the guard so the candidate can retry from the result dialog.
  const runSubmit = async () => {
    if (submitOnce.current) return;
    submitOnce.current = true;

    setSubmitState("submitting");
    setSubmitError(null);

    try {
      const payload = buildSubmission({
        questions,
        sessionById,
        examDragById,
        userId: Number(localStorage.getItem("userId")) || undefined,
      });

      // What we're actually sending for marking. Expand the object in the
      // console; the JSON string is here for copy/paste into Postman etc.
      console.groupCollapsed(
        `[exam submit] POST /api/exams/${examId}/submit — ${payload.answers.length} question(s)`,
      );
      console.log("payload:", payload);
      console.log("payload (JSON):", JSON.stringify(payload, null, 2));
      console.groupEnd();

      const response = await ExamService.submitExam(examId, payload);

      setResult(response?.data ?? null);
      setSubmitState("done");

      // The attempt is in - drop every cached answer so nothing carries over
      // to a later paper. Payload is already built and sent by this point.
      clearSession();
      clearDragState();
    } catch (submitFailure) {
      console.error("Failed to submit exam:", submitFailure);
      submitOnce.current = false;
      setSubmitError(
        submitFailure?.response?.data?.message ||
          "We couldn't reach the server.",
      );
      setSubmitState("error");
    }
  };

  const endExam = (reason) => {
    setEndReason(reason);
    setPhase("ended");
    setConfirmingSubmit(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  };

  // However the attempt ended (submit button, time up, third warning): a real
  // paper is sent for marking once (runSubmit guards itself, and clears the
  // cached answers after the payload is sent). The sample paper (/exam-mine)
  // has no endpoint, so it just clears and falls through to TimeUpDialog.
  useEffect(() => {
    if (phase !== "ended") return;

    if (examId) {
      void runSubmit();
    } else {
      clearSession();
      clearDragState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, examId]);

  const goToIndex = (index) => {
    if (!questions.length) return;

    const next = Math.min(Math.max(0, index), questions.length - 1);

    setActiveIndex(next);
    setVisited((current) => new Set(current).add(questions[next].id));
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    } else {
      await enterFullscreen();
    }
  };

  const returnToFullscreen = async () => {
    setBannerMessage(null);
    await enterFullscreen();
  };

  const toggleMark = () => {
    if (!activeQuestion) return;

    setMarked((current) => {
      const next = new Set(current);
      next.has(activeQuestion.id)
        ? next.delete(activeQuestion.id)
        : next.add(activeQuestion.id);
      return next;
    });
  };

  // Clearing the stores is enough: the question pages refetch themselves when
  // their cached entry disappears.
  const resetActiveQuestion = () => {
    if (!activeQuestion) return;

    resetQuestion(activeQuestion.id);
    resetDragQuestion(activeQuestion.id);
  };

  // --- render --------------------------------------------------------------
  if (phase === "start") {
    return (
      <main className={`examRoot ${styles.shell} ${styles.startShell}`} ref={shellRef}>
        <ExamStartScreen
          error={error}
          eyebrow={
            paper ? `${paper.courseName} · ${paper.chapterName}` : "Practice exam"
          }
          isLoading={loading}
          meta={[
            { label: "Questions", value: String(questions.length || "—") },
            { label: "Duration", value: `${EXAM_MINUTES}m` },
            { label: "Warnings", value: String(MAX_WARNINGS) },
          ]}
          onStart={startExam}
          rules={[
            "The exam runs in fullscreen. Leaving fullscreen or switching tabs costs one warning.",
            `Three warnings and the paper is submitted automatically — you'll always see how many are left.`,
            "Move freely between questions; mark any question to come back to it.",
            "Answers are kept as you go. Navigating between questions won't lose your work.",
          ]}
          title={paper?.categoryName ?? "Practice exam"}
        />
      </main>
    );
  }

  return (
    <main className={`examRoot ${styles.shell}`} ref={shellRef}>
      <ExamTopBar
        bannerMessage={phase === "running" ? bannerMessage : null}
        eyebrow={paper ? `${paper.courseName} · ${paper.chapterName}` : ""}
        isFullscreen={fullscreen}
        maxWarnings={MAX_WARNINGS}
        onDismissBanner={returnToFullscreen}
        onToggleFullscreen={toggleFullscreen}
        progressPct={
          questions.length ? (answeredIds.size / questions.length) * 100 : 0
        }
        secondsLeft={secondsLeft}
        title={paper?.categoryName ?? ""}
        warnings={warnings}
      />

      <div className={styles.body}>
        <QuestionRail
          activeIndex={activeIndex}
          answeredCount={answeredIds.size}
          markedCount={marked.size}
          onJump={goToIndex}
          questions={railQuestions}
          visitedCount={visited.size}
        />

        <div className={styles.main}>
          <div className={styles.questionArea}>
            {activeQuestion && (
              <div className={styles.questionHead}>
                <div className={styles.questionIdentity}>
                  <span className={styles.questionChip}>Q{activeIndex + 1}</span>
                  <div>
                    <div className={styles.questionTitle}>
                      {activeQuestion.question?.questionText}
                    </div>
                    <div className={styles.questionMeta}>
                      {[
                        activeQuestion.question?.courseName,
                        activeQuestion.question?.chapterName,
                        activeQuestion.question?.categoryName,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                </div>
                <button
                  className={styles.resetButton}
                  onClick={resetActiveQuestion}
                  type="button"
                >
                  <ResetIcon />
                  Reset
                </button>
              </div>
            )}

            {error ? (
              <p className={styles.status} role="alert">
                {error}
              </p>
            ) : loading ? (
              <p className={styles.status}>Loading exam questions…</p>
            ) : (
              // Once the paper is submitted the cached answers are wiped; not
              // rendering the question here keeps the pages from refetching
              // themselves (and re-hitting RuleEngine) behind the result dialog.
              phase === "running" &&
              activeQuestion && (
                <ExamQuestionRenderer
                  key={activeQuestion.id}
                  questionId={activeQuestion.id}
                  question={activeQuestion.question}
                />
              )
            )}
          </div>

          <footer className={styles.footer}>
            <button
              className={[styles.markButton, isMarked && styles.markButtonActive]
                .filter(Boolean)
                .join(" ")}
              onClick={toggleMark}
              type="button"
            >
              <MarkIcon />
              {isMarked ? "Marked for review" : "Mark for review"}
            </button>

            <div className={styles.pagination}>
              <button
                className={styles.previous}
                disabled={activeIndex === 0}
                onClick={() => goToIndex(activeIndex - 1)}
                type="button"
              >
                ‹ Previous
              </button>
              <button
                className={styles.next}
                disabled={activeIndex >= questions.length - 1}
                onClick={() => goToIndex(activeIndex + 1)}
                type="button"
              >
                Next ›
              </button>
              <div className={styles.footerDivider} />
              <button
                className={styles.submit}
                onClick={() => setConfirmingSubmit(true)}
                type="button"
              >
                Submit exam
              </button>
            </div>
          </footer>
        </div>
      </div>

      {confirmingSubmit && phase === "running" && (
        <SubmitConfirmDialog
          answered={answeredIds.size}
          marked={marked.size}
          onCancel={() => setConfirmingSubmit(false)}
          onConfirm={() => endExam("manual")}
          secondsLeft={secondsLeft}
          unattempted={questions.length - answeredIds.size}
        />
      )}

      {phase === "ended" &&
        (examId ? (
          <ExamResultDialog
            attempted={answeredIds.size}
            error={submitError}
            onExit={() => navigate("/exams")}
            onRetry={runSubmit}
            result={result}
            state={submitState}
            total={questions.length}
          />
        ) : (
          <TimeUpDialog
            attempted={answeredIds.size}
            onExit={() => navigate("/")}
            reason={endReason}
            total={questions.length}
          />
        ))}
    </main>
  );
};

export default ExamPage;
