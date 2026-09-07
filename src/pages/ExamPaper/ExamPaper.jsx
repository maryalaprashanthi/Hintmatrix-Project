import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Button } from "react-bootstrap";
import { FiHelpCircle, FiSave } from "react-icons/fi";
import Select from "react-select";

import CollegeService from "../../services/CollegeService";
import BranchService from "../../services/BranchService";
import CourseService from "../../services/CourseService";
import SectionService from "../../services/SectionService";
import SubjectService from "../../services/SubjectService";
import ChapterService from "../../services/ChapterService";
import ExamPaperService from "../../services/ExamPaperService";
import ExamService from "../../services/ExamService";

import "./ExamPaper.css";
import QuestionSelection from "./QuestionSelection";
import { useToast } from "../../components/Toast/useToast";

const ExamPaper = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { examId } = useParams();
  const isEditMode = Boolean(examId);

  const [currentStep, setCurrentStep] = useState(1);
  const [createdExamId, setCreatedExamId] = useState(examId ?? null);
  const [prefill, setPrefill] = useState(null);
  const [loadingExam, setLoadingExam] = useState(isEditMode);

  // EXAM DETAILS

  const [passPercentage, setPassPercentage] = useState(35);
  const [examName, setExamName] = useState("");

  // SELECTED VALUES

  const [college, setCollege] = useState(null);
  const [branch, setBranch] = useState(null);
  const [course, setCourse] = useState(null);
  const [subject, setSubject] = useState(null);
  const [section, setSection] = useState(null);
  const [chapters, setChapters] = useState([]);

  // DATE / TIME

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // API DATA

  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [chapterData, setChapterData] = useState([]);

  // LOADING STATES

  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // LOAD COLLEGES
  // GET /api/college

  const loadColleges = async () => {
    try {
      setLoadingColleges(true);

      const response = await CollegeService.getAllColleges();

      const data = Array.isArray(response.data) ? response.data : [];

      setColleges(data);
    } catch (error) {
      console.error("Failed to load colleges:", error);
      setColleges([]);
    } finally {
      setLoadingColleges(false);
    }
  };

  // LOAD BRANCHES
  // GET /api/branch

  const loadBranches = async () => {
    try {
      setLoadingBranches(true);

      const response = await BranchService.getAllBranches();

      const data = Array.isArray(response.data) ? response.data : [];

      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  // LOAD COURSES
  // GET /api/course

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);

      const response = await CourseService.getAllCourses();

      const data = Array.isArray(response.data) ? response.data : [];

      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  // LOAD SECTIONS
  // GET /api/section

  const loadSections = async () => {
    try {
      setLoadingSections(true);

      const response = await SectionService.getAllSections();

      const data = Array.isArray(response.data) ? response.data : [];

      setSections(data);
    } catch (error) {
      console.error("Failed to load sections:", error);
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  // LOAD SUBJECTS
  // GET /api/subjects

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);

      const response = await SubjectService.getAll();

      const data = Array.isArray(response.data) ? response.data : [];

      setSubjectData(data);
    } catch (error) {
      console.error("Failed to load subjects:", error);
      setSubjectData([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // LOAD CHAPTERS
  // GET /api/chapter

  const loadChapters = async () => {
    try {
      setLoadingChapters(true);

      const response = await ChapterService.getAll();

      const data = Array.isArray(response.data) ? response.data : [];

      setChapterData(data);
    } catch (error) {
      console.error("Failed to load chapters:", error);
      setChapterData([]);
    } finally {
      setLoadingChapters(false);
    }
  };

  // LOAD ALL MASTER DATA

  useEffect(() => {
    loadColleges();
    loadBranches();
    loadCourses();
    loadSections();
    loadSubjects();
    loadChapters();
  }, []);

  // COLLEGE OPTIONS

  const collegeOptions = useMemo(() => {
    return colleges
      .filter((item) => item.activeRow !== false)
      .map((item) => ({
        value: item.collegeId,
        label: item.instituteName,
      }));
  }, [colleges]);

  // BRANCH OPTIONS

  // Filter branches according to selected college

  const branchOptions = useMemo(() => {
    if (!college) {
      return [];
    }

    return branches
      .filter((item) => String(item.collegeId) === String(college.value))
      .filter((item) => item.activeRow !== false)
      .map((item) => ({
        value: item.branchId,
        label: item.branchName,
      }));
  }, [branches, college]);

  // COURSE OPTIONS

  // Filter courses according to selected branch

  const courseOptions = useMemo(() => {
    if (!branch) {
      return [];
    }

    return courses
      .filter((item) => String(item.branchId) === String(branch.value))
      .filter((item) => item.activeRow !== false)
      .map((item) => ({
        value: item.courseId,
        label: item.name,
      }));
  }, [courses, branch]);

  // SECTION OPTIONS

  // Filter sections according to selected course

  const sectionOptions = useMemo(() => {
    if (!course) {
      return [];
    }

    return sections
      .filter((item) => String(item.courseId) === String(course.value))
      .filter((item) => item.activeRow !== false)
      .map((item) => ({
        value: item.sectionId,
        label: item.sectionName,
      }));
  }, [sections, course]);

  // SUBJECT OPTIONS

  // Filter subjects according to selected course

  const subjectOptions = useMemo(() => {
    if (!course) {
      return [];
    }

    return subjectData
      .filter((item) => String(item.courseId) === String(course.value))
      .filter((item) => item.activeRow !== false)
      .map((item) => ({
        value: item.subjectId,
        label: item.subjectName,
      }));
  }, [subjectData, course]);

  // CHAPTER OPTIONS

  // Filter chapters according to selected subject

  const chapterOptions = useMemo(() => {
    if (!subject) {
      return [];
    }

    return chapterData
      .filter((item) => String(item.subjectId) === String(subject.value))
      .filter((item) => item.activeRow !== false)
      .map((item) => ({
        value: item.chapterId,
        label: item.name,
      }));
  }, [chapterData, subject]);

  // EDIT MODE: load the exam being edited and prefill the primitive fields
  // GET /api/exams/{examId}

  useEffect(() => {
    if (!isEditMode) return undefined;

    let active = true;
    setLoadingExam(true);

    ExamService.getById(examId)
      .then((response) => {
        if (!active) return;

        const data = response?.data ?? {};
        const [sd, st] = String(data.startDate ?? "").split("T");
        const [ed, et] = String(data.endDate ?? "").split("T");

        setExamName(data.examName ?? "");

        if (data.passPercentage != null) {
          setPassPercentage(Number(data.passPercentage));
        }

        setStartDate(sd || "");
        setStartTime((st || "").slice(0, 5));
        setEndDate(ed || "");
        setEndTime((et || "").slice(0, 5));

        setPrefill(data);
      })
      .catch((error) => {
        console.error("Failed to load exam for editing:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load this exam.",
        );
      })
      .finally(() => {
        if (active) setLoadingExam(false);
      });

    return () => {
      active = false;
    };
  }, [isEditMode, examId]);

  // EDIT MODE: resolve each dropdown selection once its option list is ready.
  // The lists cascade (college -> branch -> course -> section/chapters), so
  // these effects fire in turn as each selection unlocks the next list.

  const prefillChapterIds = prefill?.chapterIds ?? prefill?.chapters ?? null;

  useEffect(() => {
    if (prefill?.collegeId == null) return;
    const match = collegeOptions.find(
      (item) => String(item.value) === String(prefill.collegeId),
    );
    if (match) setCollege(match);
  }, [prefill, collegeOptions]);

  useEffect(() => {
    if (prefill?.branchId == null) return;
    const match = branchOptions.find(
      (item) => String(item.value) === String(prefill.branchId),
    );
    if (match) setBranch(match);
  }, [prefill, branchOptions]);

  useEffect(() => {
    if (prefill?.courseId == null) return;
    const match = courseOptions.find(
      (item) => String(item.value) === String(prefill.courseId),
    );
    if (match) setCourse(match);
  }, [prefill, courseOptions]);

  useEffect(() => {
    if (prefill?.sectionId == null) return;
    const match = sectionOptions.find(
      (item) => String(item.value) === String(prefill.sectionId),
    );
    if (match) setSection(match);
  }, [prefill, sectionOptions]);

  useEffect(() => {
    if (prefill?.subjectId == null) return;
    const match = subjectOptions.find(
      (item) => String(item.value) === String(prefill.subjectId),
    );
    if (match) setSubject(match);
  }, [prefill, subjectOptions]);

  // EDIT MODE FALLBACK: the exam record itself doesn't store a subjectId
  // (backend never added the column), so derive it from one of the exam's
  // own chapters instead - each chapter already knows its subject.
  useEffect(() => {
    if (subject) return;
    if (!Array.isArray(prefillChapterIds) || prefillChapterIds.length === 0) {
      return;
    }

    const firstChapterId = String(
      prefillChapterIds[0]?.value ?? prefillChapterIds[0],
    );
    const matchedChapter = chapterData.find(
      (item) => String(item.chapterId) === firstChapterId,
    );
    if (!matchedChapter) return;

    const match = subjectOptions.find(
      (item) => String(item.value) === String(matchedChapter.subjectId),
    );
    if (match) setSubject(match);
  }, [prefillChapterIds, chapterData, subjectOptions, subject]);

  useEffect(() => {
    if (!Array.isArray(prefillChapterIds) || prefillChapterIds.length === 0) {
      return;
    }
    const ids = prefillChapterIds.map((item) => String(item.value ?? item));
    const matches = chapterOptions.filter((item) =>
      ids.includes(String(item.value)),
    );
    if (matches.length) setChapters(matches);
  }, [prefillChapterIds, chapterOptions]);

  // COLLEGE CHANGE ,When college changes:
  // Branch must reset,Chapters must reset, Section must reset,Course must reset

  const handleCollegeChange = (selectedCollege) => {
    setCollege(selectedCollege);

    setBranch(null);
    setCourse(null);
    setSection(null);
    setSubject(null);
    setChapters([]);
  };

  // BRANCH CHANGE

  // When branch changes:
  // Course must reset,Section must reset,Chapters must reset

  const handleBranchChange = (selectedBranch) => {
    setBranch(selectedBranch);

    setCourse(null);
    setSection(null);
    setSubject(null);
    setChapters([]);
  };

  // COURSE CHANGE

  // When course changes:
  // Section must reset, Subject must reset, Chapters must reset

  const handleCourseChange = (selectedCourse) => {
    setCourse(selectedCourse);

    setSection(null);
    setSubject(null);
    setChapters([]);
  };

  // SUBJECT CHANGE

  // When subject changes:
  // Chapters must reset

  const handleSubjectChange = (selectedSubject) => {
    setSubject(selectedSubject);

    setChapters([]);
  };

  // NEXT BUTTON

  const handleNext = () => {
    if (isEditMode) {
      setCurrentStep(2);
      return;
    }

    if (!examName.trim()) {
      toast.error("Please enter an exam name.");
      return;
    }

    if (!college) {
      toast.error("Please select a college.");
      return;
    }

    if (!course) {
      toast.error("Please select a course.");
      return;
    }

    if (!subject) {
      toast.error("Please select a subject.");
      return;
    }

    if (chapters.length === 0) {
      toast.error("Please select at least one chapter.");
      return;
    }

    setCurrentStep(2);
  };

  // BACK BUTTON

  const handleBack = () => {
    setCurrentStep(1);
  };

  // SAVE AND FINISH

  const handleSave = async () => {
    try {
      const requestPayload = {
        examName,
        collegeId: college?.value ?? null,
        branchId: branch?.value ?? null,
        courseId: course?.value ?? null,
        sectionId: section?.value ?? null,
        subjectId: subject?.value ?? null,
        chapterIds: chapters.map((item) => item.value ?? item),
        startDate:
          startDate && startTime ? `${startDate}T${startTime}:00` : null,
        endDate: endDate && endTime ? `${endDate}T${endTime}:00` : null,
        passPercentage,
      };

      if (isEditMode) {
        console.log("Exam update payload being sent:", requestPayload);
        await ExamService.update(examId, requestPayload);
        toast.success("Exam updated.");
        navigate("/exams");
        return;
      }

      console.log("Final exam create payload being sent:", requestPayload);

      const response = await ExamPaperService.createExamPaper(requestPayload);
      const newExamId = response?.data?.id ?? response?.data?.examId;

      setCreatedExamId(newExamId);
      console.log("Exam created successfully:", response?.data);
      toast.success("Exam created.");
      setCurrentStep(2);
    } catch (error) {
      console.error("Failed to save exam:", error);
      toast.error(error?.response?.data?.message || "Failed to save exam.");
    }
  };

  // QUESTIONS ADDED

  const handleQuestionsAdded = async (questions) => {
    if (!createdExamId) {
      toast.error("Please create the exam first before adding questions.");
      return;
    }

    const questionIds = questions.map((question) => question.questionId);

    try {
      const response = await ExamPaperService.addQuestionsToExam(
        createdExamId,
        questionIds,
      );

      console.log("Questions added to exam:", response?.data);
      toast.success(`${questionIds.length} questions added to the exam.`);
    } catch (error) {
      console.error("Failed to add questions to exam:", error);
      toast.error(
        error?.response?.data?.message || "Failed to add questions to exam.",
      );
    }
  };

  // STEP 2

  if (currentStep === 2) {
    return (
      <QuestionSelection
        courseId={course?.value}
        chapterIds={chapters.map((item) => item.value)}
        examId={createdExamId}
        onNext={handleQuestionsAdded}
        onBack={handleBack}
      />
    );
  }

  //  UI

  return (
    <div className="exam-paper-page">
      <Card className="exam-paper-main-card">
        <Card.Header className="exam-paper-card-header">
          <h2>{isEditMode ? "Edit Exam Paper" : "Exam Paper"}</h2>

          <button
            className="exam-paper-help-btn"
            type="button"
            aria-label="Need help"
          >
            <FiHelpCircle />
          </button>
        </Card.Header>

        <Card.Body className="exam-paper-card-body">
          {/*   STEPPER */}

          <div className="exam-paper-stepper">
            <div className="exam-paper-step exam-paper-step-active">
              <div className="exam-paper-step-circle">1</div>

              <div className="exam-paper-step-label">Create Exam Paper</div>
            </div>

            <div className="exam-paper-step-line">
              <div className="exam-paper-step-line-active"></div>
            </div>

            <div className="exam-paper-step">
              <div className="exam-paper-step-circle">2</div>

              <div className="exam-paper-step-label">Select Questions</div>
            </div>
          </div>

          {/*   FORM CARD */}

          <Card className="exam-paper-form-card">
            <Card.Body>
              <h3 className="exam-paper-form-title">
                {isEditMode
                  ? loadingExam
                    ? "Loading exam details…"
                    : "Update the details of this exam paper"
                  : "Enter the details to create a new exam paper"}
              </h3>

              <div className="exam-paper-form-grid">
                {/* EXAM NAME */}
                <Form.Group className="exam-paper-form-group exam-name-group">
                  <Form.Label>
                    Exam Name <span className="exam-paper-required">*</span>
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="Enter exam name"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="exam-paper-input"
                  />
                </Form.Group>

                {/* COLLEGE */}
                <Form.Group className="exam-paper-form-group">
                  <Form.Label>
                    College <span className="exam-paper-required">*</span>
                  </Form.Label>

                  <Select
                    options={collegeOptions}
                    value={college}
                    onChange={handleCollegeChange}
                    placeholder={
                      loadingColleges
                        ? "Loading colleges..."
                        : "Search and select college"
                    }
                    isSearchable
                    isClearable
                    isLoading={loadingColleges}
                    classNamePrefix="exam-paper-select"
                  />
                </Form.Group>

                {/* BRANCH */}
                <Form.Group className="exam-paper-form-group">
                  <Form.Label>Branch</Form.Label>

                  <Select
                    options={branchOptions}
                    value={branch}
                    onChange={handleBranchChange}
                    placeholder={
                      !college
                        ? "Select college first"
                        : loadingBranches
                          ? "Loading branches..."
                          : "Search and select branch"
                    }
                    isSearchable
                    isClearable
                    isLoading={loadingBranches}
                    isDisabled={!college}
                    classNamePrefix="exam-paper-select"
                  />
                </Form.Group>

                {/* COURSE */}
                <Form.Group className="exam-paper-form-group">
                  <Form.Label>
                    Course <span className="exam-paper-required">*</span>
                  </Form.Label>

                  <Select
                    options={courseOptions}
                    value={course}
                    onChange={handleCourseChange}
                    placeholder={
                      !branch
                        ? "Select branch first"
                        : loadingCourses
                          ? "Loading courses..."
                          : "Search and select course"
                    }
                    isSearchable
                    isClearable
                    isLoading={loadingCourses}
                    isDisabled={!branch}
                    classNamePrefix="exam-paper-select"
                  />
                </Form.Group>

                {/* SECTION */}
                <Form.Group className="exam-paper-form-group">
                  <Form.Label>Section</Form.Label>

                  <Select
                    options={sectionOptions}
                    value={section}
                    onChange={setSection}
                    placeholder={
                      !course
                        ? "Select course first"
                        : loadingSections
                          ? "Loading sections..."
                          : "Search and select section"
                    }
                    isSearchable
                    isClearable
                    isLoading={loadingSections}
                    isDisabled={!course}
                    classNamePrefix="exam-paper-select"
                  />
                </Form.Group>

                {/* SUBJECT */}
                <Form.Group className="exam-paper-form-group">
                  <Form.Label>
                    Subject <span className="exam-paper-required">*</span>
                  </Form.Label>

                  <Select
                    options={subjectOptions}
                    value={subject}
                    onChange={handleSubjectChange}
                    placeholder={
                      !course
                        ? "Select course first"
                        : loadingSubjects
                          ? "Loading subjects..."
                          : "Search and select subject"
                    }
                    isSearchable
                    isClearable
                    isLoading={loadingSubjects}
                    isDisabled={!course}
                    classNamePrefix="exam-paper-select"
                  />
                </Form.Group>

                {/* CHAPTERS */}
                <Form.Group className="exam-paper-form-group">
                  <Form.Label>
                    Select Chapters{" "}
                    <span className="exam-paper-required">*</span>
                  </Form.Label>

                  <Select
                    options={chapterOptions}
                    value={chapters}
                    onChange={(selected) => setChapters(selected || [])}
                    placeholder={
                      !subject
                        ? "Select subject first"
                        : loadingChapters
                          ? "Loading chapters..."
                          : "Search & select chapters..."
                    }
                    isSearchable
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    isLoading={loadingChapters}
                    isDisabled={!subject}
                    classNamePrefix="exam-paper-select"
                  />
                </Form.Group>

                {/* START DATE */}
                <Form.Group className="exam-paper-form-group">
                  <Form.Label>Start Date</Form.Label>

                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="exam-paper-input"
                  />
                </Form.Group>

                {/* START TIME */}
                <Form.Group className="exam-paper-form-group">
                  <Form.Label>Start Time</Form.Label>

                  <Form.Control
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="exam-paper-input"
                  />
                </Form.Group>

                {/* END DATE */}
                <Form.Group className="exam-paper-form-group">
                  <Form.Label>End Date</Form.Label>

                  <Form.Control
                    type="date"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="exam-paper-input"
                  />
                </Form.Group>

                {/* END TIME */}
                <Form.Group className="exam-paper-form-group">
                  <Form.Label>End Time</Form.Label>

                  <Form.Control
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="exam-paper-input"
                  />
                </Form.Group>
              </div>

              {/*  PASS PERCENTAGE */}

              <Form.Group className="exam-paper-form-group exam-paper-pass-group">
                <Form.Label>Select Pass Percentage</Form.Label>

                <div className="exam-paper-slider-container">
                  <div
                    className="exam-paper-percentage-bubble"
                    style={{
                      left: `${passPercentage}%`,
                    }}
                  >
                    {passPercentage}%
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={passPercentage}
                    onChange={(e) => setPassPercentage(Number(e.target.value))}
                    className="exam-paper-slider"
                    style={{
                      "--exam-paper-slider-value": `${passPercentage}%`,
                    }}
                  />

                  <div className="exam-paper-slider-labels">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </Form.Group>

              {/*   BUTTONS */}

              <div className="exam-paper-actions">
                {isEditMode && (
                  <Button
                    type="button"
                    className="exam-paper-next-btn"
                    variant="light"
                    onClick={() => navigate("/exams")}
                  >
                    Cancel
                  </Button>
                )}

                <Button
                  type="button"
                  className="exam-paper-next-btn"
                  onClick={handleNext}
                >
                  {isEditMode ? "Manage questions" : "Next"}
                </Button>

                <Button
                  type="button"
                  className="exam-paper-save-btn"
                  onClick={handleSave}
                >
                  <FiSave />
                  <span>{isEditMode ? "Update exam" : "Save and finish"}</span>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ExamPaper;
