import { DragDropProvider } from "@dnd-kit/react";
import { useEffect } from "react";
import QuestionTable from "./QuestionTable";
import useQuestionStore from "./questionStore";
import QuestionService from "../../services/QuestionService";
import { useParams } from "react-router-dom";

const QuestionPage = () => {
  const { moveQuestion, setQuestions } = useQuestionStore();
  const { questionId } = useParams();
  console.log("Question Id:", questionId);

  useEffect(() => {
    loadQuestions();
  }, [questionId]);

  const loadQuestions = async () => {
    try {
      const response = await QuestionService.getQuestionById(questionId);

      console.log("API Response:", response.data);

      console.log(response.data);

      setQuestions([response.data]);
    } catch (error) {
      console.error("Failed to load question:", error);
    }
  };
  // return <ProgressCard solvedCount={10} />;
  return (
    <DragDropProvider
      onDragEnd={(Event) => {
        if (Event.canceled) return;
        const sourceId = Event.operation.source.id;
        const targetId = Event.operation.target?.id;

        if (targetId == null) {
          console.log("I did nothing");
        } else {
          console.log(`I got dropped into ${targetId}`);
          // add to respective table
          moveQuestion(sourceId, targetId);
        }
      }}
      onDragStart={(event) => {
        console.log("drag start event ", event);
        console.log("drag start source ", event.operation.source);
      }}
    >
      <QuestionTable />
    </DragDropProvider>
  );
};

export default QuestionPage;
