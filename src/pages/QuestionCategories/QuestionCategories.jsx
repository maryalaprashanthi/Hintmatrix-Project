import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DataGrid from "../../components/DataGrid";
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

const columnDefs = [
    {
        headerName: "ID",
        field: "categoryId",
        width: 100,
    },
    {
        headerName: "Category Name",
        field: "name",
        flex: 1,
    },
    {
        headerName: "Actions",
        width: 200,
        sortable: false,
        filter: false,

        cellRenderer: (params) => (
            <div className="d-flex gap-2 align-items-center h-100">

                <button
                    className="btn btn-sm btn-primary"
                   onClick={() => handleEdit(params.data)}
                >
                    Edit
                </button>

                <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                        console.log("Delete ID:", params.data.categoryId)
                    }
                >
                    Delete
                </button>

            </div>
        ),
    },
];
    

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



            
            {/* AG GRID */}

            <DataGrid
                rowData={categories}
                columnDefs={columnDefs}
                height={500}
                pageSize={10}
                loading={loading}
            />



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