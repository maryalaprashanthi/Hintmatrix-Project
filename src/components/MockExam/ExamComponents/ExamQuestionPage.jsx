/* eslint-disable react/prop-types */
import { DragDropProvider } from "@dnd-kit/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ExamQuestionTable from "./ExamQuestionTable";
import useExamQuestionStore from "./examQuestionStore";
import useExamSessionStore from "./examSessionStore";
import ExamJournalPage from "./ExamJournalPage";
import ExamDropdownPage from "./ExamDropdownPage";
import QuestionService from "../../../services/QuestionService";
import { fetchAttributeRules, pickRule, ruleDropCount } from "./examRules";
import { questionTypeOf } from "./questionTypeOf";
import { data } from "./SampleData";

// Exam version of QuestionPage: renders the question but never reveals
// whether a placement is correct - drops are always accepted silently and
// can be pulled back out via the remove ("x") control on the placed row.
//
// Whatever the user has entered stays in place when they navigate away and
// back (examQuestionStore / examSessionStore are keyed by questionId and are
// only cleared by an explicit Reset) - nothing is refetched or wiped just
// because the component remounted.
// The rule is not loaded with the question. When the student starts to drag
// a row, the page fetches that row's rule (once per attribute per exam) and
// stores how many accounts the row belongs in. The drop waits for that rule,
// then checks the limit.
const ensureDropLimit = async (questionId, row, chapterId) => {
  if (!row || row.maxDrops !== undefined) return;
  try {
    const rules = await fetchAttributeRules(row.attributeId);
    useExamQuestionStore
      .getState()
      .setDropLimit(questionId, row.attributeId, ruleDropCount(pickRule(rules, chapterId)));
  } catch (error) {
    // Leave the limit unknown: this drop is allowed, and the next drag of
    // this row tries again.
    console.error("Failed to load the rule for this row:", error);
  }
};

const rowFor = (questionId, sourceId) =>
  useExamQuestionStore
    .getState()
    .byQuestionId[questionId]?.questions.find((row) => String(row.id) === String(sourceId));

const ExamQuestionPage = ({ id, question: sourceQuestion }) => {
  const { questionId: paramsQuestionId } = useParams();
  const questionId = id ?? paramsQuestionId;

  const [questionType, setQuestionType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { moveQuestion, setQuestions, setTableData, setActiveQuestion } =
    useExamQuestionStore();
  const chapterId = sourceQuestion?.chapterId;
  const cacheQuestionType = useExamSessionStore(
    (state) => state.setQuestionType,
  );
  const cachedType = useExamSessionStore(
    (state) => state.byQuestionId[questionId]?.questionType,
  );

  const loadQuestion = async () => {
    // The API paper passes the question object in; the sample paper doesn't,
    // so fall back to fetching it by id.
    const questionData =
      sourceQuestion ??
      (await QuestionService.getQuestionById(questionId)).data;
    const type = questionTypeOf(questionData);

    cacheQuestionType(questionId, type);

    if (type !== "JOURNAL" && type !== "DROPDOWN") {
      const allStrings = data.flatMap((obj) =>
        obj.headers.map((header) => `${obj.name}-${header}`),
      );

      setQuestions(questionId, [questionData]);
      setTableData(allStrings);
    }

    return type;
  };

  // Point the shared drag store at this question every visit, cached or not, so
  // the table and dropzones read this question's slice and not whichever
  // drag-and-drop question happened to be loaded last.
  useEffect(() => {
    setActiveQuestion(questionId);
  }, [questionId, setActiveQuestion]);

  // Subscribing to the cached type (rather than reading it once) is what makes
  // the exam shell's Reset work: clearing the store drops the cached type and
  // this reloads the question from scratch.
  useEffect(() => {
    if (cachedType) {
      setQuestionType(questionTypeOf(cachedType));
      return;
    }

    const init = async () => {
      setIsLoading(true);
      try {
        setQuestionType(await loadQuestion());
      } catch (loadError) {
        console.error("Failed to load exam question:", loadError);
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [questionId, cachedType]);

  if (isLoading) {
    return <div className="question-page-loading">Loading question…</div>;
  }

  if (questionType === "JOURNAL") {
    return <ExamJournalPage id={questionId} question={sourceQuestion} />;
  }

  if (questionType === "DROPDOWN") {
    return <ExamDropdownPage id={questionId} question={sourceQuestion} />;
  }

  return (
    <DragDropProvider
      onDragStart={(event) => {
        // Fetch the rule while the student is still dragging, so the drop
        // rarely has to wait for it.
        const sourceId = event.operation.source?.id;
        void ensureDropLimit(questionId, rowFor(questionId, sourceId), chapterId);
      }}
      onDragEnd={async (event) => {
        if (event.canceled) return;

        const sourceId = event.operation.source.id;
        const targetId = event.operation.target?.id;

        if (targetId == null) {
          return;
        }

        // Shares the request that onDragStart sent; resolves at once when
        // the rule is already known.
        await ensureDropLimit(questionId, rowFor(questionId, sourceId), chapterId);

        // The student can move to another question while the rule loads.
        // moveQuestion acts on the active question, so drop only if this
        // question is still the active one.
        if (useExamQuestionStore.getState().activeQuestionId !== questionId) return;

        moveQuestion(sourceId, targetId);
      }}
    >
      <ExamQuestionTable />
    </DragDropProvider>
  );
};

export default ExamQuestionPage;
