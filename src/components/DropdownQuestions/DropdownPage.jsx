import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";

import Header from "../Question/Header";
import SummaryCards from "../Question/SummaryCards";
import DropdownQuestion from "./DropdownQuestion";
import DropdownSolution from "./DropdownSolution";

import QuestionService from "../../services/QuestionService";
import RuleEngineService from "../../services/RuleEngineService";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import { isDropdownAttributeSolved } from "./dropdownAnswerStatus";
import MistakesModal from "../Question/MistakesModal";
import useQuestionStore from "../Question/questionStore";

const getRuleConditions = (rule) =>
  [1, 2, 3, 4]
    .map((index) => {
      // Format 1: condition1, condition2, ...
      const nestedCondition = rule?.[`condition${index}`];

      if (nestedCondition) {
        return {
          ...nestedCondition,
          position: index,
        };
      }

      // Format 2: table1Id, header1Id, ...
      const tableId = rule?.[`table${index}Id`];
      const tableName = rule?.[`table${index}Name`];

      if (tableId == null || !tableName) {
        return null;
      }

      return {
        tableId,
        tableName,
        headerId: rule?.[`header${index}Id`],
        headerName: rule?.[`header${index}Name`],
        arithmetic: rule?.[`arithmetic${index}`],
        information: rule?.[`information${index}`],
        position: index,
      };
    })
    .filter(Boolean);

