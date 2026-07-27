import "./Chapters.css";
import ChapterService from "../../services/ChapterService";
import { useState, useEffect } from "react";
import ChapterForm from "./ChapterForm";
import {
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaPlayCircle,
} from "react-icons/fa";

function Chapters() {
  const { courseId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const isQuestionsModule =
    location.pathname.startsWith("/questions");

  const [showAddChapter, setShowAddChapter] = useState(false);
  const [chapters, setChapters] = useState([]);

  const loadChapters = async () => {
    try {
      const response = await ChapterService.getAll();

      console.log("Status:", response.status);
      console.log("Data:", response.data);

      setChapters(response.data);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  useEffect(() => {
    loadChapters();
  }, []);

  const handleSaveChapter = async (newChapter) => {
    try {
      console.log("Sending:", newChapter);

      console.log("Before API Call");
      const response = await ChapterService.create(newChapter);

      loadChapters();

      console.log("After API Call");
      console.log("HTTP Status:", response.status);
      console.log("Success:", response.data);

      alert("Chapter created successfully");

      setShowAddChapter(false);
    } catch (error) {
      console.error("Full Error:", error);
      console.log("Error Response:", error.response);
      console.log("Error Data:", error.response?.data);
      console.log("Error Status:", error.response?.status);

      alert("Failed to create chapter");
    }
  };

  // Upload (Frontend Only)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    console.log("Selected File:", file);
    alert(`Selected file: ${file.name}`);

    // Clear input so same file can be selected again
    event.target.value = "";
  };

  // Chapter -> Question Categories
  const openCategories = (chapterTitle) => {
    const chapterSlug = chapterTitle
      .toLowerCase()
      .replaceAll(" ", "-");

    if (isQuestionsModule) {
      navigate("/questions/question-categories");
    } else {
      navigate(
        `/question-categories/${courseId}/${chapterSlug}`
      );
    }
  };

  return (
    <div className="chapters-page">
      <button
        className="back-btn"
        onClick={() =>
          navigate(
            isQuestionsModule
              ? "/questions"
              : "/courses"
          )
        }
      >
        <FaArrowLeft />
        Back
      </button>

      <div className="chapter-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2>All Chapters</h2>
          <p className="mb-0">
            Select a chapter and start learning
          </p>
        </div>

        {/* Hidden Upload Input */}
        <input
          type="file"
          id="chapterUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() =>
              document.getElementById("chapterUpload").click()
            }
          >
            ⬆ Upload
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddChapter(true)}
          >
            + Add Chapter
          </button>
        </div>
      </div>

      <div className="row g-4">
        {console.log("Chapters State:", chapters)}

        {chapters.map((chapter, index) => (
          <div
            className="col-xl-4 col-lg-4 col-md-6"
            key={index}
          >
            <div className="chapter-card">
              <div className="chapter-icon">
                <FaBookOpen />
              </div>

              <h4>{chapter.name}</h4>

              <div className="chapter-info">
                <span>
                  <FaClock />
                  {chapter.lessons} Lessons
                </span>

                <span>
                  <FaCheckCircle />
                  {chapter.progress}
                </span>
              </div>

              <div className="progress">
                <div
                  className="progress-bar"
                  style={{
                    width: chapter.progress,
                  }}
                ></div>
              </div>

              <button
                className="start-btn"
                onClick={() =>
                  openCategories(chapter.name)
                }
              >
                <FaPlayCircle />
                Start Learning
              </button>
            </div>
          </div>
        ))}
      </div>

      <ChapterForm
        show={showAddChapter}
        onClose={() => setShowAddChapter(false)}
        onSave={handleSaveChapter}
      />
    </div>
  );
}

export default Chapters;