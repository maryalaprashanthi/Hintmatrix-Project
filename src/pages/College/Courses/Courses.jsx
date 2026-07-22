import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBookOpen,
  FaCheckCircle,
  FaPlayCircle,
  FaPlus,
  FaSearch,
  FaClock,
  FaUsers,
  FaLayerGroup,
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
  const courses = [
    {
      id: "bcom",
      title: "B.Com",
      image: bcom,
      category: "Commerce",
      level: "Under Graduation",
      duration: "3 Years",
      students: 240,
      chapters: 48,
    },
    {
      id: "ca-foundation",
      title: "CA Foundation",
      image: ca,
      category: "Professional",
      level: "Foundation Level",
      duration: "6 Months",
      students: 180,
      chapters: 32,
    },
    {
      id: "cbse-11",
      title: "CBSE Class 11",
      image: cbse,
      category: "School",
      level: "Intermediate",
      duration: "1 Year",
      students: 320,
      chapters: 25,
    },
    {
      id: "jr-accountancy",
      title: "Junior Accountancy",
      image: jrAccountancy,
      category: "Commerce",
      level: "Beginner",
      duration: "6 Months",
      students: 150,
      chapters: 20,
    },
    {
      id: "combo",
      title: "Commerce Combo",
      image: combo,
      category: "Combo Course",
      level: "Complete Package",
      duration: "2 Years",
      students: 210,
      chapters: 60,
    },
    {
      id: "inter",
      title: "Intermediate",
      image: inter,
      category: "Commerce",
      level: "Advanced",
      duration: "1 Year",
      students: 190,
      chapters: 36,
    },
  ];

  const filteredCourses = courses.filter((course) => {

    const searchMatch = course.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch =
      category === "All" ||
      course.category === category;

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

        <button
          className="btn add-course-btn"
          onClick={() => setShowModal(true)}
         >
         <FaPlus className="me-2" />
         Add Course
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
            key={course.id}
          >

            <div className="course-card h-100">

              {/* ================= IMAGE ================= */}

              <div className="course-banner">

                <img
                  src={course.image}
                  alt={course.title}
                />

              </div>

              {/* ================= CONTENT ================= */}

              <div className="course-content">

                <h4>{course.title}</h4>

                <p className="course-level">
                  {course.level}
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
                  onClick={() =>
                    navigate(`/chapters/${course.id}`)
                  }
                >

                  <FaBookOpen />

                  <span>View Chapters</span>

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>
            {/* ================= EMPTY STATE ================= */}

      {filteredCourses.length === 0 && (

        <div className="empty-state">

          <h4>No Courses Found</h4>

          <p>
            Try another search keyword or select a different category.
          </p>

        </div>

      )}
       <AddCourseModal
        show={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>

  );

}

export default Courses;