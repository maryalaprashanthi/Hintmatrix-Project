/* eslint-disable react/prop-types */
import { Col, Row } from "react-bootstrap";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import ExamJournalQuestion from "./ExamJournalQuestion";
import ExamJournalSolution from "./ExamJournalSolution";
import useExamSessionStore from "./examSessionStore";
import QuestionService from "../../../services/QuestionService";

// Exam version of JournalPage. Loading the question makes no rule engine
// call: ExamJournalQuestion fetches a transaction's ledger accounts when the
// student opens that transaction. Nothing here grades the user's choice.
// There is no score and no "check mistakes" affordance, and everything the user picks stays in the shared exam
// session cache (examSessionStore) until they explicitly hit Reset -
// navigating away and back does not refetch or wipe it.
const ExamJournalPage = ({ id, question: sourceQuestion }) => {
  const { questionId: paramsQuestionId } = useParams();
  const questionId = id ?? paramsQuestionId;

  const entry = useExamSessionStore((state) => state.byQuestionId[questionId]);
  const setQuestionData = useExamSessionStore((state) => state.setQuestionData);
  const setAnsweredData = useExamSessionStore((state) => state.setAnsweredData);

  const question = entry?.question ?? null;
  const answeredData = entry?.answeredData ?? {};

  const loadQuestion = async () => {
    // The API paper passes the question object in; the sample paper doesn't,
    // so fall back to fetching it by id.
    const questionData =
      sourceQuestion ??
      (await QuestionService.getQuestionById(questionId)).data;
    const journalAttributes = (questionData.questionAttributes || []).map(
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

  // Dropping the last real line takes the whole transaction out, so the
  // "(Being ...)" narration never lingers on its own with no way to remove it.
  const handleRemoveEntry = (attributeId, index) => {
    updateAnswered((prev) => {
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
      <Row>
        <Col>
          <ExamJournalQuestion
            data={question.questionAttributes || []}
            chapterId={question.chapterId}
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
