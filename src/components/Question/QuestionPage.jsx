import { DragDropProvider } from "@dnd-kit/react";
import { useEffect } from "react";
import QuestionTable from "./QuestionTable";
import useQuestionStore from "./questionStore";
import { useParams } from "react-router-dom";
import RuleEngineService from "../../services/RuleEngineService";
import QuestionService from "../../services/QuestionService";

// import { data } from "./sample";

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
  sub: "SUBTRACT",
};

const QuestionPage = () => {
  const {
    moveQuestion,
    setQuestions,
    setError,
    setHints,
    questions,
    setTotalAnswers,
  } = useQuestionStore();
  const { questionId } = useParams();
  // console.log("Question Id:", questionId);

  useEffect(() => {
    loadQuestions();
  }, [questionId]);

  const loadQuestions = async () => {
    try {
      const response = await QuestionService.getQuestionById(questionId);

      // console.log("API Response:", response.data);

      // console.log(response.data);

      setQuestions([response.data]);
    } catch (error) {
      console.error("Failed to load question:", error);
    }
  };
  // return <ProgressCard solvedCount={10} />;
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
          // console.log("This is data I got ", data[0].condition1);
          // is it present in answered
          const myQuestion = questions.find((q) => q.id == sourceId);
          for (const cur of myQuestion.answered) {
            if (cur === targetId) {
              console.log("This was already added");
              return;
            }
          }
          const [first, second, third] = targetId.split("-");
          try {
            const data = await RuleEngineService.getAttributeAnswers(sourceId);
            const apiData = data[0];
            let matched = false;
            let count = 0;
            let allHints = [];
            for (let i = 1; i <= 4; i++) {
              const condition = apiData[`condition${i}`];
              if (condition.arithmetic == null) continue;
              count = count + 1;
              allHints.push(condition.information);
              console.log(`This is data I got (condition${i}) `, condition);
              const string = `${termMap[condition.tableName]}-${termMap[condition.headerName]}-${termMap[condition.arithmetic]}`;
              console.log("The string is ", string);
              if (!matched && string === targetId) {
                console.log("I entered correct");
                matched = true;
              }
            }
            setTotalAnswers(sourceId, count);
            setHints(sourceId, allHints);
            if (!matched) {
              console.log("I entered wrong into ", targetId);
              // send post request to answer events

              // const questionData = ;

              let body = {
                userId: 1,
                questionId: questionId,
                attributeId: sourceId,
                arithmetic: answerMap[third],
                eventType: "ANSWER",
                isCorrect: false,
                description: `from ${questionMap[myQuestion.type]} of ${myQuestion.name} is ${myQuestion.amount} >> attempted to ${answerMap[third]} on ${answerMap[second]} of ${answerMap[first]}.`,
                userAnswer: `attempted to ${answerMap[third]} on ${answerMap[second]} of ${answerMap[first]}.`,
              };

              console.log(body);

              // {
              //     "userId": 1,
              //     "questionId": 1,
              //     "attributeId": 5,
              //     "tableNameId": 1,
              //     "headerId": 2,
              //     "arithmetic": "subtract",
              //     "eventType": "ANSWER",
              //     "isCorrect": false,
              //     "description": "from credit particulars of sales amount is 19000.0 >> attempted to subtract on debit particulars of trading account.",
              //     "userAnswer": "attempted to subtract on debit particulars of trading account"
              // }

              setError(sourceId);
            } else {
              // send post request to answer events

              let body = {
                userId: 1,
                questionId: questionId,
                attributeId: sourceId,
                arithmetic: answerMap[third],
                eventType: "ANSWER",
                isCorrect: true,
                description: `from ${questionMap[myQuestion.type]} of ${myQuestion.name} is ${myQuestion.amount} >> attempted to ${answerMap[third]} on ${answerMap[second]} of ${answerMap[first]}.`,
                userAnswer: `attempted to ${answerMap[third]} on ${answerMap[second]} of ${answerMap[first]}.`,
              };

              console.log(body);
              moveQuestion(sourceId, targetId);
            }
          } catch (error) {
            console.log("Error  is  ", error, " for id ", sourceId);
          }

          // add to respective table
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
