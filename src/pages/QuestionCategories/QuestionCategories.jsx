import { useState } from "react";
import { useParams } from "react-router-dom";

import "./QuestionCategories.css";
import "./AddQuestionCategoryModal.css";

import AddQuestionCategoryModal from "./AddQuestionCategoryModal";

export default function QuestionCategories() {

    const { chapterName } = useParams();

    const [showModal, setShowModal] = useState(false);

    const categories = [
        "B.Com Model Questions",
        "CA Foundation - Journal Entries",
        "Easy Model Questions",
        "State Board Model Questions",
        "CBSE Model Questions",
        "Company A/c's - CA Foundation - Journal Entries",
        "Bills of Exchange - CA Foundation - Journal Entries",
        "Consignment - CA Foundation - Journal Entries",
        "Sale on approval or Return basis - CA Foundation - Journal Entries",
        "Workshop for academic and corporate accounting"
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
                    onClick={() => setShowModal(true)}
                >
                    + Add Category
                </button>

            </div>



            <div className="category-table">

                <div className="table-header">

                    <div>
                        Category Name
                    </div>

                    <div>
                        Actions
                    </div>

                </div>



                {categories.map((category, index) => (

                    <div
                        className="category-row"
                        key={index}
                    >

                        <div className="category-name">

                            <input
                                type="checkbox"
                            />

                            <span>
                                {category}
                            </span>

                        </div>



                        <div className="actions">

                            <button className="edit-btn">
                                Edit
                            </button>

                            <button className="delete-btn">
                                Delete
                            </button>

                        </div>

                    </div>

                ))}

            </div>



            {/* Add Question Category Modal */}

            <AddQuestionCategoryModal
                show={showModal}
                closeModal={() => setShowModal(false)}
                chapterName={chapterName}
            />

        </div>

    );

}