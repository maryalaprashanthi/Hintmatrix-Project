import { useState } from "react";
import { useParams } from "react-router-dom";

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
    FaArrowRight
} from "react-icons/fa";

import "./QuestionCategories.css";
import "./AddQuestionCategoryModal.css";

import AddQuestionCategoryModal from "./AddQuestionCategoryModal";

export default function QuestionCategories() {

    const { chapterName } = useParams();

    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Upload (Frontend Only)
    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        console.log("Selected File:", file);

        alert(`Selected file: ${file.name}`);

        // Reset input
        event.target.value = "";
    };

    const categories = [

        {
            id:1,
            name:"B.Com Model Questions",
            questions:235,
            updated:"2 days ago",
            status:"Active",
            icon:<FaBookOpen />,
            iconBg:"#EAF2FF",
            iconColor:"#2563EB"
        },

        {
            id:2,
            name:"CA Foundation - Journal Entries",
            questions:180,
            updated:"3 days ago",
            status:"Active",
            icon:<FaFileAlt />,
            iconBg:"#E8FFF5",
            iconColor:"#10B981"
        },

        {
            id:3,
            name:"Easy Model Questions",
            questions:120,
            updated:"5 days ago",
            status:"Active",
            icon:<FaClipboardCheck />,
            iconBg:"#FFF6E8",
            iconColor:"#F59E0B"
        },

        {
            id:4,
            name:"State Board Model Questions",
            questions:210,
            updated:"1 week ago",
            status:"Active",
            icon:<FaUniversity />,
            iconBg:"#F4EEFF",
            iconColor:"#8B5CF6"
        },

        {
            id:5,
            name:"CBSE Model Questions",
            questions:195,
            updated:"1 week ago",
            status:"Active",
            icon:<FaGraduationCap />,
            iconBg:"#E9FBFF",
            iconColor:"#06B6D4"
        },

        {
            id:6,
            name:"Company A/c's",
            questions:160,
            updated:"2 weeks ago",
            status:"Active",
            icon:<FaBuilding />,
            iconBg:"#FFF8EA",
            iconColor:"#F97316"
        },

        {
            id:7,
            name:"Bills of Exchange",
            questions:150,
            updated:"2 weeks ago",
            status:"Active",
            icon:<FaExchangeAlt />,
            iconBg:"#EEF5FF",
            iconColor:"#3B82F6"
        },

        {
            id:8,
            name:"Consignment",
            questions:110,
            updated:"3 weeks ago",
            status:"Active",
            icon:<FaBoxOpen />,
            iconBg:"#FFF2F4",
            iconColor:"#EC4899"
        }

    ];

    const filteredCategories = categories.filter((category)=>{

        const searchMatch =
            category.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const statusMatch =
            statusFilter==="All"
            ||
            category.status===statusFilter;

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
                        onClick={() => setShowModal(true)}
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
                            onChange={(e)=>setSearchTerm(e.target.value)}
                        />

                    </div>

                </div>

                <div className="col-lg-4 col-md-5">

                    <select
                        className="form-select shadow-sm"
                        value={statusFilter}
                        onChange={(e)=>setStatusFilter(e.target.value)}
                    >

                        <option value="All">
                            All Status
                        </option>

                        <option value="Active">
                            Active
                        </option>

                        <option value="Inactive">
                            Inactive
                        </option>

                    </select>

                </div>

            </div>

            <div className="row g-3">

                {filteredCategories.map((category)=>(

                    <div
                        className="col-xl-4 col-lg-6 col-md-6"
                        key={category.id}
                    >

                        <div className="category-card h-100">

                            <div className="card-body">

                                <div
                                    className="icon-circle"
                                    style={{
                                        background:category.iconBg,
                                        color:category.iconColor
                                    }}
                                >

                                    {category.icon}

                                </div>

                                <h5 className="category-title">
                                    {category.name}
                                </h5>

                                <div className="question-count">
                                    {category.questions} Questions
                                </div>

                                <span className="badge bg-success-subtle text-success">
                                    {category.status}
                                </span>

                                <div className="updated-text">
                                    Last Updated
                                </div>

                                <div className="updated-date">
                                    {category.updated}
                                </div>

                                <button
                                    className="btn btn-primary view-btn"
                                >

                                    View Questions

                                    <FaArrowRight className="ms-2"/>

                                </button>

                                <div className="d-flex gap-2 mt-2">

                                    <button className="btn btn-outline-primary btn-sm action-btn">

                                        <FaPen className="me-1"/>

                                        Edit

                                    </button>

                                    <button className="btn btn-outline-danger btn-sm action-btn">

                                        <FaTrash className="me-1"/>

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

                            <FaSearch
                                size={40}
                                className="text-secondary mb-3"
                            />

                            <h5>
                                No Categories Found
                            </h5>

                            <p className="text-muted">
                                Try changing your search keyword.
                            </p>

                        </div>

                    </div>

                )}

            </div>

            <AddQuestionCategoryModal
                show={showModal}
                closeModal={()=>setShowModal(false)}
                chapterName={chapterName}
            />

        </div>

    );

}