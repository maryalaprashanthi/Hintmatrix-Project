import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../../../services/CourseService";
import SuccessModal from "../../../components/Common/SuccessModal";

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
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadCourses = () => {
    CourseService.getAllCourses()
      .then((response) => {
        setCourses(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to load backend courses:", error);
      });
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEdit = (courseData) => {
    setSelectedCourse(courseData);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this course?"
    );

    if (confirmDelete) {
      CourseService.deleteCourse(id)
        .then(() => {
          alert("Course deleted successfully!");
          loadCourses();
        })
        .catch((error) => {
          console.error("Delete Error:", error);
        });
    }
  };
  const handleSave = async (courseRequestDTO, isEdit, courseId) => {
    try {
      if (isEdit) {
        await CourseService.updateCourse(courseId, courseRequestDTO);
        setSuccessMessage("Course updated successfully!");
      } else {
        await CourseService.saveCourse(courseRequestDTO);
        setSuccessMessage("Course saved successfully!");
      }

      setShowModal(false);
      setSelectedCourse(null);
      loadCourses();
      setShowSuccess(true);

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to save course.");
    }
  };

  // Upload Button
const handleFileUpload = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  try {
    const response = await CourseService.uploadExcel(file);

    alert(
      typeof response.data === "string"
        ? response.data
        : "Course Excel uploaded successfully!"
    );

    loadCourses(); // Refresh course list

  } catch (error) {
    console.error("Upload Error:", error);

    if (error.response) {
      alert(error.response.data);
    } else {
      alert("File upload failed.");
    }
  }

  // Backend upload API later

  e.target.value = "";
};

  const filteredCourses = courses.filter((course) => {
    const courseTitle = course.name || course.title || "";

    const searchMatch = courseTitle
      .toLowerCase()
      .includes(search.toLowerCase());

    const courseCategory = course.category || "Commerce";

    const categoryMatch =
      category === "All" ||
      courseCategory === category;

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

            <p>
              Create, organize and manage all your learning programs.
            </p>

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

        <div className="d-flex gap-2">

          <button
            className="btn btn-primary"
            onClick={() =>
              document.getElementById("courseUpload").click()
            }
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

      {/* ================= COURSE GRID ================= */}

      <div className="row">

        {filteredCourses.map((course) => (

          <div
            className="col-12 col-md-6 col-lg-4 mb-4"
            key={course.courseId || course.id}
          >

            <div className="course-card h-100">

              <div className="course-banner">

                <img
                  src={course.image || bcom}
                  alt={course.name || course.title}
                />

              </div>

              <div className="course-content">

                <h4>{course.name || course.title}</h4>

                <p className="course-level">
                  {course.level || "Beginner"}
                </p>

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
                    onClick={() =>
                      handleDelete(course.courseId || course.id)
                    }
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

      {/* ================= EMPTY ================= */}

      {filteredCourses.length === 0 && (

        <div className="empty-state">

          <h4>No Courses Found</h4>

          <p>
            Try another search keyword or select another category.
          </p>

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
      <SuccessModal
  show={showSuccess}
  message={successMessage}
  onClose={() => setShowSuccess(false)}
  />

    </div>
  );
}

export default Courses;