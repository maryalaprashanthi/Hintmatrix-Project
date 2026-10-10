import { DragDropProvider } from "@dnd-kit/react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import QuestionTable from "./QuestionTable";
import DragAndDropWithAdj from "./DragAndDropWithAdj";
import { normalizeQuestionType } from "../../utils/questionType";
import useQuestionStore, { getRuleAnswers } from "./questionStore";

import JournalPage from "../JournalQuestion/JournalPage";
import DropdownPage from "../DropdownQuestions/DropdownPage";
import McqQuestionView from "./McqQuestionView";
import MatchingQuestionView from "./MatchingQuestionView";
import FillInBlankQuestionView from "./FillInBlankQuestionView";

import RuleEngineService from "../../services/RuleEngineService";
import QuestionService from "../../services/QuestionService";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import QuestionTypeService from "../../services/QuestionTypeService";
import MatchingQuestionService from "../../services/MatchingQuestionService";
import FillInBlankQuestionService from "../../services/FillInBlankQuestionService";

import { data, normalizeFinalAccountTarget } from "./SampleData";
import { getCurrentUserId } from "../../utils/user";
import { buildQuestionSequence, getQuestionNavigationIds, questionDisplayNumber, questionIndex } from "../../utils/questionNavigation";

import QuestionNavigation from "./QuestionNavigation";
import "./QuestionPage.css";

// =============================================================
// QUESTION TYPE
// =============================================================

const getQuestionType = (question) => {
  const type =
    question?.questionType?.name ??
    question?.questionType ??
    question?.type?.name ??
    question?.name ??
    question?.questionTypeName ??
    question?.question_type_name ??
    question?.typeName;

  if (typeof type === "string") {
    if (normalizeQuestionType(type) === "DRAG_AND_DROP_WITH_ADJ") return "DRAG_AND_DROP_WITH_ADJ";
    const normalizedType = type.trim().toUpperCase().replace(/\s+/g, "_");

    const normalizedQuestionType = normalizedType.replace(/-/g, "_");

    if (normalizedQuestionType === "DRAGANDDROP") {
      return "DRAG_AND_DROP";
    }

    if (
      normalizedQuestionType === "MATCHING" ||
      normalizedQuestionType === "MATCH_THE_FOLLOWING" ||
      normalizedQuestionType.includes("MATCHING") ||
      normalizedQuestionType.includes("MATCH_THE_FOLLOWING")
    ) {
      return "MATCH_THE_FOLLOWING";
    }

    if (
      normalizedQuestionType.includes("FILL") &&
      normalizedQuestionType.includes("BLANK")
    ) {
      return "FILL_IN_THE_BLANKS";
    }

    return normalizedQuestionType;
  }

  return null;
};

// =============================================================
// QUESTION MAP
// =============================================================

const questionMap = {
  credit: "credit particulars",
  debit: "debit particulars",
};

// =============================================================
// ANSWER MAP
// =============================================================

const answerMap = {
  dr: "debit particulars",
  cr: "credit particulars",
  pnl: "Profit & Loss Account",
  liabilities: "Liabilities Side",
  assets: "Asset Side",
  trading: "Trading Account",
  balance: "Balance Sheet",
  add: "ADD",
  less: "SUBTRACT",
};

// =============================================================
// QUESTION PAGE
// =============================================================

const QuestionPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { state: navigationState } = useLocation();

  const {
    moveQuestion,
    setQuestions,
    setError,
    setHints,
    setTotalAnswers,
    setTableData,
    setActualAnswers,
    setCurrentScore,
    setAttributeId,
  } = useQuestionStore();

  // ===========================================================
  // STATE
  // ===========================================================

  const [questionType, setQuestionType] = useState(null);

  const isMcq = [
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "MCQ_SINGLE_CHOICE",
    "MCQ_MULTIPLE_CHOICE",
  ].includes(questionType);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [placementError, setPlacementError] = useState("");

  const [matchingQuestion, setMatchingQuestion] = useState(null);

  // All questions for navigation
  const [testQuestions, setTestQuestions] = useState([]);

  // Current question index
  const currentQuestionIndex = questionIndex(testQuestions, questionId);
  const displayQuestionNumber = questionDisplayNumber(
    testQuestions, questionId, navigationState?.questionNavigationNumbers,
  );

  // Completed questions
  const [completedQuestions, setCompletedQuestions] = useState({});

  const [testSubmitted, setTestSubmitted] = useState(false);

  // ===========================================================
  // TOTAL QUESTIONS
  // ===========================================================

  const totalQuestions = testQuestions.length || 1;

  // ===========================================================
  // CURRENT QUESTION
  // ===========================================================

  const currentQuestion =
    testQuestions.length > 0
      ? testQuestions[currentQuestionIndex]
      : matchingQuestion;

  // ===========================================================
  // COMPLETED COUNT
  // ===========================================================

  const completedCount =
    Object.values(completedQuestions).filter(Boolean).length;

  // ===========================================================
  // LOAD QUESTION
  // ===========================================================

  const loadQuestions = useCallback(async (qId, isCurrent = () => true) => {
    try {
      const response = await QuestionService.getQuestionById(qId || questionId);
      if (!isCurrent()) return null;

      const allStrings = data.flatMap((obj) =>
        obj.headers.map((header) => `${obj.name}-${header}`),
      );

      await setQuestions([response.data]);
      if (!isCurrent()) return null;

      setMatchingQuestion(response.data);

      setTableData(allStrings);

      return response;
    } catch (error) {
      console.error("Failed to load question:", error);

      return null;
    }
  }, [questionId, setQuestions, setMatchingQuestion, setTableData]);

  // ===========================================================
  // LOAD TEST QUESTIONS
  // ===========================================================

  const loadTestQuestions = useCallback(async (currentQuestionData, isCurrent = () => true) => {
    try {
      const navigationIds = getQuestionNavigationIds(
        navigationState?.questionNavigationIds, currentQuestionData?.questionId,
      );
      if (navigationIds.length > 0) {
        setTestQuestions(buildQuestionSequence([], currentQuestionData, navigationIds));
        return;
      }
      const courseId = currentQuestionData?.courseId;

      const chapterId = currentQuestionData?.chapterId;

      const topicId =
        currentQuestionData?.topicId ?? currentQuestionData?.categoryId;

      if (!courseId || !chapterId || !topicId) {
        setTestQuestions([currentQuestionData]);


        return;
      }

      const response = await QuestionService.getQuestionsByMapping(
        courseId,
        chapterId,
        topicId,
      );
      if (!isCurrent()) return;

      const result = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      setTestQuestions(buildQuestionSequence(result, currentQuestionData));
    } catch (error) {
      console.error("Failed to load test questions:", error);

      if (isCurrent()) setTestQuestions([currentQuestionData]);
    }
  }, [navigationState, setTestQuestions]);

  // ===========================================================
  // LOAD ANSWERED QUESTIONS
  // ===========================================================

  const loadAnsweredQuestions = useCallback(async (isCurrent = () => true) => {
    const correctAnswers =
      await QuestionAnswerService.getAnswersByUserAndQuestion(
        getCurrentUserId(),
        questionId,
      );

    if (!isCurrent()) return;

    const savedAnswers = Array.isArray(correctAnswers) ? correctAnswers : [];

    if (savedAnswers.length === 0) {
      return;
    }

    const rows = useQuestionStore.getState().questions;
    const groupedAnswers = new Map();
    for (const answer of savedAnswers) {
      if (!answer) continue;
      const candidates = rows.filter((row) =>
        answer.questionAttributeId != null
          ? String(row.questionAttributeId) ===
            String(answer.questionAttributeId)
          : String(row.attributeId) === String(answer.attributeId),
      );
      // Old answers did not identify repeated trial-balance accounts. Preserve
      // them in storage without incorrectly assigning one balance to another.
      if (candidates.length !== 1) {
        setPlacementError(
          "Some older saved answers cannot identify a repeated account row. Reset the question to place those balances again.",
        );
        continue;
      }
      const row = candidates[0];
      const entries = groupedAnswers.get(row.id) ?? [];
      entries.push(answer);
      groupedAnswers.set(row.id, entries);
    }
    for (const [sourceId, answers] of groupedAnswers) {
      setTotalAnswers(
        sourceId,
        Math.max(
          answers.length,
          ...answers.map((answer) => Number(answer.totalAnswers) || 1),
        ),
      );
      for (const answer of answers) {
        moveQuestion(
          sourceId,
          normalizeFinalAccountTarget(
            `${answer.tableName}-${answer.headerName}-${answer.arithmetic}`,
          ),
          answer.conditionId,
          answer.pairAttributeId,
          answer.amount,
        );
      }
    }
  }, [questionId, setPlacementError, setTotalAnswers, moveQuestion]);

  // ===========================================================
  // LOAD QUESTION
  // ===========================================================

  useEffect(() => {
    let active = true;
    const isCurrent = () => active;
    const init = async () => {
      setIsLoading(true);
      setLoadError("");
      setPlacementError("");

      try {
        const response = await loadQuestions(questionId, isCurrent);

        if (!active || !response?.data) {
          if (active) setLoadError("Unable to load this question. Please refresh to retry.");
          return;
        }

        let type = getQuestionType(response.data);
        const questionTypeId = response.data?.questionTypeId ?? response.data?.question_type_id;

        if (!type && questionTypeId) {
          const typeResponse = await QuestionTypeService.getById(questionTypeId);
          if (!active) return;
          type = getQuestionType(typeResponse?.data);
        }

        let questionData = response.data;

        if (type === "MATCH_THE_FOLLOWING" && !Array.isArray(questionData?.pairs)) {
          try {
            const matchingResponse = await MatchingQuestionService.getById(
              questionData.questionId ?? questionId,
            );
            if (!active) return;
            questionData = { ...questionData, ...matchingResponse.data };
            setMatchingQuestion(questionData);
          } catch (matchingError) {
            console.error("Failed to load matching pairs:", matchingError);
          }
        }

        if (type === "FILL_IN_THE_BLANKS" && !Array.isArray(questionData?.blanks)) {
          try {
            const fillBlankResponse = await FillInBlankQuestionService.getById(
              questionData.questionId ?? questionId,
            );
            if (!active) return;
            questionData = { ...questionData, ...fillBlankResponse.data };
            setMatchingQuestion(questionData);
          } catch (fillBlankError) {
            console.error("Failed to load fill-in-the-blanks data:", fillBlankError);
          }
        }

        if (!active) return;
        setQuestionType(type);
        await loadTestQuestions(questionData, isCurrent);
        if (!active) return;
        if (type === "DRAG_AND_DROP") await loadAnsweredQuestions(isCurrent);
      } catch (error) {
        console.error("Failed to initialize question:", error);
        if (active) setLoadError("Unable to load this question. Please refresh to retry.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    init();
    return () => { active = false; };
  }, [questionId, navigationState, loadQuestions, loadTestQuestions, loadAnsweredQuestions]);

  // ===========================================================
  // QUESTION COMPLETED
  // ===========================================================

  const handleQuestionCompleted = (completedQuestionId) => {
    setCompletedQuestions((previous) => ({
      ...previous,
      [completedQuestionId]: true,
    }));
  };

  // ===========================================================
  // SELECT QUESTION

  // ===========================================================

  const handleSelectQuestion = (index) => {
    if (isLoading || currentQuestionIndex < 0 ||
        String(matchingQuestion?.questionId) !== String(questionId)) return;
    if (index < 0 || index >= testQuestions.length) {
      return;
    }

    const target = testQuestions[index];

    if (!target?.questionId || String(target.questionId) === String(questionId)) {
      return;
    }

    setCurrentScore(0);

    navigate(`/questions/${target.questionId}`, {
      state: {
        questionNavigationIds: testQuestions.map((row) => String(row.questionId)),
        questionNavigationNumbers: navigationState?.questionNavigationNumbers,
      },
    });
  };

  // ===========================================================
  // NEXT QUESTION
  // ===========================================================

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= 0 && currentQuestionIndex < testQuestions.length - 1) {
      handleSelectQuestion(currentQuestionIndex + 1);
    }
  };

  // ===========================================================
  // PREVIOUS QUESTION
  // ===========================================================

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      handleSelectQuestion(currentQuestionIndex - 1);
    }
  };

  // ===========================================================
  // SUBMIT TEST
  // ===========================================================

  const handleSubmitTest = () => {
    setTestSubmitted(true);

    alert(`Test submitted.\nCompleted: ${completedCount} / ${totalQuestions}`);
  };

  // ===========================================================
  // LOADING
  // ===========================================================

  if (loadError && !isLoading) return <div className="alert alert-danger" role="alert">{loadError}</div>;
  if (isLoading || String(matchingQuestion?.questionId) !== String(questionId)) {
    return <div className="question-page-loading">Loading question...</div>;
  }

  // ===========================================================
  // TEST SUBMITTED
  // ===========================================================

  if (testSubmitted) {
    return (
      <div className="test-completed-screen">
        <div className="test-completed-card">
          <div className="completed-icon">✓</div>

          <h2>Test Submitted</h2>

          <p>
            You completed <strong>{completedCount}</strong> out of{" "}
            <strong>{totalQuestions}</strong> questions.
          </p>
        </div>
      </div>
    );
  }

  // ===========================================================
  // JOURNAL
  // ===========================================================

  if (questionType === "JOURNAL") {
    return (
      <JournalPage
        displayQuestionNumber={displayQuestionNumber}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
      />
    );
  }

  // if (isMcq) {
  //   return (
  //     <McqQuestionView
  //       key={questionId}
  //       questionId={questionId}
  //       questionType={questionType}
  //     />
  //   );
  // }
  if (isMcq) {
    return (
      <McqQuestionView
        displayQuestionNumber={displayQuestionNumber}
        key={questionId}
        questionId={questionId}
        questionType={questionType}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
      />
    );
  }
  // ===========================================================
  // DROPDOWN
  // ===========================================================

  if (questionType === "DROPDOWN") {
    return (
      <DropdownPage
        displayQuestionNumber={displayQuestionNumber}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
      />
    );
  }

  if (questionType === "FILL_IN_THE_BLANKS") {
    return (
      <FillInBlankQuestionView
        displayQuestionNumber={displayQuestionNumber}
        key={(currentQuestion || matchingQuestion)?.questionId}
        question={currentQuestion || matchingQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        completedCount={completedCount}
        questions={testQuestions}
        completedQuestions={completedQuestions}
        onCompleted={handleQuestionCompleted}
        onQuestionSelect={handleSelectQuestion}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
        onSubmitTest={handleSubmitTest}
      />
    );
  }

  // ===========================================================
  // MATCH THE FOLLOWING
  // ===========================================================

  if (questionType === "MATCH_THE_FOLLOWING") {
    return (
      <MatchingQuestionView
        displayQuestionNumber={displayQuestionNumber}
        key={(currentQuestion || matchingQuestion)?.questionId}
        question={currentQuestion || matchingQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        completedCount={completedCount}
        questions={testQuestions}
        completedQuestions={completedQuestions}
        onCompleted={handleQuestionCompleted}
        onQuestionSelect={handleSelectQuestion}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
      />
    );
  }

  // ===========================================================
  // DRAG AND DROP
  // ===========================================================

  if (questionType === "DRAG_AND_DROP_WITH_ADJ") {
    return <DragAndDropWithAdj key={currentQuestion?.questionId}
      question={currentQuestion || matchingQuestion} onCompleted={handleQuestionCompleted}
      questionNumber={currentQuestionIndex + 1} displayQuestionNumber={displayQuestionNumber}
      totalQuestions={totalQuestions} onPrevious={handlePreviousQuestion} onNext={handleNextQuestion} />;
  }

  if (questionType !== "DRAG_AND_DROP") {
    return <div>Unsupported question type.</div>;
  }

  // ===========================================================
  // EXISTING DRAG DROP
  // ===========================================================

  return (
    <DragDropProvider
      onDragEnd={async (Event) => {
        if (Event.canceled) {
          return;
        }

        const sourceId = Event.operation.source.id;

        const targetId = Event.operation.target?.id;

        if (targetId == null) {
          return;
        }

        const [first, second, third] = targetId.split("-");
        const operation = useQuestionStore
          .getState()
          .beginOperation(questionId, "drop");
        if (!operation) return;

        try {
          let myQuestion = useQuestionStore
            .getState()
            .questions.find((q) => String(q.id) === String(sourceId));
          if (!myQuestion || myQuestion.status === "solved") return;
          let actualAnswers = myQuestion.actualAnswers;

          if (myQuestion.actualAnswers.length === 0) {
            const response = await RuleEngineService.getAttributeAnswers(
              myQuestion.attributeId,
            );
            if (!useQuestionStore.getState().isOperationCurrent(operation))
              return;
            myQuestion = useQuestionStore
              .getState()
              .questions.find((q) => String(q.id) === String(sourceId));
            if (!myQuestion) return;

            actualAnswers = getRuleAnswers(
              response,
              useQuestionStore.getState().question.chapterId,
              myQuestion,
            ).map((answer) => ({
              ...answer,
              answer: normalizeFinalAccountTarget(answer.answer),
            }));

            setActualAnswers(sourceId, actualAnswers);
            setTotalAnswers(sourceId, actualAnswers.length);
            setHints(
              sourceId,
              actualAnswers.map((answer) => answer.information).filter(Boolean),
            );
          }
          setPlacementError("");
          const answeredIds = myQuestion.answered.map(
            (answer) => answer.conditionId,
          );
          const correctAnswer = actualAnswers.find(
            (answer) =>
              answer.answer === targetId &&
              !answeredIds.includes(answer.conditionId),
          );
          if (!correctAnswer) {
            // Dropping onto an already completed destination is a harmless no-op.
            if (actualAnswers.some((answer) => answer.answer === targetId))
              return;
            if (myQuestion.status !== "wrong") {
              setError(sourceId);
            } else {
              // The row was already wrong, so setError does not run again.
              // Open its popover anyway, so that every wrong drop shows Hint
              // and Auto Fill.
              useQuestionStore.getState().openErrorPopover(sourceId);
            }
            const attemptedAnswer =
              actualAnswers.find(
                (answer) =>
                  answer.conditionId === myQuestion.attemptingId &&
                  !answeredIds.includes(answer.conditionId),
              ) ??
              actualAnswers.find(
                (answer) => !answeredIds.includes(answer.conditionId),
              );
            if (!attemptedAnswer) return;
            setAttributeId(sourceId, attemptedAnswer.conditionId);

            const body = {
              finalAccounts: true,
              userId: getCurrentUserId(),

              questionId: questionId,

              attributeId: myQuestion.attributeId,
              questionAttributeId: myQuestion.questionAttributeId,
              tableName: first,
              headerName: second,
              amount: attemptedAnswer.amount,
              conditionId: attemptedAnswer.conditionId,

              arithmetic: third,

              eventType: "ANSWER",

              answerPosition: attemptedAnswer.conditionId,

              isCorrect: false,

              description: `from ${questionMap[myQuestion.type]} of ${myQuestion.name} is ${attemptedAnswer.amount} >> attempted to ${answerMap[third]} on ${second} of ${first}.`,

              userAnswer: `attempted to ${answerMap[third]} on ${second} of ${first}.`,
            };

            await QuestionAnswerService.processAnswerEvent({
              ...body,
              questionAttributeId: myQuestion.questionAttributeId,
            });
          } else {
            const body = {
              finalAccounts: true,
              userId: getCurrentUserId(),

              questionId: questionId,

              attributeId: myQuestion.attributeId,
              questionAttributeId: myQuestion.questionAttributeId,
              tableNameId: correctAnswer.tableNameId,
              headerId: correctAnswer.headerId,
              tableName: first,
              headerName: second,
              amount: correctAnswer.amount,
              conditionId: correctAnswer.conditionId,

              arithmetic: third,

              answerPosition: correctAnswer.conditionId,

              eventType: myQuestion.usedHint ? "HINT" : "ANSWER",

              isCorrect: true,

              description: `from ${questionMap[myQuestion.type]} of ${myQuestion.name} is ${correctAnswer.amount} >> attempted to ${answerMap[third]} on ${second} of ${first}.`,

              userAnswer: `attempted to ${answerMap[third]} on ${second} of ${first}.`,
            };

            const questionBody = {
              userId: getCurrentUserId(),

              questionId: questionId,

              tableNameId: correctAnswer.tableNameId,

              headerId: correctAnswer.headerId,

              attributeId: myQuestion.attributeId,
              questionAttributeId: myQuestion.questionAttributeId,

              arithmetic: third,

              amount: correctAnswer.amount,

              conditionId: correctAnswer.conditionId,

              pairAttributeId: correctAnswer.pairAttributeId,

              totalAnswers: actualAnswers.length,
            };

            await QuestionAnswerService.processAnswerEvent({
              ...body,
              questionAttributeId: myQuestion.questionAttributeId,
            });
            if (!useQuestionStore.getState().isOperationCurrent(operation))
              return;

            await QuestionAnswerService.saveAnswer(questionBody);
            if (!useQuestionStore.getState().isOperationCurrent(operation))
              return;

            moveQuestion(
              sourceId,
              targetId,
              correctAnswer.conditionId,
              correctAnswer.pairAttributeId,
              correctAnswer.amount,
            );
            try {
              await setCurrentScore(getCurrentUserId());
            } catch (scoreError) {
              console.error("Unable to refresh score:", scoreError);
            }
          }
        } catch (error) {
          setPlacementError(
            error.response?.data?.message ??
              error.message ??
              "Unable to save this placement.",
          );
        } finally {
          useQuestionStore.getState().endOperation(operation);
        }
      }}
    >
      {placementError && (
        <div className="alert alert-warning" role="alert">
          {placementError}
        </div>
      )}
      <QuestionTable questionNumber={displayQuestionNumber} />
      <QuestionNavigation
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
      />
    </DragDropProvider>
  );
};

export default QuestionPage;
