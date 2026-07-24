import { useState, useEffect } from "react"; // 🌟 FIXED: Added state and effect hooks for dynamic data loading
import { useParams, useNavigate } from "react-router-dom";
import ChapterService from "../../services/ChapterService";
 // 🌟 FIXED: Hooked up your dedicated service module
import "./Chapters.css";

import {
  FaArrowLeft,
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaPlayCircle
} from "react-icons/fa";

function Chapters() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // 🌟 FIXED: State placeholder setup to dynamically read live tracking profiles from your database
  const [course, setCourse] = useState({
    name: "Loading Course...",
    chapters: []
  });

  // 🌟 FIXED: Live transaction pipeline fetch loop linked directly to ChapterService operations
  useEffect(() => {
    if (!courseId) return;

    ChapterService.getById(courseId)
      .then((response) => {
        const fetchedData = response.data || {};
        
        setCourse({
          // Maps seamlessly to your dynamic backend data properties or string definitions
          name: fetchedData.name || fetchedData.courseName || "Course Details",
          // Maps array mapping variables directly from relational backend tables
          chapters: fetchedData.chapters || (Array.isArray(fetchedData) ? fetchedData : [])
        });
      })
      .catch((error) => {
        console.error("Dynamic chapter retrieval processing failed:", error);
        setCourse({
          name: "Error Loading Data",
          chapters: []
        });
      });
  }, [courseId]);

  return (
    <div className="chapters-page">

      <button
        className="back-btn"
        onClick={() => navigate("/courses")}
      >
        <FaArrowLeft />
        Back to Courses
      </button>

      <div className="chapter-header">
        <h2>
          {course.name} Chapters
        </h2>
        <p>
          Select a chapter and start learning
        </p>
      </div>

      <div className="row g-4">
        {course.chapters.map((chapter, index) => (
          <div
            className="col-xl-4 col-lg-4 col-md-6"
            key={chapter.chapterId || chapter.id || index}
          >
            <div className="chapter-card">
              <div className="chapter-icon">
                <FaBookOpen />
              </div>

              {/* 🌟 FIXED: Dynamically handles typical response key structures like chapterName or title */}
              <h4>
                {chapter.chapterName || chapter.title || chapter.name || "Untitled Chapter"}
              </h4>

              <div className="chapter-info">
                <span>
                  <FaClock />
                  {chapter.lessons || 0} Lessons
                </span>

                <span>
                  <FaCheckCircle />
                  {chapter.progress || "0% Completed"}
                </span>
              </div>

              <div className="progress">
                <div
                  className="progress-bar"
                  style={{
                    width: chapter.progress || "0%"
                  }}
                ></div>
              </div>

              <button className="start-btn">
                <FaPlayCircle />
                Start Learning
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic empty helper node when zero relational rows are bound to the list collection */}
      {course.chapters.length === 0 && (
        <div className="text-center w-100 py-5 text-muted">
          <FaBookOpen size={40} className="mb-3 d-block mx-auto text-light" />
          <h5>No Chapters Added Yet</h5>
          <p>Please register chapters or section modules for this course in the database manager.</p>
        </div>
      )}

    </div>
  );
}

export default Chapters;
