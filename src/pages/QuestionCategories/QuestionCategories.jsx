import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    FaBookOpen,
    FaPen,
    FaTrash,
    FaArrowRight
} from "react-icons/fa";
import "./QuestionCategories.css";
import "./AddQuestionCategoryModal.css";
import QuestionCategoryService from "../../services/QuestionCategoryService";

import AddQuestionCategoryModal from "./AddQuestionCategoryModal";

export default function QuestionCategories() {

    const { chapterName } = useParams();

    const [showModal, setShowModal] = useState(false);
     const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
};

    // ==============================
    // GET QUESTION CATEGORIES
    // ==============================

    const loadCategories = async () => {

        try {

            setLoading(true);

            const response =
                await QuestionCategoryService.getAll();

            console.log(
                "Categories from backend:",
                response.data
            );

            setCategories(response.data);

        } catch (error) {

            console.error(
                "Error fetching categories:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadCategories();
    }, []);


    

    return (

        <div className="question-category-page">

            <div className="page-header">

                <div>

                    <h1>Question Categories</h1>

                    <p>
                        {chapterName} Question Categories
                    </p>

                </div>
<button
    className="add-category-btn"
    onClick={() => {
        setSelectedCategory(null);
        setShowModal(true);
    }}
>
    + Add Category
</button>

            </div>



            
           {/* CATEGORY CARDS */}

{loading ? (

    <div className="text-center py-5">
        Loading categories...
    </div>

) : (

    <div className="row g-3">

        <div className="category-grid">

    {categories.map((category, index) => (

        <div
            className="category-card"
            key={category.categoryId || index}
        >

            {/* TOP CONTENT */}
            <div className="category-card-content">

                <div className={`category-icon icon-${index % 6}`}>
                    <FaBookOpen />
                </div>

                <div className="category-info">

                    <h3>
                        {category.name}
                    </h3>

                </div>

                <button
                    type="button"
                    className="category-menu"
                >
                    ⋮
                </button>
                

            </div>


            {/* BOTTOM ACTIONS */}
            <div className="category-card-footer">

                <button className="open-question-btn">
                    Open Questions
                    <FaArrowRight />
                </button>

                <div className="category-actions">

                    <button
                        className="edit-category-btn"
                        onClick={() => handleEdit(category)}
                        title="Edit"
                    >
                        <FaPen />
                    </button>

                    <button
                        className="delete-category-btn"
                        onClick={() => handleDelete(category.categoryId)}
                        title="Delete"
                    >
                        <FaTrash />
                    </button>

                </div>

            </div>

        </div>

    ))}

</div>

    </div>

)}



            {/* Add Question Category Modal */}

          <AddQuestionCategoryModal
    show={showModal}
    closeModal={() => {
        setShowModal(false);
        setSelectedCategory(null);
    }}
    chapterName={chapterName}
    initialData={selectedCategory}
/>

        </div>

    );

}