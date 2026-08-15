import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";

import Header from "../Question/Header";
import SummaryCards from "../Question/SummaryCards";
import DropdownQuestion from "./DropdownQuestion";
import DropdownSolution from "./DropdownSolution";

import QuestionService from "../../services/QuestionService";
import RuleEngineService from "../../services/RuleEngineService";

const DropdownPage = () => {
  const { questionId } = useParams();

  const [question, setQuestion] = useState(null);
  const [answeredData, setAnsweredData] = useState({});
  const [questionTables, setQuestionTables] = useState([]);

  useEffect(() => {
    const loadQuestion = async () => {
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

            return {
              ...attribute,

              id: String(attribute.questionAttributeId),

              questionId: questionData.questionId,

              question: attribute.attributeName,

              amount1: attribute.amount,

              amount2: attribute.amount2,

              ruleEngineId: rule?.ruleEngineId,

              rule: rule,
            };
          }),
        );

        // 3. Collect ALL tables used by this question
        const allTables = [];

        dropdownAttributes.forEach((attribute) => {
          const rule = attribute.rule;

          const conditions = [
            rule?.condition1,
            rule?.condition2,
            rule?.condition3,
            rule?.condition4,
          ];

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
      } catch (error) {
        console.error("Failed to load dropdown question:", error);
      }
    };

    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Row>
        <Header
          question={question}
          answeredData={answeredData}
          setAnsweredData={setAnsweredData}
        />
      </Row>

      <Row>
        <SummaryCards
          total={question.questionAttributes?.length || 0}
          solved={0}
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
