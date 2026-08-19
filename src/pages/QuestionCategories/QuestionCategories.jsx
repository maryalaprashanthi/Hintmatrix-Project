import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import SuccessModal from "../../components/Common/SuccessModal";
import DeleteModal from "../../components/Common/DeleteModal";

import {
  FaBookOpen,
  FaFileAlt,
  FaUniversity,
  FaGraduationCap,
  FaBuilding,
  FaExchangeAlt,
  FaBoxOpen,
  FaClipboardCheck,
  FaSearch,
  FaPen,
  FaTrash,
  FaArrowRight,
} from "react-icons/fa";

import "./QuestionCategories.css";
import "./AddQuestionCategoryModal.css";

import AddQuestionCategoryModal from "./AddQuestionCategoryModal";
import QuestionCategoryService from "../../services/QuestionCategoryService";

export default function QuestionCategories() {
  const { chapterId, chapterName } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const selectedChapter = location.state?.chapter;

  console.log("Selected Chapter:", selectedChapter);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categories, setCategories] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  // GET ALL CATEGORIES
  const fetchCategories = async () => {
    try {
      const response = await QuestionCategoryService.getAll();

      setCategories(response.data || []);
    } catch (error) {
      console.error("Error loading Question Categories:", error);

      alert("Failed to load Question Categories");
    }
  };
 

  useEffect(() => {
    fetchCategories();
  }, []);
 
  // Upload (Frontend Only)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const response = await QuestionCategoryService.uploadExcel(file);

      alert(
        typeof response.data === "string"
          ? response.data
          : "Question Category Excel uploaded successfully!",
      );
    } catch (error) {
      console.error(error);

      alert(error.response?.data || "Question Category upload failed");
    }

    event.target.value = "";
  };
  // DELETE CATEGORY
  const handleDelete = async (id) => {
    if (!id) {
      alert("Cannot delete: Category ID is missing.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) return;

    try {
      await QuestionCategoryService.deleteSection(id);

      // Refresh categories from DB
      await fetchCategories();

      // Show delete success popup
      setShowDelete(true);
    } catch (error) {
      console.error("Delete Error:", error);

      alert(error.response?.data || "Delete failed");
    }
  };

  // EDIT CATEGORY

  const handleEdit = (category) => {
    setSelectedCategory(category);

    setShowModal(true);
  };

  const filteredCategories = categories.filter((category) => {
    const searchMatch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const status = category.activeRow ? "Active" : "Inactive";

    const statusMatch = statusFilter === "All" || status === statusFilter;

    return searchMatch && statusMatch;
  });

  return (
    <div className="question-category-page">
      <div className="page-header">
        <div>
          <h1>Question Categories</h1>

          <p>{chapterName} Question Categories</p>
        </div>

        {/* Hidden Upload Input */}
        <input
          type="file"
          id="questionCategoryUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() =>
              document.getElementById("questionCategoryUpload").click()
            }
          >
            ⬆ Upload
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setShowModal(true);
              setSelectedCategory(null);
            }}
          >
            + Add Category
          </button>
        </div>
      </div>

      <div className="row align-items-center mb-3">
        <div className="col-lg-8 col-md-7 mb-3 mb-md-0">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-0">
              <FaSearch />
            </span>

            <input
              type="text"
              className="form-control border-0"
              placeholder="Search Categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-lg-4 col-md-5">
          <select
            className="form-select shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>

            <option value="Active">Active</option>

            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="row g-3">
        {filteredCategories.map((category) => (
          <div className="col-xl-4 col-lg-6 col-md-6" key={category.categoryId}>
            <div className="category-card h-100">
              <div className="card-body">
                <div
                  className="icon-circle"
                  style={{
                    background: category.iconBg,
                    color: category.iconColor,
                  }}
                >
                  {category.icon}
                </div>

                <h5 className="category-title">{category.name}</h5>

                <div className="question-count">
                  {category.questions} Questions
                </div>

                <span
                  className={`badge ${
                    category.activeRow
                      ? "bg-success-subtle text-success"
                      : "bg-danger-subtle text-danger"
                  }`}
                >
                  {category.activeRow ? "Active" : "Inactive"}
                </span>

                <div className="updated-text">Last Updated</div>

                <div className="updated-date">{category.updated}</div>

                <button
                  className="btn btn-primary view-btn"
                  disabled={!category.activeRow}
                  onClick={() => {
                    const finalCourseId = selectedChapter?.courseId;
                    const finalChapterId =
                      selectedChapter?.chapterId || chapterId;
                    const finalCategoryId = category.categoryId;

                    console.log("View Questions clicked:", {
                      courseId: finalCourseId,
                      chapterId: finalChapterId,
                      categoryId: finalCategoryId,
                    });

                    if (!finalCourseId || !finalChapterId || !finalCategoryId) {
                      console.error("Missing mapping:", {
                        courseId: finalCourseId,
                        chapterId: finalChapterId,
                        categoryId: finalCategoryId,
                      });

                      alert(
                        "Course, Chapter, or Category information is missing.",
                      );
                      return;
                    }

                    navigate(
                      `/questions/question-list?courseId=${finalCourseId}&chapterId=${finalChapterId}&categoryId=${finalCategoryId}`,
                    );
                  }}
                >
                  View Questions
                  <FaArrowRight className="ms-2" />
                </button>
                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn btn-outline-primary btn-sm action-btn"
                    onClick={() => handleEdit(category)}
                  >
                    <FaPen className="me-1" />
                    Edit
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm action-btn"
                    onClick={() => handleDelete(category.categoryId)}
                  >
                    <FaTrash className="me-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="col-12">
            <div className="text-center bg-white rounded-4 p-5 shadow-sm">
              <FaSearch size={40} className="text-secondary mb-3" />

              <h5>No Categories Found</h5>

              <p className="text-muted">Try changing your search keyword.</p>
            </div>
          </div>
        )}
      </div>

      <AddQuestionCategoryModal
        show={showModal}
        closeModal={() => {
          setShowModal(false);
          setSelectedCategory(null);
        }}
        chapterName={chapterName}
        chapterId={chapterId}
        selectedChapter={selectedChapter}
        initialData={selectedCategory}
        refreshCategories={fetchCategories}
        onSuccess={() => setShowSuccess(true)}
      />
      <SuccessModal
        show={showSuccess}
        message="Question Category saved successfully!"
        onClose={() => setShowSuccess(false)}
      />
      <DeleteModal
        show={showDelete}
        message="Question Category deleted successfully!"
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}
