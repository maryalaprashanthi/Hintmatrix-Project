# dragAndDropWithAdj implementation report

Implemented on 9 October 2026 in the React and Spring repositories.

## Total Score correction — 10 October 2026

`DragAndDropWithAdj.jsx` now immediately applies the marks returned by the saved answer event, then reconciles with the existing overall-marks endpoint. A failed placement save or total-refresh request cannot hide marks that the server already awarded. The backend remains the scoring authority: correct first attempt 1, correct second attempt 0.5, third/later attempts 0, wrong answers 0, Hint 0, Auto Fill 0. No additional marks calculation was introduced in React.

Wrong second-amount drops now use the matching outstanding effect's answer position, so retries receive the correct attempt-based marks. Re-dropping an already completed effect is ignored instead of consuming another effect's attempt.

Changed for this correction: `src/components/Question/DragAndDropWithAdj.jsx`, its `DragAndDropWithAdj.test.js`, this report, and backend `src/test/java/com/project/ProjectS/service/FinalAccountsAutofillResetTest.java`. No backend production change or database change was required. Verification: 37 focused frontend tests passed; 27 backend Final Accounts/scoring tests passed; scoped lint and the production build passed. Vite retains its existing large-bundle warning.

## Architecture and creation layout

`dragAndDrop` keeps its existing placement handlers and Zustand state. Its rendering components now also accept controlled state, so both types reuse the same view without changing the ordinary question's answer flow.

`dragAndDropWithAdj` normalizes to `DRAG_AND_DROP_WITH_ADJ`. The practice, exam and mock-exam dispatchers explicitly render `DragAndDropWithAdj.jsx` before the ordinary branch. This component is the adjustment state/API controller; it passes its model and handlers into the existing `QuestionTable`, `Draggable` and `Droppable` components. It no longer implements a separate statement UI. Exam adapters use the existing paper stores and submission format, including separate identities for multiple effects at the same destination. Practice uses the existing answer-event and answer APIs and restores answers by question-row identity. Each correct practice placement is validated and saved immediately, just like ordinary drag-and-drop; there is no separate Submit answer button. Exams retain paper-level submission.

The shared student view uses `QuestionTable.css`, `Draggable.css` and `Droppable.css` directly. Both types render the same `Header`, `SummaryCards`, Trial Balance card, debit/credit accordions, three statement accordions, colored three-column tables, status icons, drop targets and wrong-answer actions. The optional draggable Adjustments card appears directly below Trial Balance. Small generic selection, note and button styles live in the existing stylesheets. The duplicate `AdjustmentQuestionLayout.jsx`, `DragAndDropWithAdj.css` and obsolete layout test were removed.

The adjustments proforma groups linked Add/Less effects beneath their base account using the Rule Engine's `pairAttributeId`, within the same statement and side. It shows the base first, each amount in the inner column, and one signed subtotal in the outer column. Group totals use integer paise; ordinary ungrouped and derived rows keep their existing formatting. Ambiguous repeated base accounts remain separate rather than receiving an invented row mapping. Exam placements retain pairing metadata while preserving the student's chosen destination. Gross/net transfers and Balance Sheet reconciliation reuse `calculateFinalAccounts`.

Wrong practice answers use the shared `Draggable` component's red tile, error icon and **Hint / Auto Fill** popover. Hints come from the applicable Rule Engine condition information; corrected answers after Hint use the existing zero-mark `HINT` event. Auto Fill re-fetches the chapter-specific rules and saves only remaining effects, with each effect's configured amount and destination. It records an `AUTOFILL` event before saving each answer, so failed or partially completed saves never appear as successful unsaved placements or earn ordinary marks. The adjustment controller supplies the shared component's state and action callbacks.

Amounts initialize before rule retrieval. A missing rule is logged to the developer console while allowing other rows and saved answers to load; the tiles remain draggable and never display `NaN`. Missing rules still prevent validation of the affected account.

The latest student-view cleanup removes the **Amount for this effect** editors, effect-count text, adjustment instruction paragraph and visible feedback box. Students drag plain account/amount tiles, including a second tile for a distinct second amount. Dragging either tile retains the original question-row identity and uses that tile's amount for validation and saving. Rule configuration diagnostics are kept out of the student layout and Auto Fill popover. Normal answer status remains accessible through a visually hidden live region, and wrong-answer tiles retain Hint / Auto Fill actions.

