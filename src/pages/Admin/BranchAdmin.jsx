import { useEffect, useState } from "react";
import BranchAdminForm from "./BranchAdminForm";
import "./BranchAdmin.css";
import BranchAdminTable from "./BranchAdminTable";
import BranchAdminService from "../../services/UserService";

function BranchAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [branchAdmins, setBranchAdmins] = useState([]);
  const [selectedBranchAdmin, setSelectedBranchAdmin] = useState(null);

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

  // Save / Update Branch Admin
  const handleSave = (branchAdminData) => {
    if (selectedBranchAdmin) {
      BranchAdminService.updateBranchAdmin(
        selectedBranchAdmin.branchAdminId,
        branchAdminData,
      )
        .then(() => {
          alert("Branch Admin updated successfully!");
          fetchBranchAdmins();
          setShowModal(false);
          setSelectedBranchAdmin(null);
        })
        .catch((error) => {
          console.error("Update Error:", error);
          alert("Failed to update Branch Admin.");
        });
    } else {
      BranchAdminService.createBranchAdmin(branchAdminData)
        .then(() => {
          alert("Branch Admin added successfully!");
          fetchBranchAdmins();
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Save Error:", error);
          alert("Failed to add Branch Admin.");
        });
    }
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
          />
        </div>
      </div>

      {/* Form */}
      <BranchAdminForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBranchAdmin(null);
        }}
        onSave={handleSave}
        selectedBranchAdminData={selectedBranchAdmin}
      />
    </div>
  );
}

export default BranchAdmin;
