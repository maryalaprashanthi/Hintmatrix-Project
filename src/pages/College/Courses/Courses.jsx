import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../../../services/CourseService";
import ChapterService from "../../../services/ChapterService";

import {
  FaBookOpen,
  FaPlayCircle,
  FaPlus,
  FaSearch,
  FaClock,
  FaUsers,
  FaLayerGroup,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import "./Courses.css";
import { canManageContent } from "../../../utils/roles";
import { getApiErrorMessage } from "../../../utils/apiError";
import { paths } from "../../../routes/paths";
import ConfirmDialog from "../../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import { useToast } from "../../../components/Toast/useToast";
import AddCourseModal from "./AddCourseModal";

import bcom from "../../../assets/courses/bcom.png.jpeg";
import ca from "../../../assets/courses/ca-foundation.png.jpeg";
import cbse from "../../../assets/courses/cbse11.png.jpeg";
import jrAccountancy from "../../../assets/courses/jr-accountancy.png.jpeg";
import combo from "../../../assets/courses/combo.png.jpeg";
import inter from "../../../assets/courses/inter.png.jpeg";

function Courses() {
  const navigate = useNavigate();
  const canManage = canManageContent();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const loadCourses = () => {
    CourseService.getAllCourses()
      .then((response) => {
        setCourses(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to load backend courses:", error);
      });
  };

  const loadChapters = () => {
    ChapterService.getAll()
      .then((response) => {
        setChapters(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Failed to load backend chapters:", error);
      });
  };

  useEffect(() => {
    loadCourses();
    loadChapters();
  }, []);

  const handleEdit = (courseData) => {
    setSelectedCourse(courseData);
    setShowModal(true);
  };

  const del = useDeleteConfirm({
    entity: "course",
    deleteFn: (course) =>
      CourseService.deleteCourse(course.courseId ?? course.id),
    onDeleted: loadCourses,
  });

  const handleSave = async (courseRequestDTO, isEdit, courseId) => {
    try {
      if (isEdit) {
        await CourseService.updateCourse(courseId, courseRequestDTO);
        toast.success("Course updated.");
      } else {
        await CourseService.saveCourse(courseRequestDTO);
        toast.success("Course saved.");
      }

      setShowModal(false);
      setSelectedCourse(null);
      loadCourses();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to save course."));
    }
  };

  // Upload Button
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const response = await CourseService.uploadExcel(file);

      toast.success(
        typeof response.data === "string"
          ? response.data
          : "Course Excel uploaded.",
      );

      loadCourses(); // Refresh course list
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "File upload failed."));
    }

    // Backend upload API later

    e.target.value = "";
  };

  const totals = React.useMemo(() => {
    const totalChapters = courses.reduce((sum, course) => {
      const courseId = course.courseId ?? course.id;
      const valueFromCourse = Number(
        course.chapters ?? course.chapterCount ?? course.totalChapters ?? 0,
      );
      const valueFromChapterTable = chapters.filter(
        (chapter) =>
          String(chapter.courseId ?? chapter.course_id) === String(courseId),
      ).length;
      const value =
        Number.isFinite(valueFromCourse) && valueFromCourse > 0
          ? valueFromCourse
          : valueFromChapterTable;

      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

    return {
      totalChapters,
      activeCourses: courses.filter((course) => course.activeRow).length,
    };
  }, [courses, chapters]);

  const filteredCourses = courses.filter((course) => {
    const courseTitle = course.name || course.title || "";

    const searchMatch = courseTitle
      .toLowerCase()
      .includes(search.toLowerCase());

    const courseCategory = course.category || "Commerce";

    const categoryMatch = category === "All" || courseCategory === category;

    return searchMatch && categoryMatch;
  });

  return (
    <div className="container-fluid courses-page">
      {/* ================= HEADER ================= */}

      <div className="courses-header">
        <div className="courses-title">
          <div className="courses-icon">
            <FaBookOpen />
          </div>

          <div>
            <h2>Courses Management</h2>

            <p>Create, organize and manage all your learning programs.</p>
          </div>
        </div>

        {/* Hidden Upload Input */}

        <input
          type="file"
          id="courseUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        {canManage && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => document.getElementById("courseUpload").click()}
            >
              ⬆ Upload
            </button>

            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedCourse(null);
                setShowModal(true);
              }}
            >
              + Add Course
            </button>
          </div>
        )}
      </div>
      {/* ================= STATISTICS ================= */}

      <div className="row g-4 stats-row">
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="modern-stat-card">
            <div className="stat-icon blue">
              <FaBookOpen />
            </div>

            <div>
              <small>Total Courses</small>
              <h3>{courses.length}</h3>
              <span>Available Courses</span>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="modern-stat-card">
            <div className="stat-icon green">
              <FaPlayCircle />
            </div>

            <div>
              <small>Active Courses</small>
              <h3>{totals.activeCourses}</h3>
              <span>Currently Running</span>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="modern-stat-card">
            <div className="stat-icon purple">
              <FaUsers />
            </div>

            <div>
              <small>Total Students</small>
              <h3>1290</h3>
              <span>Across All Courses</span>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="modern-stat-card">
            <div className="stat-icon orange">
              <FaLayerGroup />
            </div>

            <div>
              <small>Total Chapters</small>
              <h3>{totals.totalChapters}</h3>
              <span>Learning Modules</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH ================= */}

      <div className="course-toolbar">
        <div className="search-box">
          <FaSearch
            className="search-icon"
            onClick={() => {
              console.log("Search icon clicked");
            }}
          />

          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select category-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Commerce">Commerce</option>
          <option value="Professional">Professional</option>
          <option value="School">School</option>
          <option value="Combo Course">Combo Course</option>
        </select>
      </div>

      {/* ================= COURSE GRID ================= */}

      <div className="row">
        {filteredCourses.map((course) => {
          const courseId = course.courseId || course.id;
          const courseChapterCount =
            Number(
              course.chapters ??
                course.chapterCount ??
                course.totalChapters ??
                0,
            ) > 0
              ? Number(
                  course.chapters ??
                    course.chapterCount ??
                    course.totalChapters ??
                    0,
                )
              : chapters.filter(
                  (chapter) =>
                    String(chapter.courseId ?? chapter.course_id) ===
                    String(courseId),
                ).length;

          return (
            <div className="col-12 col-md-6 col-lg-4 mb-4" key={courseId}>
              <div className="course-card h-100">
                <div className="course-banner">
                  <img
                    src={course.image || bcom}
                    alt={course.name || course.title}
                  />
                </div>
                <div className="course-content">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4>{course.name || course.title}</h4>

                    <span
                      className={
                        course.activeRow
                          ? "status-badge active"
                          : "status-badge inactive"
                      }
                    >
                      {course.activeRow ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="course-level">{course.level || "Beginner"}</p>

                  <div className="course-details">
                    <div>
                      <FaUsers />
                      <span>{course.students} Students</span>
                    </div>

                    <div>
                      <FaLayerGroup />
                      <span>{courseChapterCount} Chapters</span>
                    </div>

                    <div>
                      <FaClock />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <button
                    className="course-btn mt-auto"
                    disabled={!course.activeRow}
                    onClick={() => {
                      if (course.activeRow) {
                        navigate(paths.courseSubjects(course.courseId));
                      }
                    }}
                  >
                    <FaBookOpen />

                    <span>
                      {course.activeRow ? "View Chapters" : "Inactive"}
                    </span>
                  </button>

                  {canManage && (
                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit(course)}
                      >
                        <FaEdit className="me-1" />
                        Edit
                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => del.request(course)}
                      >
                        <FaTrash className="me-1" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= EMPTY ================= */}

      {filteredCourses.length === 0 && (
        <div className="empty-state">
          <h4>No Courses Found</h4>

          <p>Try another search keyword or select another category.</p>
        </div>
      )}

      <AddCourseModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCourse(null);
        }}
        onSave={handleSave}
        selectedCourseData={selectedCourse}
      />
      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.name || del.pending?.title || "this course"}"?`}
        body="Every subject, chapter, topic and question under this course will be removed. This can't be undone."
        confirmLabel="Delete course"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}
export default Courses;
