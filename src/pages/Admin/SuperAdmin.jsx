import { useEffect, useState } from "react";
import SuperAdminForm from "./SuperAdminForm";
import "./SuperAdmin.css";
import SuperAdminTable from "./SuperAdminTable";
import SuperAdminService from "../../services/UserService";
import SuccessModal from "../../components/Common/SuccessModal";
import DeleteModal from "../../components/Common/DeleteModal";

function SuperAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [selectedSuperAdmin, setSelectedSuperAdmin] = useState(null);

  // Success Modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Delete Modal
  const [showDelete, setShowDelete] = useState(false);

  // Fetch all Super Admins
  const fetchSuperAdmins = () => {
    SuperAdminService.getAllSuperAdmins()
      .then((response) => {
        setSuperAdmins(response.data);
      })
      .catch((error) => {
        console.error("Error fetching Super Admins:", error);
      });
  };

  // Load data on page load
  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  // Open Add Form
  const handleAddSuperAdmin = () => {
    setSelectedSuperAdmin(null);
    setShowModal(true);
  };

  // Open Edit Form
  const handleEditSuperAdmin = (superAdminData) => {
    setSelectedSuperAdmin(superAdminData);
    setShowModal(true);
  };

  // Close Form
  const handleClose = () => {
    setSelectedSuperAdmin(null);
    setShowModal(false);
  };

  // Save / Update Super Admin
  const handleSave = (superAdminData) => {
    if (selectedSuperAdmin) {
      // UPDATE
      SuperAdminService.updateSuperAdmin(
        selectedSuperAdmin.userId,
        superAdminData,
      )
        .then(() => {
          fetchSuperAdmins();

          setSuccessMessage("Super Admin updated successfully!");
          setShowSuccess(true);

          setShowModal(false);
          setSelectedSuperAdmin(null);
        })
        .catch((error) => {
          console.error("Update Error:", error);
          alert("Failed to update Super Admin.");
        });
    } else {
      // CREATE
      SuperAdminService.createSuperAdmin(superAdminData)
        .then(() => {
          fetchSuperAdmins();

          setSuccessMessage("Super Admin saved successfully!");
          setShowSuccess(true);

          setShowModal(false);
        })
        .catch((error) => {
          console.error("Save Error:", error);
          alert("Failed to add Super Admin.");
        });
    }
  };

  // Delete Super Admin
  const handleDeleteSuperAdmin = (userId) => {
    if (!userId) {
      alert("Cannot delete: Super Admin ID is missing.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this Super Admin?",
    );

    if (!confirmDelete) return;

    SuperAdminService.deleteSuperAdmin(userId)
      .then(() => {
        fetchSuperAdmins();

        // Show delete success popup
        setShowDelete(true);
      })
      .catch((error) => {
        console.error("Delete Error:", error);

        alert(error.response?.data?.message || "Failed to delete Super Admin.");
      });
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Super Admin Management</h2>

          <p className="text-muted">Manage all Super Administrators.</p>
        </div>

        <button className="btn btn-primary" onClick={handleAddSuperAdmin}>
          + Add Super Admin
        </button>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <SuperAdminTable
            data={superAdmins}
            onEdit={handleEditSuperAdmin}
            onDelete={handleDeleteSuperAdmin}
            refreshData={fetchSuperAdmins}
            onDeleteSuccess={() => setShowDelete(true)}
          />
        </div>
      </div>

      {/* Form */}
      <SuperAdminForm
        show={showModal}
        onClose={handleClose}
        onSave={handleSave}
        selectedSuperAdminData={selectedSuperAdmin}
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
        message="Super Admin deleted successfully!"
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}

export default SuperAdmin;
