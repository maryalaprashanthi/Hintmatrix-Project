import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";

import ExamDropdownQuestion from "./ExamDropdownQuestion";
import ExamDropdownSolution from "./ExamDropdownSolution";
import useExamSessionStore from "./examSessionStore";

import QuestionService from "../../../services/QuestionService";
import RuleEngineService from "../../../services/RuleEngineService";

const getRuleConditions = (rule) =>
  [1, 2, 3, 4]
    .map((index) => {
      const nestedCondition = rule?.[`condition${index}`];

      if (nestedCondition) {
        return {
          ...nestedCondition,
          position: index,
        };
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
    })
    .filter(Boolean);

// Exam version of DropdownPage: RuleEngineService is used only to know which
// ledger accounts are valid options for each attribute (content), never to
// grade the user's choice. There is no score, no "check mistakes" affordance,
// and everything the user picks stays in the shared exam session cache
// (examSessionStore) until they explicitly hit Reset - navigating away and
// back does not refetch or wipe it.
const ExamDropdownPage = ({ id }) => {
  const { questionId: paramsQuestionId } = useParams();
  const questionId = id ?? paramsQuestionId;

  const entry = useExamSessionStore((state) => state.byQuestionId[questionId]);
  const setQuestionData = useExamSessionStore((state) => state.setQuestionData);
  const setAnsweredData = useExamSessionStore((state) => state.setAnsweredData);

  const question = entry?.question ?? null;
  const questionTables = entry?.questionTables ?? [];
  const answeredData = entry?.answeredData ?? {};

  const loadPage = async () => {
    const response = await QuestionService.getQuestionById(questionId);
    const questionData = response.data;
    const attributes = questionData.questionAttributes || [];

    const dropdownAttributes = await Promise.all(
      attributes.map(async (attribute) => {
        const ruleResponse = await RuleEngineService.getRuleEngineByAttributeId(
          attribute.attributeId,
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
          ruleConditions,
        };
      }),
    );

    const allTables = [];
    dropdownAttributes.forEach((attribute) => {
      (attribute.ruleConditions || []).forEach((condition) => {
        if (condition?.tableId != null && condition?.tableName) {
          allTables.push({ id: condition.tableId, name: condition.tableName });
        }
      });
    });

    const uniqueQuestionTables = allTables.filter(
      (table, index, self) =>
        index === self.findIndex((item) => String(item.id) === String(table.id)),
    );

    setQuestionData(questionId, {
      question: { ...questionData, questionAttributes: dropdownAttributes },
      questionTables: uniqueQuestionTables,
    });
  };

  // Also refetches when the cached entry disappears, which is how the exam
  // shell's Reset works: it clears the store and this reloads itself.
  useEffect(() => {
    if (questionId && !entry?.question) {
      loadPage();
    }
  }, [questionId, entry?.question]);

  // Dropping the last real line takes the whole transaction out, so the
  // "(Being ...)" narration never lingers on its own.
  const handleRemoveEntry = (attributeId, index) => {
    setAnsweredData(questionId, (prev) => {
      const rows = (prev[attributeId] || []).filter((_, i) => i !== index);
      const hasPlacedRows = rows.some(
        (entry) => !entry.particulars?.startsWith("(Being"),
      );

      const next = { ...prev };

      if (hasPlacedRows) {
        next[attributeId] = rows;
      } else {
        delete next[attributeId];
      }

      return next;
    });
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Row className="align-items-start">
        <Col md={6}>
          <ExamDropdownQuestion
            data={question.questionAttributes || []}
            questionTables={questionTables}
            answeredData={answeredData}
            setAnsweredData={(updater) => setAnsweredData(questionId, updater)}
          />
        </Col>

        <Col md={6}>
          <ExamDropdownSolution
            answeredData={answeredData}
            onRemove={handleRemoveEntry}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ExamDropdownPage;