const DropdownPage = () => {
  const { questionId } = useParams();
  const { showCheckMistakes } = useQuestionStore();
  const [question, setQuestion] = useState(null);
  const [answeredData, setAnsweredData] = useState({});
  const [questionTables, setQuestionTables] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [checkMistakes, setCheckMistakes] = useState(false);

  /*
   * =========================================================
   * LOAD TOTAL SCORE
   * Same approach used by JournalPage
   * =========================================================
   */
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
      const userId = 1;
      const qId = loadedQuestion.questionId;

      console.log("========== DROPDOWN LOAD SAVED ANSWERS ==========");
      console.log("User ID:", userId);
      console.log("Question ID:", qId);

      // 1. Get saved correct answers
      const savedAnswers =
        await QuestionAnswerService.getAnswersByUserAndQuestion(userId, qId);

      console.log("DROPDOWN SAVED QUESTION ANSWERS:", savedAnswers);

      // 2. Get answer events
      let answerEvents = [];

      try {
        answerEvents = await QuestionAnswerService.getAnswerEventsByQuestionId(
          userId,
          qId,
        );

        console.log("DROPDOWN SAVED ANSWER EVENTS:", answerEvents);
      } catch (eventError) {
        console.warn("Could not load Dropdown answer events:", eventError);
      }

      // 3. Latest event for each attribute
      const eventMap = new Map();

      (answerEvents || []).forEach((event) => {
        const attributeId = String(event.attributeId);

        const existing = eventMap.get(attributeId);

        if (
          !existing ||
          Number(event.answerEventId || 0) > Number(existing.answerEventId || 0)
        ) {
          eventMap.set(attributeId, event);
        }
      });

      // 4. Rebuild answeredData
      const formattedData = {};

      (savedAnswers || []).forEach((answer) => {
        const attribute = (loadedQuestion.questionAttributes || []).find(
          (item) => String(item.attributeId) === String(answer.attributeId),
        );

        if (!attribute) {
          console.warn(
            "Dropdown attribute not found for saved answer:",
            answer,
          );
          return;
        }

        const questionAttributeId = attribute.questionAttributeId;

        const isDebit = String(answer.headerId) === "1";

        const matchingCondition = (attribute.ruleConditions || []).find(
          (condition) =>
            String(condition.tableId) === String(answer.tableNameId) &&
            String(condition.headerId) === String(answer.headerId),
        );

        const tableName = matchingCondition?.tableName || "";

        const particulars = isDebit
          ? `${tableName}..........Dr`
          : `To ${tableName}`;

        if (!formattedData[questionAttributeId]) {
          formattedData[questionAttributeId] = [];
        }

        formattedData[questionAttributeId].push({
          questionAttributeId,

          date: "",
          particulars,

          lf: "",

          debit: isDebit ? (answer.amount ?? attribute.amount ?? 0) : "",

          credit: isDebit ? "" : (answer.amount ?? attribute.amount ?? 0),

          valid: true,

          answerId: answer.answerId || null,

          answerEventId:
            eventMap.get(String(answer.attributeId))?.answerEventId || null,

          tableNameId: answer.tableNameId,

          headerId: answer.headerId,

          attributeId: answer.attributeId,

          arithmetic: answer.arithmetic,
        });
      });

      // 5. Add Being row for restored attributes
      Object.keys(formattedData).forEach((questionAttributeId) => {
        const attribute = (loadedQuestion.questionAttributes || []).find(
          (item) =>
            String(item.questionAttributeId) === String(questionAttributeId),
        );

        if (!attribute) {
          return;
        }

        formattedData[questionAttributeId].push({
          date: "",
          particulars: `(Being ${attribute.attributeName})`,
          lf: "",
          debit: "",
          credit: "",
        });
      });

      console.log("DROPDOWN RESTORED ANSWERED DATA:", formattedData);

      setAnsweredData(formattedData);
    } catch (error) {
      console.error("Failed to load Dropdown saved answers:", error);

      setAnsweredData({});
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        console.log("Dropdown Question ID:", questionId);

        // 1. Get the main question
        const response = await QuestionService.getQuestionById(questionId);

        const questionData = response.data;

        console.log("Dropdown Question API Response:", questionData);

        const attributes = questionData.questionAttributes || [];

        // 2. Get Rule Engine for every attribute
        const dropdownAttributes = await Promise.all(
          attributes.map(async (attribute) => {
            console.log(
              "Loading Rule Engine for attribute:",
              attribute.attributeId,
            );

            const ruleResponse =
              await RuleEngineService.getRuleEngineByAttributeId(
                attribute.attributeId,
              );

            console.log(
              "Rule Engine Response:",
              attribute.attributeId,
              ruleResponse,
            );

            const rule = ruleResponse?.[0];

            const ruleConditions = getRuleConditions(rule);

            return {
              ...attribute,

              id: String(attribute.questionAttributeId),

              questionId: questionData.questionId,

              question: attribute.attributeName,

              amount1: attribute.amount,

              amount2: attribute.amount2,

              ruleEngineId: rule?.ruleEngineId,

              rule: rule,

              ruleConditions: ruleConditions,
            };
          }),
        );

        // 3. Collect ALL tables used by this question
        const allTables = [];

        dropdownAttributes.forEach((attribute) => {
          const conditions = attribute.ruleConditions || [];

          conditions.forEach((condition) => {
            if (condition?.tableId != null && condition?.tableName) {
              allTables.push({
                id: condition.tableId,
                name: condition.tableName,
              });
            }
          });
        });

        // 4. Remove duplicate tables
        const uniqueQuestionTables = allTables.filter(
          (table, index, self) =>
            index ===
            self.findIndex((item) => String(item.id) === String(table.id)),
        );

        console.log(
          "ALL TABLES FOR QUESTION:",
          questionData.questionId,
          uniqueQuestionTables,
        );

        // 5. Save common table list
        setQuestionTables(uniqueQuestionTables);

        // 6. Save final question
        const finalQuestion = {
          ...questionData,
          questionAttributes: dropdownAttributes,
        };

        setQuestion(finalQuestion);

        // 7. Restore previously saved answers
        await loadAnsweredData(finalQuestion);

        // 8. Load current total score
        await loadTotalScore();
      } catch (error) {
        console.error("Failed to load dropdown question:", error);
      }
    };

    if (questionId) {
      loadPage();
    }
  }, [questionId]);

  if (!question) {
    return <div>Loading...</div>;
  }

  console.log("DROPDOWN ANSWERED DATA:", answeredData);

  console.log(
    "DROPDOWN RULE CONDITIONS:",
    question.questionAttributes?.map((item) => ({
      attributeId: item.questionAttributeId,
      rule: item.rule,
      ruleConditions: item.ruleConditions,
    })),
  );

  const solvedAttributeIds = new Set(
    (question.questionAttributes || [])
      .filter((item) =>
        isDropdownAttributeSolved(
          item.ruleConditions || [],
          answeredData[item.questionAttributeId] || [],
        ),
      )
      .map((item) => item.questionAttributeId),
  );

  const solved = solvedAttributeIds.size;

  const debit = (question.questionAttributes || [])
    .filter((item) => !solvedAttributeIds.has(item.questionAttributeId))
    .reduce((total, item) => total + (Number(item.amount) || 0), 0);

  const credit = (question.questionAttributes || [])
    .filter((item) => !solvedAttributeIds.has(item.questionAttributeId))
    .reduce((total, item) => total + (Number(item.amount2) || 0), 0);

  if (checkMistakes) {
    console.log("I got rendered check mistakes");
    return (
      <MistakesModal
        questionId={questionId}
        setCheckMistakes={setCheckMistakes}
        checkMistakes={checkMistakes}
      />
    );
  }

  return (
    <div>
      <Row>
        <Header
          question={question}
          answeredData={answeredData}
          setAnsweredData={setAnsweredData}
          setCheckMistakes={setCheckMistakes}
        />
      </Row>

      <Row>
        <SummaryCards
          debit={0}
          credit={0}
          total={question.questionAttributes?.length || 0}
          solved={solved}
          totalScore={totalScore}
        />
      </Row>

      <Row className="align-items-start">
        <Col md={6}>
          <DropdownQuestion
            data={question.questionAttributes || []}
            questionTables={questionTables}
            questionId={question.questionId}
            answeredData={answeredData}
            setAnsweredData={setAnsweredData}
            loadTotalScore={loadTotalScore}
          />
        </Col>

        <Col md={6}>
          <DropdownSolution answeredData={answeredData} />
        </Col>
      </Row>
    </div>
  );
};

export default DropdownPage;
