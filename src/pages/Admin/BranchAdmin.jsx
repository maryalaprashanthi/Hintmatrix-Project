import { useEffect, useState } from "react";
import BranchAdminForm from "./BranchAdminForm";
import "./BranchAdmin.css";
import BranchAdminTable from "./BranchAdminTable";
import BranchAdminService from "../../services/UserService";
import SuccessModal from "../../components/Common/SuccessModal";
import DeleteModal from "../../components/Common/DeleteModal";

function BranchAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [branchAdmins, setBranchAdmins] = useState([]);
  const [selectedBranchAdmin, setSelectedBranchAdmin] = useState(null);

  // Success Modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Delete Modal
  const [showDelete, setShowDelete] = useState(false);

  // Fetch all Branch Admins
  const fetchBranchAdmins = () => {
    BranchAdminService.getAllBranchAdmins()
      .then((response) => {
        setBranchAdmins(response.data);
      })
      .catch((error) => {
        console.error("Error fetching Branch Admins:", error);
      });
  };

  // Load data on page load
  useEffect(() => {
    fetchBranchAdmins();
  }, []);

  // Open Add Form
  const handleAddBranchAdmin = () => {
    setSelectedBranchAdmin(null);
    setShowModal(true);
  };

  // Open Edit Form
  const handleEditBranchAdmin = (branchAdminData) => {
    setSelectedBranchAdmin(branchAdminData);
    setShowModal(true);
  };

  // Close Form
  const handleClose = () => {
    setSelectedBranchAdmin(null);
    setShowModal(false);
  };

  // Save / Update Branch Admin
  const handleSave = (branchAdminData) => {
    if (selectedBranchAdmin) {
      // UPDATE
      BranchAdminService.updateBranchAdmin(
        selectedBranchAdmin.userId,
        branchAdminData,
      )
        .then(() => {
          fetchBranchAdmins();

          setSuccessMessage("Branch Admin updated successfully!");
          setShowSuccess(true);

          setShowModal(false);
          setSelectedBranchAdmin(null);
        })
        .catch((error) => {
          console.error("Update Error:", error);
          alert("Failed to update Branch Admin.");
        });
    } else {
      // CREATE
      BranchAdminService.createBranchAdmin(branchAdminData)
        .then(() => {
          fetchBranchAdmins();

          setSuccessMessage("Branch Admin saved successfully!");
          setShowSuccess(true);

          setShowModal(false);
        })
        .catch((error) => {
          console.error("Save Error:", error);
          alert("Failed to add Branch Admin.");
        });
    }
  };

  // Delete Branch Admin
  const handleDeleteBranchAdmin = (userId) => {
    if (!userId) {
      alert("Cannot delete: Branch Admin ID is missing.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this Branch Admin?",
    );

    if (!confirmDelete) return;

    BranchAdminService.deleteBranchAdmin(userId)
      .then(() => {
        fetchBranchAdmins();

        // Show delete success popup
        setShowDelete(true);
      })
      .catch((error) => {
        console.error("Delete Error:", error);

        alert(
          error.response?.data?.message || "Failed to delete Branch Admin.",
        );
      });
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Branch Admin Management</h2>

          <p className="text-muted">Manage all Branch Administrators.</p>
        </div>

        <button className="btn btn-primary" onClick={handleAddBranchAdmin}>
          + Add Branch Admin
        </button>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <BranchAdminTable
            data={branchAdmins}
            onEdit={handleEditBranchAdmin}
            refreshData={fetchBranchAdmins}
            onDeleteSuccess={() => setShowDelete(true)}
          />
        </div>
      </div>

      {/* Form */}
      <BranchAdminForm
        show={showModal}
        onClose={handleClose}
        onSave={handleSave}
        selectedBranchAdminData={selectedBranchAdmin}
      />

      {/* Add / Update Success Modal */}
      <SuccessModal
        show={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />

      {/* Delete Success Modal */}
      <DeleteModal
        show={showDelete}
        message="Branch Admin deleted successfully!"
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}

export default BranchAdmin;
