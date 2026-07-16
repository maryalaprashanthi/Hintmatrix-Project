import "./CourseForm.css";

function CourseForm() {
  return (
    <div className="course-form-page">
      <div className="container-fluid">

        <div className="row justify-content-center">

          <div className="col-lg-10">

            <div className="card course-card shadow-sm">

              <div className="card-header bg-white border-0 pt-4 pb-3">
                <h2 className="fw-bold mb-1">Create New Course</h2>
                <p className="text-muted mb-0">
                  Fill in the details to create a new course.
                </p>
              </div>

              <div className="card-body">

                <div className="row">

                  {/* Course Name */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label">
                      Course Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Course Name"
                    />
                  </div>

                  {/* Category */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label">
                      Category
                    </label>

                    <select className="form-select">
                      <option>Select Category</option>
                      <option>Commerce</option>
                      <option>School Curriculum</option>
                      <option>Chartered Accountancy</option>
                      <option>Integrated Program</option>
                    </select>
                  </div>

                  {/* Level */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label">
                      Course Level
                    </label>

                    <select className="form-select">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label">
                      Duration
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Example: 30 Lessons"
                    />
                  </div>

                  {/* Instructor */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label">
                      Instructor Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Instructor Name"
                    />
                  </div>

                  {/* Course Price */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label">
                      Course Price
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      placeholder="₹ 0"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12 mb-4">
                    <label className="form-label">
                      Course Description
                    </label>

                    <textarea
                      rows="5"
                      className="form-control"
                      placeholder="Write course description..."
                    ></textarea>
                  </div>

                  {/* Thumbnail */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label">
                      Course Thumbnail
                    </label>

                    <input
                      type="file"
                      className="form-control"
                    />
                  </div>

                  {/* Banner */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label">
                      Course Banner
                    </label>

                    <input
                      type="file"
                      className="form-control"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="col-12 text-end">

                    <button className="btn btn-primary px-5">
                      Save Course
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default CourseForm;