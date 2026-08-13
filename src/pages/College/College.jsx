import { useState } from "react";
import CollegeForm from "./CollegeForm";
import CollegeTable from "./CollegeTable";
import CollegeService from "../../services/CollegeService";
import SuccessModal from "../../components/Common/SuccessModal";
import DeleteModal from "../../components/Common/DeleteModal";

function College() {
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Open Add College
  const handleAddCollege = () => {
    setSelectedCollege(null);
    setShowModal(true);
  };

  // Open Edit College
  const handleEditCollege = (collegeData) => {
    setSelectedCollege(collegeData);
    setShowModal(true);
  };

  // Save / Update College
  const handleSave = async (collegeData) => {
    try {
      if (selectedCollege) {
        await CollegeService.updateCollege(
          selectedCollege.collegeId,
          collegeData,
        );
      } else {
        await CollegeService.saveCollege(collegeData);
      }

      setRefreshTrigger((prev) => !prev);

      setSelectedCollege(null);
      setShowModal(false);

      setShowSuccess(true);
    } catch (error) {
      console.error(error);
    }
  };
  // Delete College permanently
  const handleDeleteCollege = async (collegeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this college?",
    );

    if (!confirmDelete) return;

    try {
      await CollegeService.deleteCollege(collegeId);

      // Refresh table from database
      setRefreshTrigger((prev) => !prev);

      // Show delete success popup
      setShowDelete(true);
    } catch (error) {
      console.error("Delete College Error:", error);

      if (error.response) {
        alert(error.response.data);
      } else {
        alert("Failed to delete college.");
      }
    }
  };

  // Upload (Frontend Only)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const response = await CollegeService.uploadExcel(file);

      alert(response.data);

      // Refresh the table after successful upload
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Upload Error:", error);

      if (error.response) {
        alert(error.response.data);
      } else {
        alert("File upload failed.");
      }
    }

    // Reset input
    e.target.value = "";
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">College Management</h2>

          <p className="text-muted">Manage all registered colleges.</p>
        </div>

        {/* Hidden Upload Input */}
        <input
          type="file"
          id="collegeUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById("collegeUpload").click()}
          >
            ⬆ Upload
          </button>

          <button className="btn btn-primary" onClick={handleAddCollege}>
            + Add College
          </button>
        </div>
      </div>

      {/* Table */}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <CollegeTable
            refresh={refreshTrigger}
            onEdit={handleEditCollege}
            onDelete={handleDeleteCollege}
          />
        </div>
      </div>

      {/* Modal */}

      <CollegeForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCollege(null);
        }}
        onSave={handleSave}
        selectedCollegeData={selectedCollege}
      />

      <SuccessModal
        show={showSuccess}
        message="College saved successfully!"
        onClose={() => setShowSuccess(false)}
      />
      <DeleteModal
        show={showDelete}
        message="College deleted successfully!"
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}

export default College;