Create All uses `DragAndDropAttributeEditor.jsx` for both drag-and-drop types. Both render the same debit/amount/credit/amount table and existing CSS; the adjustment type adds an adjustment name/amount table directly below it. The extra information and second-amount controls are omitted. Add/remove rows and saved draft reopening use the existing form state and serialization. `CreateDragAndDropWithAdj.jsx` remains in use by the separate Add Question modal and supplies the existing draft preview. No question-code database field was invented.

## Backend and deployment

Existing question creation/update/retrieval already store `amount`, `amount2`, `note` and the question-type ID. The new `adjustment` Boolean request/response field persists as `question_attributes.is_adjustment`. This is necessary because an account chosen in the adjustments table may already have a debit or credit attribute header. The flag preserves its role without changing that database header or encoding role metadata in the note. Existing clients that omit it retain the default balance behavior.

The existing Final Accounts Rule Engine, answer-event validation, saved-answer validation/reset, scoring and result retrieval now recognize the new type. The new type uses these paths regardless of the chapter display name; the old type keeps its existing Final Accounts chapter restriction. Review returns the distinct canonical type and reuses the existing read-only statement display. No duplicate endpoints or account-to-statement mappings were added.

The reported **Answer already autofilled for answer position 1** retry error is fixed in the shared `AnswerEventService`: Final Accounts retries retain normal server rule validation and receive zero marks while an active `AUTOFILL` marker exists. This supports recovery after failed placement saves as well as practice retries. It applies to both Final Accounts question types; unrelated types retain their existing guard. Reset continues to deactivate current saved answers and practice Auto Fill markers through the existing reset service.

Apply [DragAndDropWithAdj.sql](C:/Users/narsa/intellijWorkspace3/ProjectS/src/main/java/DataBase/DragAndDropWithAdj.sql) before deploying this update. It idempotently adds the flag column and registers the type using a database-generated ID. Retain the existing `FinalAccountsDragDrop.sql` migration for question-row identities in answers/events. The new script does not reassign existing questions or create accounting rules. The script was prepared, **not applied to a live database**.

## Adjustment coverage and limits

Configured adjustments can use up to four Rule Engine effects, each with its own database statement/header IDs, Add/Less operation and selection of amount 1 or amount 2. The author supplies monetary values; the application does not automatically calculate percentage depreciation, provision changes, cost/profit ratios or sale-or-return valuations from prose.

The checked-in `TestData_Hintmatrix.sql` dump contains **zero rules for chapter 4, Final Accounts with Adjustments**. Other chapters include single-effect Outstanding Rent, Rent Paid in Advance, Interest on Capital and Interest on Drawings, a draft Outstanding Wages account, journal Bad Debts, and a Closing Stock option elsewhere. These do not establish complete adjustment support in chapter 4.

The requested Closing Stock, Outstanding Expenses, Prepaid Expenses, Accrued Income, Income Received in Advance, Depreciation, Bad Debts, Provision for Doubtful Debts, Drawings, Interest on Capital, Interest on Drawings, goods withdrawn, samples, and sale-or-return therefore still require applicable accounts and complete chapter-specific rules in the deployed database. They can be represented by the inspected model when their effects fit its four-condition/two-amount limits. Missing, ambiguous, incomplete, invalid-amount or unsupported-destination rules are logged to the developer console, including the account name. The component never borrows another chapter's rule or invents a mapping. Live database contents were not audited.

## Verification

- Frontend: the final full suite executed **71 tests, with 70 passing**. Its only failure is the existing `roles.test.js` test **content management is restricted to admin roles**, which expects an access rule absent from the unchanged `roles.js`. All **37 adjustment/form/shared-layout/original-draggable tests passed** in that run. They cover second-amount dragging, shared Hint/Auto Fill callbacks, grouping with the database's self-paired base accounts, saved state and score restoration, Reset success/failure, and stale answer responses.
- New tests cover actual JSX rendering of the shared cards, statement sides, pending/solved/wrong tiles, drag targets and adjustment ordering; independent routing; effect destination/amount matching; repeated account identity; server rejection/save failures; Hint events; Auto Fill event-before-save ordering, second amounts, remaining effects and partial failures; exam submission state; multiple effects sharing a destination; form validation; database-derived headers and create/edit round trips.
- Backend: **35 tests passed**, zero failures/errors, across `AdjustmentQuestionPersistenceTest`, `FinalAccountsDragDropTest`, `FinalAccountsAutofillResetTest`, `AnswerEventResetTest` and `PracticeEventResultServiceTest`. Coverage includes creation/retrieval metadata, omitted-flag compatibility, multiple-effect completeness, duplicate rejection, second amounts, practice validation, review identity/type, validated zero-mark retries after Auto Fill, incorrect retries and reset/retry behavior for both types.
- The existing reset-test fixture was updated to stub `findByUserIdForUpdate`, which the existing reset service already requires. Its original four missing-user fixture errors are resolved without production reset changes.
- Scoped ESLint checks passed with zero warnings for all changed/new JavaScript files except `QuestionPage.jsx`. Linting that file reports its existing missing-hook-dependencies warning on the initialization effect; the dependency array and referenced load functions are unchanged. No lint errors were reported. The existing preview component follows the repository's prop-types lint exemption convention.
- `npm run build` passed. Vite still reports the existing large-bundle warning.
- Diff whitespace checks passed for changed source/test files.
- Browser visual verification was attempted twice, but the browser runtime failed during Windows sandbox initialization. No browser screenshot, live end-to-end API test or visual QA completion is claimed. Temporary verification files and the local preview server were removed/stopped.

