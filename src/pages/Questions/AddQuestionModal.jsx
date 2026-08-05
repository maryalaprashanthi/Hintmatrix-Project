import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import CourseService from "../../services/CourseService";
import ChapterService from "../../services/ChapterService";
import CategoryService from "../../services/QuestionCategoryService";
import TableAttributeService from "../../services/TableAttributeService";

import {
  FaTimes,
  FaBook,
  FaLayerGroup,
  FaList,
  FaFileAlt,
  FaSave,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import "./AddQuestionModal.css";

function AddQuestionModal({
  show,
  onClose,
  onSave,
  questionData,
}) {
  const [courseId, setCourseId] = useState(null);
  const [chapterId, setChapterId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [questionText, setQuestionText] = useState("");

  // Empty options (Backend team will populate)
  const [courseOptions, setCourseOptions] = useState([]);
  const [chapterOptions,setChapterOptions] = useState([]);
  const [categoryOptions,setCategoryOptions] = useState([]);
  const [balanceOptions, setBalanceOptions] = useState([]);

  const [attributes, setAttributes] = useState([
    {
      debitBalance: "",
      debitAmount: "",
      creditBalance: "",
      creditAmount: "",
    },
  ]);

  useEffect(() => {
    if (questionData) {
      setCourseId(questionData.courses || null);
      setChapterId(questionData.chapters || null);
      setCategoryId(questionData.categoryies || null);
      let courseOptionsData = questionData.courses.map((item) => ({
      value: item.id,
      label: item.name,
}));

let categoryOptionsData = questionData.categories.map((item) => ({
  value: item.id,
  label: item.name,
}));

let chapterOptionData = questionData.chapters.map((item) => ({
  value: item.id,
  label: item.name,
}));

setCourseOptions(courseOptionsData);
setCategoryOptions(categoryOptionsData);
setChapterOptions(chapterOptionData);

    const attributesData = questionData.attributes || [
  {
    debitBalance: "",
    debitAmount: "",
    creditBalance: "",
    creditAmount: "",
  },
];

setAttributes(attributesData);

// Create balance options from attributes
const balances = [
  ...attributesData.map((item) => item.debitBalance),
  ...attributesData.map((item) => item.creditBalance),
];

const uniqueBalances = [...new Set(balances.filter(Boolean))];

const balanceOptionsData = uniqueBalances.map((balance) => ({
  value: balance,
  label: balance,
}));

setBalanceOptions(balanceOptionsData);  
    } else {
      setCourseId(null);
      setChapterId(null);
      setCategoryId(null);
      setQuestionText("");

      setAttributes([
        {
          debitBalance: "",
          debitAmount: "",
          creditBalance: "",
          creditAmount: "",
        },
      ]);
    }
  }, [questionData]);
  useEffect(() => {
  loadCourses();
  loadCategories();
  loadTableAttributes();
  
}, []);


const loadCourses = async () => {
  try {

    const response = await CourseService.getAllCourses();
    
    const courseOptions = response.data.map((course)=>({
      value: course.course_id,
      label: course.course_name,
    }));

    setCourseOptions(courseOptions);

  } catch(error){
    console.log(error);
  }
};


const loadCategories = async () => {
  try {

    const response = await CategoryService.getAllCategories();

    const data=response.data.map((item)=>({
      value:item.category_id,
      label:item.category_name
    }));

    setCategoryOptions(data);

  }catch(error){
    console.log(error);
  }
};
// ADD CHAPTER USEEFFECT HERE 👇

useEffect(()=>{

 if(courseId){
    loadChapters(courseId.value);
 }
 else{
    setChapterOptions([]);
 }

},[courseId]);

const loadTableAttributes = async () => {
  try {
    const response = await TableAttributeService.getAll();

    const data = response.data.map((item) => ({
      value: item.attributeId,
      label: item.name,
    }));

    setBalanceOptions(data);

  } catch (error) {
    console.error("Error loading table attributes:", error);
  }
};

const loadChapters = async(courseId)=>{

 try{

 const response =
 await ChapterService.getChaptersByCourse(courseId);


 const data=response.data.map((item)=>({
    value:item.chapter_id,
    label:item.chapter_name
 }));

 setChapterOptions(data);

 }catch(error){
    console.log(error);
 }

};

  if (!show) return null;

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const handleAddRow = () => {
    setAttributes([
      ...attributes,
      {
        debitBalance: "",
        debitAmount: "",
        creditBalance: "",
        creditAmount: "",
      },
    ]);
  };

  const handleDeleteRow = (index) => {
    if (attributes.length === 1) return;

    const updatedRows = attributes.filter((_, i) => i !== index);
    setAttributes(updatedRows);
  };

  const handleSave = async () => {
    if (
      !courseId ||
      !chapterId ||
      !categoryId ||
      !questionText.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const newQuestion = {
      courseId,
      chapterId,
      categoryId,
      questionText,
      attributes,
    };

    await onSave(newQuestion);

    handleClose();
  };

  const handleClose = () => {
    setCourseId(null);
    setChapterId(null);
    setCategoryId(null);
    setQuestionText("");

    setAttributes([
      {
        debitBalance: "",
        debitAmount: "",
        creditBalance: "",
        creditAmount: "",
      },
    ]);

    onClose();
  };
  
  return createPortal(
    <div className="modal-overlay">
  <div className="table-name-modal">

    {/* Header */}

    <div className="modal-header">
      <div>
        <h2>
          {questionData ? "Add Question" : "Add New Question"}
        </h2>

        <p>
          {questionData
            ? "Fill in the details below to create a new question."
            : "Fill in the details below to create a new question."}
        </p>
      </div>

      <button className="close-btn" onClick={handleClose}>
        <FaTimes />
      </button>
    </div>
    {/* Body */}

    <div className="modal-body">

      <div className="form-card">

        <h3 className="section-title">
          Question Details
        </h3>

        <div className="form-grid">

          {/* Course ID */}
            <div className="form-group">
           <label>
           Course ID <span>*</span>
           </label>

          <div className="input-box ">

          <FaList className="input-icon" />
          <Select
          className="react-select-container"
          classNamePrefix="react-select"
          options={courseOptions}
          value={courseId}
          onChange={setCourseId}
          placeholder="Select Course Id"
          isSearchable={true}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={{
          menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
          }),
        }}
        />
       </div>
     </div>
         {/* Chapter ID */}

          <div className="form-group">
            <label>
            Chapter ID <span>*</span>
            </label>

            <div className="input-box">
              <FaList className="input-icon" />
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={chapterOptions}
                value={chapterId}
                onChange={setChapterId}
                placeholder="Select Chapter Id"
                isSearchable={true}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              }}
              />
            </div>
          </div>

          {/* Category ID */}

          <div className="form-group">
            <label>
              Category ID <span>*</span>
            </label>

            <div className="input-box">
              <FaList className="input-icon" />

              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={categoryOptions}
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Select "
                isSearchable={true}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                }),
              }}
              />
            </div>
          </div>
        </div>

        {/* Question Text */}

        <div className="form-group mt-4">
          <label>
            Question Text <span>*</span>
          </label>

          <div className="textarea-box">
            <FaFileAlt className="input-icon" />

            <textarea
              placeholder="Enter question text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>
        </div>

      </div>
            {/* Question Attributes */}

      <div className="form-card">

        <h3 className="section-title">
          Question Attributes
        </h3>

        <p>Add debit and credit balances for this question.</p>

        <div className="question-table">
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Debit Balance</th>
                <th>Amount</th>
                <th>Credit Balance</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {attributes.map((row, index) => (
                <tr key={index}>

                  {/* Debit Balance */}

                 <td>
  <Select
    className="react-select-container"
    classNamePrefix="react-select"
    options={balanceOptions}
    value={balanceOptions.find(
      option => option.value === row.debitBalance
    )}
    onChange={(selected) =>
      handleAttributeChange(
        index,
        "debitBalance",
        selected ? selected.value : ""
      )
    }
    placeholder="Select "
    isSearchable={false}
  />
</td>

                  {/* Debit Amount */}

                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={row.debitAmount}
                      onChange={(e) =>

                        handleAttributeChange(
                          index,
                          "debitAmount",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* Credit Balance */}
<td>
  <Select
    className="react-select-container"
    classNamePrefix="react-select"
    options={balanceOptions}
    value={balanceOptions.find(
      option => option.value === row.creditBalance
    )}
    onChange={(selected) =>
      handleAttributeChange(
        index,
        "creditBalance",
        selected ? selected.value : ""
      )
    }
    placeholder="Select "
    isSearchable={false}
  />
</td>
                 {/* Credit Amount */}
                     <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={row.creditAmount}
                      onChange={(e) =>
                        handleAttributeChange(
                          index,
                          "creditAmount",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* Delete */}

                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => handleDeleteRow(index)}
                      disabled={attributes.length === 1}
                    >
                      <FaTrash />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary mt-3"
          onClick={handleAddRow}
        >
          <FaPlus className="me-2" />
          Add Row
        </button>

      </div>
       {/* Footer */}

        <div className="modal-footer">

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            <FaSave className="me-2" />
            {questionData ? "Save" : "Save"}
          </button>

            </div>
          </div>
       </div>
    </div>,
    document.body
  );
}
export default AddQuestionModal;
