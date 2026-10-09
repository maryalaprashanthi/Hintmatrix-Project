import { useEffect, useState } from "react";
import { getQuestionAttributeSide } from "../../utils/questionAttributeSide";
import { createPortal } from "react-dom";
import Select from "react-select";

import CourseService from "../../services/CourseService";
import SubjectService from "../../services/SubjectService";
import ChapterService from "../../services/ChapterService";
import TopicService from "../../services/TopicService";
import QuestionTypeService from "../../services/QuestionTypeService";
import TableAttributeService from "../../services/TableAttributeService";
import TableHeaderService from "../../services/TableHeaderService";
import QuestionService from "../../services/QuestionService";
import MatchingQuestionService from "../../services/MatchingQuestionService";
import McqQuestionService from "../../services/McqQuestionService";
import FillInBlankQuestionService from "../../services/FillInBlankQuestionService";
import { normalizeQuestionType, isMatchingQuestionType, isFillBlankQuestionType } from "../../utils/questionType";

import {
  FaTimes,
  FaList,
  FaFileAlt,
  FaSave,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import "./AddQuestionModal.css";

const mcqType = normalizeQuestionType;
const isMcqType = (name) =>
  ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(mcqType(name));

function AddQuestionModal({
  courseId: initialCourseId,
  subjectId: initialSubjectId,
  chapterId: initialChapterId,
  topicId: initialTopicId,
  initialData,
  onClose,
  onSave,
}) {
  const [courseId, setCourseId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [chapterId, setChapterId] = useState(null);
  const [topicId, setTopicId] = useState(null);
  const [questionTypeId, setQuestionTypeId] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [mcqOptions, setMcqOptions] = useState([]);
  const [marks, setMarks] = useState(1);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqLoadError, setMcqLoadError] = useState("");
  const [mcqSaving, setMcqSaving] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(Boolean(initialData?.questionId));
  const [detailsError, setDetailsError] = useState("");
  const [saving, setSaving] = useState(false);
  const [blankAnswers, setBlankAnswers] = useState([]);
  const isFillBlankQuestion = isFillBlankQuestionType(questionTypeId?.label);
  const isMcqQuestion = isMcqType(questionTypeId?.label);
  const isMultipleChoice = mcqType(questionTypeId?.label) === "MULTIPLE_CHOICE";

  useEffect(() => {
    if (!isMcqQuestion) return;
    if (!initialData?.questionId) {
      setMcqOptions([
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ]);
      return;
    }
    let cancelled = false;
    setMcqLoading(true);
    setMcqLoadError("");
    McqQuestionService.getById(initialData.questionId)
      .then(({ data }) => {
        if (cancelled) return;
        setMarks(data.marks ?? 1);
        setMcqOptions(
          [...(data.options || [])]
            .sort((a, b) => a.optionOrder - b.optionOrder)
            .map((option) => ({
              ...option,
              isCorrect:
                option.isCorrect === true || option.isCorrect === "true",
            })),
        );
      })
      .catch(() => {
        if (!cancelled)
          setMcqLoadError(
            "Unable to load MCQ options. Close and reopen the edit form.",
          );
      })
      .finally(() => {
        if (!cancelled) setMcqLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialData?.questionId, isMcqQuestion]);

  // =========================================================
  // DROPDOWN OPTIONS
  // =========================================================

  const [courseOptions, setCourseOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);
  const [questionTypeOptions, setQuestionTypeOptions] = useState([]);
  const [balanceOptions, setBalanceOptions] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);

  // =========================================================
  // NORMAL QUESTION ATTRIBUTES
  // =========================================================

  const [attributes, setAttributes] = useState([
    {
      debitBalance: "",
      debitAmount: "",
      creditBalance: "",
      creditAmount: "",
    },
  ]);

  // =========================================================
  // MATCHING QUESTION PAIRS
  // =========================================================

  const [matchingPairs, setMatchingPairs] = useState([
    {
      pairId: null,
      columnA: "",
      columnB: "",
      displayOrder: 1,
    },
  ]);

  // =========================================================
  // INITIAL DATA LOAD
  // =========================================================

  useEffect(() => {
    getData();
    loadQuestionTypes();
    loadTableAttributes();
    TableHeaderService.getAll()
      .then(({ data }) => setTableHeaders(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Failed to load table headers:", error));
  }, []);

  // =========================================================
  // LOAD COURSE / SUBJECT / CHAPTER / TOPIC
  // =========================================================

  const getData = async () => {
    try {
      const [courseResponse, subjectResponse, chapterResponse, topicResponse] =
        await Promise.all([
          CourseService.getAllCourses(),
          SubjectService.getAll(),
          ChapterService.getAll(),
          TopicService.getAll(),
        ]);

      const courseData = Array.isArray(courseResponse.data)
        ? courseResponse.data
        : [];

      const subjectData = Array.isArray(subjectResponse.data)
        ? subjectResponse.data
        : [];

      const chapterData = Array.isArray(chapterResponse.data)
        ? chapterResponse.data
        : [];

      const topicData = Array.isArray(topicResponse.data)
        ? topicResponse.data
        : [];

      setCourseOptions(
        courseData.map((item) => ({
          value: item.courseId,
          label: item.name,
        })),
      );

      setSubjectOptions(
        subjectData.map((item) => ({
          value: item.subjectId ?? item.subject_id,
          label: item.subjectName ?? item.name,
          courseId: item.courseId ?? item.course_id,
        })),
      );

      setChapterOptions(
        chapterData.map((item) => ({
          value: item.chapterId,
          label: item.name,
          courseId: item.courseId ?? item.course_id,
          subjectId: item.subjectId ?? item.subject_id,
        })),
      );

      setTopicOptions(
        topicData.map((item) => ({
          value: item.topicId ?? item.topic_id ?? item.id,
          label: item.name,
          chapterId: item.chapterId ?? item.chapter_id,
          subjectId: item.subjectId ?? item.subject_id,
        })),
      );
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  // =========================================================
  // CASCADING OPTIONS
  // =========================================================

  const visibleSubjectOptions = subjectOptions.filter(
    (option) =>
      !courseId?.value || String(option.courseId) === String(courseId.value),
  );

  const visibleChapterOptions = chapterOptions.filter((option) => {
    if (subjectId?.value) {
      return String(option.subjectId) === String(subjectId.value);
    }

    return (
      !courseId?.value || String(option.courseId) === String(courseId.value)
    );
  });

  const visibleTopicOptions = topicOptions.filter(
    (option) =>
      !chapterId?.value || String(option.chapterId) === String(chapterId.value),
  );

  // =========================================================
  // LOAD QUESTION TYPES
  // =========================================================

  const loadQuestionTypes = async () => {
    try {
      const response = await QuestionTypeService.getAll();

      const data = Array.isArray(response.data) ? response.data : [];

      const options = data.map((item) => ({
        value: Number(item.questionTypeId ?? item.question_type_id ?? item.id),

        label: String(item.questionType ?? item.name ?? item.type ?? "").trim(),
      }));

      setQuestionTypeOptions(options);
    } catch (error) {
      console.error("Failed to load question types:", error);
    }
  };

  // =========================================================
  // LOAD TABLE ATTRIBUTES
  // =========================================================

  const loadTableAttributes = async () => {
    try {
      const response = await TableAttributeService.getRuleAttributes();

      console.log("TABLE ATTRIBUTE API RESPONSE:", response);

      console.log("TABLE ATTRIBUTE DATA:", response.data);

      const data = response.data.map((item) => ({
        value: Number(item.attributeId),
        label: item.name,
        amount: item.amount ?? item.amount1 ?? item.amount2 ?? "",
      }));

      console.log("DROPDOWN OPTIONS:", data);

      setBalanceOptions(data);
    } catch (error) {
      console.error("TABLE ATTRIBUTE ERROR:", error);

      console.error("STATUS:", error.response?.status);

      console.error("ERROR DATA:", error.response?.data);
    }
  };

  // =========================================================
  // LOAD INITIAL DATA
  // =========================================================

  useEffect(() => {
    const selectedCourseId = initialData?.courseId ?? initialCourseId;

    const selectedSubjectId = initialData?.subjectId ?? initialSubjectId;

    const selectedChapterId = initialData?.chapterId ?? initialChapterId;

    const selectedTopicId = initialData?.topicId ?? initialTopicId;

    const selectedQuestionTypeId =
      initialData?.questionTypeId ?? initialData?.question_type_id;

    setQuestionText(initialData?.questionText || "");

    if (selectedQuestionTypeId && questionTypeOptions.length > 0) {
      const selectedQuestionType = questionTypeOptions.find(
        (option) => option.value === Number(selectedQuestionTypeId),
      );

      if (selectedQuestionType) {
        setQuestionTypeId(selectedQuestionType);
      }
    }

    if (selectedCourseId && courseOptions.length > 0) {
      const selectedCourse = courseOptions.find(
        (option) => option.value === Number(selectedCourseId),
      );

      if (selectedCourse) {
        setCourseId(selectedCourse);
      }
    }

    if (selectedSubjectId && subjectOptions.length > 0) {
      const selectedSubject = subjectOptions.find(
        (option) => option.value === Number(selectedSubjectId),
      );

      if (selectedSubject) {
        setSubjectId(selectedSubject);
      }
    }

    if (selectedChapterId && chapterOptions.length > 0) {
      const selectedChapter = chapterOptions.find(
        (option) => option.value === Number(selectedChapterId),
      );

      if (selectedChapter) {
        setChapterId(selectedChapter);
      }
    }

    if (selectedTopicId && topicOptions.length > 0) {
      const selectedTopic = topicOptions.find(
        (option) => option.value === Number(selectedTopicId),
      );

      if (selectedTopic) {
        setTopicId(selectedTopic);
      }
    }
  }, [
    initialCourseId,
    initialSubjectId,
    initialChapterId,
    initialTopicId,
    initialData,
    courseOptions,
    subjectOptions,
    chapterOptions,
    topicOptions,
    questionTypeOptions,
  ]);

  // =========================================================
  // LOAD EXISTING QUESTION DETAILS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadQuestionDetails = async () => {
      if (!initialData?.questionId) {
        setDetailsLoading(false);
        setDetailsError("");
        setBlankAnswers([{ answerText: "", blankNumber: 1, isCorrect: true }]);
        setAttributes([
          {
            debitBalance: "",
            debitAmount: "",
            creditBalance: "",
            creditAmount: "",
          },
        ]);

        setMatchingPairs([
          {
            pairId: null,
            columnA: "",
            columnB: "",
            displayOrder: 1,
          },
        ]);

        return;
      }

      setDetailsLoading(true);
      setDetailsError("");
      try {
        // =====================================================
        // LOAD COMMON QUESTION DETAILS
        // =====================================================

        const response = await QuestionService.getQuestionById(
          initialData.questionId,
        );

        const question = response.data || initialData;

        const questionAttributes = question.questionAttributes || [];

        const isCreditAttribute = (attribute) => getQuestionAttributeSide(attribute) === "credit";

        if (cancelled) return;

        setQuestionText(question.questionText || "");

        // =====================================================
        // GET QUESTION TYPE
        // =====================================================

        const loadedQuestionTypeId =
          question.questionTypeId ?? question.question_type_id;

        if (loadedQuestionTypeId && questionTypeOptions.length > 0) {
          const selectedQuestionType = questionTypeOptions.find(
            (option) => option.value === Number(loadedQuestionTypeId),
          );

          if (selectedQuestionType) {
            setQuestionTypeId(selectedQuestionType);
          }
        }

        // =====================================================
        // LOAD MATCHING PAIRS
        // =====================================================

        const loadedType = question.questionType ?? questionTypeOptions.find(
          (option) => option.value === Number(loadedQuestionTypeId),
        )?.label;
        if (isFillBlankQuestionType(loadedType)) {
          const { data } = await FillInBlankQuestionService.getById(initialData.questionId);
          if (cancelled) return;
          if (!Array.isArray(data.answers) || !data.answers.length) {
            throw new Error("Blank answers were not returned by the server.");
          }
          setBlankAnswers(data.answers.map((answer) => ({
            ...answer,
            isCorrect: answer.isCorrect === true || answer.isCorrect === "true",
          })));
        }
        if (isMatchingQuestionType(loadedType)) {
            const matchingResponse = await MatchingQuestionService.getById(
              initialData.questionId,
            );

            const matchingQuestion = matchingResponse.data;
            if (cancelled) return;
            if (!Array.isArray(matchingQuestion?.pairs) || !matchingQuestion.pairs.length) {
              throw new Error("Matching pairs were not returned by the server.");
            }
              setMatchingPairs(
                matchingQuestion.pairs.map((pair, index) => ({
                  pairId: pair.pairId ?? null,

                  columnA: pair.columnA ?? "",

                  columnB: pair.columnB ?? "",

                  displayOrder: pair.displayOrder ?? index + 1,
                })),
              );
        }

        // =====================================================
        // LOAD NORMAL QUESTION ATTRIBUTES
        // =====================================================

        setAttributes(
          questionAttributes.length > 0
            ? (() => {
                const debitAttributes = questionAttributes.filter(
                  (attribute) => !isCreditAttribute(attribute),
                );

                const creditAttributes =
                  questionAttributes.filter(isCreditAttribute);

                const rowCount = Math.max(
                  debitAttributes.length,
                  creditAttributes.length,
                );

                return Array.from(
                  {
                    length: rowCount,
                  },
                  (_, index) => {
                    const debit = debitAttributes[index];

                    const credit = creditAttributes[index];

                    return {
                      debitOriginal: debit || null,

                      debitQuestionAttributeId:
                        debit?.questionAttributeId ?? "",

                      debitBalance:
                        debit?.attributeId ?? debit?.attribute_id ?? "",

                      debitAttributeName: debit?.attributeName || "",

                      debitAmount:
                        debit?.amount ?? debit?.amount1 ?? debit?.amount2 ?? "",

                      creditQuestionAttributeId:
                        credit?.questionAttributeId ?? "",

                      creditOriginal: credit || null,

                      creditBalance:
                        credit?.attributeId ?? credit?.attribute_id ?? "",

                      creditAttributeName: credit?.attributeName || "",

                      creditAmount:
                        credit?.amount ??
                        credit?.amount1 ??
                        credit?.amount2 ??
                        "",
                    };
                  },
                );
              })()
            : [
                {
                  debitBalance: "",
                  debitAmount: "",
                  creditBalance: "",
                  creditAmount: "",
                },
              ],
        );
      } catch (error) {
        console.error("Question details load error:", error);
        if (!cancelled) setDetailsError("Unable to load complete question details. Close and reopen the form.");
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    };

    loadQuestionDetails();

    return () => {
      cancelled = true;
    };
  }, [initialData, questionTypeOptions]);

  // =========================================================
  // MATCHING QUESTION CHECK
  // =========================================================

  const isMatchingQuestion = isMatchingQuestionType(questionTypeId);

  const getBalanceValue = (row, side) => {
    const value = row[`${side}Balance`];
    if (value === "" || value == null) return null;
    return balanceOptions.find((option) => String(option.value) === String(value)) ?? {
      value: Number(value),
      label: row[`${side}AttributeName`] || `Attribute ${value}`,
    };
  };

  const getBalanceHeader = (row, side) => {
    const original = row[`${side}Original`];
    if (original?.attributeHeaderId != null &&
        String(original.attributeId) === String(row[`${side}Balance`]) &&
        getQuestionAttributeSide({ headerName: original.attributeHeaderName }) === side) {
      return { headerId: Number(original.attributeHeaderId), headerName: original.attributeHeaderName };
    }
    if (original?.headerId != null &&
        getQuestionAttributeSide({ headerName: original.headerName }) === side) {
      return { headerId: Number(original.headerId), headerName: original.headerName };
    }
    const header = tableHeaders.find((item) =>
      getQuestionAttributeSide({ headerName: item.name }) === side,
    );
    return header ? { headerId: Number(header.headerId), headerName: header.name } : null;
  };

  // =========================================================
  // NORMAL ATTRIBUTE FUNCTIONS
  // =========================================================

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];

    updated[index][field] = value;

    setAttributes(updated);
  };

  const handleAddRow = () => {
    setAttributes([
      ...attributes,
      {
        debitBalance: "",
        debitAmount: "",
        creditBalance: "",
        creditAmount: "",
      },
    ]);
  };

  const handleDeleteRow = (index) => {
    if (attributes.length === 1) return;

    const updatedRows = attributes.filter((_, i) => i !== index);

    setAttributes(updatedRows);
  };

  // =========================================================
  // MATCHING PAIR FUNCTIONS
  // =========================================================

  const handleMatchingPairChange = (index, field, value) => {
    setMatchingPairs((current) =>
      current.map((pair, pairIndex) =>
        pairIndex === index
          ? {
              ...pair,
              [field]: value,
            }
          : pair,
      ),
    );
  };

  const handleAddMatchingPair = () => {
    setMatchingPairs((current) => [
      ...current,
      {
        pairId: null,
        columnA: "",
        columnB: "",
        displayOrder: current.length + 1,
      },
    ]);
  };

  const handleDeleteMatchingPair = (index) => {
    if (matchingPairs.length <= 1) {
      return;
    }

    setMatchingPairs((current) =>
      current
        .filter((_, pairIndex) => pairIndex !== index)
        .map((pair, pairIndex) => ({
          ...pair,
          displayOrder: pairIndex + 1,
        })),
    );
  };

  // =========================================================
  // SAVE QUESTION
  // =========================================================

  const handleSave = async () => {
    if (mcqSaving || saving || detailsLoading || detailsError) return;
    // =======================================================
    // REQUIRED FIELD VALIDATION
    // =======================================================

    if (
      !courseId ||
      !subjectId ||
      !chapterId ||
      !topicId ||
      !questionTypeId ||
      !questionText.trim()
    ) {
      alert("Please fill all required fields.");

      return;
    }

    // =======================================================
    // MATCHING QUESTION
    // =======================================================

    if (isFillBlankQuestion) {
      const groups = new Map();
      for (const answer of blankAnswers) {
        const number = Number(answer.blankNumber);
        if (!answer.answerText?.trim() || !Number.isInteger(number) || number < 1) {
          alert("Enter an answer and a positive blank number for every option.");
          return;
        }
        groups.set(number, (groups.get(number) || false) || answer.isCorrect);
      }
      if (!groups.size || [...groups.values()].some((correct) => !correct)) {
        alert("Every blank needs at least one correct answer.");
        return;
      }
      setSaving(true);
      try {
        const payload = {
          courseId: Number(courseId.value), subjectId: Number(subjectId.value),
          chapterId: Number(chapterId.value), topicId: Number(topicId.value),
          questionTypeId: Number(questionTypeId.value), questionText: questionText.trim(),
          answers: blankAnswers.map((answer, index) => ({
            ...answer, answerText: answer.answerText.trim(),
            blankNumber: Number(answer.blankNumber), displayOrder: index + 1,
          })),
        };
        const response = initialData?.questionId
          ? await FillInBlankQuestionService.update(initialData.questionId, payload)
          : await FillInBlankQuestionService.create(payload);
        await onSave(response.data);
        handleClose();
      } catch (error) {
        alert(error.response?.data?.message || "Unable to save blank answers.");
      } finally { setSaving(false); }
      return;
    }

    if (isMcqQuestion) {
      if (mcqLoading || mcqLoadError) return;
      const correctCount = mcqOptions.filter(
        (option) => option.isCorrect,
      ).length;
      if (
        mcqOptions.length < 2 ||
        mcqOptions.some((option) => !option.optionText?.trim()) ||
        correctCount === 0 ||
        (!isMultipleChoice && correctCount !== 1) ||
        !Number.isFinite(Number(marks)) ||
        Number(marks) <= 0
      ) {
        alert(
          "Enter positive marks, at least two options, and select " +
            (isMultipleChoice
              ? "at least one correct answer."
              : "exactly one correct answer."),
        );
        return;
      }
      setMcqSaving(true);
      try {
        const payload = {
          courseId: Number(courseId.value),
          chapterId: Number(chapterId.value),
          topicId: Number(topicId.value),
          questionTypeId: Number(questionTypeId.value),
          questionText: questionText.trim(),
          marks: Number(marks),
          options: mcqOptions.map((option, index) => ({
            ...(option.optionId ? { optionId: option.optionId } : {}),
            optionText: option.optionText.trim(),
            optionOrder: index + 1,
            isCorrect: option.isCorrect,
          })),
        };
        const response = initialData?.questionId
          ? await McqQuestionService.update(initialData.questionId, payload)
          : await McqQuestionService.create(payload);
        await onSave(response.data);
        handleClose();
      } catch (error) {
        alert(error.response?.data?.message || "Unable to save MCQ question.");
      } finally {
        setMcqSaving(false);
      }
      return;
    }

    if (isMatchingQuestion) {
      const invalidPair = matchingPairs.some(
        (pair) => !pair.columnA?.trim() || !pair.columnB?.trim(),
      );

      if (invalidPair) {
        alert("Please fill both Column A and Column B for every pair.");

        return;
      }

      const matchingQuestionData = {
        courseId: Number(courseId.value),

        subjectId: Number(subjectId.value),

        chapterId: Number(chapterId.value),

        topicId: Number(topicId.value),

        questionTypeId: Number(questionTypeId.value),

        questionText: questionText.trim(),

        pairs: matchingPairs.map((pair, index) => ({
          ...(pair.pairId
            ? {
                pairId: Number(pair.pairId),
              }
            : {}),

          columnA: pair.columnA.trim(),

          columnB: pair.columnB.trim(),

          displayOrder: index + 1,
        })),
      };

      console.log("MATCHING QUESTION REQUEST:", matchingQuestionData);

      setSaving(true);
      try {
        const response = initialData?.questionId
          ? await MatchingQuestionService.update(
              initialData.questionId,
              matchingQuestionData,
            )
          : await MatchingQuestionService.create(matchingQuestionData);

        await onSave(response.data);

        handleClose();
      } catch (error) {
        console.error("Save Matching Question Error:", error);

        console.error("Response:", error.response?.data);

        alert(
          `Failed to ${initialData ? "update" : "create"} matching question.`,
        );
      } finally { setSaving(false); }

      return;
    }

    // =======================================================
    // NORMAL QUESTION ATTRIBUTES
    // =======================================================

    if (attributes.some((row) =>
      (row.debitBalance && !getBalanceHeader(row, "debit")) ||
      (row.creditBalance && !getBalanceHeader(row, "credit")),
    )) {
      alert("Unable to resolve debit/credit headers. Check the table headers and reopen the form.");
      return;
    }

    const questionAttributes = attributes.flatMap((row) => {
      const mappedAttributes = [];

      // =====================================================
      // DEBIT
      // =====================================================

      if (row.debitBalance) {
        const debitAmount =
          row.debitAmount === "" ? null : Number(row.debitAmount);

        mappedAttributes.push({
          ...(row.debitOriginal || {}),

          ...(row.debitQuestionAttributeId && {
            questionAttributeId: row.debitQuestionAttributeId,
          }),

          ...getBalanceHeader(row, "debit"),

          attributeId: Number(row.debitBalance),

          attributeName: row.debitAttributeName || undefined,

          amount: debitAmount,

          amount1: debitAmount,

          amount2: row.debitOriginal?.amount2 ?? null,

          transaction: "Debit",
        });
      }

      // =====================================================
      // CREDIT
      // =====================================================

      if (row.creditBalance) {
        const creditAmount =
          row.creditAmount === "" ? null : Number(row.creditAmount);

        mappedAttributes.push({
          ...(row.creditOriginal || {}),

          ...(row.creditQuestionAttributeId && {
            questionAttributeId: row.creditQuestionAttributeId,
          }),

          ...getBalanceHeader(row, "credit"),

          attributeId: Number(row.creditBalance),

          attributeName: row.creditAttributeName || undefined,

          amount: creditAmount,

          amount1: creditAmount,

          amount2: row.creditOriginal?.amount2 ?? null,

          transaction: "Credit",
        });
      }

      return mappedAttributes;
    });

    // =======================================================
    // NORMAL QUESTION REQUEST
    // =======================================================

    const questionData = {
      courseId: Number(courseId.value),

      subjectId: Number(subjectId.value),

      chapterId: Number(chapterId.value),

      topicId: Number(topicId.value),

      questionTypeId: Number(questionTypeId.value),

      questionText: questionText.trim(),

      questionAttributes,
    };

    console.log("NORMAL QUESTION REQUEST:", questionData);

    setSaving(true);
    try {
      const response = initialData?.questionId
        ? await QuestionService.update(initialData.questionId, questionData)
        : await QuestionService.create(questionData);

      await onSave(response.data);

      handleClose();
    } catch (error) {
      console.error("Save Question Error:", error);

      console.error("Response:", error.response?.data);

      alert(`Failed to ${initialData ? "update" : "create"} question.`);
    } finally { setSaving(false); }
  };

  // =========================================================
  // CLOSE / RESET
  // =========================================================

  const handleClose = () => {
    setCourseId(null);
    setSubjectId(null);
    setChapterId(null);
    setTopicId(null);
    setQuestionTypeId(null);
    setQuestionText("");

    setAttributes([
      {
        debitBalance: "",
        debitAmount: "",
        creditBalance: "",
        creditAmount: "",
      },
    ]);

    setMatchingPairs([
      {
        pairId: null,
        columnA: "",
        columnB: "",
        displayOrder: 1,
      },
    ]);

    onClose();
  };

  // =========================================================
  // UI
  // =========================================================

  return createPortal(
    <div className="modal-overlay">
      <div className="table-name-modal">
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="modal-header">
          <div>
            <h2>{initialData ? "Edit Question" : "Add New Question"}</h2>

            <p>
              {initialData
                ? "Update the question details below."
                : "Fill in the details below to create a new question."}
            </p>
          </div>

          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {/* ===================================================
            BODY
        =================================================== */}

        <div className="modal-body">
          {/* =================================================
              QUESTION DETAILS
          ================================================= */}

          <div className="form-card">
            <h3 className="section-title">Question Details</h3>

            <div className="form-grid">
              {/* =============================================
                  COURSE
              ============================================= */}

              <div className="form-group">
                <label>
                  Course Name <span>*</span>
                </label>

                <div className="select-box">
                  <FaList className="select-icon" />

                  <Select
                    className="aq-search-select"
                    classNamePrefix="aq-select"
                    options={courseOptions}
                    value={courseId}
                    onChange={(option) => {
                      setCourseId(option);

                      setSubjectId(null);

                      setChapterId(null);

                      setTopicId(null);
                    }}
                    placeholder="Select Course Name"
                    isSearchable
                    isDisabled={!!initialCourseId}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>
              </div>

              {/* =============================================
                  SUBJECT
              ============================================= */}

              <div className="form-group">
                <label>
                  Subject <span>*</span>
                </label>

                <div className="select-box">
                  <FaList className="select-icon" />

                  <Select
                    className="aq-search-select"
                    classNamePrefix="aq-select"
                    options={visibleSubjectOptions}
                    value={subjectId}
                    onChange={(option) => {
                      setSubjectId(option);

                      setChapterId(null);

                      setTopicId(null);
                    }}
                    placeholder="Select Subject"
                    isSearchable
                    isDisabled={!!initialSubjectId || !courseId}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>
              </div>

              {/* =============================================
                  CHAPTER
              ============================================= */}

              <div className="form-group">
                <label>
                  Chapter Name <span>*</span>
                </label>

                <div className="select-box">
                  <FaList className="select-icon" />

                  <Select
                    className="aq-search-select"
                    classNamePrefix="aq-select"
                    options={visibleChapterOptions}
                    value={chapterId}
                    onChange={(option) => {
                      setChapterId(option);

                      setTopicId(null);
                    }}
                    placeholder="Select Chapter Name"
                    isSearchable
                    isDisabled={!!initialChapterId || !subjectId}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>
              </div>

              {/* =============================================
                  TOPIC
              ============================================= */}

              <div className="form-group">
                <label>
                  Topic <span>*</span>
                </label>

                <div className="select-box">
                  <FaList className="select-icon" />

                  <Select
                    className="aq-search-select"
                    classNamePrefix="aq-select"
                    options={visibleTopicOptions}
                    value={topicId}
                    onChange={setTopicId}
                    placeholder="Select Topic"
                    isSearchable
                    isDisabled={!!initialTopicId || !chapterId}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>
              </div>

              {/* =============================================
                  QUESTION TYPE
              ============================================= */}

              <div className="form-group">
                <label>
                  Question Type <span>*</span>
                </label>

                <div className="select-box">
                  <FaList className="select-icon" />

                  <Select
                    className="aq-search-select"
                    classNamePrefix="aq-select"
                    options={questionTypeOptions}
                    isDisabled={Boolean(initialData?.questionId)}
                    value={questionTypeId}
                    onChange={(option) => {
                      setQuestionTypeId(option);

                      if (isMatchingQuestionType(option)) {
                        setMatchingPairs([
                          {
                            pairId: null,
                            columnA: "",
                            columnB: "",
                            displayOrder: 1,
                          },
                        ]);
                      }
                    }}
                    placeholder="Select Question Type"
                    isSearchable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ===============================================
                QUESTION TEXT
            =============================================== */}

            <div className="form-group full-width">
              <label>
                Question Text <span>*</span>
              </label>

              <div className="textarea-box">
                <FaFileAlt className="input-icon" />

                <textarea
                  placeholder="Enter question text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              MATCHING QUESTION
          ================================================= */}

          {detailsLoading && <p role="status">Loading question details…</p>}
          {detailsError && <p className="text-danger" role="alert">{detailsError}</p>}
          {isFillBlankQuestion ? (
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Blank number</th><th>Answer / option</th><th>Correct</th><th>Action</th></tr></thead>
                <tbody>{blankAnswers.map((answer, index) => (
                  <tr key={answer.answerId ?? index}>
                    <td><input className="form-control" type="number" min="1" aria-label="Blank number" value={answer.blankNumber ?? 1} onChange={(event) => setBlankAnswers((rows) => rows.map((row, i) => i === index ? { ...row, blankNumber: event.target.value } : row))} /></td>
                    <td><input className="form-control" aria-label="Blank answer" value={answer.answerText ?? ""} onChange={(event) => setBlankAnswers((rows) => rows.map((row, i) => i === index ? { ...row, answerText: event.target.value } : row))} /></td>
                    <td><input type="checkbox" aria-label="Correct answer" checked={Boolean(answer.isCorrect)} onChange={(event) => setBlankAnswers((rows) => rows.map((row, i) => i === index ? { ...row, isCorrect: event.target.checked } : row))} /></td>
                    <td><button type="button" className="btn btn-outline-danger" aria-label="Remove answer" disabled={blankAnswers.length <= 1} onClick={() => setBlankAnswers((rows) => rows.filter((_, i) => i !== index))}><FaTrash /></button></td>
                  </tr>
                ))}</tbody>
              </table>
              <button type="button" className="btn btn-primary" onClick={() => setBlankAnswers((rows) => [...rows, { answerText: "", blankNumber: 1, isCorrect: false }])}><FaPlus /> Add answer</button>
            </div>
          ) : isMcqQuestion ? (
            <div className="form-card question-attributes-section">
              <h3 className="section-title">Answer Options</h3>
              <div className="form-group">
                <label htmlFor="mcq-edit-marks">
                  Marks <span>*</span>
                </label>
                <input
                  id="mcq-edit-marks"
                  className="form-control"
                  type="number"
                  min="1"
                  value={marks}
                  onChange={(event) => setMarks(event.target.value)}
                />
              </div>
              <p>
                {isMultipleChoice
                  ? "Select all correct answers."
                  : "Select one correct answer."}
              </p>
              {mcqLoading && <p>Loading options...</p>}
              {mcqLoadError && (
                <div className="alert alert-danger">{mcqLoadError}</div>
              )}
              {!mcqLoading && !mcqLoadError && (
                <>
                  {mcqOptions.map((option, index) => (
                    <div
                      className="d-flex align-items-center gap-3 mb-3"
                      key={option.optionId ?? `new-${index}`}
                    >
                      <input
                        type={isMultipleChoice ? "checkbox" : "radio"}
                        name="mcq-edit-correct"
                        aria-label={`Option ${index + 1} is correct`}
                        checked={option.isCorrect}
                        onChange={() =>
                          setMcqOptions((current) =>
                            current.map((item, i) => ({
                              ...item,
                              isCorrect: isMultipleChoice
                                ? i === index
                                  ? !item.isCorrect
                                  : item.isCorrect
                                : i === index,
                            })),
                          )
                        }
                      />
                      <input
                        className="form-control"
                        aria-label={`Option ${index + 1}`}
                        value={option.optionText}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        onChange={(event) =>
                          setMcqOptions((current) =>
                            current.map((item, i) =>
                              i === index
                                ? { ...item, optionText: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        aria-label={`Remove option ${index + 1}`}
                        disabled={mcqOptions.length <= 2}
                        onClick={() =>
                          setMcqOptions((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary add-row-btn"
                    onClick={() =>
                      setMcqOptions((current) => [
                        ...current,
                        { optionText: "", isCorrect: false },
                      ])
                    }
                  >
                    <FaPlus className="me-2" /> Add Option
                  </button>
                </>
              )}
            </div>
          ) : isMatchingQuestion ? (
            <div className="form-card question-attributes-section">
              <h3 className="section-title">Matching Pairs</h3>

              <div className="question-table">
                <table className="table table-bordered mt-3">
                  <thead>
                    <tr>
                      <th>Column A</th>

                      <th>Column B</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {matchingPairs.map((pair, index) => (
                      <tr key={index}>
                        {/* COLUMN A */}

                        <td>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Column A"
                            value={pair.columnA}
                            onChange={(e) =>
                              handleMatchingPairChange(
                                index,
                                "columnA",
                                e.target.value,
                              )
                            }
                          />
                        </td>

                        {/* COLUMN B */}

                        <td>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Column B"
                            value={pair.columnB}
                            onChange={(e) =>
                              handleMatchingPairChange(
                                index,
                                "columnB",
                                e.target.value,
                              )
                            }
                          />
                        </td>

                        {/* DELETE */}

                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteMatchingPair(index)}
                            disabled={matchingPairs.length <= 1}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ADD PAIR */}

              <button
                type="button"
                className="btn btn-outline-primary add-row-btn"
                onClick={handleAddMatchingPair}
              >
                <FaPlus className="me-2" />
                Add Pair
              </button>
            </div>
          ) : (
            /* =================================================
               NORMAL QUESTION ATTRIBUTES
            ================================================= */

            <div className="form-card question-attributes-section">
              <h3 className="section-title">Question Attributes</h3>

              <div className="question-table">
                <table className="table table-bordered mt-3">
                  <thead>
                    <tr>
                      <th>Debit Balance</th>

                      <th>Amount</th>

                      <th>Credit Balance</th>

                      <th>Amount</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attributes.map((row, index) => (
                      <tr key={index}>
                        {/* =================================
                              DEBIT BALANCE
                          ================================= */}

                        <td>
                          <Select
                            className="react-select-container"
                            classNamePrefix="credit-select"
                            options={balanceOptions}
                            value={getBalanceValue(row, "debit")}
                            onChange={(selected) =>
                              (() => {
                                const updated = [...attributes];

                                updated[index] = {
                                  ...updated[index],

                                  debitBalance: selected ? selected.value : "",

                                  debitAttributeName: selected?.label || "",

                                  debitAmount: selected ? selected.amount : "",
                                };

                                setAttributes(updated);
                              })()
                            }
                            placeholder="Enter Debit Balance"
                            isSearchable
                            isClearable
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 99999,
                              }),
                            }}
                          />
                        </td>

                        {/* =================================
                              DEBIT AMOUNT
                          ================================= */}

                        <td>
                          <input
                            className="amount-input"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={row.debitAmount}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "debitAmount",
                                e.target.value,
                              )
                            }
                          />
                        </td>

                        {/* =================================
                              CREDIT BALANCE
                          ================================= */}

                        <td>
                          <Select
                            className="react-select-container"
                            classNamePrefix="credit-select"
                            options={balanceOptions}
                            value={getBalanceValue(row, "credit")}
                            onChange={(selected) =>
                              (() => {
                                const updated = [...attributes];

                                updated[index] = {
                                  ...updated[index],

                                  creditBalance: selected ? selected.value : "",

                                  creditAttributeName: selected?.label || "",

                                  creditAmount: selected ? selected.amount : "",
                                };

                                setAttributes(updated);
                              })()
                            }
                            placeholder="Enter Credit Balance"
                            isSearchable
                            isClearable
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 99999,
                              }),
                            }}
                          />
                        </td>

                        {/* =================================
                              CREDIT AMOUNT
                          ================================= */}

                        <td>
                          <input
                            className="amount-input"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={row.creditAmount}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "creditAmount",
                                e.target.value,
                              )
                            }
                          />
                        </td>

                        {/* =================================
                              DELETE
                          ================================= */}

                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteRow(index)}
                            disabled={attributes.length === 1}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ADD ATTRIBUTE ROW */}

              <button
                type="button"
                className="btn btn-outline-primary add-row-btn"
                onClick={handleAddRow}
              >
                <FaPlus className="me-2" />
                Add Row
              </button>
            </div>
          )}
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={
              detailsLoading || !!detailsError || saving || !questionTypeId ||
              (isMcqQuestion && (mcqLoading || !!mcqLoadError || mcqSaving))
            }
          >
            <FaSave className="me-2" />

            {initialData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default AddQuestionModal;
