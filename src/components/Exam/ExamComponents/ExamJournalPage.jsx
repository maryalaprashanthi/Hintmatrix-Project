import { Col, Row } from "react-bootstrap";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import ExamJournalQuestion from "./ExamJournalQuestion";
import ExamJournalSolution from "./ExamJournalSolution";
import useExamSessionStore from "./examSessionStore";
import QuestionService from "../../../services/QuestionService";
import RuleEngineService from "../../../services/RuleEngineService";

const getRuleConditions = (rule) =>
  [1, 2, 3, 4].map((index) => {
    const nestedCondition = rule?.[`condition${index}`];

    if (nestedCondition) {
      return { ...nestedCondition, position: index };
    }

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
  });

// Exam version of JournalPage: RuleEngineService is used only to build the
// list of ledger accounts (content) available for each transaction, never
// to grade the user's choice. There is no score and no "check mistakes"
// affordance, and everything the user picks stays in the shared exam
// session cache (examSessionStore) until they explicitly hit Reset -
// navigating away and back does not refetch or wipe it.
const ExamJournalPage = ({ id }) => {
  const { questionId: paramsQuestionId } = useParams();
  const questionId = id ?? paramsQuestionId;

  const entry = useExamSessionStore((state) => state.byQuestionId[questionId]);
  const setQuestionData = useExamSessionStore((state) => state.setQuestionData);
  const setAnsweredData = useExamSessionStore((state) => state.setAnsweredData);

  const question = entry?.question ?? null;
  const answeredData = entry?.answeredData ?? {};

  const loadQuestion = async () => {
    const response = await QuestionService.getQuestionById(questionId);
    const questionData = response.data;
    const attributes = questionData.questionAttributes || [];

    const journalAttributes = await Promise.all(
      attributes.map(async (attribute) => {
        const ruleResponse = await RuleEngineService.getRuleEngineByAttributeId(
          attribute.attributeId,
        );

        const rule = ruleResponse?.[0];
        const tables = [];
        const conditions = getRuleConditions(rule);

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
              arithmetic: condition.arithmetic,
              position: condition.position,
            };
          }

          if (condition.headerName === "Credit Particulars") {
            table.credit = {
              headerId: condition.headerId,
              arithmetic: condition.arithmetic,
              position: condition.position,
            };
          }
        });

        return {
          ...attribute,
          id: String(attribute.questionAttributeId),
          questionId: questionData.questionId,
          question: attribute.attributeName,
          amount1: attribute.amount,
          amount2: attribute.amount2,
          tables,
        };
      }),
    );

    setQuestionData(questionId, {
      question: { ...questionData, questionAttributes: journalAttributes },
    });
  };

  // Also refetches when the cached entry disappears, which is how the exam
  // shell's Reset works: it clears the store and this reloads itself.
  useEffect(() => {
    if (questionId && !entry?.question) {
      loadQuestion();
    }
  }, [questionId, entry?.question]);

  const updateAnswered = (updater) => setAnsweredData(questionId, updater);

  const handleRemoveEntry = (attributeId, index) => {
    updateAnswered((prev) => {
      const rows = prev[attributeId] || [];
      return {
        ...prev,
        [attributeId]: rows.filter((_, i) => i !== index),
      };
    });
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Row>
        <Col>
          <ExamJournalQuestion
            data={question.questionAttributes || []}
            answeredData={answeredData}
            setAnsweredData={updateAnswered}
          />
        </Col>

        <Col>
          <ExamJournalSolution
            answeredData={answeredData}
            onRemove={handleRemoveEntry}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ExamJournalPage;