## Exact files created

React repository `C:/Users/narsa/git/Hintmatrix-Project`:

1. [DragAndDropWithAdj.jsx](C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/DragAndDropWithAdj.jsx) — adjustment state/API controller supplying the shared drag-and-drop components.
2. [adjustmentPlacement.js](C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/adjustmentPlacement.js) — effect matching, rule-based proforma grouping and independent exam-effect identities.
3. [DragAndDropWithAdj.test.js](C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/DragAndDropWithAdj.test.js) — routing and actual persistence-handler tests.
4. [CreateDragAndDropWithAdj.jsx](C:/Users/narsa/git/Hintmatrix-Project/src/pages/Questions/CreateDragAndDropWithAdj.jsx) — separate creation/edit form and draft preview.
5. [CreateDragAndDropWithAdj.css](C:/Users/narsa/git/Hintmatrix-Project/src/pages/Questions/CreateDragAndDropWithAdj.css) — reference-inspired two-table styling.
6. [adjustmentQuestionForm.js](C:/Users/narsa/git/Hintmatrix-Project/src/pages/Questions/adjustmentQuestionForm.js) — form serialization, validation and reopening.
7. [adjustmentQuestionForm.test.js](C:/Users/narsa/git/Hintmatrix-Project/src/pages/Questions/adjustmentQuestionForm.test.js) — separate-table round-trip and validation tests.
8. [QuestionTable.test.js](C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/QuestionTable.test.js) — actual shared-component rendering, state isolation, score, progress, drag targets, wrong-answer actions and adjustment proforma regressions.
9. [This report](C:/Users/narsa/git/Hintmatrix-Project/docs/drag-and-drop-with-adjustments.md).

Spring repository `C:/Users/narsa/intellijWorkspace3/ProjectS`:

12. [DragAndDropWithAdj.sql](C:/Users/narsa/intellijWorkspace3/ProjectS/src/main/java/DataBase/DragAndDropWithAdj.sql) — type registration and adjustment flag migration.
13. [AdjustmentQuestionPersistenceTest.java](C:/Users/narsa/intellijWorkspace3/ProjectS/src/test/java/com/project/ProjectS/service/AdjustmentQuestionPersistenceTest.java) — existing create/retrieve API contract tests.

## Exact existing files modified

React repository:

1. [QuestionPage.jsx](C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/QuestionPage.jsx) — explicit new practice branch and normalization.
2. [ExamQuestionRenderer.jsx](C:/Users/narsa/git/Hintmatrix-Project/src/components/Exam/ExamQuestionRenderer.jsx) — new component with exam stores.
3. [Mock ExamQuestionRenderer.jsx](C:/Users/narsa/git/Hintmatrix-Project/src/components/MockExam/ExamQuestionRenderer.jsx) — new component with mock-exam stores.
4. [Exam questionTypeOf.js](C:/Users/narsa/git/Hintmatrix-Project/src/components/Exam/ExamComponents/questionTypeOf.js) — distinct type before broad drag/drop matching.
5. [Mock questionTypeOf.js](C:/Users/narsa/git/Hintmatrix-Project/src/components/MockExam/ExamComponents/questionTypeOf.js) — distinct type before broad drag/drop matching.
6. [questionType.js](C:/Users/narsa/git/Hintmatrix-Project/src/utils/questionType.js) — canonical new type alias.
7. [questionAttributeSide.js](C:/Users/narsa/git/Hintmatrix-Project/src/utils/questionAttributeSide.js) — explicitly marked adjustments retain their separate role.
8. [CreateAllQuestions.jsx](C:/Users/narsa/git/Hintmatrix-Project/src/pages/Questions/CreateAllQuestions.jsx) — shared debit/credit editor dispatch for both types, draft/reset/edit state, validation and payload.
9. [AddQuestionModal.jsx](C:/Users/narsa/git/Hintmatrix-Project/src/pages/Questions/AddQuestionModal.jsx) — separate creation/edit branch with complete adjustment persistence.
10. [QuestionTable.jsx](C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/QuestionTable.jsx) — common Trial Balance, optional Adjustments card, summary and statement layout with original store and controlled-state adapters.
11. [Draggable.jsx](C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/Draggable.jsx) — shared tiles, status icons and Hint / Auto Fill actions with original-store and controlled-state adapters.
12. [Draggable.css](C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/Draggable.css) — common tile selection and account-note styling.
13. [Droppable.jsx](C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/Droppable.jsx) — shared statement tables, controlled answer state, Add/Less drop targets, exam removal and metadata-based grouped subtotals.
14. [Droppable.css](C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/Droppable.css) — common button drop targets, keyboard focus and removal-control styling.

