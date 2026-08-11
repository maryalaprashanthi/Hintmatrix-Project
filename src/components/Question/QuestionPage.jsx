import { DragDropProvider } from "@dnd-kit/react";
import { useEffect } from "react";
import QuestionTable from "./QuestionTable";
import useQuestionStore from "./questionStore";
import { useParams } from "react-router-dom";
import RuleEngineService from "../../services/RuleEngineService";
import QuestionService from "../../services/QuestionService";

// import { data } from "./sample";

export const termMap = {
  "Balance Sheet": "balance",
  "Trading Account": "trading",
  "Profit and Loss Account": "pnl",
  "Debit Particulars": "dr",
  "Credit Particulars": "cr",
  assets: "assets",
  "Liabilities Side": "liabilities",
};

const QuestionPage = () => {
  const { moveQuestion, setQuestions, setError } = useQuestionStore();
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
          try {
            const data = await RuleEngineService.getAttributeAnswers(sourceId);
            const apiData = data[0].condition1;
            console.log("This is data I got ", apiData);
            const string = `${termMap[apiData.tableName]}-${termMap[apiData.headerName]}-${apiData.arithmetic}`;
            console.log("The string is ", string);
            if (string === targetId) {
              console.log("I entered correct");
              moveQuestion(sourceId, targetId);
            } else {
              console.log("I entered wrong into ", targetId);
              setError(sourceId);
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
