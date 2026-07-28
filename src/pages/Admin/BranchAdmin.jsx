import { useState } from "react";
import BranchAdminForm from "./BranchAdminForm";
import "./BranchAdmin.css";
import { MdAdminPanelSettings, MdManageAccounts } from "react-icons/md";
import BranchAdminTable from "./BranchAdminTable";

function BranchAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [branchAdmins, setBranchAdmins] = useState([]);
  const [selectedBranchAdmin, setSelectedBranchAdmin] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // Open Add Branch Admin Form
  const handleAddBranchAdmin = () => {
    setSelectedBranchAdmin(null);
    setShowModal(true);
  };

  // Open Edit Branch Admin Form
  const handleEditBranchAdmin = (branchAdminData) => {
    setSelectedBranchAdmin(branchAdminData);
    setShowModal(true);
  };

  // Save / Update Branch Admin
  const handleSave = (branchAdminData) => {
    console.log("Submitting Branch Admin payload:", branchAdminData);

    setBranchAdmins((prev) => [...prev, branchAdminData]);

    // Backend integration can be added later
    alert(
      selectedBranchAdmin
        ? "Branch Admin updated successfully!"
        : "Branch Admin added successfully!",
    );

    setRefreshTrigger((prev) => !prev);
    setShowModal(false);
    setSelectedBranchAdmin(null);
  };

  // Upload File
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    console.log("Selected File:", file);

    alert(`Selected File: ${file.name}`);

    // TODO: Upload API

    e.target.value = "";
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Branch Admin Management</h2>

          <p className="text-muted">Manage all Branch Administrators.</p>
        </div>

        {/* Hidden Upload */}

        <input
          type="file"
          id="branchAdminUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById("branchAdminUpload").click()}
          >
            ⬆ Upload
          </button>

          <button className="btn btn-primary" onClick={handleAddBranchAdmin}>
            + Add Branch Admin
          </button>
        </div>
      </div>

      {/* AG Grid */}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <BranchAdminTable
            data={branchAdmins}
            refresh={refreshTrigger}
            onEdit={handleEditBranchAdmin}
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
