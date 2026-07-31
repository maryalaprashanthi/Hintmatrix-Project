import { useEffect, useRef, useState } from "react";
import StudentForm from "./StudentForm";
import "./Student.css";
import StudentTable from "./StudentTable";
import StudentService from "../../services/UserService";

function Student() {
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch all Students
  const fetchStudents = () => {
    StudentService.getAllStudents()
      .then((response) => {
        setStudents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching Students:", error);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Upload
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    console.log("Selected File:", file);

    // StudentService.uploadStudents(file)
    //   .then(() => {
    //     alert("Students uploaded successfully!");
    //     fetchStudents();
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
  };

  // Open Add Form
  const handleAddStudent = () => {
    setSelectedStudent(null);
    setShowModal(true);
  };

  // Open Edit Form
  const handleEditStudent = (studentData) => {
    setSelectedStudent(studentData);
    setShowModal(true);
  };

  // Save / Update Student
  const handleSave = (studentData) => {
    if (selectedStudent) {
      StudentService.updateStudent(selectedStudent.studentId, studentData)
        .then(() => {
          alert("Student updated successfully!");
          fetchStudents();
          setShowModal(false);
          setSelectedStudent(null);
        })
        .catch((error) => {
          console.error("Update Error:", error);
          alert("Failed to update Student.");
        });
    } else {
      StudentService.createStudent(studentData)
        .then(() => {
          alert("Student added successfully!");
          fetchStudents();
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Save Error:", error);
          alert("Failed to add Student.");
        });
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Student Management</h2>
          <p className="text-muted">Manage all Students.</p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleUploadClick}>
            ⬆ Upload
          </button>

          <button className="btn btn-primary" onClick={handleAddStudent}>
            + Add Student
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
      />

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <StudentTable
            data={students}
            onEdit={handleEditStudent}
            refreshData={fetchStudents}
          />
        </div>
      </div>

      {/* Form */}
      <StudentForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedStudent(null);
        }}
        onSave={handleSave}
        selectedStudentData={selectedStudent}
      />
    </div>
  );
}

export default Student;
