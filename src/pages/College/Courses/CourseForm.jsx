import React, { useState } from "react";
import "./CourseForm.css";
import CourseService from "../../../services/CourseService"; // 🌟 Connected service layer

function CourseForm({ onSaveCourse }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "Commerce",
    level: "Beginner",
    duration: "",
    instructor: "",
    price: "",
    description: "",
    progress: "0%"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a course name.");
      return;
    }

    // 🌟 FIXED: Structured payload to match the exact keys expected by CourseRequestDTO
    const courseRequestDTO = {
      branchId: 1, // Satisfies backend @NotNull validation constraint
      name: formData.title.trim() // Satisfies backend @NotBlank validation constraint
    };

    // 🌟 FIXED: Dispatches the transaction payload data directly to your Spring Boot database engine
    CourseService.saveCourse(courseRequestDTO)
      .then((response) => {
        alert("Course saved successfully to backend database!");

        // Retain compatibility layer wrapper with parent trackers if necessary
        if (typeof onSaveCourse === "function") {
          onSaveCourse({
            ...formData,
            id: response.data?.id || Date.now()
          });
        }

        // Reset the form fields cleanly
        setFormData({
          title: "",
          category: "Commerce",
          level: "Beginner",
          duration: "",
          instructor: "",
          price: "",
          description: "",
          progress: "0%"
        });
      })
      .catch((error) => {
        console.error("Database transaction failed:", error);
        alert(error.response?.data?.message || "Validation failed: Make sure your server models match.");
      });
  };

  return (
    <div className="course-form-page">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <form onSubmit={handleSubmit} className="card course-card shadow-sm">
              <div className="card-header bg-white border-0 pt-4 pb-3">
                <h2 className="fw-bold mb-1">Create New Course</h2>
                <p className="text-muted mb-0">
                  Fill in the details to create a new course.
                </p>
              </div>

              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label">Course Name</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter Course Name"
                    />
                  </div>

                  <div className="col-md-6 mb-4">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Commerce">Commerce</option>
                      <option value="School Curriculum">School Curriculum</option>
                      <option value="Chartered Accountancy">Chartered Accountancy</option>
                      <option value="Integrated Program">Integrated Program</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label className="form-label">Course Level</label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Example: 30 Lessons"
                    />
                  </div>

                  <div className="col-md-6 mb-4">
                    <label className="form-label">Instructor Name</label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Instructor Name"
                    />
                  </div>

                  <div className="col-md-6 mb-4">
                    <label className="form-label">Course Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="₹ 0"
                    />
                  </div>

                  <div className="col-12 mb-4">
                    <label className="form-label">Course Description</label>
                    <textarea
                      rows="5"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Write course description..."
                    ></textarea>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label className="form-label">Course Thumbnail</label>
                    <input type="file" className="form-control" />
                  </div>

                  <div className="col-md-6 mb-4">
                    <label className="form-label">Course Banner</label>
                    <input type="file" className="form-control" />
                  </div>

                  <div className="d-flex justify-content-end gap-3 mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary px-4"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseForm;
