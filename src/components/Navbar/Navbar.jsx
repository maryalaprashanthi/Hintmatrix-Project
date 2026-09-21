import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../interceptors/axiosInterceptor";
import { getCurrentUserName } from "../../utils/user";
import CourseService from "../../services/CourseService";
import TopicService from "../../services/TopicService";
import SubjectService from "../../services/SubjectService";
import ChapterService from "../../services/ChapterService";
import QuestionService from "../../services/QuestionService";
import CollegeService from "../../services/CollegeService";
import BranchService from "../../services/BranchService";
import SectionService from "../../services/SectionService";
import {
  canAccessFeature,
  normalizeRole,
  ROLES,
  CONTENT_MANAGER_ROLES,
} from "../../utils/roles";
import "./Navbar.css";

import {
  FiSearch,
  FiBell,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchItems, setSearchItems] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);
  const userRole = localStorage.getItem("role") || "GUEST";
  const normalizedUserRole = normalizeRole(userRole);
  const userName = getCurrentUserName();

  const handleLogout = () => {
    logoutUser(navigate);
  };

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener("mousedown", close);

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const hasRole = (roles) => roles.includes(normalizedUserRole);
    const page = (label, description, path, feature, allowed = true) => ({
      label,
      description,
      type: "Page",
      path,
      allowed:
        allowed && (!feature || canAccessFeature(feature, normalizedUserRole)),
    });
    const staticItems = [
      page("Dashboard", "Overview", "/dashboard", "dashboard"),
      page(
        "Subscription Overview",
        "Subscription management",
        "/subscriptions",
        "subscriptions",
      ),
      page(
        "Manage Plans",
        "Subscription plans",
        "/subscriptions/plans",
        "subscriptionsPlans",
      ),
      page(
        "Subscription History",
        "Subscription records",
        "/subscriptions/history",
        "subscriptionsHistory",
      ),
      page("Colleges", "College management", "/college", "colleges"),
      page("Branches", "Branch management", "/branch", "branches"),
      page("Courses", "Courses and question bank", "/courses", "courses"),
      page("Sections", "Section management", "/section", "sections"),
      page(
        "All Questions",
        "Question management",
        "/questions",
        "manageQuestions",
      ),
      page(
        "Create Questions",
        "Add a new question",
        "/questions/create-all",
        null,
        hasRole(CONTENT_MANAGER_ROLES),
      ),
      page("Table Names", "Table metadata", "/table-names", "tableMetadata"),
      page(
        "Table Headers",
        "Table metadata",
        "/table-headers",
        "tableMetadata",
      ),
      page(
        "Table Attributes",
        "Table metadata",
        "/table-attributes",
        "tableMetadata",
      ),
      page("Rule Engine", "Rule configuration", "/ruleengine", "ruleEngine"),
      page(
        "Student Attendance",
        "Attendance management",
        "/studentattendance",
        "attendance",
      ),
      page("Practice", "Practice questions", "/practice", "practiceQuestions"),
      page("Exam Hub", "Exams and assessments", "/exam-hub", "attemptExams"),
      page("Performance", "Student performance", "/performance", "performance"),
      page("Sessions", "Learning sessions", "/sessions", "attemptExams"),
      page("Results", "Exam results", "/results", "results"),
      page(
        "Certificates",
        "Student certificates",
        "/certificates",
        "certificates",
      ),
      page(
        "Super Admins",
        "Super admin management",
        "/admin/super-admin",
        "manageSuperAdmins",
      ),
      page(
        "College Admins",
        "College admin management",
        "/admin/college-admin",
        "manageCollegeAdmins",
      ),
      page(
        "Branch Admins",
        "Branch admin management",
        "/admin/branch-admin",
        "manageBranchAdmins",
      ),
      page(
        "Students",
        "Student management",
        "/admin/student",
        "manageStudents",
      ),
      page("My Profile", "Account profile", "/profile", "dashboard"),
      page("Settings", "Account preferences", "/settings", "settings"),
    ].filter((entry) => entry.allowed);

    const getRows = (response) => {
      const data = response?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      return [];
    };

    async function loadSearchItems() {
      setSearchLoading(true);
      const canBrowseCourses = canAccessFeature("courses", normalizedUserRole);
      const requests = [
        canBrowseCourses
          ? CourseService.getAllCourses()
          : Promise.resolve({ data: [] }),
        canBrowseCourses
          ? SubjectService.getAll()
          : Promise.resolve({ data: [] }),
        canBrowseCourses
          ? ChapterService.getAll()
          : Promise.resolve({ data: [] }),
        canBrowseCourses
          ? TopicService.getAll()
          : Promise.resolve({ data: [] }),
        canBrowseCourses
          ? QuestionService.getAll()
          : Promise.resolve({ data: [] }),
        canAccessFeature("colleges", normalizedUserRole)
          ? CollegeService.getAllColleges()
          : Promise.resolve({ data: [] }),
        canAccessFeature("branches", normalizedUserRole)
          ? BranchService.getAllBranches()
          : Promise.resolve({ data: [] }),
        canAccessFeature("sections", normalizedUserRole)
          ? SectionService.getAllSections()
          : Promise.resolve({ data: [] }),
      ];
      const results = await Promise.allSettled(requests);

      if (!mounted) return;

      const rowsAt = (index) =>
        results[index]?.status === "fulfilled"
          ? getRows(results[index].value)
          : [];
      const [
        courses,
        subjects,
        chapters,
        topics,
        questions,
        colleges,
        branches,
        sections,
      ] = results.map((_, index) => rowsAt(index));

      const isVisible = (record) => record.activeRow !== false;
      const item = (record, config) => ({
        label: config.label,
        description: config.description,
        type: config.type,
        path: config.path,
        keywords: Object.values(record)
          .filter((value) => ["string", "number"].includes(typeof value))
          .join(" "),
      });

      setSearchItems([
        ...staticItems,
        ...courses.filter(isVisible).map((course) =>
          item(course, {
            label: course.name || course.courseName || "Untitled course",
            description:
              [course.collegeName, course.branchName]
                .filter(Boolean)
                .join(" • ") || "Open subjects",
            type: "Course",
            path: `/courses/${course.courseId || course.id}/subjects`,
          }),
        ),
        ...subjects.filter(isVisible).map((subject) =>
          item(subject, {
            label: subject.subjectName || subject.name || "Untitled subject",
            description: subject.courseName || "Open chapters",
            type: "Subject",
            path: `/subjects/${subject.subjectId || subject.id}/chapters`,
          }),
        ),
        ...chapters.filter(isVisible).map((chapter) =>
          item(chapter, {
            label: chapter.chapterName || chapter.name || "Untitled chapter",
            description:
              [chapter.courseName, chapter.subjectName]
                .filter(Boolean)
                .join(" • ") || "Open topics",
            type: "Chapter",
            path: `/chapters/${chapter.chapterId || chapter.id}/topics`,
          }),
        ),
        ...topics.filter(isVisible).map((topic) =>
          item(topic, {
            label: topic.name || topic.topicName || "Untitled topic",
            description:
              [topic.courseName, topic.subjectName, topic.chapterName]
                .filter(Boolean)
                .join(" • ") || "Open questions",
            type: "Topic",
            path: `/topics/${topic.topicId || topic.id}/questions`,
          }),
        ),
        ...questions.filter(isVisible).map((question) =>
          item(question, {
            label:
              question.questionText ||
              question.text ||
              question.name ||
              "Untitled question",
            description:
              [
                question.courseName,
                question.chapterName,
                question.topicName,
                question.questionTypeName,
              ]
                .filter(Boolean)
                .join(" • ") || "Open question",
            type: "Question",
            path: `/questions/${question.questionId || question.id}`,
          }),
        ),
        ...colleges.filter(isVisible).map((college) =>
          item(college, {
            label: college.name || college.collegeName || "Untitled college",
            description:
              college.address || college.email || "College management",
            type: "College",
            path: "/college",
          }),
        ),
        ...branches.filter(isVisible).map((branch) =>
          item(branch, {
            label: branch.name || branch.branchName || "Untitled branch",
            description:
              branch.collegeName || branch.address || "Branch management",
            type: "Branch",
            path: "/branch",
          }),
        ),
        ...sections.filter(isVisible).map((section) =>
          item(section, {
            label: section.name || section.sectionName || "Untitled section",
            description:
              [section.courseName, section.branchName]
                .filter(Boolean)
                .join(" • ") || "Section management",
            type: "Section",
            path: "/section",
          }),
        ),
      ]);
      setSearchLoading(false);
    }

    loadSearchItems();
    return () => {
      mounted = false;
    };
  }, [normalizedUserRole]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSearchItems = normalizedQuery
    ? searchItems
        .filter((item) =>
          `${item.label} ${item.description} ${item.type} ${item.keywords || ""}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
        .slice(0, 8)
    : [];

  const openSearchItem = (item) => {
    navigate(item.path);
    setSearchQuery("");
    setShowSearchResults(false);
    setActiveSearchIndex(-1);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      setShowSearchResults(false);
      setActiveSearchIndex(-1);
      return;
    }
    if (!filteredSearchItems.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSearchIndex((index) =>
        index < filteredSearchItems.length - 1 ? index + 1 : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSearchIndex((index) =>
        index > 0 ? index - 1 : filteredSearchItems.length - 1,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      openSearchItem(filteredSearchItems[Math.max(activeSearchIndex, 0)]);
    }
  };

  return (
    <header className="navbar">
      {/* Mobile Menu */}
      <div className="navbar-left">
        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FiMenu />
        </button>
      </div>

      {/* Search */}
      <div className="navbar-center" ref={searchRef}>
        <div
          className={`search-box ${showSearchResults ? "search-box-active" : ""}`}
        >
          <FiSearch className="search-icon" />

          <input
            type="search"
            value={searchQuery}
            placeholder="Search anything..."
            aria-label="Search the application"
            aria-expanded={showSearchResults}
            onFocus={() => setShowSearchResults(true)}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setShowSearchResults(true);
              setActiveSearchIndex(-1);
            }}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        {showSearchResults && searchQuery.trim() && (
          <div className="navbar-search-results" role="listbox">
            {searchLoading ? (
              <div className="navbar-search-state">Loading results...</div>
            ) : filteredSearchItems.length ? (
              filteredSearchItems.map((item, index) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeSearchIndex}
                  className={`navbar-search-result ${index === activeSearchIndex ? "active" : ""}`}
                  key={`${item.type}-${item.path}-${item.label}`}
                  onMouseEnter={() => setActiveSearchIndex(index)}
                  onClick={() => openSearchItem(item)}
                >
                  <span className="navbar-search-result-icon">
                    <FiSearch />
                  </span>
                  <span className="navbar-search-result-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span
                    className={`navbar-search-type ${item.type.toLowerCase()}`}
                  >
                    {item.type}
                  </span>
                </button>
              ))
            ) : (
              <div className="navbar-search-state">
                No matching results found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="navbar-right">
        <div className="notification-menu" ref={notificationsRef}>
          <button
            type="button"
            className="nav-icon notification-trigger"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            onClick={() => {
              setShowNotifications((visible) => !visible);
              setShowMenu(false);
            }}
          >
            <FiBell />
            <span className="notification-count">3</span>
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div>
                  <strong>Notifications</strong>
                  <span>3 unread</span>
                </div>
                <button type="button">Mark all as read</button>
              </div>

              <div className="notification-list">
                <button type="button" className="notification-item unread">
                  <span className="notification-symbol blue">✓</span>
                  <span className="notification-copy">
                    <strong>Question bank updated</strong>
                    <span>New questions were added to Final Accounts.</span>
                    <small>10 minutes ago</small>
                  </span>
                </button>
                <button type="button" className="notification-item unread">
                  <span className="notification-symbol green">↑</span>
                  <span className="notification-copy">
                    <strong>Student upload completed</strong>
                    <span>All student records were imported successfully.</span>
                    <small>1 hour ago</small>
                  </span>
                </button>
                <button type="button" className="notification-item unread">
                  <span className="notification-symbol amber">!</span>
                  <span className="notification-copy">
                    <strong>Subscription reminder</strong>
                    <span>One college plan expires this week.</span>
                    <small>Yesterday</small>
                  </span>
                </button>
              </div>

              <button type="button" className="notification-footer">
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="profile" ref={menuRef}>
          <div
            className="profile-trigger"
            onClick={() => {
              setShowMenu(!showMenu);
              setShowNotifications(false);
            }}
          >
            <img src="https://i.pravatar.cc/150?img=32" alt="Profile" />

            <div className="profile-info">
              <span className="profile-name">{userName}</span>

              <span className="profile-role">{userRole}</span>
            </div>

            <FiChevronDown />
          </div>

          {showMenu && (
            <div className="profile-dropdown">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}
              >
                <FiUser />
                My Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/settings");
                }}
              >
                <FiSettings />
                Settings
              </button>

              <button
                className="logout-btn"
                onClick={handleLogout}
                type="button"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
