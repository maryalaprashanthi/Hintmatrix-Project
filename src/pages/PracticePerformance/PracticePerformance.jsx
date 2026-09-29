/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Building2,
  ChevronRight,
  CircleCheck,
  FileText,
  GraduationCap,
  Layers,
  ListChecks,
  RefreshCw,
  Target,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";

import PracticePerformanceService, {
  PRACTICE_LEVELS,
} from "../../services/PracticePerformanceService";
import CollegeService from "../../services/CollegeService";
import BranchService from "../../services/BranchService";
import UserService from "../../services/UserService";
import { currentRole, ROLES } from "../../utils/roles";
import { getApiErrorMessage } from "../../utils/apiError";
import "./PracticePerformance.css";

// ---------------------------------------------------------------------------
// Static config
// ---------------------------------------------------------------------------

const LEVEL_META = {
  course: {
    label: "Course",
    plural: "Courses",
    wise: "Course-wise",
    Icon: GraduationCap,
    tone: "blue",
    next: "subject",
  },
  subject: {
    label: "Subject",
    plural: "Subjects",
    wise: "Subject-wise",
    Icon: Layers,
    tone: "indigo",
    next: "chapter",
  },
  chapter: {
    label: "Chapter",
    plural: "Chapters",
    wise: "Chapter-wise",
    Icon: FileText,
    tone: "violet",
    next: "topic",
  },
  topic: {
    label: "Topic",
    plural: "Topics",
    wise: "Topic-wise",
    Icon: Target,
    tone: "purple",
    next: null,
  },
};

// Which scope tabs a role sees, and which of them need a specific
// college / branch / student picked. A tab without `pick` shows everything the
// role can already see.
const SCOPE_TABS = {
  [ROLES.SUPER_ADMIN]: [
    { key: "all", label: "All App" },
    { key: "college", label: "College", pick: "college" },
    { key: "branch", label: "Branch", pick: "branch" },
    { key: "student", label: "Student", pick: "student" },
  ],
  [ROLES.COLLEGE_ADMIN]: [
    { key: "college", label: "My College" },
    { key: "branch", label: "Branch", pick: "branch" },
    { key: "student", label: "Student", pick: "student" },
  ],
  [ROLES.BRANCH_ADMIN]: [
    { key: "branch", label: "My Branch" },
    { key: "student", label: "Student", pick: "student" },
  ],
};

const REVISION_THRESHOLD = 60;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const num = (value) => Number(value) || 0;

const formatCount = (value) => num(value).toLocaleString();

