import CollegeService from "../../services/CollegeService";
import BranchService from "../../services/BranchService";
import SectionService from "../../services/SectionService";
import { useEffect, useRef, useState } from "react";
import StudentForm from "./StudentForm";
import "./Student.css";
import StudentTable from "./StudentTable";
import StudentService from "../../services/UserService";
import SuccessModal from "../../components/Common/SuccessModal";
import DeleteModal from "../../components/Common/DeleteModal";

function Student() {
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);

  // Success Modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Delete Modal
  const [showDelete, setShowDelete] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch all Students
  const fetchStudents = async () => {
    try {
      const response = await StudentService.getAllStudents();
      setStudents(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching Students:", error);
      return [];
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await CollegeService.getAllColleges();

      console.log("COLLEGE API RESPONSE:", response.data);

      setColleges(response.data);
    } catch (error) {
      console.error("COLLEGE API ERROR:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await BranchService.getAllBranches();

      console.log("BRANCH API RESPONSE:", response.data);

      setBranches(response.data);
    } catch (error) {
      console.error("BRANCH API ERROR:", error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await SectionService.getAllSections();

      console.log("SECTION API RESPONSE:", response.data);

      setSections(response.data);
    } catch (error) {
      console.error("SECTION API ERROR:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchColleges();
    fetchBranches();
    fetchSections();
  }, []);

  // Upload
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    console.log("Selected File:", file);

    StudentService.uploadUsersExcel(file)
      .then((response) => {
        setSuccessMessage(
          response.data.message || "Students uploaded successfully!",
        );
        setShowSuccess(true);

        // Refresh table after upload
        fetchStudents();
      })
      .catch((error) => {
        console.error("Upload Error:", error);

        alert("Failed to upload students.");
      });

    // reset input so same file can be selected again
    e.target.value = "";
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

  const handleStudentDeleted = async (studentId) => {
    const refreshedStudents = await fetchStudents();

    setStudents((currentStudents) => {
      const serverStillHasStudent = refreshedStudents.some(
        (student) =>
          String(student.userId || student.user_id) === String(studentId),
      );

      return serverStillHasStudent
        ? currentStudents.filter(
            (student) =>
              String(student.userId || student.user_id) !== String(studentId),
          )
        : refreshedStudents;
    });

    setShowDelete(true);
  };

  // Save / Update Student
  const handleSave = (studentData) => {
    if (selectedStudent) {
      const studentId = selectedStudent.userId || selectedStudent.studentId;

      if (!studentId) {
        console.error("Cannot update student without an ID:", selectedStudent);
        alert("Unable to update Student: student ID is missing.");
        return;
      }

      StudentService.updateStudent(studentId, studentData)
        .then(() => {
          fetchStudents();

          setSuccessMessage("Student updated successfully!");
          setShowSuccess(true);

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
          fetchStudents();

          setSuccessMessage("Student saved successfully!");
          setShowSuccess(true);

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
            onDeleted={handleStudentDeleted}
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
        colleges={colleges}
        branches={branches}
        sections={sections}
      />

      {/* Add / Update / Upload Success Modal */}
      <SuccessModal
        show={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />

      {/* Delete Success Modal */}
      <DeleteModal
        show={showDelete}
        message="Student deleted successfully!"
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}

export default Student;
