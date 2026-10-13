/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";

import ExamDropdownQuestion from "./ExamDropdownQuestion";
import ExamDropdownSolution from "./ExamDropdownSolution";
import useExamSessionStore from "./examSessionStore";

import QuestionService from "../../../services/QuestionService";

// Exam version of DropdownPage. Loading the question makes no rule engine
// call: ExamDropdownQuestion fetches the account list when the student first
// opens a transaction, then stores it here as questionTables (buildSubmission
// reads it). Nothing here grades the user's choice. There is no score, no "check mistakes" affordance,
// and everything the user picks stays in the shared exam session cache
// (examSessionStore) until they explicitly hit Reset - navigating away and
// back does not refetch or wipe it.
const ExamDropdownPage = ({ id, question: sourceQuestion }) => {
  const { questionId: paramsQuestionId } = useParams();
  const questionId = id ?? paramsQuestionId;

  const entry = useExamSessionStore((state) => state.byQuestionId[questionId]);
  const setQuestionData = useExamSessionStore((state) => state.setQuestionData);
  const setAnsweredData = useExamSessionStore((state) => state.setAnsweredData);

  const question = entry?.question ?? null;
  const answeredData = entry?.answeredData ?? {};

  const loadPage = async () => {
    // The API paper passes the question object in; the sample paper doesn't,
    // so fall back to fetching it by id.
    const questionData =
      sourceQuestion ??
      (await QuestionService.getQuestionById(questionId)).data;
    const dropdownAttributes = (questionData.questionAttributes || []).map(
      (attribute) => ({
        ...attribute,
        id: String(attribute.questionAttributeId),
        questionId: questionData.questionId,
        question: attribute.attributeName,
        amount1: attribute.amount,
        amount2: attribute.amount2,
      }),
    );

    setQuestionData(questionId, {
      question: { ...questionData, questionAttributes: dropdownAttributes },
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
            chapterId={question.chapterId}
            onTablesLoaded={(tables) =>
              setQuestionData(questionId, { questionTables: tables })
            }
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
