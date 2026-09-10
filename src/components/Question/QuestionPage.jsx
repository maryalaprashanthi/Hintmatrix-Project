import { DragDropProvider } from "@dnd-kit/react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import QuestionTable from "./QuestionTable";
import useQuestionStore from "./questionStore";

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

import { data } from "./SampleData";

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
  pnl: "Profit and Loss Account",
  liabilities: "Liabilities Side",
  assets: "assets",
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

  const {
    moveQuestion,
    setQuestions,
    setError,
    setHints,
    questions,
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

  const [matchingQuestion, setMatchingQuestion] = useState(null);

  // All questions for navigation
  const [testQuestions, setTestQuestions] = useState([]);

  // Current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Completed questions
  const [completedQuestions, setCompletedQuestions] = useState({});

  // Timer - 30 minutes
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const [testSubmitted, setTestSubmitted] = useState(false);

  // ===========================================================
  // TOTAL QUESTIONS
  // ===========================================================

  const totalQuestions = testQuestions.length > 0 ? testQuestions.length : 20;

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
  // PROGRESS
  // ===========================================================

  const progressPercentage =
    totalQuestions > 0
      ? Math.round((completedCount / totalQuestions) * 100)
      : 0;

  // ===========================================================
  // LOAD QUESTION
  // ===========================================================

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      try {
        const response = await loadQuestions(questionId);

        if (!response?.data) {
          return;
        }

        let type = getQuestionType(response.data);

        const questionTypeId =
          response.data?.questionTypeId ?? response.data?.question_type_id;

        if (!type && questionTypeId) {
          const typeResponse =
            await QuestionTypeService.getById(questionTypeId);

          type = getQuestionType(typeResponse?.data);
        }

        let questionData = response.data;

        if (
          type === "MATCH_THE_FOLLOWING" &&
          !Array.isArray(questionData?.pairs)
        ) {
          try {
            const matchingResponse = await MatchingQuestionService.getById(
              questionData.questionId ?? questionId,
            );

            questionData = {
              ...questionData,
              ...matchingResponse.data,
            };
            setMatchingQuestion(questionData);
          } catch (matchingError) {
            console.error("Failed to load matching pairs:", matchingError);
          }
        }

        if (
          type === "FILL_IN_THE_BLANKS" &&
          !Array.isArray(questionData?.blanks)
        ) {
          try {
            const fillBlankResponse = await FillInBlankQuestionService.getById(
              questionData.questionId ?? questionId,
            );

            questionData = {
              ...questionData,
              ...fillBlankResponse.data,
            };
          } catch (fillBlankError) {
            console.error(
              "Failed to load fill-in-the-blanks data:",
              fillBlankError,
            );
          }
        }

        setQuestionType(type);

        // -----------------------------------------------------
        // Load all questions for navigation
        // -----------------------------------------------------

        await loadTestQuestions(questionData);

        // -----------------------------------------------------
        // Restore drag/drop answers
        // -----------------------------------------------------

        if (type === "DRAG_AND_DROP") {
          await loadAnsweredQuestions();
        }
      } catch (error) {
        console.error("Failed to initialize question:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [questionId]);

  // ===========================================================
  // LOAD QUESTION
  // ===========================================================

  const loadQuestions = async (qId) => {
    try {
      const response = await QuestionService.getQuestionById(qId || questionId);

      const allStrings = data.flatMap((obj) =>
        obj.headers.map((header) => `${obj.name}-${header}`),
      );

      console.log("QUESTION RESPONSE:", response.data);

      console.log("QUESTION PAIRS:", response.data?.pairs);

      await setQuestions([response.data]);

      setMatchingQuestion(response.data);

      setTableData(allStrings);

      return response;
    } catch (error) {
      console.error("Failed to load question:", error);

      return null;
    }
  };

  // ===========================================================
  // LOAD TEST QUESTIONS
  // ===========================================================

  const loadTestQuestions = async (currentQuestionData) => {
    try {
      const courseId = currentQuestionData?.courseId;

      const chapterId = currentQuestionData?.chapterId;

      const topicId =
        currentQuestionData?.topicId ??
        currentQuestionData?.topic_id ??
        currentQuestionData?.categoryId;

      if (!courseId || !chapterId || !topicId) {
        setTestQuestions([currentQuestionData]);

        setCurrentQuestionIndex(0);

        return;
      }

      const response = await QuestionService.getQuestionsByMapping(
        courseId,
        chapterId,
        topicId,
      );

      const result = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      // -------------------------------------------------------
      // Remove inactive questions if activeRow exists
      // -------------------------------------------------------

      const activeQuestions = result.filter(
        (question) => question?.activeRow !== false,
      );

      // -------------------------------------------------------
      // If API didn't return the current question,
      // add it.
      // -------------------------------------------------------

      const containsCurrent = activeQuestions.some(
        (question) =>
          Number(question.questionId) ===
          Number(currentQuestionData.questionId),
      );

      let finalQuestions = activeQuestions;

      if (!containsCurrent) {
        finalQuestions = [currentQuestionData, ...activeQuestions];
      }

      // -------------------------------------------------------
      // Keep maximum 20 questions for this test UI
      // -------------------------------------------------------

      finalQuestions = finalQuestions.slice(0, 20);

      setTestQuestions(finalQuestions);

      // -------------------------------------------------------
      // Find current question
      // -------------------------------------------------------

      const currentIndex = finalQuestions.findIndex(
        (question) =>
          Number(question.questionId) ===
          Number(currentQuestionData.questionId),
      );

      setCurrentQuestionIndex(currentIndex >= 0 ? currentIndex : 0);

      console.log("TEST QUESTIONS:", finalQuestions);
    } catch (error) {
      console.error("Failed to load test questions:", error);

      setTestQuestions([currentQuestionData]);

      setCurrentQuestionIndex(0);
    }
  };

  // ===========================================================
  // LOAD ANSWERED QUESTIONS
  // ===========================================================

  const loadAnsweredQuestions = async () => {
    const correctAnswers =
      await QuestionAnswerService.getAnswersByQuestionId(questionId);

    console.log("Completed data ", correctAnswers);

    const savedAnswers = Array.isArray(correctAnswers) ? correctAnswers : [];

    if (savedAnswers.length === 0) {
      console.warn("No saved answers to restore:", correctAnswers);

      return;
    }

    const answerMap = savedAnswers.reduce((map, answer) => {
      if (!answer) {
        return map;
      }

      const entries = (map[answer.attributeId] = map[answer.attributeId] || []);

      entries.push({
        totalAnswers: answer.totalAnswers,

        targetId: `${answer.tableName}-${answer.headerName}-${answer.arithmetic}`,

        conditionId: answer.conditionId,

        pairAttributeId: answer.pairAttributeId,
      });

      return map;
    }, {});

    console.log("I have data in answerMap: ", answerMap);

    for (const [sourceId, answers] of Object.entries(answerMap)) {
      const attributeId = Number(sourceId);

      await setTotalAnswers(attributeId, answers[0].totalAnswers);

      for (const obj of answers) {
        await moveQuestion(
          attributeId,
          obj.targetId,
          obj.conditionId,
          obj.pairAttributeId,
        );
      }
    }
  };

  // ===========================================================
  // TIMER
  // ===========================================================

  useEffect(() => {
    if (testSubmitted || isMcq) {
      return;
    }

    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testSubmitted, isMcq]);

  // ===========================================================
  // FORMAT TIMER
  // ===========================================================

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }, [timeLeft]);

  // ===========================================================
  // QUESTION COMPLETED
  // ===========================================================

  const handleQuestionCompleted = (completedQuestionId, questionScore) => {
    setCompletedQuestions((previous) => ({
      ...previous,
      [completedQuestionId]: true,
    }));

    console.log(
      "Completed question:",
      completedQuestionId,
      "Score:",
      questionScore,
    );
  };

  // ===========================================================
  // SELECT QUESTION
  // ===========================================================

  const handleSelectQuestion = (index) => {
    if (index < 0 || index >= testQuestions.length) {
      return;
    }

    setCurrentQuestionIndex(index);

    const selected = testQuestions[index];

    setMatchingQuestion(selected);

    setQuestionType(getQuestionType(selected));

    setCurrentScore(0);
  };

  // ===========================================================
  // NEXT QUESTION
  // ===========================================================

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
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

  if (isLoading) {
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
    return <JournalPage />;
  }

  if (isMcq) {
    return (
      <McqQuestionView
        key={questionId}
        questionId={questionId}
        questionType={questionType}
      />
    );
  }

  // ===========================================================
  // DROPDOWN
  // ===========================================================

  if (questionType === "DROPDOWN") {
    return <DropdownPage />;
  }

  if (questionType === "FILL_IN_THE_BLANKS") {
    return (
      <FillInBlankQuestionView
        question={currentQuestion || matchingQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        completedCount={completedCount}
        questions={testQuestions}
        completedQuestions={completedQuestions}
        onCompleted={handleQuestionCompleted}
        onQuestionSelect={handleSelectQuestion}
        onNext={handleNextQuestion}
        formattedTime={formattedTime}
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
          console.log("I did nothing");

          return;
        }

        console.log(`I got dropped into ${targetId}`);

        const myQuestion = questions.find((q) => q.id == sourceId);

        if (!myQuestion) {
          return;
        }

        for (const cur of myQuestion.answered) {
          if (cur === targetId) {
            console.log("This was already added");

            return;
          }
        }

        const [first, second, third] = targetId.split("-");

        let count = 0;

        try {
          let actualAnswers = myQuestion.actualAnswers;

          if (myQuestion.actualAnswers.length === 0) {
            const response =
              await RuleEngineService.getAttributeAnswers(sourceId);

            const apiData = response[0];

            let allHints = [];

            for (let i = 1; i <= 4; i++) {
              const pairId = apiData.pairAttributeId;

              const condition = apiData[`condition${i}`];

              if (condition.arithmetic == null) {
                continue;
              }

              count++;

              allHints.push(condition.information);

              const string = `${condition.tableName}-${condition.headerName}-${condition.arithmetic}`;

              actualAnswers.push({
                conditionId: i,
                answer: string,
                tableNameId: condition.tableId,
                headerId: condition.headerId,
                pairAttributeId: pairId,
              });
            }

            setActualAnswers(sourceId, actualAnswers);

            setTotalAnswers(sourceId, count);

            setHints(sourceId, allHints);
          }

          if (count === 0) {
            count = myQuestion.totalAnswers;
          }

          let matched = false;

          let answerId = null;

          const alreadyAnswered = myQuestion.answered.find(
            (a) => a.answer === targetId,
          );

          if (alreadyAnswered) {
            return;
          }

          const correctAnswer = actualAnswers.find(
            (a) => a.answer === targetId,
          );

          if (correctAnswer) {
            matched = true;

            answerId = correctAnswer.conditionId;
          }

          if (!matched) {
            setError(sourceId);

            const answeredIds = myQuestion.answered.map((a) => a.conditionId);

            let enter = false;

            let newValue = null;

            if (answeredIds.includes(myQuestion.attemptingId)) {
              enter = true;

              const nextAttempt = myQuestion.actualAnswers.find(
                (a) => !answeredIds.includes(a.conditionId),
              );

              if (!nextAttempt) {
                return;
              }

              newValue = nextAttempt.conditionId;

              setAttributeId(sourceId, nextAttempt.conditionId);
            }

            const body = {
              userId: 1,

              questionId: questionId,

              attributeId: sourceId,

              arithmetic: answerMap[third],

              eventType: "ANSWER",

              answerPosition: enter ? newValue : myQuestion.attemptingId,

              isCorrect: false,

              description: `from ${questionMap[myQuestion.type]} of ${myQuestion.name} is ${myQuestion.amount} >> attempted to ${answerMap[third]} on ${second} of ${first}.`,

              userAnswer: `attempted to ${answerMap[third]} on ${second} of ${first}.`,
            };

            await QuestionAnswerService.processAnswerEvent(body);
          } else {
            const body = {
              userId: 1,

              questionId: questionId,

              attributeId: sourceId,

              arithmetic: answerMap[third],

              answerPosition: answerId,

              eventType: myQuestion.usedHint ? "HINT" : "ANSWER",

              isCorrect: true,

              description: `from ${questionMap[myQuestion.type]} of ${myQuestion.name} is ${myQuestion.amount} >> attempted to ${answerMap[third]} on ${second} of ${first}.`,

              userAnswer: `attempted to ${answerMap[third]} on ${second} of ${first}.`,
            };

            const correctAnswer = myQuestion.actualAnswers.find(
              (a) => a.answer === targetId,
            );

            const questionBody = {
              userId: 1,

              questionId: questionId,

              tableNameId: correctAnswer.tableNameId,

              headerId: correctAnswer.headerId,

              attributeId: sourceId,

              arithmetic: third,

              amount: myQuestion.amount,

              conditionId: correctAnswer.conditionId,

              pairAttributeId: correctAnswer.pairAttributeId,

              totalAnswers: count,
            };

            setCurrentScore(1);

            await QuestionAnswerService.processAnswerEvent(body);

            await QuestionAnswerService.saveAnswer(questionBody);

            moveQuestion(
              sourceId,
              targetId,
              answerId,
              correctAnswer.pairAttributeId,
            );
          }
        } catch (error) {
          console.log("Error is ", error, " for id ", sourceId);
        }
      }}
    >
      <QuestionTable />
    </DragDropProvider>
  );
};

export default QuestionPage;
