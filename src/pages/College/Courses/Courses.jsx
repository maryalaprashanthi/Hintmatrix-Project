import React, { useState, useEffect } from "react"; // 🌟 FIXED: Added useEffect for data loading hooks
import { useNavigate } from "react-router-dom";
import CourseService from "../../../services/CourseService";
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
import AddCourseModal from "./AddCourseModal";

import bcom from "../../../assets/courses/bcom.png.jpeg";
import ca from "../../../assets/courses/ca-foundation.png.jpeg";
import cbse from "../../../assets/courses/cbse11.png.jpeg";
import jrAccountancy from "../../../assets/courses/jr-accountancy.png.jpeg";
import combo from "../../../assets/courses/combo.png.jpeg";
import inter from "../../../assets/courses/inter.png.jpeg";

function Courses() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);

  // 🌟 FIXED: Changed static array to an active state array variable to read from your service endpoints
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // 🌟 FIXED: Added fetch loop pipeline orchestration to extract active data from the server
  const loadCourses = () => {
    CourseService.getAllCourses()
      .then((response) => {
        setCourses(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to load backend courses database array:", error);
      });
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEdit = (courseData) => {
    setSelectedCourse(courseData); // Track target element fields
    setShowModal(true); // Fire up modal box template rows toggle
  };

  const handleDelete = (id) => {
    if (!id) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this course?",
    );
    if (confirmDelete) {
      CourseService.deleteCourse(id)
        .then(() => {
          alert("Course deleted successfully!");
          loadCourses(); // Refresh list live
        })
        .catch((error) => {
          console.error("Failed to execute deletion tracking pipeline:", error);
        });
    }
  };

  const filteredCourses = courses.filter((course) => {
    // 🌟 FIXED: Safely reads your backend 'name' variable or defaults to fallback structures
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

        <button className="add-course-btn" onClick={() => setShowModal(true)}>
          <FaPlus />
          <span>Add Course</span>
        </button>
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
              <h3>5</h3>
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
              <h3>221</h3>
              <span>Learning Modules</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH ================= */}

      <div className="course-toolbar">
        <div className="search-box">
          <FaSearch />

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

      {/* ================= COURSES GRID ================= */}
      <div className="row">
        {filteredCourses.map((course) => (
          <div
            className="col-12 col-md-6 col-lg-4 mb-4"
            key={course.courseId || course.id}
          >
            <div className="course-card h-100">
              {/* ================= IMAGE ================= */}
              <div className="course-banner">
                <img
                  src={course.image || bcom}
                  alt={course.name || course.title}
                />
              </div>

              {/* ================= CONTENT ================= */}
              <div className="course-content">
                <h4>{course.name || course.title}</h4>
                <p className="course-level">{course.level || "Beginner"}</p>

                <div className="course-details">
                  <div>
                    <FaUsers />
                    <span>{course.students} Students</span>
                  </div>

                  <div>
                    <FaLayerGroup />
                    <span>{course.chapters} Chapters</span>
                  </div>

                  <div>
                    <FaClock />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <button
                  className="course-btn mt-auto"
                  onClick={() => navigate(`/chapters/${course.id}`)}
                >
                  <FaBookOpen />
                  <span>View Chapters</span>
                </button>

                {/* ===== Edit / Delete ===== */}

                <div className="d-flex justify-content-start gap-2 mt-3">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(course)}
                  >
                    <FaEdit className="me-1" />
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(course.courseId || course.id)}
                  >
                    <FaTrash className="me-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= EMPTY STATE ================= */}

      {filteredCourses.length === 0 && (
        <div className="empty-state">
          <h4>No Courses Found</h4>

          <p>Try another search keyword or select a different category.</p>
        </div>
      )}

      <AddCourseModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCourse(null);
        }}
        onRefresh={loadCourses}
        selectedCourseData={selectedCourse}
      />
    </div>
  );
}

export default Courses;
