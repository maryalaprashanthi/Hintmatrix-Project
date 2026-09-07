import { useState } from "react";
import CollegeForm from "./CollegeForm";
import CollegeTable from "./CollegeTable";
import CollegeService from "../../services/CollegeService";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";
import { getApiErrorMessage } from "../../utils/apiError";

function College() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);

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
    const isEditing = Boolean(selectedCollege);

    try {
      if (isEditing) {
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

      toast.success(isEditing ? "College updated." : "College saved.");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to save college."));
    }
  };
  // Delete College permanently
  const del = useDeleteConfirm({
    entity: "college",
    deleteFn: (college) =>
      CollegeService.deleteCollege(college.collegeId ?? college.id ?? college),
    onDeleted: () => setRefreshTrigger((prev) => !prev),
  });

  // Upload (Frontend Only)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const response = await CollegeService.uploadExcel(file);

      toast.success(
        typeof response.data === "string" ? response.data : "Upload complete.",
      );

      // Refresh the table after successful upload
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "File upload failed."));
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
            onDelete={del.request}
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

      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.instituteName || del.pending?.name || "this college"}"?`}
        body="Its branches, courses and everything under them will be removed. This can't be undone."
        confirmLabel="Delete college"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default College;
