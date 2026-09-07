// Every URL in the Course -> Subject -> Chapter -> Topic -> Question drill-down
// is built here, so a route rename is a one-file change and no component
// hand-formats a path string.
//
// The scheme is one parent id per segment - each list page needs exactly the
// id of the thing it lists children of, and nothing travels in query strings
// or router state (so a refresh or a shared link always works).

export const paths = {
  courses: () => "/courses",

  // Course -> its subjects
  courseSubjects: (courseId) => `/courses/${courseId}/subjects`,

  // Subject -> its chapters
  subjectChapters: (subjectId) => `/subjects/${subjectId}/chapters`,

  // Chapter -> its topics
  chapterTopics: (chapterId) => `/chapters/${chapterId}/topics`,

  // Topic -> its questions
  topicQuestions: (topicId) => `/topics/${topicId}/questions`,

  // A single question (drag/drop or journal/dropdown practice view)
  question: (questionId) => `/questions/${questionId}`,

  // Flat "all questions" admin table
  allQuestions: () => "/questions",
};

export default paths;