Spring repository:

10. [QuestionAttribute.java](C:/Users/narsa/intellijWorkspace3/ProjectS/src/main/java/com/project/ProjectS/entity/QuestionAttribute.java) — adjustment flag column mapping.
11. [QuestionAttributeRequestDTO.java](C:/Users/narsa/intellijWorkspace3/ProjectS/src/main/java/com/project/ProjectS/model/QuestionAttributeRequestDTO.java) — optional adjustment flag.
12. [QuestionAttributeResponseDTO.java](C:/Users/narsa/intellijWorkspace3/ProjectS/src/main/java/com/project/ProjectS/model/QuestionAttributeResponseDTO.java) — adjustment flag on retrieval.
13. [QuestionService.java](C:/Users/narsa/intellijWorkspace3/ProjectS/src/main/java/com/project/ProjectS/service/QuestionService.java) — new-type header validation and flag create/update/retrieval.
14. [RuleEngineService.java](C:/Users/narsa/intellijWorkspace3/ProjectS/src/main/java/com/project/ProjectS/service/RuleEngineService.java) — reuse existing validated Final Accounts paths for the new type.
15. [ExamScoringService.java](C:/Users/narsa/intellijWorkspace3/ProjectS/src/main/java/com/project/ProjectS/service/ExamScoringService.java) — retain distinct review type.
16. [FinalAccountsDragDropTest.java](C:/Users/narsa/intellijWorkspace3/ProjectS/src/test/java/com/project/ProjectS/service/FinalAccountsDragDropTest.java) — old/new type parameterized regression coverage.
17. [FinalAccountsAutofillResetTest.java](C:/Users/narsa/intellijWorkspace3/ProjectS/src/test/java/com/project/ProjectS/service/FinalAccountsAutofillResetTest.java) — required locked-user fixture stub and Auto Fill retry/reset regressions for both types.
18. [AnswerEventService.java](C:/Users/narsa/intellijWorkspace3/ProjectS/src/main/java/com/project/ProjectS/service/AnswerEventService.java) — allow validated Final Accounts retries after Auto Fill with zero marks; retain unrelated guards.

## Unused duplicates removed

The shared components replace these earlier files:

- `C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/AdjustmentQuestionLayout.jsx`.
- `C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/AdjustmentQuestionLayout.test.js`.
- `C:/Users/narsa/git/Hintmatrix-Project/src/components/Question/DragAndDropWithAdj.css`.

Pre-existing backend log changes were left alone and are not implementation files. Build outputs and test reports are generated artifacts. No commit, deployment or database mutation was performed.

## Create All shared editor correction (October 10, 2026)

Created `src/pages/Questions/DragAndDropAttributeEditor.jsx` and `DragAndDropAttributeEditor.test.js`. Modified `CreateAllQuestions.jsx`, `CreateAllQuestions.css`, and this report. Both `DRAG_AND_DROP` and `DRAG_AND_DROP_WITH_ADJ` select the shared authoring component. Only the latter supplies adjustment rows, which render in a second table below the identical debit/credit card using existing CSS. The adjustment table contains only the account selector, amount and add/remove controls; information and second-amount controls are removed. Existing serialization remains compatible with saved data. No backend changes are required for this correction.

Verification: all **7** shared-editor and adjustment-form tests passed; scoped ESLint passed; production Vite build passed with the existing bundle-size warning; whitespace check passed. Browser visual verification was unavailable in this environment.
