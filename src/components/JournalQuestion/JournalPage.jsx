import JournalQuestion from "./JournalQuestion";
import JournalSolution from "./JournalSolution";
import { Col, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../Question/Header";
import SummaryCards from "../Question/SummaryCards";
import QuestionService from "../../services/QuestionService";
import RuleEngineService from "../../services/RuleEngineService";
import QuestionAnswerService from "../../services/QuestionAnswerService";

const JournalPage = () => {
  const { questionId } = useParams();

  const [question, setQuestion] = useState(null);
  const [answeredData, setAnsweredData] = useState({});
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    const loadPage = async () => {
      const loadedQuestion = await loadQuestion();

      await loadAnsweredData(loadedQuestion);
      await loadTotalScore();
    };

    loadPage();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      console.log("Journal Question ID:", questionId);

      const response = await QuestionService.getQuestionById(questionId);

      console.log("Journal API Response:", response.data);

      const questionData = response.data;

      console.log(
        "QUESTION ATTRIBUTES:",
        JSON.stringify(questionData.questionAttributes, null, 2),
      );

      const attributes = questionData.questionAttributes || [];

      const journalAttributes = await Promise.all(
        attributes.map(async (attribute) => {
          console.log("Attribute ID:", attribute.attributeId);

          const ruleResponse =
            await RuleEngineService.getRuleEngineByAttributeId(
              attribute.attributeId,
            );

          console.log(
            "RULE ENGINE FULL RESPONSE:",
            JSON.stringify(ruleResponse, null, 2),
          );

          const rule = ruleResponse?.[0];

          const tables = [];

          const conditions = [
            rule?.condition1,
            rule?.condition2,
            rule?.condition3,
            rule?.condition4,
          ];

          conditions.forEach((condition) => {
            if (!condition?.tableId || !condition?.tableName) {
              return;
            }

            let table = tables.find(
              (item) => String(item.id) === String(condition.tableId),
            );

            if (!table) {
              table = {
                id: condition.tableId,
                name: condition.tableName,
                debit: null,
                credit: null,
              };

              tables.push(table);
            }

            if (condition.headerName === "Debit Particulars") {
              table.debit = {
                headerId: condition.headerId,
                headerName: condition.headerName,
                arithmetic: condition.arithmetic,
              };
            }

            if (condition.headerName === "Credit Particulars") {
              table.credit = {
                headerId: condition.headerId,
                headerName: condition.headerName,
                arithmetic: condition.arithmetic,
              };
            }
          });

          console.log("Tables for", attribute.attributeName, ":", tables);

          return {
            ...attribute,

            id: String(attribute.questionAttributeId),

            questionId: questionData.questionId,

            question: attribute.attributeName,

            amount1: attribute.amount,

            amount2: attribute.amount2,

            tables: tables,

            ruleEngineId: rule?.ruleEngineId,
          };
        }),
      );

      const finalQuestion = {
        ...questionData,
        questionAttributes: journalAttributes,
      };

      setQuestion(finalQuestion);

      console.log("Final Journal Data:", journalAttributes);

      return finalQuestion;
    } catch (error) {
      console.error("Failed to load journal question:", error);
    }
  };

  const loadTotalScore = async () => {
    try {
      const userId = 1;

      const score = await QuestionAnswerService.getOverallMarks(userId);

      console.log("TOTAL USER SCORE:", score);

      setTotalScore(Number(score) || 0);
    } catch (error) {
      console.error("Failed to load total score:", error);
      setTotalScore(0);
    }
  };

  const loadAnsweredData = async (loadedQuestion) => {
    try {
      console.log("Loading current answers:", questionId);

      // 1. Get CURRENT answers
      const userId = 1;

      const answerResponse =
        await QuestionAnswerService.getAnswersByUserAndQuestion(
          userId,
          questionId,
        );

      console.log("Current Answers:", answerResponse);

      // 2. Get ALL answer events/history

      const eventResponse =
        await QuestionAnswerService.getAnswerEventsByQuestionId(
          userId,
          questionId,
        );

      console.log("Answer Events:", eventResponse);

      // Map answerId -> latest AnswerEvent
      const eventMap = new Map();

      eventResponse.forEach((event) => {
        if (!event.attributeId) {
          return;
        }

        const existing = eventMap.get(event.attributeId);

        if (
          !existing ||
          Number(event.answerEventId) > Number(existing.answerEventId)
        ) {
          eventMap.set(event.attributeId, event);
        }
      });

      console.log("Answer Event Map:", Array.from(eventMap.entries()));

      const formattedData = {};

      // 3. Restore ONLY current active QuestionAnswers
      answerResponse.forEach((answer) => {
        const questionAttribute = loadedQuestion?.questionAttributes?.find(
          (item) => String(item.attributeId) === String(answer.attributeId),
        );

        const id = questionAttribute?.questionAttributeId;

        if (!formattedData[id]) {
          formattedData[id] = [];
        }

        const event = eventMap.get(answer.attributeId);

        const text =
          answer.headerName === "Debit Particulars"
            ? `${answer.tableName}..........Dr`
            : `To ${answer.tableName}`;

        formattedData[id].push({
          questionAttributeId: questionAttribute?.questionAttributeId,

          date: "",
          particulars: text,
          lf: "",

          debit: answer.headerName === "Debit Particulars" ? answer.amount : "",

          credit:
            answer.headerName === "Credit Particulars" ? answer.amount : "",

          // Get correctness from AnswerEvent
          valid: true,

          answerId: answer.answerId,

          answerEventId: event?.answerEventId,

          tableNameId: answer.tableNameId,
          headerId: answer.headerId,
          attributeId: answer.attributeId,
          arithmetic: answer.arithmetic,
        });
      });

      // 4. Add Being row
      Object.keys(formattedData).forEach((id) => {
        const attribute = loadedQuestion?.questionAttributes?.find(
          (item) => String(item.questionAttributeId) === String(id),
        );

        formattedData[id].push({
          date: "",
          particulars: `(Being ${attribute?.attributeName || ""})`,
          lf: "",
          debit: "",
          credit: "",
        });
      });

      console.log("Restored Current Answered Data:", formattedData);

      console.log(
        "FINAL RESTORED ANSWERED DATA:",
        JSON.stringify(formattedData, null, 2),
      );

      setAnsweredData(formattedData);
    } catch (error) {
      console.error("Failed to load saved answers:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  };
  if (!question) {
    return <div>Loading...</div>;
  }

  const journalQuestions = question.questionAttributes || [];

  const solvedAttributeIds = new Set(
    Object.values(answeredData)
      .flat()
      .filter((entry) => entry.valid === true)
      .map((entry) => entry.questionAttributeId),
  );

  const debit = journalQuestions
    .filter(
      (item) =>
        item.headerName === "Debit Particulars" &&
        !solvedAttributeIds.has(item.questionAttributeId),
    )
    .reduce((total, item) => total + (Number(item.amount) || 0), 0);

  const credit = journalQuestions
    .filter(
      (item) =>
        item.headerName === "Credit Particulars" &&
        !solvedAttributeIds.has(item.questionAttributeId),
    )
    .reduce((total, item) => total + (Number(item.amount) || 0), 0);

  const solved = solvedAttributeIds.size;

  return (
    <div>
      <Header
        question={question}
        answeredData={answeredData}
        setAnsweredData={setAnsweredData}
      />

      <Row>
        <SummaryCards
          debit={debit}
          credit={credit}
          total={question.questionAttributes?.length || 0}
          solved={solved}
          totalScore={totalScore}
        />
      </Row>

      <Row>
        <Col>
          <JournalQuestion
            data={question.questionAttributes || []}
            questionText={question.questionText}
            answeredData={answeredData}
            setAnsweredData={setAnsweredData}
            loadTotalScore={loadTotalScore}
          />
        </Col>

        <Col>
          <JournalSolution answeredData={answeredData} />
        </Col>
      </Row>
    </div>
  );
};

export default JournalPage;
