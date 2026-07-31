import { DragDropProvider } from "@dnd-kit/react";
import QuestionTable from "./QuestionTable";
import useQuestionStore from "./questionStore";

const QuestionPage = () => {
  const { moveQuestion } = useQuestionStore();
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
