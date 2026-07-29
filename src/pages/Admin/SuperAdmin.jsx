import { useEffect, useState } from "react";
import SuperAdminForm from "./SuperAdminForm";
import "./SuperAdmin.css";
import SuperAdminTable from "./SuperAdminTable";
import SuperAdminService from "../../services/UserService";

function SuperAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [selectedSuperAdmin, setSelectedSuperAdmin] = useState(null);

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

  // Save / Update Super Admin
  const handleSave = (superAdminData) => {
    if (selectedSuperAdmin) {
      SuperAdminService.updateSuperAdmin(
        selectedSuperAdmin.superAdminId,
        superAdminData,
      )
        .then(() => {
          alert("Super Admin updated successfully!");
          fetchSuperAdmins();
          setShowModal(false);
          setSelectedSuperAdmin(null);
        })
        .catch((error) => {
          console.error("Update Error:", error);
          alert("Failed to update Super Admin.");
        });
    } else {
      SuperAdminService.createSuperAdmin(superAdminData)
        .then(() => {
          alert("Super Admin added successfully!");
          fetchSuperAdmins();
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Save Error:", error);
          alert("Failed to add Super Admin.");
        });
    }
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
            refreshData={fetchSuperAdmins}
          />
        </div>
      </div>

      {/* Form */}
      <SuperAdminForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSuperAdmin(null);
        }}
        onSave={handleSave}
        selectedSuperAdminData={selectedSuperAdmin}
      />
    </div>
  );
}

export default SuperAdmin;
