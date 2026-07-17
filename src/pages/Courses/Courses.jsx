
// =========================================================
// ACTIVE FUNCTIONAL CODE (RUNNING ON SCREEN)
// =========================================================
import React from "react";
import "./Courses.css";
import { FaBookOpen } from "react-icons/fa";

// Import a fallback image asset for cards that don't have one uploaded
import bcom from "../../assets/courses/bcom.png.jpeg";

function Courses({ dynamicCourses = [] }) {
  return (
    <div className="courses-page">
      {/* Header */}
      <div className="courses-header">
        <div className="courses-title">
          <div className="title-icon">
            <FaBookOpen />
          </div>

          <div>
            <h1>My Courses</h1>
            <p>Explore all available courses</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="courses-toolbar">
        <input
          type="text"
          placeholder="🔍 Search Courses..."
          className="search-input"
        />

        <select className="category-select">
          <option>All Categories</option>
          <option>Commerce</option>
          <option>School Curriculum</option>
          <option>Chartered Accountancy</option>
          <option>Integrated Program</option>
        </select>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {dynamicCourses && dynamicCourses.map((item, index) => (
          <div className="course-card" key={item.id || index}>
            {/* Course Banner */}
            <div className="course-banner">
              <img src={item.image || bcom} alt={item.title} />
            </div>

            {/* Course Content */}
            <div className="course-content">
              <h3>{item.title}</h3>

              <p className="course-category">
                {item.category}
              </p>

              <div className="course-info">
                <span className="level">
                  ⭐ {item.level}
                </span>

                <span className="duration">
                  ⏳ {item.duration || "Self-paced"}
                </span>
              </div>

              {/* Progress */}
              <div className="progress">
                <div
                  className="progress-fill"
                  style={{ width: item.progress || "0%" }}
                ></div>
              </div>

              <p className="progress-text">
                {item.progress || "0%"} Completed
              </p>

              <button className="course-btn">
                {item.button || "Continue Learning"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;