const formatPct = (value) => {
  const rounded = Math.round(num(value) * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
};

const percent = (part, whole) =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

// Accuracy colour bands used by the bars and chips.
const band = (accuracy, attempted) => {
  if (!attempted) return "none";
  if (accuracy >= 75) return "good";
  if (accuracy >= 60) return "ok";
  if (accuracy >= 40) return "warn";
  return "bad";
};

const sortByName = (a, b) =>
  String(a.name ?? "").localeCompare(String(b.name ?? ""));

const deepestLevel = (path) => {
  if (path.chapter) return "chapter";
  if (path.subject) return "subject";
  return "course";
};

const pathToParams = (path) => ({
  courseId: path.course?.id,
  subjectId: path.subject?.id,
  chapterId: path.chapter?.id,
});

const scopeToParams = (scope) => {
  if (scope.mode === "college" && scope.collegeId) {
    return { collegeId: scope.collegeId };
  }
  if (scope.mode === "branch" && scope.branchId) {
    return { branchId: scope.branchId };
  }
  if (scope.mode === "student" && scope.studentId) {
    return { studentId: scope.studentId };
  }
  return {};
};

// ---------------------------------------------------------------------------
// Presentational pieces
// ---------------------------------------------------------------------------

const KpiCard = ({ Icon, tone, label, value, hint }) => (
  <div className="pp-kpi">
    <span className={`pp-kpi__icon pp-tone-${tone}`}>
      <Icon size={22} aria-hidden="true" />
    </span>
    <div className="pp-kpi__body">
      <span className="pp-kpi__label">{label}</span>
      <strong className="pp-kpi__value">{value}</strong>
      {hint && <span className="pp-kpi__hint">{hint}</span>}
    </div>
  </div>
);

const Bar = ({ value, tone }) => (
  <span className="pp-bar" aria-hidden="true">
    <span
      className={`pp-bar__fill pp-bar__fill--${tone}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </span>
);

// Correct / incorrect / not attempted, from the unit counts. Drawn with a CSS
// conic-gradient so it needs no chart library.
const UnitDonut = ({ total, attempted, correct }) => {
  const wrong = Math.max(0, attempted - correct);
  const notAttempted = Math.max(0, total - attempted);

  const segments = [
    { key: "correct", label: "Correct", value: correct, color: "#00a86b" },
    { key: "wrong", label: "Incorrect", value: wrong, color: "#e53935" },
    {
      key: "left",
      label: "Not attempted",
      value: notAttempted,
      color: "#d5dbe8",
    },
  ];

  let cursor = 0;
  const stops = segments
    .filter((segment) => segment.value > 0)
    .map((segment) => {
      const start = cursor;
      cursor += (segment.value / total) * 100;
      return `${segment.color} ${start}% ${cursor}%`;
    });

  const background =
    total > 0 ? `conic-gradient(${stops.join(", ")})` : "#eef1f5";

  return (
    <div className="pp-donut">
      <div className="pp-donut__ring" style={{ background }}>
        <div className="pp-donut__hole">
          <span>Total units</span>
          <strong>{formatCount(total)}</strong>
        </div>
      </div>
      <ul className="pp-donut__legend">
        {segments.map((segment) => (
          <li key={segment.key}>
            <span
              className="pp-donut__dot"
              style={{ background: segment.color }}
            />
            <span className="pp-donut__name">{segment.label}</span>
            <span className="pp-donut__count">
              {formatCount(segment.value)}
            </span>
            <span className="pp-donut__pct">
              {formatPct(percent(segment.value, total))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// One clickable row of a level list: name, the level above it, a bar of
// accuracy and how much of it has been attempted.
const ItemRow = ({ item, active, onSelect }) => {
  const attempted = num(item.attemptedUnits);
  const accuracy = num(item.accuracyPercentage);
  const tone = band(accuracy, attempted);

  return (
    <li>
      <button
        type="button"
        className={`pp-item${active ? " pp-item--active" : ""}`}
        onClick={() => onSelect(item)}
      >
        <span className="pp-item__top">
          <span className="pp-item__name">
            {item.name}
            {item.parentName && (
              <small className="pp-item__parent">{item.parentName}</small>
            )}
          </span>
          <span className={`pp-item__value pp-text-${tone}`}>
            {attempted ? formatPct(accuracy) : "Not started"}
          </span>
        </span>
        <span className="pp-item__bottom">
          <Bar value={attempted ? accuracy : 0} tone={tone} />
          <span className="pp-item__meta">
            {formatCount(attempted)}/{formatCount(item.totalUnits)} attempted
          </span>
          <ChevronRight size={16} aria-hidden="true" />
        </span>
      </button>
    </li>
  );
};

const StatusNote = ({ children, tone = "info", role }) => (
  <div className={`pp-note pp-note--${tone}`} role={role}>
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const PracticePerformance = () => {
  const role = currentRole();
  const isStudent = role === ROLES.STUDENT;
  const scopeTabs = SCOPE_TABS[role] ?? [];

  const [scope, setScope] = useState({
    mode: scopeTabs[0]?.key ?? "all",
    collegeId: "",
    branchId: "",
    studentId: "",
  });

  // Hierarchy narrowing: { course: {id,name}, subject: {...}, chapter: {...} }
  const [path, setPath] = useState({});
  const [focusLevel, setFocusLevel] = useState("course");
  const [selected, setSelected] = useState(null); // { level, item }

  const [options, setOptions] = useState({
    colleges: [],
    branches: [],
    students: [],
    courses: [],
    subjects: [],
  });

  const [levels, setLevels] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [orgMode, setOrgMode] = useState(
    role === ROLES.SUPER_ADMIN ? "college" : "branch",
  );
  const [org, setOrg] = useState({ status: "idle", rows: [] });

  const [detail, setDetail] = useState({ status: "idle", items: [] });

  const requestId = useRef(0);

  const scopeParams = useMemo(() => scopeToParams(scope), [scope]);
  const pathParams = useMemo(() => pathToParams(path), [path]);
  const kpiLevel = deepestLevel(path);

  // ---- pick lists --------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const safe = async (call) => {
      try {
        const response = await call();
        return asArray(response.data);
      } catch {
        return [];
      }
    };

    const loadOptions = async () => {
      const [colleges, branches, students, courseResponse] = await Promise.all([
        role === ROLES.SUPER_ADMIN
          ? safe(() => CollegeService.getAllColleges())
          : [],
        role === ROLES.SUPER_ADMIN || role === ROLES.COLLEGE_ADMIN
          ? safe(() => BranchService.getAllBranches())
          : [],
        isStudent ? [] : safe(() => UserService.getAllStudents()),
        PracticePerformanceService.getLevel("course").catch(() => null),
      ]);

      if (cancelled) return;

      setOptions((current) => ({
        ...current,
        colleges,
        branches,
        students,
        courses: asArray(courseResponse?.data?.items),
      }));
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [role, isStudent]);

  // Subjects for the Subject filter - narrowed by the chosen course.
  const courseId = path.course?.id;

  useEffect(() => {
    let cancelled = false;

    PracticePerformanceService.getLevel("subject", { courseId })
      .then((response) => {
        if (!cancelled) {
          setOptions((current) => ({
            ...current,
            subjects: asArray(response.data?.items),
          }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOptions((current) => ({ ...current, subjects: [] }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // ---- main data: all four levels for the current scope + hierarchy -------
  const load = useCallback(async () => {
    const id = ++requestId.current;

    setStatus("loading");
    setError("");

    try {
      const responses = await Promise.all(
        PRACTICE_LEVELS.map((level) =>
          PracticePerformanceService.getLevel(level, {
            ...scopeParams,
            ...pathParams,
          }),
        ),
      );

      if (id !== requestId.current) return;

      setLevels(
        Object.fromEntries(
          PRACTICE_LEVELS.map((level, index) => [
            level,
            responses[index].data,
          ]),
        ),
      );
      setStatus("ready");
    } catch (loadError) {
      if (id !== requestId.current) return;

      setError(
        getApiErrorMessage(
          loadError,
          "We couldn't load practice performance. Please try again.",
        ),
      );
      setStatus("error");
    }
  }, [scopeParams, pathParams]);

  useEffect(() => {
    void load();
  }, [load]);

  // ---- organisation comparison table --------------------------------------
  const orgRows = useMemo(() => {
    if (orgMode === "college") {
      return options.colleges.map((college) => ({
        key: `college-${college.collegeId}`,
        name: college.instituteName,
        sub: null,
        params: { collegeId: college.collegeId },
        target: { mode: "college", collegeId: String(college.collegeId) },
      }));
    }

    return options.branches.map((branch) => ({
      key: `branch-${branch.branchId}`,
      name: branch.branchName,
      sub: branch.collegeName,
      params: { branchId: branch.branchId },
      target: { mode: "branch", branchId: String(branch.branchId) },
    }));
  }, [orgMode, options.colleges, options.branches]);

  const showOrg =
    role === ROLES.SUPER_ADMIN || role === ROLES.COLLEGE_ADMIN;

  useEffect(() => {
    if (!showOrg) return undefined;

    let cancelled = false;

    const loadOrg = async () => {
      setOrg((current) => ({ ...current, status: "loading" }));

      try {
        const responses = await Promise.all([
          PracticePerformanceService.getLevel(kpiLevel, pathParams),
          ...orgRows.map((row) =>
            PracticePerformanceService.getLevel(kpiLevel, {
              ...row.params,
              ...pathParams,
            }),
          ),
        ]);

        if (cancelled) return;

        const toRow = (base, response) => ({
          ...base,
          students: num(response.data?.studentCount),
          summary: response.data?.summary ?? {},
        });

        setOrg({
          status: "ready",
          rows: [
            toRow(
              {
                key: "all",
                name: role === ROLES.SUPER_ADMIN ? "All App" : "My College",
                sub: null,
                highlight: true,
                target:
                  role === ROLES.SUPER_ADMIN
                    ? { mode: "all" }
                    : { mode: "college" },
              },
              responses[0],
            ),
            ...orgRows.map((row, index) =>
              toRow(row, responses[index + 1]),
            ),
          ],
        });
      } catch {
        if (!cancelled) setOrg({ status: "error", rows: [] });
      }
    };

    void loadOrg();

    return () => {
      cancelled = true;
    };
  }, [showOrg, orgRows, kpiLevel, pathParams, role]);

  // ---- detail panel: the children of the selected item --------------------
  useEffect(() => {
    const nextLevel = selected ? LEVEL_META[selected.level].next : null;

    if (!selected || !nextLevel) {
      setDetail({ status: "idle", items: [] });
      return undefined;
    }

    let cancelled = false;

    setDetail({ status: "loading", items: [] });

    PracticePerformanceService.getLevel(nextLevel, {
      ...scopeParams,
      [`${selected.level}Id`]: selected.item.id,
    })
      .then((response) => {
        if (!cancelled) {
          setDetail({
            status: "ready",
            items: asArray(response.data?.items),
          });
        }
      })
      .catch(() => {
        if (!cancelled) setDetail({ status: "error", items: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [selected, scopeParams]);

  // ---- actions -------------------------------------------------------------
  const changeScopeMode = (mode) => {
    setScope({ mode, collegeId: "", branchId: "", studentId: "" });
    setSelected(null);
  };

  const applyScopeTarget = (target) => {
    setScope({
      mode: target.mode,
      collegeId: target.collegeId ?? "",
      branchId: target.branchId ?? "",
      studentId: target.studentId ?? "",
    });
    setSelected(null);
  };

  const chooseCourse = (value) => {
    const course = options.courses.find((item) => String(item.id) === value);

    setPath(course ? { course: { id: course.id, name: course.name } } : {});
    setFocusLevel(course ? "subject" : "course");
    setSelected(null);
  };

  const chooseSubject = (value) => {
    const subject = options.subjects.find((item) => String(item.id) === value);

    setPath((current) => ({
      course: current.course,
      ...(subject ? { subject: { id: subject.id, name: subject.name } } : {}),
    }));
    setFocusLevel(subject ? "chapter" : path.course ? "subject" : "course");
    setSelected(null);
  };

  // Clicking a row selects it for the side panel and, unless it is a topic
  // (nothing below it), narrows the hierarchy to it so the next level opens.
  const selectItem = (level, item) => {
    setSelected({ level, item });

    if (level === "topic") return;

    const order = PRACTICE_LEVELS;
    const index = order.indexOf(level);
    const entry = { id: item.id, name: item.name };

    setPath((current) => {
      const next = {};

      order.slice(0, index).forEach((upper) => {
        if (current[upper]) next[upper] = current[upper];
      });

      next[level] = entry;

      return next;
    });
    setFocusLevel(LEVEL_META[level].next);
  };

  const resetHierarchy = () => {
    setPath({});
    setFocusLevel("course");
    setSelected(null);
  };

  // ---- derived -------------------------------------------------------------
  const kpi = levels[kpiLevel]?.summary ?? {};
  const studentCount = num(levels[kpiLevel]?.studentCount);
  const totalUnits = num(kpi.totalUnits);
  const attemptedUnits = num(kpi.attemptedUnits);
  const correctUnits = num(kpi.correctUnits);

  const focusItems = useMemo(
    () =>
      asArray(levels[focusLevel]?.items).filter(
        (item) => num(item.totalUnits) > 0,
      ),
    [levels, focusLevel],
  );

  const hiddenEmpty =
    asArray(levels[focusLevel]?.items).length - focusItems.length;

  const revisionTopics = useMemo(
    () =>
      asArray(levels.topic?.items)
        .filter(
          (item) =>
            num(item.attemptedUnits) > 0 &&
            num(item.accuracyPercentage) < REVISION_THRESHOLD,
        )
        .sort(
          (a, b) =>
            num(a.accuracyPercentage) - num(b.accuracyPercentage) ||
            num(b.attemptedUnits) - num(a.attemptedUnits),
        )
        .slice(0, 6),
    [levels],
  );

  const crumbs = useMemo(() => {
    if (!selected) return [];

    const order = PRACTICE_LEVELS;
    const index = order.indexOf(selected.level);
    const list = [];

    order.slice(0, Math.max(0, index - 1)).forEach((upper) => {
      if (path[upper]) list.push(path[upper].name);
    });

    if (selected.item.parentName) list.push(selected.item.parentName);
    list.push(selected.item.name);

    return list;
  }, [selected, path]);

  const activeTab = scopeTabs.find((tab) => tab.key === scope.mode);
  const pickKind = activeTab?.pick;

  const pickList = {
    college: options.colleges.map((college) => ({
      value: String(college.collegeId),
      label: college.instituteName,
    })),
    branch: options.branches.map((branch) => ({
      value: String(branch.branchId),
      label: branch.collegeName
        ? `${branch.branchName} — ${branch.collegeName}`
        : branch.branchName,
    })),
    student: options.students.map((student) => ({
      value: String(student.userId),
      label: student.studentCode
        ? `${student.name} (${student.studentCode})`
        : student.name,
    })),
  };

  const pickValue = pickKind ? scope[`${pickKind}Id`] : "";
  const pickAllLabel = {
    college: "All colleges",
    branch: "All branches",
    student: "All students",
  };

  const hasPath = Boolean(path.course || path.subject || path.chapter);
  const loading = status === "loading";

  // ---- render --------------------------------------------------------------
  return (
    <div className="pp-page">
      <header className="pp-header">
        <div>
          <h1>{isStudent ? "My Practice Performance" : "Practice Performance Overview"}</h1>
          <p>
            Track and analyze practice performance across courses, subjects,
            chapters and topics.
          </p>
        </div>
        <button
          type="button"
          className="pp-btn"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
            className={loading ? "pp-spin" : undefined}
          />
          Refresh
        </button>
      </header>

      {/* ---- filters ---- */}
      <section className="pp-card pp-filters" aria-label="Filters">
        {scopeTabs.length > 0 && (
          <div className="pp-field">
            <span className="pp-field__label">Scope</span>
            <div className="pp-segment" role="tablist">
              {scopeTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={scope.mode === tab.key}
                  className={scope.mode === tab.key ? "is-active" : undefined}
                  onClick={() => changeScopeMode(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {pickKind && (
          <label className="pp-field">
            <span className="pp-field__label">
              {pickKind === "college"
                ? "College"
                : pickKind === "branch"
                  ? "Branch"
                  : "Student"}
            </span>
            <select
              className="pp-select"
              value={pickValue}
              onChange={(event) =>
                setScope((current) => ({
                  ...current,
                  [`${pickKind}Id`]: event.target.value,
                }))
              }
            >
              <option value="">{pickAllLabel[pickKind]}</option>
              {pickList[pickKind].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="pp-field">
          <span className="pp-field__label">Course</span>
          <select
            className="pp-select"
            value={path.course ? String(path.course.id) : ""}
            onChange={(event) => chooseCourse(event.target.value)}
          >
            <option value="">All courses</option>
            {[...options.courses].sort(sortByName).map((course) => (
              <option key={course.id} value={String(course.id)}>
                {course.name}
              </option>
            ))}
          </select>
        </label>

        <label className="pp-field">
          <span className="pp-field__label">Subject</span>
          <select
            className="pp-select"
            value={path.subject ? String(path.subject.id) : ""}
            onChange={(event) => chooseSubject(event.target.value)}
          >
            <option value="">All subjects</option>
            {[...options.subjects].sort(sortByName).map((subject) => (
              <option key={subject.id} value={String(subject.id)}>
                {path.course || !subject.parentName
                  ? subject.name
                  : `${subject.name} (${subject.parentName})`}
              </option>
            ))}
          </select>
        </label>

        {hasPath && (
          <button type="button" className="pp-link" onClick={resetHierarchy}>
            Clear course &amp; subject
          </button>
        )}
      </section>

      {status === "error" && (
        <StatusNote tone="error" role="alert">
          {error}{" "}
          <button type="button" className="pp-link" onClick={() => void load()}>
            Try again
          </button>
        </StatusNote>
      )}

      {status !== "error" && (
        <div
          className={`pp-layout${selected ? " pp-layout--panel" : ""}${loading ? " pp-loading" : ""}`}
        >
          <div className="pp-main">
            {status === "ready" && studentCount === 0 && (
              <StatusNote>
                There are no students in this scope, so there is nothing to
                measure yet.
              </StatusNote>
            )}

            {status === "ready" && studentCount > 0 && attemptedUnits === 0 && (
              <StatusNote>
                No practice attempts have been recorded here yet. Results
                appear as students answer practice questions.
              </StatusNote>
            )}

            {/* ---- KPI cards ---- */}
            <section className="pp-kpis" aria-label="Summary">
              <KpiCard
                Icon={Users}
                tone="blue"
                label={isStudent ? "Student" : "Total Students"}
                value={formatCount(studentCount)}
                hint="in this scope"
              />
              <KpiCard
                Icon={Activity}
                tone="indigo"
                label="Average Accuracy"
                value={formatPct(kpi.accuracyPercentage)}
                hint={`${formatCount(correctUnits)} of ${formatCount(attemptedUnits)} correct`}
              />
              <KpiCard
                Icon={CircleCheck}
                tone="green"
                label="Practice Completion"
                value={formatPct(kpi.completionPercentage)}
                hint={`${formatCount(attemptedUnits)} of ${formatCount(totalUnits)} units`}
              />
              <KpiCard
                Icon={ListChecks}
                tone="amber"
                label="Units Attempted"
                value={formatCount(attemptedUnits)}
                hint="current results only"
              />
            </section>

            <div className="pp-grid-2">
              {/* ---- hierarchy tiles ---- */}
              <section className="pp-card">
                <h2 className="pp-card__title">
                  <GraduationCap size={18} aria-hidden="true" /> Performance
                  Hierarchy
                </h2>
                <p className="pp-card__sub">Click any level to explore details</p>
                <ul className="pp-tiles">
                  {PRACTICE_LEVELS.map((level) => {
                    const meta = LEVEL_META[level];
                    const summary = levels[level]?.summary ?? {};
                    const Icon = meta.Icon;

                    return (
                      <li key={level}>
                        <button
                          type="button"
                          className={`pp-tile${focusLevel === level ? " pp-tile--active" : ""}`}
                          onClick={() => {
                            setFocusLevel(level);
                            setSelected(null);
                          }}
                        >
                          <span className={`pp-tile__icon pp-tone-${meta.tone}`}>
                            <Icon size={22} aria-hidden="true" />
                          </span>
                          <span className="pp-tile__body">
                            <strong>{meta.wise}</strong>
                            <small>Avg. accuracy</small>
                          </span>
                          <span className="pp-tile__value">
                            {formatPct(summary.accuracyPercentage)}
                          </span>
                          <ChevronRight size={16} aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* ---- unit breakdown ---- */}
              <section className="pp-card">
                <h2 className="pp-card__title">Unit Breakdown</h2>
                <p className="pp-card__sub">
                  Every unit students could attempt, by current result
                </p>
                <UnitDonut
                  total={totalUnits}
                  attempted={attemptedUnits}
                  correct={correctUnits}
                />
              </section>
            </div>

            {/* ---- focused level list ---- */}
            <section className="pp-card">
              <div className="pp-card__head">
                <div>
                  <h2 className="pp-card__title">
                    {LEVEL_META[focusLevel].wise} Performance
                  </h2>
                  <p className="pp-card__sub">
                    Accuracy on the units attempted. Click a row to open it.
                  </p>
                </div>
                {hasPath && (
                  <nav className="pp-path" aria-label="Current filter">
                    {[path.course, path.subject, path.chapter]
                      .filter(Boolean)
                      .map((entry) => entry.name)
                      .join(" › ")}
                  </nav>
                )}
              </div>

              {status === "ready" && focusItems.length === 0 ? (
                <p className="pp-empty">
                  No {LEVEL_META[focusLevel].plural.toLowerCase()} with
                  questions here.
                </p>
              ) : (
                <ul className="pp-list">
                  {focusItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      active={
                        selected?.level === focusLevel &&
                        selected.item.id === item.id
                      }
                      onSelect={(row) => selectItem(focusLevel, row)}
                    />
                  ))}
                </ul>
              )}

              {hiddenEmpty > 0 && (
                <p className="pp-foot">
                  {hiddenEmpty} {LEVEL_META[focusLevel].plural.toLowerCase()}{" "}
                  with no questions are hidden.
                </p>
              )}
            </section>

            {/* ---- organisation comparison ---- */}
            {showOrg && (
              <section className="pp-card">
                <div className="pp-card__head">
                  <div>
                    <h2 className="pp-card__title">
                      <Building2 size={18} aria-hidden="true" />{" "}
                      Organization-level Performance
                    </h2>
                    <p className="pp-card__sub">
                      Compare {orgMode === "college" ? "colleges" : "branches"}
                      {hasPath ? " for the selected course / subject" : ""}.
                    </p>
                  </div>
                  {role === ROLES.SUPER_ADMIN && (
                    <div className="pp-segment pp-segment--small">
                      {["college", "branch"].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          className={orgMode === mode ? "is-active" : undefined}
                          onClick={() => setOrgMode(mode)}
                        >
                          {mode === "college" ? "College" : "Branch"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {org.status === "error" ? (
                  <p className="pp-empty" role="alert">
                    Couldn&rsquo;t load the comparison.
                  </p>
                ) : (
                  <div className="pp-table-wrap">
                    <table className="pp-table">
                      <thead>
                        <tr>
                          <th>Organization</th>
                          <th>Students</th>
                          <th>Accuracy</th>
                          <th>Completion</th>
                          <th aria-label="Open" />
                        </tr>
                      </thead>
                      <tbody>
                        {org.rows.map((row) => {
                          const attempted = num(row.summary.attemptedUnits);

                          return (
                            <tr
                              key={row.key}
                              className={row.highlight ? "is-highlight" : undefined}
                            >
                              <td>
                                <button
                                  type="button"
                                  className="pp-table__name"
                                  onClick={() => applyScopeTarget(row.target)}
                                >
                                  <Building2 size={16} aria-hidden="true" />
                                  <span>
                                    {row.name}
                                    {row.sub && <small>{row.sub}</small>}
                                  </span>
                                </button>
                              </td>
                              <td>{formatCount(row.students)}</td>
                              <td
                                className={`pp-text-${band(num(row.summary.accuracyPercentage), attempted)}`}
                              >
                                {attempted
                                  ? formatPct(row.summary.accuracyPercentage)
                                  : "—"}
                              </td>
                              <td>{formatPct(row.summary.completionPercentage)}</td>
                              <td className="pp-table__chev">
                                <ChevronRight size={16} aria-hidden="true" />
                              </td>
                            </tr>
                          );
                        })}
                        {org.status === "ready" && org.rows.length === 0 && (
                          <tr>
                            <td colSpan={5} className="pp-empty">
                              Nothing to compare yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* ---- topics needing revision ---- */}
            <section className="pp-card">
              <h2 className="pp-card__title">
                <TriangleAlert size={18} aria-hidden="true" /> Topics Needing
                Revision
              </h2>
              <p className="pp-card__sub">
                Based on low accuracy (&lt; {REVISION_THRESHOLD}%)
              </p>

              {status === "ready" && revisionTopics.length === 0 ? (
                <p className="pp-empty">
                  {attemptedUnits === 0
                    ? "Nothing attempted yet."
                    : `No topics are below ${REVISION_THRESHOLD}% accuracy.`}
                </p>
              ) : (
                <ul className="pp-revision">
                  {revisionTopics.map((item) => {
                    const accuracy = num(item.accuracyPercentage);
                    const severe = accuracy < 50;

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setSelected({ level: "topic", item })}
                        >
                          <span className="pp-revision__name">
                            {item.name}
                            {item.parentName && <small>{item.parentName}</small>}
                          </span>
                          <span className="pp-text-bad pp-revision__pct">
                            {formatPct(accuracy)}
                          </span>
                          <span
                            className={`pp-chip ${severe ? "pp-chip--high" : "pp-chip--medium"}`}
                          >
                            {severe ? "High" : "Medium"}
                          </span>
                          <ChevronRight size={16} aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* ---- details side panel ---- */}
          {selected && (
            <aside className="pp-panel" aria-label="Details">
              <div className="pp-panel__head">
                <span className={`pp-tile__icon pp-tone-${LEVEL_META[selected.level].tone}`}>
                  {(() => {
                    const Icon = LEVEL_META[selected.level].Icon;
                    return <Icon size={20} aria-hidden="true" />;
                  })()}
                </span>
                <h2>
                  {LEVEL_META[selected.level].label} Details:{" "}
                  {selected.item.name}
                </h2>
                <button
                  type="button"
                  className="pp-icon-btn"
                  aria-label="Close details"
                  onClick={() => setSelected(null)}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <p className="pp-crumbs">{crumbs.join(" › ")}</p>

              <div className="pp-stats">
                <div>
                  <span>Attempted</span>
                  <strong>{formatCount(selected.item.attemptedUnits)}</strong>
                </div>
                <div>
                  <span>Accuracy</span>
                  <strong>{formatPct(selected.item.accuracyPercentage)}</strong>
                </div>
                <div>
                  <span>Completion</span>
                  <strong>{formatPct(selected.item.completionPercentage)}</strong>
                </div>
                <div>
                  <span>Correct</span>
                  <strong>{formatCount(selected.item.correctUnits)}</strong>
                </div>
              </div>

              <h3 className="pp-panel__title">Units</h3>
              <UnitDonut
                total={num(selected.item.totalUnits)}
                attempted={num(selected.item.attemptedUnits)}
                correct={num(selected.item.correctUnits)}
              />

              {LEVEL_META[selected.level].next && (
                <>
                  <h3 className="pp-panel__title">
                    {LEVEL_META[LEVEL_META[selected.level].next].plural} in this{" "}
                    {LEVEL_META[selected.level].label.toLowerCase()}
                  </h3>

                  {detail.status === "loading" && (
                    <p className="pp-empty">Loading…</p>
                  )}
                  {detail.status === "error" && (
                    <p className="pp-empty" role="alert">
                      Couldn&rsquo;t load this list.
                    </p>
                  )}
                  {detail.status === "ready" && (
                    <ul className="pp-mini">
                      {detail.items
                        .filter((item) => num(item.totalUnits) > 0)
                        .sort(
                          (a, b) =>
                            num(b.attemptedUnits) - num(a.attemptedUnits) ||
                            sortByName(a, b),
                        )
                        .map((item) => {
                          const attempted = num(item.attemptedUnits);

                          return (
                            <li key={item.id}>
                              <span>{item.name}</span>
                              <span
                                className={`pp-text-${band(num(item.accuracyPercentage), attempted)}`}
                              >
                                {attempted ? formatPct(item.accuracyPercentage) : "—"}
                              </span>
                              <span className="pp-mini__count">
                                {formatCount(attempted)}/{formatCount(item.totalUnits)}
                              </span>
                            </li>
                          );
                        })}
                      {detail.items.filter((item) => num(item.totalUnits) > 0)
                        .length === 0 && (
                        <li className="pp-empty">No questions here yet.</li>
                      )}
                    </ul>
                  )}
                </>
              )}
            </aside>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticePerformance;
