import { DragDropProvider } from "@dnd-kit/react";
import { useEffect } from "react";
import QuestionTable from "./QuestionTable";
import useQuestionStore from "./questionStore";
import { useParams } from "react-router-dom";
import RuleEngineService from "../../services/RuleEngineService";
import QuestionService from "../../services/QuestionService";
import { data } from "./SampleData";
import QuestionAnswerService from "../../services/QuestionAnswerService";

const termMap = {
  "Balance Sheet": "balance",
  "Trading Account": "trading",
  "Profit and Loss Account": "pnl",
  "Debit Particulars": "dr",
  "Credit Particulars": "cr",
  assets: "assets",
  add: "add",
  less: "sub",
  "Liabilities Side": "liabilities",
};

const questionMap = {
  credit: "credit particulars",
  debit: "debit particulars",
};

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

const QuestionPage = () => {
  const {
    moveQuestion,
    setQuestions,
    setError,
    setHints,
    questions,
    setTotalAnswers,
    setTableData,
    setActualAnswers,
    setAttributeId,
  } = useQuestionStore();
  const { questionId } = useParams();
  // console.log("Question Id:", questionId);

  useEffect(() => {
    loadQuestions();
  }, [questionId]);

  const loadQuestions = async () => {
    try {
      const response = await QuestionService.getQuestionById(questionId);

      let allStrings = data.flatMap((obj) =>
        obj.headers.map((header) => `${obj.name}-${header}`),
      );
      // console.log("All strings are ", allStrings);
      setQuestions([response.data]);
      setTableData(allStrings);
    } catch (error) {
      console.error("Failed to load question:", error);
    }
  };
  return (
    <DragDropProvider
      onDragEnd={async (Event) => {
        if (Event.canceled) return;
        const sourceId = Event.operation.source.id;
        const targetId = Event.operation.target?.id;

        if (targetId == null) {
          // This is called when not dropped in a dropzone
          console.log("I did nothing");
        } else {
          // This is called when dropped in a dropzone
          console.log(`I got dropped into ${targetId}`);
          const myQuestion = questions.find((q) => q.id == sourceId);
          for (const cur of myQuestion.answered) {
            if (cur === targetId) {
              console.log("This was already added");
              return;
            }
          }
          const [first, second, third] = targetId.split("-");
          try {
            let actualAnswers = myQuestion.actualAnswers;
            if (myQuestion.actualAnswers.length == 0) {
              const data =
                await RuleEngineService.getAttributeAnswers(sourceId);
              const apiData = data[0];
              let count = 0;
              let allHints = [];
              for (let i = 1; i <= 4; i++) {
                const condition = apiData[`condition${i}`];
                if (condition.arithmetic == null) continue;
                count = count + 1;
                allHints.push(condition.information);
                // console.log(`This is data I got (condition${i}) `, condition);
                const string = `${condition.tableName}-${condition.headerName}-${condition.arithmetic}`;
                actualAnswers.push({
                  conditionId: i,
                  answer: string,
                  tableNameId: condition.tableId,
                  headerId: condition.headerId,
                });
                // console.log(
                //   "The string is ",
                //   string,
                //   " and targetId is ",
                //   targetId,
                // );
              }
              console.log("I am getting data from db: ", actualAnswers);
              setActualAnswers(sourceId, actualAnswers);
              // if (myQuestion.totalAnswers != count)
              setTotalAnswers(sourceId, count);
              setHints(sourceId, allHints);
            }
            let matched = false;
            let answerId = null;

            // check if present in myQuestion.actualAnswers if yes set matched to true
            // set a variable answerId to actualAnswers.id and call moveQuestion with answerId as well.
            // if not present set matched to false and call setError with sourceId
            console.log("This is actual answers hh ", actualAnswers);

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
              console.log("I entered wrong into ", targetId);

              // if attemptingId is present in answered give a value from actualAnswers that is not
              // present in answered to attemptingId. if there's no such id return

              console.log("I have already answered ", myQuestion.answered);

              const answeredIds = myQuestion.answered.map((a) => a.conditionId);
              let enter = false;
              let newValue = null;
              if (answeredIds.includes(myQuestion.attemptingId)) {
                enter = true;
                const nextAttempt = myQuestion.actualAnswers.find(
                  (a) => !answeredIds.includes(a.conditionId),
                );
                if (!nextAttempt) return;
                newValue = nextAttempt.conditionId;
                setAttributeId(sourceId, nextAttempt.conditionId);
              }

              console.log("I am attempting on ", myQuestion.answered);

              let body = {
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

              console.log(body);
              console.log("I did wrong answer ");
              if (myQuestion.status != "wrong") setError(sourceId);
              // call answer events with post and body
              const response =
                await QuestionAnswerService.processAnswerEvent(body);
              console.log(response);
            } else {
              let body = {
                userId: 1,
                questionId: questionId,
                attributeId: sourceId,
                arithmetic: answerMap[third],
                answerPosition: answerId, // pass answer id here
                eventType: myQuestion.usedHint ? "HINT" : "ANSWER",
                isCorrect: true,
                description: `from ${questionMap[myQuestion.type]} of ${myQuestion.name} is ${myQuestion.amount} >> attempted to ${answerMap[third]} on ${second} of ${first}.`,
                userAnswer: `attempted to ${answerMap[third]} on ${second} of ${first}.`,
              };

              console.log("Did I use hint? ", myQuestion.usedHint);
              console.log(body);
              // call answer events and question answers with post and body

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
              };

              const response =
                await QuestionAnswerService.processAnswerEvent(body);
              console.log(response);
              const response2 =
                await QuestionAnswerService.saveAnswer(questionBody);
              console.log(response2);
              moveQuestion(sourceId, targetId, answerId);
            }
          } catch (error) {
            console.log("Error  is  ", error, " for id ", sourceId);
          }
        }
      }}
      onDragStart={(event) => {
        // console.log("drag start event ", event);
        // console.log("drag start source ", event.operation.source);
      }}
    >
      <QuestionTable />
    </DragDropProvider>
  );
};

export default QuestionPage;
