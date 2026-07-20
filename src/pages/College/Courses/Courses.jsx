import { useState } from "react";
import "./Courses.css";
import { FaBookOpen, FaPlus } from "react-icons/fa";

import AddCourseModal from "./AddCourseModal";

// Images
import bcom from "../../../assets/courses/bcom.png.jpeg";
import ca from "../../../assets/courses/ca-foundation.png.jpeg";
import cbse from "../../../assets/courses/cbse11.png.jpeg";
import accountancy from "../../../assets/courses/jr-accountancy.png.jpeg";
import combo from "../../../assets/courses/combo.png.jpeg";
import inter from "../../../assets/courses/inter.png.jpeg";

function Courses() {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  const [courses, setCourses] = useState([
    {
      title: "B.Com - 1st Year",
      image: bcom,
      category: "Commerce",
      level: "Beginner",
      duration: "Self-paced",
      button: "Continue Learning",
      progress: "70%",
    },
    {
      title: "CA Foundation",
      image: ca,
      category: "Chartered Accountancy",
      level: "Intermediate",
      duration: "Self-paced",
      button: "Continue Learning",
      progress: "55%",
    },
    {
      title: "CBSE Class-11",
      image: cbse,
      category: "School Curriculum",
      level: "Beginner",
      duration: "Academic Year",
      button: "View Course",
      progress: "40%",
    },
    {
      title: "Jr. Accountancy",
      image: accountancy,
      category: "Commerce",
      level: "Beginner",
      duration: "30 Lessons",
      button: "Continue Learning",
      progress: "85%",
    },
    {
      title: "Combo Pack",
      image: combo,
      category: "Multiple Courses",
      level: "All Levels",
      duration: "Unlimited Access",
      button: "View Details",
      progress: "25%",
    },
    {
      title: "Inter CBSE CAF B.Com",
      image: inter,
      category: "Integrated Program",
      level: "Intermediate",
      duration: "Full Program",
      button: "Continue Learning",
      progress: "60%",
    },
  ]);

  const handleSaveCourse = (courseData) => {
    if (editingIndex !== null) {
      const updatedCourses = [...courses];
      updatedCourses[editingIndex] = courseData;
      setCourses(updatedCourses);
      setEditingIndex(null);
      setEditingCourse(null);
    } else {
      setCourses([...courses, courseData]);
    }
  };

  const handleDeleteCourse = (index) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter((_, i) => i !== index));
    }
  };

  const handleEditCourse = (course, index) => {
    setEditingCourse(course);
    setEditingIndex(index);
    setShowModal(true);
  };

  return (
    <div className="courses-page">
      <AddCourseModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCourse(null);
          setEditingIndex(null);
        }}
        onSave={handleSaveCourse}
        editCourse={editingCourse}
      />

      <div className="courses-header">
        <div className="courses-header-top">
          <div className="courses-title">
            <div className="title-icon">
              <FaBookOpen />
            </div>

            <div>
              <h1>My Courses</h1>
              <p>Explore all available courses</p>
            </div>
          </div>

          <button
            className="add-course-btn"
            onClick={() => setShowModal(true)}
          >
            <FaPlus />
            Add Course
          </button>
        </div>
      </div>

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

      <div className="courses-grid">
        {courses.map((course, index) => (
          <div className="course-card" key={index}>
            <div className="course-banner">
              <img src={course.image} alt={course.title} />
            </div>

            <div className="course-content">
              <h3>{course.title}</h3>

              <p className="course-category">{course.category}</p>

              <div className="course-info">
                <span className="level">⭐ {course.level}</span>

                <span className="duration">⏳ {course.duration}</span>
              </div>

              <div className="progress">
                <div
                  className="progress-fill"
                  style={{ width: course.progress }}
                ></div>
              </div>

              <p className="progress-text">{course.progress} Completed</p>

              <button className="course-btn">{course.button}</button>

              <div className="course-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditCourse(course, index)}
                >
                  ✏ Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDeleteCourse(index)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;