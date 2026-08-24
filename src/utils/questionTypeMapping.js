const chapterQuestionTypeMap = {
  DRAG_AND_DROP: [1],
  JOURNAL: [2],
  DROPDOWN: [3],
};

export const getQuestionTypeByChapter = (chapterId) => {
  const id = Number(chapterId);

  for (const [questionType, chapters] of Object.entries(
    chapterQuestionTypeMap,
  )) {
    if (chapters.includes(id)) {
      return questionType;
    }
  }

  return null;
};

export default chapterQuestionTypeMap;
