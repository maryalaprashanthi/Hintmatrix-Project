import { useEffect, useState } from "react";
import SuperAdminForm from "./SuperAdminForm";
import "./SuperAdmin.css";
import SuperAdminTable from "./SuperAdminTable";
import SuperAdminService from "../../services/UserService";
import { useToast } from "../../components/Toast/useToast";
import { FaUserShield } from "react-icons/fa";
import ManagementCountTiles from "../../components/Common/ManagementCountTiles";
import { getManagementCounts } from "../../utils/managementCounts";

function SuperAdmin() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [selectedSuperAdmin, setSelectedSuperAdmin] = useState(null);
  const superAdminCounts = getManagementCounts(superAdmins);

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

          toast.success("Super admin updated.");

          setShowModal(false);
          setSelectedSuperAdmin(null);
        })
        .catch((error) => {
          console.error("Update Error:", error);
          toast.error("Failed to update super admin.");
        });
    } else {
      // CREATE
      SuperAdminService.createSuperAdmin(superAdminData)
        .then(() => {
          fetchSuperAdmins();

          toast.success("Super admin saved.");

          setShowModal(false);
        })
        .catch((error) => {
          console.error("Save Error:", error);
          toast.error("Failed to add super admin.");
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

      <ManagementCountTiles
        label="Super Admins"
        counts={superAdminCounts}
        icon={FaUserShield}
      />

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
        onClose={handleClose}
        onSave={handleSave}
        selectedSuperAdminData={selectedSuperAdmin}
      />

    </div>
  );
}

export default SuperAdmin;
