import { useState } from "react";
import StudentUserForm from "./StudentUserForm";
import "./StudentUser.css";
import StudentUserTable from "./StudentUserTable";

function StudentUser() {
  const [showModal, setShowModal] = useState(false);
  const [studentUsers, setStudentUsers] = useState([]);
  const [selectedStudentUser, setSelectedStudentUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // Open Add Student User Form
  const handleAddStudentUser = () => {
    setSelectedStudentUser(null);
    setShowModal(true);
  };

  // Open Edit Student User Form
  const handleEditStudentUser = (studentUserData) => {
    setSelectedStudentUser(studentUserData);
    setShowModal(true);
  };

  // Save / Update Student User
  const handleSave = (studentUserData) => {
    console.log("Submitting Student User payload:", studentUserData);

    if (selectedStudentUser) {
      setStudentUsers((prev) =>
        prev.map((item) =>
          item.studentUserId === selectedStudentUser.studentUserId
            ? studentUserData
            : item,
        ),
      );
    } else {
      setStudentUsers((prev) => [
        ...prev,
        {
          ...studentUserData,
          studentUserId: Date.now(),
        },
      ]);
    }

    alert(
      selectedStudentUser
        ? "Student User updated successfully!"
        : "Student User added successfully!",
    );

    setRefreshTrigger((prev) => !prev);
    setShowModal(false);
    setSelectedStudentUser(null);
  };

  // Upload File (Frontend Only)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    console.log("Selected File:", file);

    alert(`Selected File: ${file.name}`);

    // Backend integration can be added later

    e.target.value = "";
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Student User Management</h2>

          <p className="text-muted">Manage all Student Users.</p>
        </div>

        {/* Hidden Upload */}

        <input
          type="file"
          id="studentUserUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById("studentUserUpload").click()}
          >
            ⬆ Upload
          </button>

          <button className="btn btn-primary" onClick={handleAddStudentUser}>
            + Add Student User
          </button>
        </div>
      </div>

      {/* AG Grid */}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <StudentUserTable
            data={studentUsers}
            refresh={refreshTrigger}
            onEdit={handleEditStudentUser}
          />
        </div>
      </div>

      {/* Form */}

      <StudentUserForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedStudentUser(null);
        }}
        onSave={handleSave}
        selectedStudentUserData={selectedStudentUser}
      />
    </div>
  );
}

export default StudentUser;
